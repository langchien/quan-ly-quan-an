/**
 * Seed script: Tạo dữ liệu hóa đơn/đơn hàng phong phú từ 01/09/2026 đến 30/09/2026
 *
 * Chạy lệnh: pnpm db:seed-orders (hoặc npx tsx prisma/seed-orders.ts)
 */
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'

const DATABASE_URL = process.env['DATABASE_URL']
if (!DATABASE_URL) {
  console.error('Thiếu DATABASE_URL trong .env')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma = new PrismaClient({ adapter } as any)

// Dữ liệu tên tiếng Việt phong phú
const SURNAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ',
  'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đoàn', 'Đinh'
]
const MIDDLENAMES = [
  'Văn', 'Thị', 'Minh', 'Hải', 'Thanh', 'Đức', 'Quốc', 'Phương',
  'Bảo', 'Gia', 'Ngọc', 'Khánh', 'Thùy', 'Kim', 'Anh', 'Hoàng'
]
const FIRSTNAMES = [
  'An', 'Bình', 'Cường', 'Dũng', 'Dương', 'Đạt', 'Hà', 'Hải',
  'Hiếu', 'Hòa', 'Huy', 'Hương', 'Hưng', 'Khoa', 'Kiên', 'Lâm',
  'Linh', 'Long', 'Mai', 'Minh', 'My', 'Nam', 'Nga', 'Ngân',
  'Nghĩa', 'Ngọc', 'Phong', 'Phúc', 'Phương', 'Quân', 'Quang', 'Sơn',
  'Tâm', 'Thắng', 'Thảo', 'Thịnh', 'Thu', 'Trang', 'Trí', 'Trung',
  'Tuấn', 'Tùng', 'Tú', 'Vinh', 'Vũ', 'Vy', 'Yến'
]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateVietnameseName(): string {
  const sur = getRandomItem(SURNAMES)
  const mid = getRandomItem(MIDDLENAMES)
  const first = getRandomItem(FIRSTNAMES)
  return `${sur} ${mid} ${first}`
}

