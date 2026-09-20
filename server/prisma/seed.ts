/**
 * Seed script cho PostgreSQL (NestJS server)
 * Du lieu day du: Owner, Employees (6), Dishes (10), Tables (10)
 *
 * 2 anh goc giu lai tu SQLite:
 *   - 4f2867ef88214b4b961e72cf05e093b4.jpg  => Beef Steak
 *   - e0001b7e08604e0dbabf0d8f95e6174a.jpg  => Spaghetti Y
 *
 * Chay: pnpm db:seed
 */
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { createHash } from 'crypto'

const DATABASE_URL = process.env['DATABASE_URL']
if (!DATABASE_URL) {
  console.error('Thieu DATABASE_URL trong .env')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma = new PrismaClient({ adapter } as any)

// Bcrypt hash cua "123456" (rounds=10) - pre-computed
// Server dung bcrypt.compare() se verify dung
const BCRYPT_HASH_123456 = '$2b$10$yvqkpPMBPNHJAMejp3e9oe7FXJdBk/G9MulZT6RuShpYFvLjJ2K8y'

const BASE_URL = 'http://localhost:4000'

// ─── XOA DU LIEU CU ────────────────────────────────────────────────────────
async function clearAll() {
  console.log('Xoa du lieu cu...')
  await prisma.socket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.dishSnapshot.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.table.deleteMany()
  await prisma.dish.deleteMany()
  // Account co self-relation ownerId, phai reset truoc khi xoa
  await prisma.account.updateMany({ data: { ownerId: null } })
  await prisma.account.deleteMany()
  console.log('=> Da xoa sach.\n')
}

// ─── TAI KHOAN ──────────────────────────────────────────────────────────────
async function seedAccounts() {
  console.log('Tao tai khoan...')

  const owner = await prisma.account.create({
    data: {
      name: 'Duoc Hello 1',
      email: 'admin@order.com',
      password: BCRYPT_HASH_123456,
      role: 'Owner',
    },
  })

  const employeeList = [
    { name: 'Nguyen Van Binh',  email: 'binhnguyen@gmail.com',    avatar: 'c1fbb745767f41b9acce48f3e616388c.png' },
    { name: 'Huynh Ngoc Bich',  email: 'ngocbichhuynh@gmail.com', avatar: 'cf91ff6603e3451282ffff6b86b3a557.png' },
    { name: 'Bui Anh Son',      email: 'buianhson@gmail.com',      avatar: '83ad053992c8494088ee2eb0b3b9c3ac.png' },
    { name: 'Phu Minh Dat',     email: 'phuminhdat@gmail.com',     avatar: '3f32b38ff1ec4d2ea26028f9fd8062f2.png' },
    { name: 'Dang Van Binh',    email: 'dangvanbinh@gmail.com',    avatar: '748759efe4c2407399ff66dfd3f69cce.png' },
    { name: 'Nguyen Binh An',   email: 'duthanhan@gmail.com',      avatar: '4ecd93551be7444c95542614e3c2ce1f.png' },
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

// ─── MON AN ──────────────────────────────────────────────────────────────────
async function seedDishes() {
  console.log('Tao mon an...')

  const dishes = [
    // ✅ 2 anh goc giu nguyen tu SQLite
    { name: 'Beef Steak',       price: 190000, desc: 'Bo bit tet My thuong hang, ap chao vang deu, phuc vu kem khoai tay chien va sot tieu den.',  img: '4f2867ef88214b4b961e72cf05e093b4.jpg' },
    { name: 'Spaghetti Y',      price: 75000,  desc: 'Mi Y sot ca chua bo bam, rac pho mai parmesan va hung que tuoi.',                             img: 'e0001b7e08604e0dbabf0d8f95e6174a.jpg' },
    // Cac mon moi
    { name: 'Banh Mi Viet Nam', price: 35000,  desc: 'Banh mi gion rum nhan thit nguoi, cha lua, dua leo, rau thom va tuong ot.',                  img: '6d05d144f70f4eadbd3a89428645e346.png' },
    { name: 'Pho Bo Dac Biet',  price: 65000,  desc: 'Pho bo nuoc trong vat, thit tai chin, gan, gau. An kem gia song, rau mui, chanh ot.',        img: '207722ef5e92427fbaa9051f1fc06078.png' },
    { name: 'Com Tam Suon Bi',  price: 55000,  desc: 'Com tam suon nuong mat ong, bi, cha trung hap, mo hanh va nuoc mam chua ngot.',               img: 'd1d8056c3bd649dc91b30a47105df993.png' },
    { name: 'Bun Bo Hue',       price: 60000,  desc: 'Bun bo Hue chuan vi, nuoc leo dam da tu xa ot, thit bo va cha cua.',                          img: 'c3e190967ed146889f9e5708a9790fa2.png' },
    { name: 'Ga Nuong Mat Ong', price: 130000, desc: 'Dui ga ta nuong than, uop mat ong va sa, da vang gion, thit mem ngot.',                       img: 'c2a24cf5dd02423a8103e63f1838375f.png' },
    { name: 'Lau Thai Hai San', price: 250000, desc: 'Lau Thai chua cay, hai san tuoi: tom, muc, ngheu, nam kim cham va rau du loai.',              img: '6af7612e0b5848fcbc968465189f11bf.png' },
    { name: 'Cha Gio Ran',      price: 45000,  desc: 'Cha gio vang gion nhan tom thit, rau cu. An kem bun tuoi, rau song va nuoc cham.',            img: '73133e3c103c404b96e4c18b5568753c.png' },
    { name: 'Ca Phe Sua Da',    price: 25000,  desc: 'Ca phe phin truyen thong pha voi sua dac, rot len da bao min. Dam da, mat lanh.',             img: 'bc8f57d7e32c4b298cf11742d9f175cb.png' },
  ]

  for (const d of dishes) {
    await prisma.dish.create({
      data: {
        name: d.name,
        price: d.price,
        description: d.desc,
        image: `${BASE_URL}/static/${d.img}`,
        status: 'Available',
      },
    })
  }

  console.log(`=> Da tao ${dishes.length} mon an.\n`)
}

// ─── BAN AN ──────────────────────────────────────────────────────────────────
async function seedTables() {
  console.log('Tao ban an...')

  const makeToken = (n: number) =>
    createHash('md5').update(`table_${n}_${Date.now()}_${Math.random()}`).digest('hex')

  const tableData = [
    { number: 1,  capacity: 4  },
    { number: 2,  capacity: 4  },
    { number: 3,  capacity: 6  },
    { number: 4,  capacity: 6  },
    { number: 5,  capacity: 8  },
    { number: 6,  capacity: 8  },
    { number: 7,  capacity: 2  },
    { number: 8,  capacity: 2  },
    { number: 9,  capacity: 10 },
    { number: 10, capacity: 10 },
  ]

  for (const t of tableData) {
    await prisma.table.create({
      data: {
        number:   t.number,
        capacity: t.capacity,
        status:   'Available',
        token:    makeToken(t.number),
      },
    })
  }

  console.log(`=> Da tao ${tableData.length} ban an.\n`)
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=========================================')
  console.log('  SEED DATABASE POSTGRESQL (NestJS)')
  console.log('=========================================\n')

  await clearAll()
  await seedAccounts()
  await seedDishes()
  await seedTables()

  console.log('=========================================')
  console.log('  SEED HOAN TAT!')
  console.log('=========================================')
  console.log('  Email Owner : admin@order.com')
  console.log('  Mat khau    : 123456')
  console.log('=========================================')
}

main()
  .catch((e) => {
    console.error('Loi seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
