import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module.js'
import { ZodValidationPipe, GlobalExceptionFilter } from './common/index.js'
import type { EnvType } from './config/env.config.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Cho phép CORS để Frontend (port 3000) có thể gọi API kèm cookies/tokens
  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalPipes(new ZodValidationPipe())

  // Sử dụng Socket.IO adapter (thay vì ws mặc định)
  app.useWebSocketAdapter(new IoAdapter(app))

  const configService = app.get(ConfigService<EnvType, true>)
  const port = configService.get('PORT', { infer: true })
  const protocol = configService.get('PROTOCOL', { infer: true })
  const domain = configService.get('DOMAIN', { infer: true })

  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`🚀 Server đang chạy tại: ${protocol}://${domain}:${port}`)
}
await bootstrap()
