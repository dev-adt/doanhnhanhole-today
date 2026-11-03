-- ============================================
-- Laocai.today — MySQL Database Schema
-- Nền tảng thông tin, dữ liệu, truyền thông và kết nối đầu tư Lào Cai
-- Database: laocai_db | User: laocai_user
-- ============================================

-- ── 1. Bảng hội viên doanh nghiệp ─────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL COMMENT 'Tên doanh nghiệp / Đơn vị',
  tax_code              VARCHAR(20)  COMMENT 'Mã số thuế',
  license               VARCHAR(50)  COMMENT 'Số giấy phép kinh doanh',
  industry              VARCHAR(100) COMMENT 'Ngành nghề / Lĩnh vực',
  size                  VARCHAR(50)  COMMENT 'Quy mô nhân sự',
  address               TEXT         COMMENT 'Địa chỉ',
  city                  VARCHAR(100) DEFAULT NULL COMMENT 'Tỉnh / Thành phố',
  website               VARCHAR(255) COMMENT 'Website',
  social                VARCHAR(255) COMMENT 'Fanpage / LinkedIn',
  description           TEXT         COMMENT 'Mô tả hoạt động',
  tier                  ENUM('Silver','Gold','Platinum') DEFAULT 'Silver' COMMENT 'Gói hội viên',
  tier_expires_at       TIMESTAMP    NULL DEFAULT NULL COMMENT 'Hạn gói hội viên',
  pending_tier_upgrade  ENUM('Silver','Gold','Platinum') DEFAULT NULL COMMENT 'Yêu cầu nâng cấp gói',
  is_featured           TINYINT(1)   DEFAULT 0 COMMENT '1: Hội viên tiêu biểu ghim trang chủ',
  status                ENUM('pending','approved','rejected','suspended') DEFAULT 'pending' COMMENT 'Trạng thái tài khoản',
  contact_name          VARCHAR(100) COMMENT 'Tên người đại diện',
  contact_pos           VARCHAR(100) COMMENT 'Chức vụ',
  email                 VARCHAR(255) DEFAULT NULL COMMENT 'Email liên hệ',
  username              VARCHAR(100) UNIQUE DEFAULT NULL COMMENT 'Tên đăng nhập',
  password_hash         VARCHAR(255) DEFAULT NULL COMMENT 'Mật khẩu mã hóa',
  phone                 VARCHAR(20)  COMMENT 'Số điện thoại',
  goal                  TEXT         COMMENT 'Mục tiêu tham gia',
  referral              VARCHAR(100) COMMENT 'Biết đến qua kênh nào',
  reject_reason         TEXT         COMMENT 'Lý do từ chối',
  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_tier (tier),
  INDEX idx_industry (industry),
  INDEX idx_city (city)
) ENGINE=InnoDB COMMENT='Danh sách hội viên doanh nghiệp';

-- ── 2. Bảng phiên đăng nhập hội viên ─────────────────────────
CREATE TABLE IF NOT EXISTS member_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  token         VARCHAR(255) NOT NULL UNIQUE,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB COMMENT='Token phiên đăng nhập hội viên';

-- ── 3. Bảng quản trị viên hệ thống ───────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  role          ENUM('superadmin','admin','editor','creator','member') DEFAULT 'admin',
  last_login    TIMESTAMP NULL DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Tài khoản quản trị và ban điều hành';

-- ── 4. Bảng phiên đăng nhập quản trị ─────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  admin_id      INT NOT NULL,
  token         VARCHAR(255) NOT NULL UNIQUE,
  expires_at    DATETIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB COMMENT='Phiên đăng nhập quản trị viên';

