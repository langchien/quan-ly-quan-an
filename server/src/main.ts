import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { AppModule, ObserveInstrument } from './app.module.js'
import { ZodValidationPipe } from './common/index.js'
import type { EnvType } from './config/env.config.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  })

  app.useGlobalPipes(new ZodValidationPipe())

  const configService = app.get(ConfigService<EnvType, true>)
  const port = configService.get('PORT', { infer: true })
  const protocol = configService.get('PROTOCOL', { infer: true })
  const domain = configService.get('DOMAIN', { infer: true })

  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`🚀 Server đang chạy tại: ${protocol}://${domain}:${port}`)
}
await bootstrap()
