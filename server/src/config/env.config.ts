import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL không được để trống'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET không được để trống'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('1h'),
  GUEST_ACCESS_TOKEN_SECRET: z.string().min(1, 'GUEST_ACCESS_TOKEN_SECRET không được để trống'),
  GUEST_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  GUEST_REFRESH_TOKEN_SECRET: z.string().min(1, 'GUEST_REFRESH_TOKEN_SECRET không được để trống'),
  GUEST_REFRESH_TOKEN_EXPIRES_IN: z.string().default('12h'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET không được để trống'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('1d'),
  INITIAL_EMAIL_OWNER: z.string().email('INITIAL_EMAIL_OWNER phải là email hợp lệ'),
  INITIAL_PASSWORD_OWNER: z.string().min(6, 'INITIAL_PASSWORD_OWNER tối thiểu 6 ký tự'),
  DOMAIN: z.string().default('localhost'),
  PROTOCOL: z.string().default('http'),
  UPLOAD_FOLDER: z.string().default('uploads'),
})

export type EnvType = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): EnvType {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    const formattedErrors = result.error.format()
    console.error('❌ Cấu hình môi trường (.env) không hợp lệ:')
    console.error(JSON.stringify(formattedErrors, null, 2))
    throw new Error('Các giá trị khai báo trong file .env không hợp lệ')
  }

  return result.data
}
