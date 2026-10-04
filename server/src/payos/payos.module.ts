import { Module } from '@nestjs/common'
import { PayosService } from './payos.service.js'

@Module({
  providers: [PayosService],
  exports: [PayosService],
})
export class PayosModule {}
