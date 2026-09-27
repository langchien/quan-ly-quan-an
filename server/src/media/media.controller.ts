import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, resolve, join } from 'path'
import { ConfigService } from '@nestjs/config'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import type { EnvType } from '../config/env.config.js'
import sharp from 'sharp'
import { unlink, rename } from 'fs/promises'

// Cấu hình tối ưu ảnh
const IMAGE_CONFIG = {
  maxWidth: 1200, // Resize tối đa 1200px width
  jpegQuality: 80, // Chất lượng JPEG 80%
  webpQuality: 80, // Chất lượng WebP 80%
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  maxFileSizeMB: 5, // Giới hạn 5MB (thay vì 10MB)
}

function generateFilename(
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  // Luôn lưu dưới dạng .webp sau khi optimize
  callback(null, `${uniqueSuffix}.webp`)
}

@Controller('media')
@UseGuards(AccessTokenGuard)
export class MediaController {
  private readonly logger = new Logger(MediaController.name)

  constructor(private readonly configService: ConfigService<EnvType, true>) {}

  /**
   * POST /media/upload
   * Upload một file ảnh (tối đa 5MB, chỉ nhận image/jpeg, image/png, image/webp)
   * Tự động resize và compress về WebP để tối ưu dung lượng
   * Yêu cầu: Bearer access token hợp lệ
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadFolder = process.env.UPLOAD_FOLDER ?? 'uploads'
          cb(null, resolve(uploadFolder))
        },
        filename: generateFilename,
      }),
      limits: {
        fileSize: 1024 * 1024 * IMAGE_CONFIG.maxFileSizeMB,
      },
      fileFilter: (_req, file, callback) => {
        if (!IMAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `Chỉ chấp nhận file ảnh định dạng: JPEG, PNG, WebP (nhận được: ${file.mimetype})`
            ),
            false
          )
        }
        callback(null, true)
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file')
    }

    // Tối ưu ảnh bằng sharp: resize + compress → WebP
    const originalPath = file.path
    const optimizedPath = `${originalPath}.optimized`

    try {
      await sharp(originalPath)
        .resize({
          width: IMAGE_CONFIG.maxWidth,
          withoutEnlargement: true, // Không phóng to ảnh nhỏ hơn maxWidth
        })
        .webp({ quality: IMAGE_CONFIG.webpQuality })
        .toFile(optimizedPath)

      // Thay thế file gốc bằng file đã tối ưu
      await unlink(originalPath)
      await rename(optimizedPath, originalPath)

      this.logger.log(
        `Optimized image: ${file.originalname} → ${file.filename} (WebP, max ${IMAGE_CONFIG.maxWidth}px)`
      )
    } catch (err) {
      // Nếu sharp lỗi, xóa file optimized (nếu có) và giữ file gốc
      this.logger.warn(`Sharp optimization failed for ${file.originalname}, using original`)
      await unlink(optimizedPath).catch(() => {})
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