-- ── 5. Bảng ban biên tập & Creator ───────────────────────────
CREATE TABLE IF NOT EXISTS content_creators (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  requires_approval TINYINT(1) DEFAULT 1,
  phone         VARCHAR(50)  DEFAULT NULL,
  email         VARCHAR(191) DEFAULT NULL,
  role          VARCHAR(50)  DEFAULT 'creator',
  status        VARCHAR(50)  DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Tài khoản Ban biên tập & Creator';

-- ── 6. Bảng phiên đăng nhập Creator ──────────────────────────
CREATE TABLE IF NOT EXISTS creator_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  creator_id    INT NOT NULL,
  token         VARCHAR(255) NOT NULL UNIQUE,
  expires_at    DATETIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES content_creators(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB COMMENT='Phiên đăng nhập Biên tập viên / Creator';

-- ── 7. Bảng ban tổ chức sự kiện & soát vé ────────────────────
CREATE TABLE IF NOT EXISTS event_organizers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(50)  DEFAULT NULL,
  email         VARCHAR(191) DEFAULT NULL,
  role          VARCHAR(50)  DEFAULT 'organizer' COMMENT 'organizer hoặc ticket_inspector',
  status        VARCHAR(50)  DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Tài khoản Ban tổ chức Sự kiện & Soát vé';

-- ── 8. Bảng phiên đăng nhập Ban tổ chức sự kiện ───────────────
CREATE TABLE IF NOT EXISTS organizer_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id  INT NOT NULL,
  token         VARCHAR(255) NOT NULL UNIQUE,
  expires_at    DATETIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES event_organizers(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB COMMENT='Phiên đăng nhập Ban tổ chức Sự kiện';

-- ── 9. Bảng bài viết & tin tức ───────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  member_id           INT          DEFAULT NULL COMMENT 'NULL nếu là bài từ ban biên tập/creator',
  creator_id          INT          DEFAULT NULL COMMENT 'NULL nếu là bài từ hội viên',
  title               VARCHAR(255) NOT NULL,
  slug                VARCHAR(550) DEFAULT NULL,
  category            VARCHAR(100) DEFAULT 'Tin tức',
  sub_category        VARCHAR(100) DEFAULT NULL,
  summary             TEXT,
  body                LONGTEXT     NOT NULL,
  image_url           VARCHAR(1000) DEFAULT NULL,
  author_name         VARCHAR(100),
  author_pos          VARCHAR(100),
  contact_info        VARCHAR(255),
  source_url          VARCHAR(500) DEFAULT NULL,
  tags                JSON         DEFAULT NULL,
  deadline            VARCHAR(50)  DEFAULT NULL,
  type                VARCHAR(50)  DEFAULT 'Tin tức' COMMENT 'Tìm đối tác, Cần mua, Cần bán, Tin tức...',
  status              ENUM('draft','pending','approved','rejected','hidden') DEFAULT 'pending',
  is_featured         TINYINT(1)   DEFAULT 0,
  featured_requested  TINYINT(1)   DEFAULT 0,
  reject_reason       TEXT         DEFAULT NULL,
  published_at        TIMESTAMP    NULL DEFAULT NULL,
  views               INT          DEFAULT 0,
  likes               INT          DEFAULT 0,
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_created (created_at),
  INDEX idx_category (category),
  INDEX idx_creator (creator_id),
  INDEX idx_slug (slug)
) ENGINE=InnoDB COMMENT='Bài viết và tin đăng doanh nghiệp';

-- ── 10. Bảng sự kiện & hội thảo ──────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL COMMENT 'Tiêu đề sự kiện',
  slug          VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn thân thiện',
  short_desc    TEXT         DEFAULT NULL COMMENT 'Mô tả ngắn',
  description   TEXT         DEFAULT NULL COMMENT 'Tóm tắt sự kiện',
  content       LONGTEXT     DEFAULT NULL COMMENT 'Nội dung chi tiết (Rich Text HTML)',
  event_date    DATETIME     NOT NULL     COMMENT 'Thời gian bắt đầu',
  end_date      DATETIME     DEFAULT NULL COMMENT 'Thời gian kết thúc',
  location      VARCHAR(255) DEFAULT NULL COMMENT 'Địa điểm tổ chức',
  organizer     VARCHAR(100) DEFAULT 'Tạp chí Doanh Nghiệp Việt Nam',
  capacity      INT          DEFAULT 0    COMMENT 'Giới hạn số lượng vé (0 = không giới hạn)',
  image_url     VARCHAR(500) DEFAULT NULL COMMENT 'Ảnh đại diện sự kiện',
  is_paid       TINYINT(1)   DEFAULT 0    COMMENT '0: Miễn phí, 1: Có thu phí',
  price         DECIMAL(15,2) DEFAULT 0   COMMENT 'Mức phí (đ/vé)',
  is_published  TINYINT(1)   DEFAULT 1    COMMENT '1: Công khai lên website, 0: Ẩn',
  status        ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date),
  INDEX idx_status (status),
  INDEX idx_published (is_published)
) ENGINE=InnoDB COMMENT='Quản lý sự kiện và hội thảo doanh nghiệp';

