# Cách import collection vào postman bằng json

1. Mở Postman
2. Nhấn vào nút "Import"
3. Chọn "File"
4. Tìm đến file json và chọn

5. Chọn "Import"

# Lưu ý quan trọng sau khi import

Vì ownerPassword bị xóa khi export secret, người nhận cần tự điền lại trong Environment:

ownerEmail = admin@gmail.com
ownerPassword = 123456
baseUrl = http://localhost:4000
