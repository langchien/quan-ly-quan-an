import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { createObserveModule } from '@nestjs/observe'
import { resolve } from 'path'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { validateEnv } from './config/env.config.js'
import { AuthModule } from './auth/auth.module.js'
import { MediaModule } from './media/media.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    // Phục vụ file tĩnh (ảnh upload) tại route /static
    ServeStaticModule.forRoot({
      rootPath: resolve(process.cwd(), process.env.UPLOAD_FOLDER ?? 'uploads'),
      serveRoot: '/static',
      serveStaticOptions: {
        index: false,
      },
    }),
    PrismaModule,
    AuthModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
