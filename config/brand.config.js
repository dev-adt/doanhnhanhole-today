/**
 * BACKEND BRAND CONFIGURATION
 * -------------------------------------------------------------
 * File cấu hình thương hiệu tập trung cho Node.js Express Backend (Doanhnhanhole.today).
 * Tự động đồng bộ với biến môi trường (.env) nếu có.
 */

require('dotenv').config();

const brandConfig = {
  appName: process.env.APP_NAME || 'Doanhnhanhole.today Platform',
  brandName: process.env.BRAND_NAME || 'Doanhnhanhole.today',
  brandShortName: process.env.BRAND_SHORT_NAME || 'Doanh nhân Họ Lê',
  siteUrl: process.env.SITE_URL || 'https://doanhnhanhole.today',
  demoSiteUrl: 'https://dev.doanhnhanhole.today',
  
  // Nhận diện logo thương hiệu
  logo: {
    primary: '/logo_icon.svg',
    dark: '/logo_icon.svg',
    icon: '/logo_icon.svg',
    favicon: '/favicon.svg'
  },
  
  // Thông tin thanh toán ngân hàng (VietQR)
  bankAccount: {
    bankName: 'Techcombank',
    bankBranch: 'CN Hà Nội / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // AI System Persona Prompt cho Doanh nhân Họ Lê Toàn cầu (Mục 5.3 Đề án)
  ai: {
    agentName: process.env.AI_AGENT_NAME || 'AI Doanh Nhân Họ Lê',
    systemPrompt: process.env.AI_SYSTEM_PROMPT || 
      "Bạn là trợ lý AI có kiểm soát của nền tảng Doanhnhanhole.today — Nền tảng kết nối Doanh nhân Họ Lê Toàn cầu và những người bạn trong nước & quốc tế (Giao thương • Du lịch • Đầu tư • Chia sẻ kinh nghiệm • Đào tạo). Slogan: 'Kết nối Họ Lê toàn cầu, cùng mở cơ hội phát triển'. Hãy hỗ trợ người dùng tra cứu danh bạ doanh nghiệp xác minh, sàn thông tin cơ hội giao thương B2B (mua hàng, bán hàng, tìm đại lý, nhà phân phối, nhà cung cấp, đối tác dịch vụ), quy trình kết nối 7 bước có Ban thư ký điều phối (phản hồi trong 2 ngày làm việc, đề xuất tối đa 3 đối tác phù hợp, hậu kiểm sau 7 và 30 ngày), chương trình kết nối du lịch về nguồn Họ Lê & khảo sát doanh nghiệp, kết nối đầu tư, chuyên mục Bài học điều hành và 6 chuyên đề đào tạo + cố vấn 1-kèm-1..3 trong 8 tuần cho doanh nhân trẻ. Hỗ trợ soạn bản nháp giới thiệu doanh nghiệp chuẩn mực. Lưu ý: Không tự nhân danh cộng đồng để bảo chứng thương mại hoặc cam kết lợi nhuận đầu tư; khi thiếu thông tin, hướng dẫn gửi yêu cầu cho Ban Thư ký."
  },

  // Email Brand Info
  email: {
    fromName: process.env.SMTP_FROM_NAME || 'Ban Thư Ký Doanhnhanhole.today',
    fromAddress: process.env.SMTP_FROM || `"Doanhnhanhole.today" <${process.env.SMTP_USER || 'no-reply@doanhnhanhole.today'}>`,
    supportEmail: process.env.SUPPORT_EMAIL || 'banthuky@doanhnhanhole.today'
  },

  // 7 Chuyên mục mặc định cho Doanhnhanhole.today theo Tài liệu Đề án
  defaultCategories: [
    { name: 'Cộng đồng & Danh bạ', slug: 'cong-dong-danh-ba', icon: '🌏', description: 'Mạng lưới Doanh nhân Họ Lê Toàn cầu và những người bạn, 100 doanh nhân tiên phong & quy chế xác minh' },
    { name: 'Cơ hội Giao thương', slug: 'co-hoi-giao-thuong', icon: '🤝', description: 'Sàn nhu cầu mua bán, tìm đại lý, nhà phân phối, nhà cung cấp và đối tác dịch vụ có Ban thư ký điều phối' },
    { name: 'Du lịch & Về nguồn', slug: 'du-lich-ve-nguon', icon: '🧭', description: 'Hành trình về nguồn Họ Lê, du lịch kết hợp thăm doanh nghiệp (Biz-Tour) và đón kiều bào quốc tế' },
    { name: 'Đầu tư & Dự án', slug: 'dau-tu-du-an', icon: '💼', description: 'Hợp tác mở nhà máy, phát triển phân phối, chuyển giao công nghệ, góp vốn và phiên giới thiệu đầu tư quý' },
    { name: 'Bài học Điều hành', slug: 'bai-hoc-dieu-hanh', icon: '📚', description: 'Tình huống quản trị thực tế (Bối cảnh - Quyết định - Kết quả), chân dung doanh nhân và đối thoại chuyên gia' },
    { name: 'Đào tạo & Cố vấn', slug: 'dao-tao-co-van', icon: '🎓', description: '6 chuyên đề nâng cao năng lực chủ doanh nghiệp và chương trình Mentorship 8 tuần cho người trẻ khởi nghiệp' },
    { name: 'Sự kiện & Hoạt động', slug: 'su-kien-hoat-dong', icon: '📅', description: 'Phiên giao thương hàng tháng, đoàn khảo sát doanh nghiệp hàng quý và buổi chào đón thành viên mới' }
  ]
};

module.exports = brandConfig;
