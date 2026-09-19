import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '../../generated/prisma/client.js'
import { EntityErrorException, type EntityErrorItem } from '../exceptions/entity-error.exception.js'
import { AuthError } from '../exceptions/auth.exception.js'
import { ForbiddenError } from '../exceptions/forbidden.exception.js'
import { StatusError } from '../exceptions/status.exception.js'

export interface ErrorResponseFormat {
  message: string
  statusCode: number
  errors?: EntityErrorItem[]
}

export function isPrismaClientKnownRequestError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { name?: string }).name === 'PrismaClientKnownRequestError')
  )
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // 1. Xử lý EntityErrorException (422) từ ZodValidationPipe
    if (exception instanceof EntityErrorException) {
      const statusCode = HttpStatus.UNPROCESSABLE_ENTITY
      response.status(statusCode).json({
        message: exception.message || 'Lỗi xảy ra khi xác thực dữ liệu...',
        errors: exception.errors,
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 2. Xử lý trực tiếp ZodError nếu có ném ra ở service/controller
    if (exception instanceof ZodError) {
      const statusCode = HttpStatus.UNPROCESSABLE_ENTITY
      const errors: EntityErrorItem[] = exception.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      response.status(statusCode).json({
        message: 'Lỗi xảy ra khi xác thực dữ liệu...',
        errors,
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 3. Xử lý AuthError (401) hoặc UnauthorizedException -> Xóa cookie session_token
    if (exception instanceof AuthError) {
      this.clearSessionTokenCookie(response)
      const statusCode = HttpStatus.UNAUTHORIZED
      response.status(statusCode).json({
        message: exception.message,
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 4. Xử lý ForbiddenError (403)
    if (exception instanceof ForbiddenError) {
      const statusCode = HttpStatus.FORBIDDEN
      response.status(statusCode).json({
        message: exception.message,
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 5. Xử lý StatusError (Mã status tùy biến)
    if (exception instanceof StatusError) {
      const statusCode = exception.getStatus()
      response.status(statusCode).json({
        message: exception.message,
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 6. Xử lý lỗi Prisma Database
    if (isPrismaClientKnownRequestError(exception)) {
      if (exception.code === 'P2025') {
        const statusCode = HttpStatus.NOT_FOUND
        response.status(statusCode).json({
          message: 'Không tìm thấy dữ liệu',
          statusCode,
        } satisfies ErrorResponseFormat)
        return
      }

      if (exception.code === 'P2002') {
        const statusCode = HttpStatus.CONFLICT
        const target = Array.isArray((exception.meta as { target?: unknown })?.target)
          ? (exception.meta as { target: string[] }).target.join(', ')
          : ((exception.meta as { target?: string })?.target ?? '')

        const message = target
          ? `Dữ liệu '${target}' đã tồn tại trong hệ thống`
          : 'Dữ liệu đã tồn tại hoặc bị trùng lặp'

        response.status(statusCode).json({
          message,
          statusCode,
        } satisfies ErrorResponseFormat)
        return
      }

      // Các lỗi Prisma khác
      const statusCode = HttpStatus.BAD_REQUEST
      response.status(statusCode).json({
        message: exception.message || 'Lỗi truy vấn cơ sở dữ liệu',
        statusCode,
      } satisfies ErrorResponseFormat)
      return
    }

    // 7. Xử lý NestJS HttpException chuẩn (NotFound, BadRequest, ...)
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      const res = exception.getResponse()

      if (statusCode === HttpStatus.UNAUTHORIZED) {
        this.clearSessionTokenCookie(response)
      }

      let message = exception.message
      let errors: EntityErrorItem[] | undefined

      if (typeof res === 'string') {
        message = res
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, unknown>
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ')
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message
        }
        if (Array.isArray(responseObj.errors)) {
          errors = responseObj.errors as EntityErrorItem[]
        }
      }

      const payload: ErrorResponseFormat = {
        message,
        statusCode,
      }

      if (errors) {
        payload.errors = errors
      }

      response.status(statusCode).json(payload)
      return
    }

    // 8. Xử lý các lỗi hệ thống không lường trước (Unhandled Errors -> 500)
    const errMessage = exception instanceof Error ? exception.message : 'Unknown error'
    const errStack = exception instanceof Error ? exception.stack : undefined

    this.logger.error(`${request.method} ${request.url} - ${errMessage}`, errStack)

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    const isDev = process.env.NODE_ENV !== 'production'
    const clientMessage =
      isDev && exception instanceof Error ? exception.message : 'Đã có lỗi xảy ra trên máy chủ'

    response.status(statusCode).json({
      message: clientMessage,
      statusCode,
    } satisfies ErrorResponseFormat)
  }

  private clearSessionTokenCookie(response: Response): void {
    if (typeof response.clearCookie === 'function') {
      response.clearCookie('session_token', {
        path: '/',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
    } else if (typeof response.cookie === 'function') {
      response.cookie('session_token', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 0,
      })
    }
  }
}
