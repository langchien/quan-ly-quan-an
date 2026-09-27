import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import type { EnvType } from '../config/env.config.js'
import { PrismaClient } from '../generated/prisma/client.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService<EnvType, true>) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true })
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