async function main() {
  console.log('===========================================================')
  console.log('  SEED DỮ LIỆU HÓA ĐƠN / ĐƠN HÀNG (01/09/2026 - 30/09/2026)')
  console.log('===========================================================\n')

  // 1. Lấy danh sách món ăn, bàn, tài khoản
  const dishes = await prisma.dish.findMany()
  if (dishes.length === 0) {
    console.error('Chưa có món ăn nào trong database! Vui lòng chạy pnpm db:seed trước.')
    process.exit(1)
  }

  const tables = await prisma.table.findMany()
  if (tables.length === 0) {
    console.error('Chưa có bàn ăn nào trong database! Vui lòng chạy pnpm db:seed trước.')
    process.exit(1)
  }

  const employees = await prisma.account.findMany({
    where: { role: 'Employee' },
  })
  const owner = await prisma.account.findFirst({
    where: { role: 'Owner' },
  })

  const handlers = employees.length > 0 ? employees : (owner ? [owner] : [])
  if (handlers.length === 0) {
    console.error('Chưa có nhân viên hoặc chủ quán trong database!')
    process.exit(1)
  }

  console.log(`- Món ăn có sẵn   : ${dishes.length} món`)
  console.log(`- Bàn ăn có sẵn   : ${tables.length} bàn`)
  console.log(`- Nhân viên xử lý : ${handlers.length} tài khoản`)

  // 2. Xóa các đơn hàng & khách hàng cũ để dữ liệu mới sạch sẽ, chính xác
  console.log('\nDọn dẹp các đơn hàng & khách hàng cũ trước khi nạp mới...')
  await prisma.order.deleteMany()
  await prisma.dishSnapshot.deleteMany()
  await prisma.guest.deleteMany()
  console.log('✓ Đã dọn dẹp sạch dữ liệu cũ.\n')

  // 3. Khởi tạo các mốc thời gian và kế hoạch đơn hàng
  const YEAR = 2026
  const MONTH = 8 // Tháng 9 (0-indexed: 8 là September)

  let totalGuestsCreated = 0
  let totalOrdersCreated = 0
  let totalRevenue = 0

  console.log('Bắt đầu sinh dữ liệu từ ngày 01/09/2026 đến 30/09/2026...')

  // Vòng lặp 30 ngày của tháng 9
  for (let day = 1; day <= 30; day++) {
    const currentDate = new Date(YEAR, MONTH, day)
    const dayOfWeek = currentDate.getDay() // 0: Chủ Nhật, 6: Thứ Bảy
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isNationalHoliday = day === 2 // Ngày Quốc Khánh 02/09

    // Xác định số lượt khách theo tính chất ngày
    let sessionCount: number
    if (isNationalHoliday) {
      sessionCount = getRandomInt(45, 55) // Ngày lễ đông khách nhất
    } else if (isWeekend) {
      sessionCount = getRandomInt(32, 42) // Cuối tuần đông
    } else {
      sessionCount = getRandomInt(18, 26) // Ngày thường ổn định
    }

    let dayRevenue = 0
    let dayOrdersCount = 0

    // Chuẩn bị mảng transactions cho ngày hiện tại
    for (let s = 0; s < sessionCount; s++) {
      // Xác định khung giờ trong ngày:
      // 15% sáng (07:15 - 09:30), 45% trưa (11:15 - 13:45), 10% xế (14:30 - 16:30), 30% tối (17:30 - 21:15)
      const roll = Math.random()
      let hour: number
      let minute: number = getRandomInt(0, 59)

      if (roll < 0.15) {
        hour = getRandomInt(7, 9)
        if (hour === 9) minute = getRandomInt(0, 30)
      } else if (roll < 0.60) {
        hour = getRandomInt(11, 13)
        if (hour === 13) minute = getRandomInt(0, 45)
      } else if (roll < 0.70) {
        hour = getRandomInt(14, 16)
        if (hour === 16) minute = getRandomInt(0, 30)
      } else {
        hour = getRandomInt(17, 21)
        if (hour === 21) minute = getRandomInt(0, 15)
      }

      const second = getRandomInt(0, 59)
      const sessionTime = new Date(YEAR, MONTH, day, hour, minute, second)

      const guestName = generateVietnameseName()
      const selectedTable = getRandomItem(tables)
      const selectedHandler = getRandomItem(handlers)

      // Tạo Guest
      const guest = await prisma.guest.create({
        data: {
          name: guestName,
          tableNumber: selectedTable.number,
          createdAt: sessionTime,
          updatedAt: sessionTime,
        },
      })
      totalGuestsCreated++

      // Chọn 2 đến 5 món cho lượt khách này
      const numberOfDishes = getRandomInt(2, 5)
      // Lấy ngẫu nhiên các món không trùng nhau
      const shuffledDishes = [...dishes].sort(() => 0.5 - Math.random())
      const selectedDishes = shuffledDishes.slice(0, numberOfDishes)

      for (const dish of selectedDishes) {
        const quantity = getRandomInt(1, 3)

        // Phân phối trạng thái đơn hàng:
        // ~92% Paid, 4% Delivered, 2% Processing/Pending, 2% Rejected
        let status = 'Paid'
        const statusRoll = Math.random()
        if (statusRoll < 0.92) {
          status = 'Paid'
        } else if (statusRoll < 0.96) {
          status = 'Delivered'
        } else if (statusRoll < 0.98) {
          status = 'Processing'
        } else {
          status = 'Rejected'
        }

        // Tạo DishSnapshot
        const snapshot = await prisma.dishSnapshot.create({
          data: {
            name: dish.name,
            price: dish.price,
            description: dish.description,
            image: dish.image,
            dishId: dish.id,
            status: 'Available',
            createdAt: sessionTime,
            updatedAt: sessionTime,
          },
        })

        // Tạo Order
        await prisma.order.create({
          data: {
            guestId: guest.id,
            tableNumber: selectedTable.number,
            dishSnapshotId: snapshot.id,
            quantity: quantity,
            orderHandlerId: selectedHandler.id,
            status: status,
            createdAt: sessionTime,
            updatedAt: sessionTime,
          },
        })

        totalOrdersCreated++
        dayOrdersCount++

        if (status === 'Paid') {
          const itemRevenue = dish.price * quantity
          dayRevenue += itemRevenue
          totalRevenue += itemRevenue
        }
      }
    }

    const dayStr = day < 10 ? `0${day}` : `${day}`
    const dayLabel = isNationalHoliday ? ' (Quốc Khánh 🇻🇳)' : isWeekend ? ' (Cuối tuần)' : ''
    console.log(
      `  [${dayStr}/09/2026${dayLabel}]: ${sessionCount} khách | ${dayOrdersCount} đơn | Doanh thu: ${dayRevenue.toLocaleString('vi-VN')} đ`
    )
  }

  console.log('\n===========================================================')
  console.log('  TỔNG KẾT DỮ LIỆU ĐÃ TẠO THÀNH CÔNG')
  console.log('===========================================================')
  console.log(`- Tổng số lượt khách (Guest)   : ${totalGuestsCreated.toLocaleString('vi-VN')}`)
  console.log(`- Tổng số đơn hàng (Order)     : ${totalOrdersCreated.toLocaleString('vi-VN')}`)
  console.log(`- Tổng doanh thu tháng 9/2026 : ${totalRevenue.toLocaleString('vi-VN')} đ`)
  console.log('===========================================================\n')
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed hóa đơn:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
