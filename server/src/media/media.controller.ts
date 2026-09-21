import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, resolve } from 'path'
import { ConfigService } from '@nestjs/config'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import type { EnvType } from '../config/env.config.js'

function generateFilename(
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const ext = extname(file.originalname)
  callback(null, `${uniqueSuffix}${ext}`)
}

@Controller('media')
@UseGuards(AccessTokenGuard)
export class MediaController {
  constructor(private readonly configService: ConfigService<EnvType, true>) {}

  /**
   * POST /media/upload
   * Upload một file ảnh (tối đa 10MB, chỉ nhận image/*)
   * Yêu cầu: Bearer access token hợp lệ
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          // Lấy folder từ env config, resolve theo thư mục gốc process
          const uploadFolder = process.env.UPLOAD_FOLDER ?? 'uploads'
          cb(null, resolve(uploadFolder))
        },
        filename: generateFilename,
      }),
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Chỉ chấp nhận file ảnh (image/*)'), false)
        }
        callback(null, true)
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file')
    }

    const protocol = this.configService.get('PROTOCOL', { infer: true })
    const domain = this.configService.get('DOMAIN', { infer: true })
    const port = this.configService.get('PORT', { infer: true })

    const url = `${protocol}://${domain}:${port}/static/${file.filename}`

    return {
      message: 'Upload ảnh thành công',
      data: url,
    }
  }
}
