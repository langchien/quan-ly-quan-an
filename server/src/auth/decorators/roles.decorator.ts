import { Reflector } from '@nestjs/core'
import type { RoleType } from '@app/shared'

/**
 * Decorator đánh dấu endpoint yêu cầu role cụ thể.
 *
 * Ví dụ:
 *   @Roles(Role.Owner)                  // Chỉ Owner
 *   @Roles(Role.Owner, Role.Employee)   // Owner hoặc Employee
 */
export const Roles = Reflector.createDecorator<RoleType[]>()
