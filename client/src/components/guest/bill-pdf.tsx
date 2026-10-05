import { SHOP_INFO } from '@/lib/shop-info'
import type { PaymentMethod, GetGuestBillsResType } from '@app/shared'
import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'
import { getIntlLocale, formatDateTime as formatDateTimeLocale } from '@/lib/i18n/use-locale'
import { getPaymentMethodLabel } from '@/lib/status-label'
import i18n from '@/lib/i18n'

// Module này chỉ được import động (dynamic import) khi khách bấm "Tải PDF"
// để không kéo @react-pdf/renderer vào bundle chính.

type Bill = GetGuestBillsResType['data'][number]
type BillOrder = Bill['orders'][number]

Font.register({
  family: 'BeVietnamPro',
  fonts: [
    { src: '/fonts/BeVietnamPro-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/BeVietnamPro-Bold.ttf', fontWeight: 700 },
  ],
})
// Không tự ngắt từ bằng dấu gạch nối (tiếng Việt sẽ bị ngắt sai)
Font.registerHyphenationCallback(word => [word])

const styles = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontSize: 9, padding: 28, color: '#1f2937' },
  header: { alignItems: 'center', marginBottom: 12 },
  shopName: { fontSize: 15, fontWeight: 700, color: '#ea580c' },
  shopMeta: { fontSize: 8, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  title: { fontSize: 12, fontWeight: 700, textAlign: 'center', marginVertical: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  infoLabel: { color: '#6b7280' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginVertical: 8 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  colName: { flex: 1, paddingLeft: 4, paddingRight: 4 },
  colQty: { width: 28, textAlign: 'center' },
  colPrice: { width: 60, textAlign: 'right' },
  colTotal: { width: 66, textAlign: 'right', paddingRight: 4 },
  note: { fontSize: 7.5, color: '#6b7280', marginTop: 1 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  totalLabel: { fontSize: 11, fontWeight: 700 },
  totalValue: { fontSize: 12, fontWeight: 700, color: '#ea580c' },
  footer: { marginTop: 18, textAlign: 'center', color: '#6b7280', fontSize: 8 },
})

// Dùng "đ" thay cho ký hiệu ₫ để tương thích mọi font
function money(value: number) {
  return `${new Intl.NumberFormat(getIntlLocale()).format(value)} đ`
}

function formatDateTime(date: string | Date) {
  return formatDateTimeLocale(date)
}

function getMethodLabel(method: (typeof PaymentMethod)[keyof typeof PaymentMethod]) {
  return getPaymentMethodLabel(method)
}

interface BillPdfDocumentProps {
  bill: Bill
  guestName?: string
}

function BillPdfDocument({ bill, guestName }: BillPdfDocumentProps) {
  const totalQty = bill.orders.reduce((sum: number, o: BillOrder) => sum + o.quantity, 0)
  const fileTitle = i18n.t('guest:pdf.fileName', { code: bill.orderCode })

  return (
    <Document title={fileTitle} author={SHOP_INFO.name}>
      <Page size='A5' style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.shopName}>{SHOP_INFO.name}</Text>
          <Text style={styles.shopMeta}>{SHOP_INFO.address}</Text>
          <Text style={styles.shopMeta}>
            {i18n.t('guest:pdf.hotline', { phone: SHOP_INFO.phone })}
          </Text>
        </View>

        <Text style={styles.title}>{i18n.t('guest:pdf.heading')}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{i18n.t('guest:pdf.code')}</Text>
          <Text>#{bill.orderCode}</Text>
        </View>
        {bill.tableNumber != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{i18n.t('guest:pdf.table')}</Text>
            <Text>{bill.tableNumber}</Text>
          </View>
        )}
        {guestName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{i18n.t('guest:pdf.customer')}</Text>
            <Text>{guestName}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{i18n.t('guest:pdf.time')}</Text>
          <Text>{formatDateTime(bill.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{i18n.t('guest:pdf.method')}</Text>
          <Text>{getMethodLabel(bill.paymentMethod)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableHeader}>
          <Text style={styles.colName}>{i18n.t('guest:pdf.colDish')}</Text>
          <Text style={styles.colQty}>{i18n.t('guest:pdf.colQty')}</Text>
          <Text style={styles.colPrice}>{i18n.t('guest:pdf.colPrice')}</Text>
          <Text style={styles.colTotal}>{i18n.t('guest:pdf.colTotal')}</Text>
        </View>
        {bill.orders.map((order: BillOrder) => (
          <View key={order.id} style={styles.tableRow} wrap={false}>
            <View style={styles.colName}>
              <Text>{order.dishSnapshot.name}</Text>
              {order.note ? (
                <Text style={styles.note}>{i18n.t('guest:pdf.note', { note: order.note })}</Text>
              ) : null}
            </View>
            <Text style={styles.colQty}>{order.quantity}</Text>
            <Text style={styles.colPrice}>{money(order.dishSnapshot.price)}</Text>
            <Text style={styles.colTotal}>{money(order.dishSnapshot.price * order.quantity)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {i18n.t('guest:pdf.totalWithCount', { count: totalQty })}
          </Text>
          <Text style={styles.totalValue}>{money(bill.totalAmount)}</Text>
        </View>

        <Text style={styles.footer}>{i18n.t('guest:pdf.thankYou')}</Text>
      </Page>
    </Document>
  )
}

/** Tạo PDF hóa đơn và kích hoạt tải xuống trên trình duyệt */
export async function downloadBillPdf(bill: Bill, guestName?: string) {
  const blob = await pdf(<BillPdfDocument bill={bill} guestName={guestName} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${i18n.t('guest:pdf.fileName', { code: bill.orderCode })}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