-- ── 11. Bảng đăng ký tham gia sự kiện & cấp vé QR ───────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT          NOT NULL,
  member_id       INT          DEFAULT NULL COMMENT 'Khóa ngoại liên kết hội viên (nếu có)',
  ticket_code     VARCHAR(50)  NOT NULL UNIQUE COMMENT 'Mã vé / Mã QR check-in',
  full_name       VARCHAR(150) NOT NULL COMMENT 'Họ và tên người đăng ký',
  phone           VARCHAR(30)  NOT NULL COMMENT 'Số điện thoại',
  email           VARCHAR(255) DEFAULT NULL COMMENT 'Email nhận thông tin',
  company         VARCHAR(255) DEFAULT NULL COMMENT 'Đơn vị / Công ty',
  quantity        INT          DEFAULT 1    COMMENT 'Số lượng vé đăng ký',
  total_amount    DECIMAL(15,2) DEFAULT 0   COMMENT 'Tổng tiền thanh toán (VNĐ)',
  payment_status  ENUM('free','pending','paid','cancelled') DEFAULT 'free' COMMENT 'Trạng thái thanh toán',
  payment_note    VARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú / Cú pháp chuyển khoản',
  payment_proof   VARCHAR(500) DEFAULT NULL COMMENT 'Ảnh chứng từ thanh toán chuyển khoản',
  checkin_status  ENUM('not_checked_in','checked_in') DEFAULT 'not_checked_in' COMMENT 'Trạng thái điểm danh',
  checkin_time    DATETIME     DEFAULT NULL COMMENT 'Thời gian quét mã QR check-in',
  create_account  TINYINT(1)   DEFAULT 0    COMMENT 'Yêu cầu tạo tài khoản theo dõi',
  notes           TEXT         DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event (event_id),
  INDEX idx_ticket (ticket_code),
  INDEX idx_phone (phone),
  INDEX idx_reg_member (member_id),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB COMMENT='Danh sách đăng ký tham gia sự kiện và vé QR';

-- ── 12. Bảng quan tâm sự kiện (Tương thích ngược) ───────────
CREATE TABLE IF NOT EXISTS event_interests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  event_id      INT NOT NULL,
  member_id     INT DEFAULT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event (event_id),
  INDEX idx_member (member_id)
) ENGINE=InnoDB COMMENT='Đăng ký quan tâm sự kiện';

-- ── 13. Bảng Leads & Đăng ký tư vấn doanh nghiệp ─────────────
CREATE TABLE IF NOT EXISTS leads (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) DEFAULT NULL,
  city          VARCHAR(100) DEFAULT NULL,
  member_type   VARCHAR(100) DEFAULT 'Tư vấn chung',
  company_name  VARCHAR(255) DEFAULT NULL,
  notes         TEXT         DEFAULT NULL,
  status        VARCHAR(50)  DEFAULT 'new',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='Danh sách khách hàng tiềm năng & đăng ký tư vấn';

-- ── 14. Bảng chuyên mục & lĩnh vực con (Song ngữ) ───────────
CREATE TABLE IF NOT EXISTS categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255) DEFAULT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  order_index   INT DEFAULT 0,
  status        ENUM('active', 'inactive') DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Chuyên mục chính';

CREATE TABLE IF NOT EXISTS sub_categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255) DEFAULT NULL,
  slug          VARCHAR(255),
  order_index   INT DEFAULT 0,
  status        ENUM('active', 'inactive') DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id)
) ENGINE=InnoDB COMMENT='Lĩnh vực con';

-- ── 15. Bảng cấu hình AI & Trợ lý ảo ─────────────────────────
CREATE TABLE IF NOT EXISTS ai_config (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  provider            VARCHAR(50)  NOT NULL DEFAULT 'openrouter',
  model               VARCHAR(100) NOT NULL,
  system_prompt       TEXT,
  system_instruction  TEXT DEFAULT NULL,
  is_active           TINYINT(1)   DEFAULT 1,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Cấu hình AI Proxy';

-- ── 16. Bảng lưu trữ lịch sử hội thoại AI Chat ───────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_id    VARCHAR(100) NOT NULL,
  member_id     INT          DEFAULT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',
  content       LONGTEXT     NOT NULL,
  provider      VARCHAR(50)  DEFAULT NULL,
  model         VARCHAR(100) DEFAULT NULL,
  tokens_in     INT          DEFAULT 0,
  tokens_out    INT          DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_member (member_id)
) ENGINE=InnoDB COMMENT='Lịch sử trò chuyện với AI Bot';

-- ============================================
-- DỮ LIỆU KHỞI TẠO MẪU (Laocai.today)
-- ============================================

