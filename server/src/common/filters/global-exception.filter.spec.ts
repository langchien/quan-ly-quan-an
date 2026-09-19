import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  type ArgumentsHost,
} from '@nestjs/common'
import { z } from 'zod'
import {
  GlobalExceptionFilter,
  isPrismaClientKnownRequestError,
} from './global-exception.filter.js'
import { EntityErrorException } from '../exceptions/entity-error.exception.js'
import { AuthError } from '../exceptions/auth.exception.js'
import { ForbiddenError } from '../exceptions/forbidden.exception.js'
import { StatusError } from '../exceptions/status.exception.js'
import { Prisma } from '../../generated/prisma/client.js'

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter

  beforeEach(() => {
    filter = new GlobalExceptionFilter()
  })

  const createMockHost = (requestOverrides = {}) => {
    const jsonMock = vi.fn()
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    const clearCookieMock = vi.fn()
    const cookieMock = vi.fn()

    const response = {
      status: statusMock,
      json: jsonMock,
      clearCookie: clearCookieMock,
      cookie: cookieMock,
    }

    const request = {
      method: 'POST',
      url: '/test',
      ...requestOverrides,
    }

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost

    return { host, statusMock, jsonMock, clearCookieMock, cookieMock }
  }

  it('nên xử lý EntityErrorException và trả về status 422 với danh sách errors', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const errorItems = [{ field: 'email', message: 'Email không hợp lệ' }]
    const exception = new EntityErrorException(errorItems, 'Lỗi xác thực dữ liệu')

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(422)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Lỗi xác thực dữ liệu',
      errors: errorItems,
      statusCode: 422,
    })
  })

  it('nên xử lý ZodError thuần và map sang status 422 với errors', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const schema = z.object({
      username: z.string().min(3, 'Tên người dùng tối thiểu 3 ký tự'),
    })

    const parseResult = schema.safeParse({ username: 'a' })
    if (parseResult.success) throw new Error('Không thể xảy ra')

    filter.catch(parseResult.error, host)

    expect(statusMock).toHaveBeenCalledWith(422)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Lỗi xảy ra khi xác thực dữ liệu...',
      errors: [
        {
          field: 'username',
          message: 'Tên người dùng tối thiểu 3 ký tự',
        },
      ],
      statusCode: 422,
    })
  })

  it('nên xử lý AuthError, trả về 401 và xóa cookie session_token', () => {
    const { host, statusMock, jsonMock, clearCookieMock } = createMockHost()
    const exception = new AuthError('Token không hợp lệ hoặc đã hết hạn')

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(401)
    expect(clearCookieMock).toHaveBeenCalledWith('session_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Token không hợp lệ hoặc đã hết hạn',
      statusCode: 401,
    })
  })

  it('nên xử lý NestJS UnauthorizedException chuẩn, trả về 401 và xóa cookie session_token', () => {
    const { host, statusMock, jsonMock, clearCookieMock } = createMockHost()
    const exception = new UnauthorizedException('Chưa đăng nhập')

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(401)
    expect(clearCookieMock).toHaveBeenCalledWith('session_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Chưa đăng nhập',
      statusCode: 401,
    })
  })

  it('nên xử lý ForbiddenError và trả về status 403', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const exception = new ForbiddenError('Bạn không có quyền thao tác tính năng này')

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(403)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Bạn không có quyền thao tác tính năng này',
      statusCode: 403,
    })
  })

  it('nên xử lý NestJS ForbiddenException và trả về status 403', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const exception = new ForbiddenException('Bị cấm truy cập')

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(403)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Bị cấm truy cập',
      statusCode: 403,
    })
  })

  it('nên xử lý StatusError với status tùy biến', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const exception = new StatusError({ message: 'I am a teapot', status: 418 })

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(418)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'I am a teapot',
      statusCode: 418,
    })
  })

  it('nên xử lý PrismaClientKnownRequestError P2025 (RecordNotFound) trả về 404', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'An operation failed because it depends on one or more records that were required but not found',
      {
        code: 'P2025',
        clientVersion: '7.10.0',
      }
    )

    filter.catch(prismaError, host)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Không tìm thấy dữ liệu',
      statusCode: 404,
    })
  })

  it('nên xử lý PrismaClientKnownRequestError P2002 (UniqueConstraintViolation) trả về 409', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { target: ['email'] },
      }
    )

    filter.catch(prismaError, host)

    expect(statusMock).toHaveBeenCalledWith(409)
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Dữ liệu 'email' đã tồn tại trong hệ thống",
      statusCode: 409,
    })
  })

  it('nên xử lý các mã PrismaClientKnownRequestError khác trả về 400', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const prismaError = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '7.10.0',
    })

    filter.catch(prismaError, host)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      })
    )
  })

  it('nên xử lý NestJS BadRequestException với response dạng object', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const exception = new BadRequestException({
      message: ['Tên món ăn không được để trống'],
      error: 'Bad Request',
      statusCode: 400,
    })

    filter.catch(exception, host)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Tên món ăn không được để trống',
      statusCode: 400,
    })
  })

  it('nên xử lý Unhandled Error và trả về status 500', () => {
    const { host, statusMock, jsonMock } = createMockHost()
    const unknownError = new Error('Database connection crashed!')

    filter.catch(unknownError, host)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
      })
    )
  })

  it('hàm isPrismaClientKnownRequestError nên nhận diện đúng lỗi Prisma', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Test error', {
      code: 'P2025',
      clientVersion: '7.10.0',
    })
    expect(isPrismaClientKnownRequestError(prismaError)).toBe(true)

    const standardError = new Error('Regular error')
    expect(isPrismaClientKnownRequestError(standardError)).toBe(false)
  })
})
