# 🚀 HƯỚNG DẪN BẮT ĐẦU NHANH (QUICK START CHO WINDOWS)

Tài liệu này hướng dẫn chi tiết từ một **máy tính Windows mới hoàn toàn (chưa cài đặt công cụ phát triển)** cho đến khi ứng dụng **Hệ thống Quản lý Quán ăn & Đặt món qua mã QR** hoạt động trọn vẹn.

---

## 📌 MỤC LỤC
1. [Cài đặt các phần mềm nền tảng](#1-cài-đặt-các-phần-mềm-nền-tảng)
2. [Cấu hình môi trường PowerShell trên Windows](#2-cấu-hình-môi-trường-powershell-trên-windows)
3. [Tải mã nguồn dự án (Clone Repository)](#3-tải-mã-nguồn-dự-án-clone-repository)
4. [Kích hoạt pnpm & Cài đặt thư viện](#4-kích-hoạt-pnpm--cài-đặt-thư-viện)
5. [Thiết lập biến môi trường (.env)](#5-thiết-lập-biến-môi-trường-env)
6. [Khởi động cơ sở dữ liệu PostgreSQL qua Docker](#6-khởi-động-cơ-sở-dữ-liệu-postgresql-qua-docker)
7. [Đồng bộ Database & Nạp dữ liệu ban đầu (Prisma Seed)](#7-đồng-bộ-database--nạp-dữ-liệu-ban-đầu-prisma-seed)
8. [Khởi chạy ứng dụng (Backend & Frontend)](#8-khởi-chạy-ứng-dụng-backend--frontend)
9. [Tài khoản đăng nhập & Trải nghiệm hệ thống](#9-tài-khoản-đăng-nhập--trải-nghiệm-hệ-thống)
10. [Bảng tóm tắt lệnh nhanh (Cheat Sheet)](#10-bảng-tóm-tắt-lệnh-nhanh-cheat-sheet)
11. [Xử lý lỗi thường gặp trên Windows (Troubleshooting)](#11-xử-lý-lỗi-thường-gặp-trên-windows-troubleshooting)

---

## 1. Cài đặt các phần mềm nền tảng

Trên máy tính Windows mới, bạn cần cài đặt 4 công cụ cốt lõi. Bạn có thể tải file cài đặt trực tiếp từ trang chủ hoặc cài đặt nhanh qua **PowerShell** bằng `winget`:

### Cách A: Cài đặt tự động bằng dòng lệnh (Khuyến nghị)
Mở **PowerShell với quyền Administrator** (`Run as Administrator`) và chạy lần lượt:

```powershell
# 1. Cài đặt Git
winget install --id Git.Git -e --source winget

# 2. Cài đặt Node.js LTS (Khuyến nghị bản v20 hoặc v22 LTS)
winget install --id OpenJS.NodeJS.LTS -e --source winget

# 3. Cài đặt Docker Desktop
winget install --id Docker.DockerDesktop -e --source winget

# 4. (Tùy chọn) Cài đặt trình soạn thảo Visual Studio Code
winget install --id Microsoft.VisualStudioCode -e --source winget
```

### Cách B: Tải bộ cài thủ công từ website chính thức
- **Git for Windows**: [https://git-scm.com/download/win](https://git-scm.com/download/win) (Cứ bấm Next theo cấu hình mặc định).
- **Node.js LTS**: [https://nodejs.org/](https://nodejs.org/) (Chọn bản LTS).
- **Docker Desktop**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) (Yêu cầu bật tính năng WSL 2 trong quá trình cài đặt).
- **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

> ⚠️ **LƯU Ý SAU KHI CÀI ĐẶT:** 
> - Khởi động lại máy tính (hoặc đăng xuất rồi đăng nhập lại) để Windows nhận diện đầy đủ biến môi trường `PATH`.
> - Mở ứng dụng **Docker Desktop** lên và đợi thanh trạng thái góc trái hiển thị màu xanh lá cây (**Engine running**).

---

## 2. Cấu hình môi trường PowerShell trên Windows

Mặc định, Windows chặn thực thi các script bên ngoài trong PowerShell (gây lỗi khi chạy `pnpm` hoặc `npx`). 

Mở **PowerShell** và gõ lệnh sau để mở quyền thực thi an toàn:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Nhấn `Y` rồi `Enter` để xác nhận.

---

## 3. Tải mã nguồn dự án (Clone Repository)

Mở thư mục bạn muốn lưu dự án (ví dụ `D:\Projects` hoặc `C:\workspace`), mở PowerShell hoặc Git Bash và chạy:

```powershell
git clone https://github.com/langchien/quan-ly-quan-an.git
cd quan-ly-quan-an
```

---

## 4. Kích hoạt pnpm & Cài đặt thư viện

Dự án được xây dựng theo mô hình **Monorepo (pnpm workspace)** kết nối 3 phân hệ:
- `client`: Ứng dụng web React 19 + Vite
- `server`: API NestJS + Prisma ORM
- `shared`: Thư viện dùng chung (`@app/shared`) chứa Zod schemas và types

### Bước 4.1: Bật `pnpm`
Node.js đã tích hợp sẵn công cụ quản lý package Corepack, chỉ cần bật lên:
```powershell
corepack enable
```
*(Nếu gặp lỗi, bạn có thể cài pnpm qua npm: `npm install -g pnpm`)*.

Kiểm tra pnpm đã hoạt động:
```powershell
pnpm -v
```

### Bước 4.2: Cài đặt toàn bộ dependencies
Tại thư mục gốc của dự án (`quan-ly-quan-an`), chạy:
```powershell
pnpm install
```
*Lệnh này sẽ tự động tải các gói cho root, `server`, `client` và `shared`.*

---

## 5. Thiết lập biến môi trường (.env)

Các file `.env` chứa mật khẩu bí mật nên không được đưa lên Git. Dự án đã chuẩn bị sẵn file mẫu `.env.example`.

Tại thư mục gốc dự án, chạy 2 lệnh sau để tạo file cấu hình:

```powershell
# Tạo cấu hình cho Server
Copy-Item server/.env.example server/.env

# Tạo cấu hình cho Client
Copy-Item client/.env.example client/.env
```
*(Nếu dùng Command Prompt thông thường: `copy server\.env.example server\.env` và `copy client\.env.example client\.env`)*.

### 📝 Chi tiết cấu hình sẵn:
- **`server/.env`**:
  - `PORT=4000`: Cổng API Backend.
  - `DATABASE_URL="postgresql://user:password@localhost:5432/quan_ly_quan_an?schema=public"`: Kết nối thẳng vào container Docker PostgreSQL.
  - Cấu hình PayOS: Đã có sẵn API Key sandbox phục vụ việc phát triển & kiểm thử thanh toán trực tuyến.
- **`client/.env`**:
  - `VITE_API_URL="http://localhost:4000"`: Địa chỉ API Server.
  - `VITE_WEB_URL="http://localhost:3000"`: Địa chỉ Frontend.

---

## 6. Khởi động cơ sở dữ liệu PostgreSQL qua Docker

1. Đảm bảo ứng dụng **Docker Desktop** đang chạy trên máy tính.
2. Di chuyển vào thư mục `server`:
```powershell
cd server
docker compose up -d
```
3. Kiểm tra container đã hoạt động:
```powershell
docker ps
```
Bạn sẽ thấy container `quan_ly_quan_an_db` đang chạy ở cổng `0.0.0.0:5432->5432/tcp`.

---

## 7. Đồng bộ Database & Nạp dữ liệu ban đầu (Prisma Seed)

Vẫn đứng tại thư mục `server/`, chạy lần lượt 3 lệnh:

### 1. Sinh Prisma Client
```powershell
npx prisma generate
```
*Lệnh này tạo code Prisma Client tại `src/generated/prisma/` theo kiến trúc dự án.*

### 2. Tạo các bảng trong Database
```powershell
pnpm db:push
```
*Lệnh này đồng bộ toàn bộ bảng (Account, Category, Dish, Table, Order, Bill,...) vào cơ sở dữ liệu PostgreSQL.*

### 3. Nạp dữ liệu ban đầu (Seed Data)
```powershell
pnpm db:seed
```
*Lệnh này tự động tạo:*
- 1 Tài khoản Quản trị viên (Owner)
- 6 Tài khoản Nhân viên (Employee)
- 6 Danh mục món ăn
- 36 Món ăn đặc sản kèm hình ảnh thực tế
- 10 Bàn ăn có kèm mã định danh QR

*(Tùy chọn) Nạp thêm dữ liệu đơn hàng mẫu để kiểm tra biểu đồ doanh thu:*
```powershell
pnpm db:seed-orders
```

*(Tùy chọn) Mở giao diện xem và chỉnh sửa dữ liệu trực tiếp trong trình duyệt:*
```powershell
npx prisma studio
# Truy cập: http://localhost:5555
```

---

## 8. Khởi chạy ứng dụng (Backend & Frontend)

Để làm việc thuận tiện, bạn mở **2 cửa sổ Terminal (PowerShell)**:

### 🖥️ Terminal 1: Khởi chạy Backend (`server`)
```powershell
cd p:\Nodejs\quan-ly-quan-an\server   # (thay bằng đường dẫn dự án của bạn)
pnpm start:dev
```
- Lệnh này sẽ tự động build `@app/shared` và kích hoạt NestJS ở chế độ Hot-reload (tự cập nhật khi sửa code).
- Backend hoạt động tại: **`http://localhost:4000`**

### 💻 Terminal 2: Khởi chạy Frontend (`client`)
```powershell
cd p:\Nodejs\quan-ly-quan-an\client   # (thay bằng đường dẫn dự án của bạn)
pnpm dev
```
- Frontend Vite hoạt động tại: **`http://localhost:3000`**

---

## 9. Tài khoản đăng nhập & Trải nghiệm hệ thống

Mở trình duyệt truy cập: **`http://localhost:3000`**

### 1. Tài khoản quản trị & nhân viên
| Vai trò | Email | Mật khẩu | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **Chủ quán (Owner / Admin)** | `admin@gmail.com` | `123456` | Quản lý toàn quyền: Món ăn, Bàn ăn, Nhân viên, Thống kê doanh thu, Thiết lập quán |
| **Nhân viên (Employee)** | `phuminhdat@gmail.com` | `123456` | Quản lý Đơn hàng (Orders), cập nhật trạng thái món, xuất hóa đơn |
| **Nhân viên (Employee)** | `buianhson@gmail.com` | `123456` | Nhân viên phục vụ |

### 2. Trải nghiệm luồng Đặt món qua mã QR (Guest):
1. Đăng nhập bằng tài khoản Quản trị viên (`admin@gmail.com`).
2. Vào menu **Quản lý bàn** (`/manage/tables`).
3. Chọn một bàn (ví dụ Bàn 1), nhấn vào xem **Mã QR** hoặc mở trực tiếp đường dẫn của bàn.
4. Giao diện khách hàng sẽ mở ra: Chọn món, thêm vào giỏ và nhấn **Đặt món**.
5. Đơn hàng sẽ ngay lập tức được bắn thông báo theo thời gian thực (Real-time Socket.io) về màn hình của Nhân viên & Admin!

---

## 10. Bảng tóm tắt lệnh nhanh (Cheat Sheet)

Sau khi đã thiết lập lần đầu, ở những lần làm việc tiếp theo bạn chỉ cần:

```powershell
# 1. Bật Docker Desktop

# 2. Bật database (nếu chưa chạy)
cd server
docker compose up -d

# 3. Chạy Server (Terminal 1)
pnpm start:dev

# 4. Chạy Client (Terminal 2)
cd ../client
pnpm dev
```

---

## 11. Xử lý lỗi thường gặp trên Windows (Troubleshooting)

### ❓ Lỗi 1: `docker compose up -d` báo lỗi `error during connect: ... open //./pipe/docker_engine`
- **Nguyên nhân**: Docker Desktop chưa được bật hoặc chưa khởi động xong.
- **Cách sửa**: Mở ứng dụng **Docker Desktop** từ Start Menu, đợi vài giây đến khi biểu tượng Docker ở thanh taskbar hiển thị màu xanh ổn định rồi chạy lại lệnh.

### ❓ Lỗi 2: Lỗi cổng 5432 bị chiếm dụng (`port is already allocated`)
- **Nguyên nhân**: Máy Windows của bạn trước đó đã cài đặt dịch vụ PostgreSQL cục bộ chạy dưới dạng Windows Service.
- **Cách sửa**: 
  - Mở `Services` trên Windows (nhấn `Win + R` gõ `services.msc`).
  - Tìm service tên `postgresql-x64-...`, nhấn chuột phải chọn **Stop**.
  - Sau đó chạy lại `docker compose up -d`.

### ❓ Lỗi 3: PowerShell báo `File ... cannot be loaded because running scripts is disabled on this system`
- **Nguyên nhân**: Chính sách bảo mật ExecutionPolicy của PowerShell.
- **Cách sửa**: Chạy lệnh `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` và chọn `Y`.

### ❓ Lỗi 4: `Cannot find module '../src/generated/prisma/client.js'`
- **Nguyên nhân**: Chưa sinh code Prisma Client.
- **Cách sửa**: Tại thư mục `server/`, chạy lệnh `npx prisma generate`.

### ❓ Lỗi 5: Lỗi thiếu thư viện `@app/shared` khi khởi động
- **Nguyên nhân**: Dự án dùng pnpm monorepo, nếu bạn dùng `npm install` thay vì `pnpm install` thì `@app/shared` sẽ không được liên kết đúng.
- **Cách sửa**: Xóa `node_modules` và chạy lại `pnpm install` tại thư mục gốc dự án.