-- Admin mặc định (Username: admin | Password: Admin@123)
INSERT INTO admins (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$3luJFH.EMVPnxeH8BdXn9.5tnCQ9huv13yzOzHrwYGiRhgV7dcufq', 'Ban Quản trị Laocai.today', 'admin@laocai.today', 'superadmin')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Cấu hình AI mặc định (Google Gemini Flash qua OpenRouter / Google API)
INSERT INTO ai_config (provider, model, is_active) VALUES ('openrouter', 'google/gemini-3-flash-preview', 1)
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- Khởi tạo 7 Chuyên mục chính Lào Cai
INSERT INTO categories (name, name_en, slug, order_index, status) VALUES
('Khám phá Lào Cai', 'Discover Lao Cai', 'kham-pha-lao-cai', 1, 'active'),
('Doanh nghiệp & Sản phẩm', 'Enterprises & Products', 'doanh-nghiep-san-pham', 2, 'active'),
('Dự án & Đầu tư', 'Projects & Investment', 'du-an-dau-tu', 3, 'active'),
('Cửa khẩu & Logistics', 'Border Gate & Logistics', 'cua-khau-logistics', 4, 'active'),
('Nông sản & Dược liệu', 'Agro-Forestry & Medicinal Herbs', 'nong-san-duoc-lieu', 5, 'active'),
('Du lịch & Trải nghiệm', 'Tourism & Experiences', 'du-lich-trai-nghiem', 6, 'active'),
('Sự kiện & Diễn đàn', 'Events & Forums', 'su-kien-dien-dan', 7, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Khởi tạo Lĩnh vực con tương ứng
INSERT INTO sub_categories (category_id, name, name_en, slug, order_index, status) VALUES
(1, 'Tổng quan & Vị thế', 'Overview & Position', 'tong-quan-vi-the', 1, 'active'),
(1, 'Bản sắc vùng cao', 'Highland Identity', 'ban-sac-vung-cao', 2, 'active'),
(1, 'Quy hoạch & Hạ tầng', 'Planning & Infrastructure', 'quy-hoach-ha-tang', 3, 'active'),
(2, 'Danh bạ Doanh nghiệp', 'Business Directory', 'danh-ba-doanh-nghiep', 1, 'active'),
(2, 'Thương hiệu & OCOP Lào Cai', 'Lao Cai OCOP & Brands', 'thuong-hieu-ocop-lao-cai', 2, 'active'),
(2, 'Showroom số B2B', 'B2B Digital Showroom', 'showroom-so-b2b', 3, 'active'),
(3, 'Dự án kêu gọi đầu tư', 'Investment-Ready Projects', 'du-an-keu-goi-dau-tu', 1, 'active'),
(3, 'Khu kinh tế & KCN', 'Economic & Industrial Zones', 'khu-kinh-te-kcn', 2, 'active'),
(3, 'Chính sách & Ưu đãi', 'Incentives & Policies', 'chinh-sach-uu-dai', 3, 'active'),
(4, 'Kinh tế cửa khẩu Kim Thành', 'Kim Thanh Border Gate Economy', 'kinh-te-cua-khau-kim-thanh', 1, 'active'),
(4, 'Hành lang Côn Minh – Lào Cai – Hải Phòng', 'Kunming - Lao Cai - Hai Phong Corridor', 'hanh-lang-con-minh-lao-cai-hai-phong', 2, 'active'),
(4, 'Xuất nhập khẩu & Hải quan số', 'Import-Export & Smart Customs', 'xuat-nhap-khau-hai-quan-so', 3, 'active'),
(5, 'Dược liệu quý vùng cao', 'Highland Medicinal Herbs', 'duoc-lieu-quy-vung-cao', 1, 'active'),
(5, 'Nông nghiệp ôn đới & Đặc sản', 'Temperate Agriculture & Specialties', 'nong-nghiep-on-doi-dac-san', 2, 'active'),
(5, 'Chế biến sâu & Truy xuất nguồn gốc', 'Deep Processing & Traceability', 'che-bien-sau-truy-xuat-nguon-goc', 3, 'active'),
(6, 'Sa Pa – Fansipan – Y Tý', 'Sa Pa - Fansipan - Y Ty', 'sa-pa-fansipan-y-ty', 1, 'active'),
(6, 'Bắc Hà – Bát Xát – Bảo Yên', 'Bac Ha - Bat Xat - Bao Yen', 'bac-ha-bat-xat-bao-yen', 2, 'active'),
(6, 'Lịch trình gợi ý & Mùa lễ hội', 'Suggested Itineraries & Festivals', 'lich-trinh-goi-y-mua-le-hoi', 3, 'active'),
(7, 'Hội chợ Thương mại Quốc tế Việt – Trung', 'Viet - China International Trade Fair', 'hoi-cho-thuong-mai-quoc-te-viet-trung', 1, 'active'),
(7, 'Diễn đàn Xúc tiến Đầu tư & Du lịch', 'Investment & Tourism Promotion Forum', 'dien-dan-xuc-tien-dau-tu-du-lich', 2, 'active'),
(7, 'Lễ hội Văn hóa Tây Bắc', 'Northwest Cultural Festivals', 'le-hoi-van-hoa-tay-bac', 3, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

