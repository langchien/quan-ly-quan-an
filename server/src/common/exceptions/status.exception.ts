import { HttpException } from '@nestjs/common'

export class StatusError extends HttpException {
  constructor({ message, status }: { message: string; status: number }) {
    super(message, status)
  }
}
