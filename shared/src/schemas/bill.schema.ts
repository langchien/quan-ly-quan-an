import z from "zod";
import { BillStatusValues, PaymentMethodValues } from '../constants.js'
import { OrderSchema } from './order.schema.js'

export const BillSchema = z.object({
  id: z.number(),
  orderCode: z.number(),
  guestId: z.number().nullable(),
  tableNumber: z.number().nullable(),
  orderHandlerId: z.number().nullable(),
  totalAmount: z.number(),
  status: z.enum(BillStatusValues),
  paymentMethod: z.enum(PaymentMethodValues),
  paymentLinkId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  qrCode: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BillSchemaType = z.TypeOf<typeof BillSchema>;

export const BillWithOrdersSchema = BillSchema.extend({
  orders: z.array(OrderSchema),
});

export type BillWithOrdersSchemaType = z.output<typeof BillWithOrdersSchema>;

// --- Request / Response schemas ---

export const CreatePaymentLinkBody = z.object({
  guestId: z.number(),
});

export type CreatePaymentLinkBodyType = z.TypeOf<typeof CreatePaymentLinkBody>;

export const CreatePaymentLinkRes = z.object({
  message: z.string(),
  data: z.object({
    billId: z.number(),
    checkoutUrl: z.string(),
    qrCode: z.string(),
    orderCode: z.number(),
  }),
});

export type CreatePaymentLinkResType = z.TypeOf<typeof CreatePaymentLinkRes>;

export const PayOSWebhookBody = z.object({
  code: z.string(),
  desc: z.string(),
  success: z.boolean(),
  data: z
    .object({
      orderCode: z.number(),
      amount: z.number(),
      description: z.string(),
      accountNumber: z.string().optional(),
      reference: z.string().optional(),
      transactionDateTime: z.string().optional(),
      currency: z.string().optional(),
      paymentLinkId: z.string().optional(),
      code: z.string().optional(),
      desc: z.string().optional(),
      counterAccountBankId: z.string().nullable().optional(),
      counterAccountBankName: z.string().nullable().optional(),
      counterAccountName: z.string().nullable().optional(),
      counterAccountNumber: z.string().nullable().optional(),
      virtualAccountName: z.string().nullable().optional(),
      virtualAccountNumber: z.string().nullable().optional(),
    })
    .nullable(),
  signature: z.string(),
});

export type PayOSWebhookBodyType = z.TypeOf<typeof PayOSWebhookBody>;

export const GetBillRes = z.object({
  message: z.string(),
  data: BillWithOrdersSchema,
});

export type GetBillResType = z.TypeOf<typeof GetBillRes>;

export const GetGuestBillsRes = z.object({
  message: z.string(),
  data: z.array(BillWithOrdersSchema),
});

export type GetGuestBillsResType = z.TypeOf<typeof GetGuestBillsRes>;
