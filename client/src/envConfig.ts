import z from 'zod'

const envConfigSchema = z.object({
  API_URL: z.string(),
  WEB_URL: z.string(),
})

const parsedConfig = envConfigSchema.safeParse({
  API_URL: process.env.API_URL,
  WEB_URL: process.env.WEB_URL,
})

if (!parsedConfig.success) {
  console.error('❌ Biến môi trường không hợp lệ, xem file .env.example để biết thêm chi tiết')
  throw new Error('Biến môi trường không hợp lệ')
}

export const envConfig = parsedConfig.data
