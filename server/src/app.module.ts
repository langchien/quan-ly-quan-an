import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { resolve } from 'path'
import { AccountModule } from './account/account.module.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { AuthModule } from './auth/auth.module.js'
import { validateEnv } from './config/env.config.js'
import { DishModule } from './dish/dish.module.js'
import { EventsModule } from './events/events.module.js'
import { GuestModule } from './guest/guest.module.js'
import { MediaModule } from './media/media.module.js'
import { OrderModule } from './order/order.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { TableModule } from './table/table.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
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
    AccountModule,
    TableModule,
    DishModule,
    EventsModule,
    GuestModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
