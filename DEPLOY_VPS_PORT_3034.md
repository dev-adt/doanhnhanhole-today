# Hướng dẫn Triển khai (Deploy) `doanhnhanhole.today` lên VPS (Chạy Port `3034`)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai hệ thống **Doanhnhanhole.today — Doanh nhân Họ Lê Toàn cầu & Những người bạn** lên máy chủ VPS (Ubuntu/Debian Linux) chạy trên cổng **`3034`** với **Node.js + PM2 + MySQL + Nginx + SSL Let's Encrypt**.

---

## 1. Yêu cầu hệ thống trên VPS
- **Hệ điều hành:** Ubuntu 20.04 / 22.04 / 24.04 LTS
- **Node.js:** `v18.x` hoặc `v20.x` LTS
- **MySQL / MariaDB:** `8.0+` hoặc `10.6+`
- **Quản lý tiến trình:** `pm2` (`npm install -g pm2`)
- **Web Server / Reverse Proxy:** `nginx` & `certbot`
- **Port nội bộ ứng dụng:** `3034`

---

## 2. Clone mã nguồn từ GitHub về VPS

Đăng nhập SSH vào VPS và clone dự án vào thư mục `/var/www/doanhnhanhole.today`:

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/dev-adt/doanhnhanhole-today.git doanhnhanhole.today
sudo chown -R $USER:$USER /var/www/doanhnhanhole.today
cd /var/www/doanhnhanhole.today
```

---

## 3. Khởi tạo Cơ sở dữ liệu MySQL

Đăng nhập vào MySQL và tạo database `doanhnhanhole_db`:

```bash
sudo mysql -u root -p
```

Chạy các câu lệnh SQL sau trong giao diện MySQL:

```sql
CREATE DATABASE IF NOT EXISTS doanhnhanhole_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user riêng (hoặc dùng user hiện có trên VPS của bạn):
CREATE USER IF NOT EXISTS 'doanhnhanhole_user'@'localhost' IDENTIFIED BY 'MatKhauManhCuaBan_2026!';
GRANT ALL PRIVILEGES ON doanhnhanhole_db.* TO 'doanhnhanhole_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import cấu trúc bảng và dữ liệu danh mục ban đầu từ file `schema.sql`:

```bash
mysql -u doanhnhanhole_user -p doanhnhanhole_db < /var/www/doanhnhanhole.today/schema.sql
```

*(Lưu ý: Khi khởi động lần đầu, `server.js` cũng tự động kiểm tra và đồng bộ các bảng/cột còn thiếu cũng như 7 chuyên mục chuẩn của Doanhnhanhole.today).*

---

## 4. Cấu hình biến môi trường (`.env`) trên Port `3034`

Tạo file `.env` từ file mẫu `.env.example`:

```bash
cd /var/www/doanhnhanhole.today
cp .env.example .env
nano .env
```

Cập nhật nội dung `.env` như sau:

```env
# Cổng chạy ứng dụng (Bắt buộc 3034)
PORT=3034
NODE_ENV=production
SITE_URL=https://doanhnhanhole.today
ALLOWED_ORIGIN=*

# Kết nối MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=doanhnhanhole_user
DB_PASSWORD=MatKhauManhCuaBan_2026!
DB_NAME=doanhnhanhole_db

# Bảo mật & Tài khoản Quản trị mặc định
JWT_SECRET=doanhnhanhole_global_jwt_secret_key_2026_very_secure
ADMIN_SECRET_KEY=doanhnhanhole_admin_2026
ADMIN_EMAIL=admin@doanhnhanhole.today

# AI Assistant Keys (Tùy chọn cấu hình trong .env hoặc trong trang /admin)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
DEEPSEEK_API_KEY=

# Cấu hình SMTP gửi Email thông báo & Vé QR Sự kiện
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@doanhnhanhole.today
SMTP_PASS=mat_khau_ung_dung_gmail
```

---

## 5. Cài đặt thư viện & Build Frontend

Mặc dù thư mục `public/` đã có sẵn bản build mới nhất từ Git, bạn nên chạy lệnh cài đặt và build lại trên VPS để đảm bảo tương thích tuyệt đối:

```bash
cd /var/www/doanhnhanhole.today

# 1. Cài đặt dependencies cho Backend
npm install --production=false

# 2. Cài đặt dependencies & Build Frontend (Vite xuất thẳng ra /public)
cd frontend
npm install
npm run build
cd ..

# 3. Đảm bảo quyền đọc/ghi cho thư mục uploads và knowledge_base
mkdir -p uploads public/uploads knowledge_base logs
chmod -R 755 uploads public/uploads knowledge_base
```

---

## 6. Khởi chạy ứng dụng trên Port `3034` bằng PM2

File `ecosystem.config.js` trong dự án đã được cấu hình sẵn tên tiến trình `doanhnhanhole-today` và `PORT: 3034`:

```bash
cd /var/www/doanhnhanhole.today

# Khởi chạy ứng dụng qua PM2
pm2 start ecosystem.config.js

# Kiểm tra trạng thái và log
pm2 status
pm2 logs doanhnhanhole-today --lines 50

# Lưu danh sách PM2 để tự khởi động lại khi reboot VPS
pm2 save
pm2 startup
```

Kiểm tra nhanh xem server đã phản hồi tại cổng `3034` chưa:

```bash
curl -I http://127.0.0.1:3034/api/stats
```

---

## 7. Cấu hình Nginx Reverse Proxy trỏ vào Port `3034`

Sao chép cấu hình mẫu `nginx.conf` có sẵn trong dự án vào `/etc/nginx/sites-available/doanhnhanhole.today`:

```bash
sudo cp /var/www/doanhnhanhole.today/nginx.conf /etc/nginx/sites-available/doanhnhanhole.today
```

Hoặc tạo file `/etc/nginx/sites-available/doanhnhanhole.today` (khi **chưa** cài SSL, dùng cấu hình HTTP trước để Certbot xác thực):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name doanhnhanhole.today www.doanhnhanhole.today;

    root /var/www/doanhnhanhole.today/public;
    index index.html;

    client_max_body_size 100M;

    # Phục vụ trực tiếp ảnh/tài liệu upload
    location ^~ /uploads/ {
        alias /var/www/doanhnhanhole.today/public/uploads/;
        try_files $uri /uploads/$uri @backend_uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    location @backend_uploads {
        proxy_pass http://127.0.0.1:3034;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Chuyển toàn bộ request API và SSR OpenGraph sang Node.js port 3034
    location / {
        proxy_pass http://127.0.0.1:3034;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt site trên Nginx và cài đặt chứng chỉ SSL miễn phí với Certbot:

```bash
# Tạo symlink sang sites-enabled
sudo ln -sf /etc/nginx/sites-available/doanhnhanhole.today /etc/nginx/sites-enabled/

# Kiểm tra cú pháp Nginx và reload
sudo nginx -t
sudo systemctl reload nginx

# Cài đặt SSL HTTPS tự động qua Certbot
sudo certbot --nginx -d doanhnhanhole.today -d www.doanhnhanhole.today
```

---

## 8. Quy trình Cập nhật (Update) code mới sau này trên VPS

Mỗi khi có thay đổi mới được đẩy lên GitHub, chỉ cần chạy cụm lệnh 1 dòng sau trên VPS:

```bash
cd /var/www/doanhnhanhole.today && git pull origin main && cd frontend && npm install && npm run build && cd .. && pm2 restart doanhnhanhole-today
```

