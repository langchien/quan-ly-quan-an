import { describe, it, expect } from 'vitest'
import { validateEnv, envSchema } from './env.config.js'

describe('env.config', () => {
  const validEnv = {
    PORT: '4000',
    DATABASE_URL: 'postgresql://user:password@localhost:5432/quan_ly_quan_an?schema=public',
    ACCESS_TOKEN_SECRET: 'access_secret_key',
    ACCESS_TOKEN_EXPIRES_IN: '1h',
    GUEST_ACCESS_TOKEN_EXPIRES_IN: '15m',
    GUEST_REFRESH_TOKEN_EXPIRES_IN: '12h',
    REFRESH_TOKEN_SECRET: 'refresh_secret_key',
    REFRESH_TOKEN_EXPIRES_IN: '1d',
    INITIAL_EMAIL_OWNER: 'admin@order.com',
    INITIAL_PASSWORD_OWNER: '123456',
    DOMAIN: 'localhost',
    PROTOCOL: 'http',
    UPLOAD_FOLDER: 'uploads',
  }

  it('nên parse và chuyển đổi kiểu thành công với dữ liệu hợp lệ', () => {
    const result = validateEnv(validEnv)
    expect(result.PORT).toBe(4000)
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL)
    expect(result.INITIAL_EMAIL_OWNER).toBe('admin@order.com')
  })

  it('nên ném lỗi khi thiếu biến bắt buộc (DATABASE_URL)', () => {
    const invalidEnv = { ...validEnv, DATABASE_URL: '' }
    expect(() => validateEnv(invalidEnv)).toThrow(
      'Các giá trị khai báo trong file .env không hợp lệ'
    )
  })

  it('nên ném lỗi khi email không đúng định dạng', () => {
    const invalidEnv = { ...validEnv, INITIAL_EMAIL_OWNER: 'not-an-email' }
    expect(() => validateEnv(invalidEnv)).toThrow(
      'Các giá trị khai báo trong file .env không hợp lệ'
    )
  })

  it('nên tự động áp dụng giá trị mặc định cho PORT khi không truyền', () => {
    const { PORT: _PORT, ...envWithoutPort } = validEnv
    const parsed = envSchema.parse(envWithoutPort)
    expect(parsed.PORT).toBe(4000)
  })
})
