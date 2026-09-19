import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { ZodValidationPipe } from './zod-validation.pipe.js'
import { createZodDto } from '../dto/zod.dto.js'
import { EntityErrorException } from '../exceptions/entity-error.exception.js'

describe('ZodValidationPipe', () => {
  const TestSchema = z.object({
    email: z.string().email('Email không đúng định dạng'),
    age: z.coerce.number().min(18, 'Tuổi phải từ 18 trở lên'),
    address: z
      .object({
        city: z.string().min(1, 'Thành phố không được để trống'),
      })
      .optional(),
  })

  describe('Chế độ nhận schema trực tiếp (new ZodValidationPipe(schema))', () => {
    const pipe = new ZodValidationPipe(TestSchema)

    it('nên validate thành công và coerce kiểu dữ liệu', () => {
      const input = { email: 'test@example.com', age: '25' }
      const output = pipe.transform(input)

      expect(output).toEqual({
        email: 'test@example.com',
        age: 25,
      })
    })

    it('nên ném EntityErrorException với mã 422 khi dữ liệu không hợp lệ', () => {
      const invalidInput = { email: 'invalid-email', age: 16 }

      expect(() => pipe.transform(invalidInput)).toThrow(EntityErrorException)

      try {
        pipe.transform(invalidInput)
      } catch (err) {
        const error = err as EntityErrorException
        expect(error.getStatus()).toBe(422)

        const response = error.getResponse() as any
        expect(response.statusCode).toBe(422)
        expect(response.message).toBe('Lỗi xảy ra khi xác thực dữ liệu...')
        expect(response.errors).toEqual(
          expect.arrayContaining([
            { field: 'email', message: 'Email không đúng định dạng' },
            { field: 'age', message: 'Tuổi phải từ 18 trở lên' },
          ])
        )
      }
    })

    it('nên định dạng đúng trường field đối với object lồng nhau (nested)', () => {
      const invalidNestedInput = {
        email: 'test@example.com',
        age: 20,
        address: { city: '' },
      }

      try {
        pipe.transform(invalidNestedInput)
      } catch (err) {
        const error = err as EntityErrorException
        const response = error.getResponse() as any
        expect(response.errors).toContainEqual({
          field: 'address.city',
          message: 'Thành phố không được để trống',
        })
      }
    })
  })

  describe('Chế độ Global Pipe với DTO (createZodDto)', () => {
    class TestDto extends createZodDto(TestSchema) {}
    const globalPipe = new ZodValidationPipe()

    it('nên tự động phát hiện Zod Schema từ DTO class', () => {
      const input = { email: 'admin@order.com', age: '30' }
      const output = globalPipe.transform(input, {
        type: 'body',
        metatype: TestDto,
        data: '',
      })

      expect(output).toEqual({
        email: 'admin@order.com',
        age: 30,
      })
    })

    it('nên ném lỗi EntityErrorException 422 nếu DTO validation thất bại', () => {
      const invalidInput = { email: 'bad-email', age: '10' }

      expect(() =>
        globalPipe.transform(invalidInput, {
          type: 'body',
          metatype: TestDto,
          data: '',
        })
      ).toThrow(EntityErrorException)
    })

    it('nên bỏ qua và giữ nguyên value nếu metatype không phải là ZodDto', () => {
      const regularInput = { foo: 'bar' }
      class RegularDto {}

      const output = globalPipe.transform(regularInput, {
        type: 'body',
        metatype: RegularDto,
        data: '',
      })

      expect(output).toBe(regularInput)
    })

    it('nên bỏ qua nếu không có metatype', () => {
      const rawInput = 'simple string'
      const output = globalPipe.transform(rawInput)
      expect(output).toBe(rawInput)
    })
  })
})
