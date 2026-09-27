/**
 * Seed script cho PostgreSQL (NestJS server)
 * Du lieu day du: Owner, Employees (6), Categories (6), Dishes (36), Tables (10)
 *
 * 2 anh goc giu lai tu SQLite:
 *   - 4f2867ef88214b4b961e72cf05e093b4.jpg  => Beef Steak
 *   - e0001b7e08604e0dbabf0d8f95e6174a.jpg  => Spaghetti Y
 *
 * Chay: pnpm db:seed
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { createHash } from 'crypto'
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { dishesData } from './dishes.data.js'

const DATABASE_URL = process.env['DATABASE_URL']
if (!DATABASE_URL) {
  console.error('Thieu DATABASE_URL trong .env')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma = new PrismaClient({ adapter } as any)

// Bcrypt hash cua "123456" (rounds=10) - pre-computed
// Server dung bcrypt.compare() se verify dung
const BCRYPT_HASH_123456 = '$2b$10$IF77GvFYy6M5MF53l008jeX8vE4a5X9xeyX2Hn7JC5eKqQjoamJAq'

const BASE_URL = 'http://localhost:4000'

// XOA DU LIEU CU
async function clearAll() {
  console.log('Xoa du lieu cu...')
  await prisma.socket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.dishSnapshot.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.table.deleteMany()
  await prisma.dish.deleteMany()
  await prisma.category.deleteMany()
  // Account co self-relation ownerId, phai reset truoc khi xoa
  await prisma.account.updateMany({ data: { ownerId: null } })
  await prisma.account.deleteMany()
  console.log('=> Da xoa sach.\n')
}

// TAI KHOAN
async function seedAccounts() {
  console.log('Tao tai khoan...')

  const owner = await prisma.account.create({
    data: {
      name: 'Lăng Tiến',
      email: process.env['INITIAL_EMAIL_OWNER'] ?? 'admin@gmail.com',
      password: BCRYPT_HASH_123456,
      role: 'Owner',
    },
  })

  const employeeList = [
    {
      name: 'Nguyen Van Binh',
      email: 'binhnguyen@gmail.com',
      avatar: 'c1fbb745767f41b9acce48f3e616388c.png',
    },
    {
      name: 'Huynh Ngoc Bich',
      email: 'ngocbichhuynh@gmail.com',
      avatar: 'cf91ff6603e3451282ffff6b86b3a557.png',
    },
    {
      name: 'Bui Anh Son',
      email: 'buianhson@gmail.com',
      avatar: '83ad053992c8494088ee2eb0b3b9c3ac.png',
    },
    {
      name: 'Phu Minh Dat',
      email: 'phuminhdat@gmail.com',
      avatar: '3f32b38ff1ec4d2ea26028f9fd8062f2.png',
    },
    {
      name: 'Dang Van Binh',
      email: 'dangvanbinh@gmail.com',
      avatar: '748759efe4c2407399ff66dfd3f69cce.png',
    },
    {
      name: 'Nguyen Binh An',
      email: 'duthanhan@gmail.com',
      avatar: '4ecd93551be7444c95542614e3c2ce1f.png',
    },
  ]

  for (const emp of employeeList) {
    await prisma.account.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: BCRYPT_HASH_123456,
        role: 'Employee',
        avatar: `${BASE_URL}/static/${emp.avatar}`,
        ownerId: owner.id,
      },
    })
  }

  console.log(`=> Da tao 1 Owner + ${employeeList.length} Employees.\n`)
}

// DANH MUC
const CATEGORY_DATA = [
  { name: 'Phở & Bún', order: 1 },
  { name: 'Cơm & Xôi', order: 2 },
  { name: 'Đặc sản vùng miền', order: 3 },
  { name: 'Bánh', order: 4 },
  { name: 'Đồ uống & Tráng miệng', order: 5 },
  { name: 'Món nướng & Lẩu', order: 6 },
] as const

// Map tên món → tên danh mục
const DISH_CATEGORY_MAP: Record<string, string> = {
  // Phở & Bún
  'Phở Hà Nội': 'Phở & Bún',
  'Bún Chả Hà Nội': 'Phở & Bún',
  'Bún Bò Huế': 'Phở & Bún',
  'Bún Cá Nha Trang': 'Phở & Bún',
  'Bún Quậy Phú Quốc': 'Phở & Bún',
  'Phở Chua Lạng Sơn': 'Phở & Bún',
  'Mì Quảng Hội An': 'Phở & Bún',
  'Cao Lầu Hội An': 'Phở & Bún',
  'Hủ Tiếu Mỹ Tho': 'Phở & Bún',
  'Bánh Đa Cua Hải Phòng': 'Phở & Bún',
  'Bánh Canh Hẹ Phú Yên': 'Phở & Bún',

  // Cơm & Xôi
  'Cơm Cháy Ninh Bình': 'Cơm & Xôi',
  'Xôi Nếp Nương Điện Biên': 'Cơm & Xôi',
  'Mèn Mén Hà Giang': 'Cơm & Xôi',

  // Đặc sản vùng miền
  'Chả Mực Hạ Long': 'Đặc sản vùng miền',
  'Thắng Cố Lào Cai': 'Đặc sản vùng miền',
  'Vịt Quay 7 Vị Cao Bằng': 'Đặc sản vùng miền',
  'Nem Nắm Giao Thủy': 'Đặc sản vùng miền',
  'Gỏi Cá Nam Ô Đà Nẵng': 'Đặc sản vùng miền',
  'Mắt Cá Ngừ Đại Dương Phú Yên': 'Đặc sản vùng miền',
  'Bánh Tráng Cuốn Thịt Heo Hai Da Đà Nẵng': 'Đặc sản vùng miền',
  'Canh Don Quảng Ngãi': 'Đặc sản vùng miền',
  'Gỏi Cá Trích Phú Quốc': 'Đặc sản vùng miền',
  'Bò Tơ Tây Ninh': 'Đặc sản vùng miền',
  'Mắm Châu Đốc': 'Đặc sản vùng miền',

  // Bánh
  'Bánh Bèo Huế': 'Bánh',
  'Bánh Căn Nha Trang': 'Bánh',
  'Bánh Mì Xíu Mại Đà Lạt': 'Bánh',
  'Bánh Mì Sài Gòn': 'Bánh',
  'Bánh Cống Cần Thơ': 'Bánh',
  'Bánh Khọt Vũng Tàu': 'Bánh',
  'Bánh Đúc Lá Dứa Miền Tây': 'Bánh',
  'Bánh Pía Sóc Trăng': 'Bánh',

  // Đồ uống & Tráng miệng
  'Chè Tân Cương Thái Nguyên': 'Đồ uống & Tráng miệng',
  'Kẹo Dừa Bến Tre': 'Đồ uống & Tráng miệng',

  // Món nướng & Lẩu
  'Lẩu Mắm Miền Tây': 'Món nướng & Lẩu',
}

async function seedCategories() {
  console.log('Tao danh muc...')

  const categoryMap = new Map<string, number>()

  for (const cat of CATEGORY_DATA) {
    const created = await prisma.category.create({
      data: { name: cat.name, order: cat.order },
    })
    categoryMap.set(cat.name, created.id)
  }

  console.log(`=> Da tao ${CATEGORY_DATA.length} danh muc.\n`)
  return categoryMap
}

// MON AN
async function seedDishes(categoryMap: Map<string, number>) {
  console.log('Tao mon an...')

  for (const d of dishesData) {
    const categoryName = DISH_CATEGORY_MAP[d.name]
    const categoryId = categoryName ? categoryMap.get(categoryName) ?? null : null

    await prisma.dish.create({
      data: {
        name: d.name,
        price: d.price,
        description: d.description,
        image: `${BASE_URL}/static/${d.image}`,
        status: 'Available',
        categoryId,
      },
    })
  }

  console.log(`=> Da tao ${dishesData.length} mon an tu dishes.data.ts.\n`)
}

// BAN AN
async function seedTables() {
  console.log('Tao ban an...')

  const makeToken = (n: number) =>
    createHash('md5').update(`table_${n}_${Date.now()}_${Math.random()}`).digest('hex')

  const tableData = [
    { number: 1, capacity: 4 },
    { number: 2, capacity: 4 },
    { number: 3, capacity: 6 },
    { number: 4, capacity: 6 },
    { number: 5, capacity: 8 },
    { number: 6, capacity: 8 },
    { number: 7, capacity: 2 },
    { number: 8, capacity: 2 },
    { number: 9, capacity: 10 },
    { number: 10, capacity: 10 },
  ]

  for (const t of tableData) {
    await prisma.table.create({
      data: {
        number: t.number,
        capacity: t.capacity,
        status: 'Available',
        token: makeToken(t.number),
      },
    })
  }

  console.log(`=> Da tao ${tableData.length} ban an.\n`)
}

// MAIN
async function main() {
  console.log('=========================================')
  console.log('  SEED DATABASE POSTGRESQL (NestJS)')
  console.log('=========================================\n')

  await clearAll()
  await seedAccounts()
  const categoryMap = await seedCategories()
  await seedDishes(categoryMap)
  await seedTables()

  console.log('=========================================')
  console.log('  SEED HOAN TAT!')
  console.log('=========================================')
  console.log(`  Email Owner : ${process.env['INITIAL_EMAIL_OWNER'] ?? 'admin@gmail.com'}`)
  console.log('  Mat khau    : 123456')
  console.log('=========================================')
}

main()
  .catch(e => {
    console.error('Loi seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
