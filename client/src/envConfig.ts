import z from 'zod'

const envConfigSchema = z.object({
  VITE_API_URL: z.string(),
  VITE_WEB_URL: z.string(),
})

const parsedConfig = envConfigSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WEB_URL: import.meta.env.VITE_WEB_URL,
})

if (!parsedConfig.success) {
  console.error('❌ Biến môi trường không hợp lệ, xem file .env.example để biết thêm chi tiết')
  throw new Error('Biến môi trường không hợp lệ')
}

export const envConfig = parsedConfig.data
