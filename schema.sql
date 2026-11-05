-- ============================================
-- Phutho.today — MySQL Database Schema
-- Nền tảng thông tin, dữ liệu, truyền thông và kết nối đầu tư Lào Cai
-- Database: phutho_db | User: phutho_user
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
-- DỮ LIỆU KHỞI TẠO MẪU (Phutho.today)
-- ============================================

-- Admin mặc định (Username: admin | Password: Admin@123)
INSERT INTO admins (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$3luJFH.EMVPnxeH8BdXn9.5tnCQ9huv13yzOzHrwYGiRhgV7dcufq', 'Ban Quản trị Phutho.today', 'admin@phutho.today', 'superadmin')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Cấu hình AI mặc định (Google Gemini Flash qua OpenRouter / Google API)
INSERT INTO ai_config (provider, model, is_active) VALUES ('openrouter', 'google/gemini-3-flash-preview', 1)
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- Khởi tạo 7 Chuyên mục chính Phú Thọ Mới
INSERT INTO categories (name, name_en, slug, order_index, status) VALUES
('Khám phá Phú Thọ', 'Discover Phu Tho', 'kham-pha-phu-tho', 1, 'active'),
('Du lịch & Trải nghiệm', 'Tourism & Experiences', 'du-lich-trai-nghiem', 2, 'active'),
('Doanh nghiệp & Giao thương', 'Enterprises & Trade', 'doanh-nghiep-giao-thuong', 3, 'active'),
('Sản phẩm địa phương & OCOP', 'Local Produce & OCOP', 'san-pham-dia-phuong', 4, 'active'),
('Đầu tư & Hợp tác', 'Investment & Cooperation', 'dau-tu-hop-tac', 5, 'active'),
('Tri thức & Đào tạo số', 'Knowledge & Digital Skills', 'tri-thuc-dao-tao', 6, 'active'),
('Sự kiện & Diễn đàn', 'Events & Forums', 'su-kien-dien-dan', 7, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Khởi tạo Lĩnh vực con tương ứng
INSERT INTO sub_categories (category_id, name, name_en, slug, order_index, status) VALUES
(1, 'Đất Tổ Hùng Vương & Di sản', 'Hung Kings Heritage & Ancestral Land', 'dat-to-hung-vuong-di-san', 1, 'active'),
(1, 'Tam Đảo & Tây Thiên Vĩnh Phúc', 'Tam Dao & Tay Thien Vinh Phuc', 'tam-dao-tay-thien', 2, 'active'),
(1, 'Kỳ quan Hồ Hòa Bình & Bản sắc Mường', 'Hoa Binh Lake & Muong Culture', 'ho-hoa-binh-ban-sac-muong', 3, 'active'),
(1, 'Tra cứu địa chỉ sau sáp nhập', 'Post-Merger Administrative Lookup', 'tra-cuu-dia-chi-moi', 4, 'active'),
(2, 'Điểm đến & Thắng cảnh 3 vùng', 'Destinations Across 3 Regions', 'diem-den-thang-canh-3-vung', 1, 'active'),
(2, 'Lịch trình gợi ý (1N, 2N1Đ, 3N2Đ)', 'Curated Itineraries', 'lich-trinh-goi-y', 2, 'active'),
(2, 'Nghỉ dưỡng & Khoáng nóng Onsen', 'Resorts & Hot Springs Onsen', 'nghi-duong-khoang-nong', 3, 'active'),
(2, 'Ẩm thực bản địa & Trải nghiệm', 'Local Cuisine & Experiences', 'am-thuc-ban-dia', 4, 'active'),
(3, 'Danh bạ Doanh nghiệp 3 vùng', 'Enterprise Directory 3 Regions', 'danh-ba-doanh-nghiep-3-vung', 1, 'active'),
(3, 'Hồ sơ năng lực & Cung ứng', 'Capacity Profiles & Sourcing', 'ho-so-nang-luc-cung-ung', 2, 'active'),
(3, 'Nhu cầu mua hàng & Hợp tác B2B', 'B2B Sourcing Demands', 'nhu-cau-mua-hang-b2b', 3, 'active'),
(3, 'Showroom số doanh nghiệp', 'Digital Enterprise Showroom', 'showroom-so-doanh-nghiep', 4, 'active'),
(4, 'Sản phẩm OCOP tiêu biểu', 'Featured OCOP Products', 'san-pham-ocop-tieu-bieu', 1, 'active'),
(4, 'Đặc sản Đất Tổ (Bưởi, Chè Long Cốc)', 'Dat To Specialties', 'dac-san-dat-to', 2, 'active'),
(4, 'Đặc sản Vĩnh Phúc (Su su, Mật ong)', 'Vinh Phuc Specialties', 'dac-san-vinh-phuc', 3, 'active'),
(4, 'Đặc sản Hòa Bình (Cam Cao Phong, Rượu cần)', 'Hoa Binh Specialties', 'dac-san-hoa-binh', 4, 'active'),
(5, 'Khu & Cụm công nghiệp trọng điểm', 'Key Industrial Parks', 'khu-cum-cong-nghiep-trong-diem', 1, 'active'),
(5, 'Hành lang kinh tế & Quy hoạch liên vùng', 'Economic Corridors & Master Plan', 'hanh-lang-kinh-te-quy-hoach', 2, 'active'),
(5, 'Chính sách & Ưu đãi đầu tư', 'Investment Policies & Incentives', 'chinh-sach-uu-dai-dau-tu', 3, 'active'),
(5, 'Danh mục dự án kêu gọi hợp tác', 'Investment Call Projects', 'danh-muc-du-an-keu-goi', 4, 'active'),
(6, 'Chuyển đổi số & Ứng dụng AI', 'Digital Transformation & AI', 'chuyen-doi-so-ung-dung-ai', 1, 'active'),
(6, 'Kỹ năng du lịch & Dịch vụ đa ngữ', 'Tourism & Multilingual Skills', 'ky-nang-du-lich-dich-vu', 2, 'active'),
(6, 'Nghiên cứu kinh tế & Báo cáo thị trường', 'Economic Research & Reports', 'nghien-cuu-kinh-te-bao-cao', 3, 'active'),
(7, 'Lễ hội truyền thống (Đền Hùng, Tây Thiên, Mường Bi)', 'Traditional Festivals', 'le-hoi-truyen-thong', 1, 'active'),
(7, 'Diễn đàn Xúc tiến Đầu tư & Thương mại', 'Investment & Trade Forums', 'dien-dan-xuc-tien-dau-tu', 2, 'active'),
(7, 'Hội chợ & Triển lãm OCOP Liên vùng', 'Regional OCOP Fairs & Expos', 'hoi-cho-trien-lam-ocop', 3, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

