import { SHOP_INFO } from '@/lib/shop-info'
import { PaymentMethod } from '@app/shared'
import type { GetGuestBillsResType } from '@app/shared'
import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'

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
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const methodLabel: Record<(typeof PaymentMethod)[keyof typeof PaymentMethod], string> = {
  [PaymentMethod.PayOS]: 'VietQR (PayOS)',
  [PaymentMethod.Cash]: 'Tiền mặt',
}

function BillPdfDocument({ bill, guestName }: { bill: Bill; guestName?: string }) {
  const totalQty = bill.orders.reduce((sum: number, o: BillOrder) => sum + o.quantity, 0)

  return (
    <Document title={`Hoa-don-${bill.orderCode}`} author={SHOP_INFO.name}>
      <Page size='A5' style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.shopName}>{SHOP_INFO.name}</Text>
          <Text style={styles.shopMeta}>{SHOP_INFO.address}</Text>
          <Text style={styles.shopMeta}>Hotline: {SHOP_INFO.phone}</Text>
        </View>

        <Text style={styles.title}>HÓA ĐƠN THANH TOÁN</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã hóa đơn</Text>
          <Text>#{bill.orderCode}</Text>
        </View>
        {bill.tableNumber != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bàn</Text>
            <Text>{bill.tableNumber}</Text>
          </View>
        )}
        {guestName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khách hàng</Text>
            <Text>{guestName}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thời gian</Text>
          <Text>{formatDateTime(bill.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức</Text>
          <Text>{methodLabel[bill.paymentMethod]}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableHeader}>
          <Text style={styles.colName}>Món</Text>
          <Text style={styles.colQty}>SL</Text>
          <Text style={styles.colPrice}>Đơn giá</Text>
          <Text style={styles.colTotal}>Thành tiền</Text>
        </View>
        {bill.orders.map((order: BillOrder) => (
          <View key={order.id} style={styles.tableRow} wrap={false}>
            <View style={styles.colName}>
              <Text>{order.dishSnapshot.name}</Text>
              {order.note ? <Text style={styles.note}>Ghi chú: {order.note}</Text> : null}
            </View>
            <Text style={styles.colQty}>{order.quantity}</Text>
            <Text style={styles.colPrice}>{money(order.dishSnapshot.price)}</Text>
            <Text style={styles.colTotal}>{money(order.dishSnapshot.price * order.quantity)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng ({totalQty} món)</Text>
          <Text style={styles.totalValue}>{money(bill.totalAmount)}</Text>
        </View>

        <Text style={styles.footer}>{SHOP_INFO.thankYou}</Text>
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
  link.download = `hoa-don-${bill.orderCode}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
