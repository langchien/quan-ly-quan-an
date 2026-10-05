import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BillStatus,
  BillStatusValues,
  DishStatus,
  DishStatusValues,
  OrderStatus,
  OrderStatusValues,
  PaymentMethod,
  PaymentMethodValues,
  Role,
  TableStatus,
  TableStatusValues,
} from '@app/shared'
import i18n from '@/lib/i18n'

export const ORDER_STATUS_EMOJI: Record<string, string> = {
  [OrderStatus.Pending]: '🕐',
  [OrderStatus.Processing]: '🔄',
  [OrderStatus.Delivered]: '✅',
  [OrderStatus.Rejected]: '❌',
  [OrderStatus.Paid]: '💰',
}

export const DISH_STATUS_EMOJI: Record<string, string> = {
  [DishStatus.Available]: '✅',
  [DishStatus.Unavailable]: '⏸️',
  [DishStatus.Hidden]: '🙈',
}

export const TABLE_STATUS_EMOJI: Record<string, string> = {
  [TableStatus.Available]: '🟢',
  [TableStatus.Reserved]: '🟡',
  [TableStatus.Hidden]: '🔴',
}

export const BILL_STATUS_EMOJI: Record<string, string> = {
  [BillStatus.Pending]: '⏳',
  [BillStatus.Paid]: '✅',
  [BillStatus.Cancelled]: '❌',
}

export const ROLE_EMOJI: Record<string, string> = {
  [Role.Owner]: '👑',
  [Role.Employee]: '👤',
  [Role.Guest]: '🧑',
}

export const PAYMENT_METHOD_EMOJI: Record<string, string> = {
  [PaymentMethod.PayOS]: '📱',
  [PaymentMethod.Cash]: '💵',
}

type TranslateFn = (key: any, options?: any) => string

export interface StatusOption<T extends string = string> {
  value: T
  label: string
}

export function getOrderStatusLabel(status: string, t: TranslateFn = i18n.t): string {
  return t(`status:order.${status}`, { defaultValue: status })
}

export function getDishStatusLabel(status: string, t: TranslateFn = i18n.t): string {
  return t(`status:dish.${status}`, { defaultValue: status })
}

export function getTableStatusLabel(status: string, t: TranslateFn = i18n.t): string {
  return t(`status:table.${status}`, { defaultValue: status })
}

export function getBillStatusLabel(status: string, t: TranslateFn = i18n.t): string {
  return t(`status:bill.${status}`, { defaultValue: status })
}

export function getRoleLabel(role: string, t: TranslateFn = i18n.t): string {
  return t(`status:role.${role}`, { defaultValue: role })
}

export function getPaymentMethodLabel(method: string, t: TranslateFn = i18n.t): string {
  return t(`status:payment.${method}`, { defaultValue: method })
}

export function getOrderStatusOptions(
  t: TranslateFn = i18n.t,
  withEmoji = true
): StatusOption<string>[] {
  return OrderStatusValues.map(value => ({
    value,
    label: withEmoji
      ? `${ORDER_STATUS_EMOJI[value] ?? ''} ${getOrderStatusLabel(value, t)}`.trim()
      : getOrderStatusLabel(value, t),
  }))
}

export function getDishStatusOptions(
  t: TranslateFn = i18n.t,
  withEmoji = true
): StatusOption<string>[] {
  return DishStatusValues.map(value => ({
    value,
    label: withEmoji
      ? `${DISH_STATUS_EMOJI[value] ?? ''} ${getDishStatusLabel(value, t)}`.trim()
      : getDishStatusLabel(value, t),
  }))
}

export function getTableStatusOptions(
  t: TranslateFn = i18n.t,
  withEmoji = true
): StatusOption<string>[] {
  return TableStatusValues.map(value => ({
    value,
    label: withEmoji
      ? `${TABLE_STATUS_EMOJI[value] ?? ''} ${getTableStatusLabel(value, t)}`.trim()
      : getTableStatusLabel(value, t),
  }))
}

export function getBillStatusOptions(
  t: TranslateFn = i18n.t,
  withEmoji = true
): StatusOption<string>[] {
  return BillStatusValues.map(value => ({
    value,
    label: withEmoji
      ? `${BILL_STATUS_EMOJI[value] ?? ''} ${getBillStatusLabel(value, t)}`.trim()
      : getBillStatusLabel(value, t),
  }))
}

export function getPaymentMethodOptions(
  t: TranslateFn = i18n.t,
  withEmoji = true
): StatusOption<string>[] {
  return PaymentMethodValues.map(value => ({
    value,
    label: withEmoji
      ? `${PAYMENT_METHOD_EMOJI[value] ?? ''} ${getPaymentMethodLabel(value, t)}`.trim()
      : getPaymentMethodLabel(value, t),
  }))
}

export function getRoleOptions(t: TranslateFn = i18n.t, withEmoji = true): StatusOption<string>[] {
  return [Role.Owner, Role.Employee].map(value => ({
    value,
    label: withEmoji
      ? `${ROLE_EMOJI[value] ?? ''} ${getRoleLabel(value, t)}`.trim()
      : getRoleLabel(value, t),
  }))
}

/**
 * Hook cung cấp status labels và options đa ngôn ngữ theo reactive translation context.
 */
export function useStatusLabel() {
  const { t } = useTranslation()

  return useMemo(
    () => ({
      getOrderStatusLabel: (status: string) => getOrderStatusLabel(status, t),
      getDishStatusLabel: (status: string) => getDishStatusLabel(status, t),
      getTableStatusLabel: (status: string) => getTableStatusLabel(status, t),
      getBillStatusLabel: (status: string) => getBillStatusLabel(status, t),
      getRoleLabel: (role: string) => getRoleLabel(role, t),
      getPaymentMethodLabel: (method: string) => getPaymentMethodLabel(method, t),

      orderStatusOptions: getOrderStatusOptions(t, true),
      dishStatusOptions: getDishStatusOptions(t, true),
      tableStatusOptions: getTableStatusOptions(t, true),
      billStatusOptions: getBillStatusOptions(t, true),
      paymentMethodOptions: getPaymentMethodOptions(t, true),
      roleOptions: getRoleOptions(t, true),

      orderStatusOptionsPlain: getOrderStatusOptions(t, false),
      dishStatusOptionsPlain: getDishStatusOptions(t, false),
      tableStatusOptionsPlain: getTableStatusOptions(t, false),
      billStatusOptionsPlain: getBillStatusOptions(t, false),
      paymentMethodOptionsPlain: getPaymentMethodOptions(t, false),
      roleOptionsPlain: getRoleOptions(t, false),
    }),
    [t]
  )
}
