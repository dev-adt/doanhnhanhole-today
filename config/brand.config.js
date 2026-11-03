/**
 * BACKEND BRAND CONFIGURATION
 * -------------------------------------------------------------
 * File cấu hình thương hiệu tập trung cho Node.js Express Backend (Laocai.today).
 * Tự động đồng bộ với biến môi trường (.env) nếu có.
 */

require('dotenv').config();

const brandConfig = {
  appName: process.env.APP_NAME || 'Laocai.today Platform',
  brandName: process.env.BRAND_NAME || 'Laocai.today',
  brandShortName: process.env.BRAND_SHORT_NAME || 'Lào Cai',
  siteUrl: process.env.SITE_URL || 'https://laocai.today',
  demoSiteUrl: 'https://dev.laocai.today',
  
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
    bankBranch: 'CN Lào Cai / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // AI System Persona Prompt cho Lào Cai
  ai: {
    agentName: process.env.AI_AGENT_NAME || 'AI Lào Cai Assistant',
    systemPrompt: process.env.AI_SYSTEM_PROMPT || 
      "Bạn là trợ lý AI chuyên nghiệp đa ngôn ngữ của nền tảng Laocai.today — Nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai. Hãy tư vấn sâu sắc, chuẩn xác, giàu thông tin và truyền cảm hứng về cơ hội đầu tư, Khu kinh tế cửa khẩu Quốc tế Lào Cai - Kim Thành, logistics biên giới ASEAN - Trung Quốc, các khu công nghiệp (Tằng Loỏng, Đông Phố Mới, Bắc Duyên Hải), nông sản dược liệu quý (Atiso Sa Pa, tam thất, chè Shan Tuyết, quế hữu cơ, cá hồi nước lạnh), bản sắc văn hóa Tây Bắc và du lịch bốn mùa Sa Pa – Fansipan – Bắc Hà – Y Tý."
  },

  // Email Brand Info
  email: {
    fromName: process.env.SMTP_FROM_NAME || 'Ban Biên Tập Laocai.today',
    fromAddress: process.env.SMTP_FROM || `"Laocai.today" <${process.env.SMTP_USER || 'no-reply@laocai.today'}>`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@laocai.today'
  },

  // 7 Chuyên mục mặc định Lào Cai theo Đặc tả kiến trúc hệ sinh thái số Laocai.today
  defaultCategories: [
    { name: 'Khám phá Lào Cai', slug: 'kham-pha-lao-cai', icon: '🏔️', description: 'Đỉnh Fansipan, Sa Pa, Bắc Hà, Y Tý, danh thắng và bản sắc văn hóa các dân tộc Tây Bắc' },
    { name: 'Doanh nghiệp & Sản phẩm', slug: 'doanh-nghiep-san-pham', icon: '🏢', description: 'Hồ sơ doanh nghiệp, sản phẩm OCOP vùng cao, showroom số và kết nối giao thương' },
    { name: 'Dự án & Đầu tư', slug: 'du-an-dau-tu', icon: '💰', description: 'Danh mục dự án kêu gọi đầu tư, KKT cửa khẩu, khu công nghiệp và chính sách ưu đãi' },
    { name: 'Cửa khẩu & Logistics', slug: 'cua-khau-logistics', icon: '🚢', description: 'Khu kinh tế cửa khẩu Lào Cai - Kim Thành, xuất nhập khẩu ASEAN - Trung Quốc và hạ tầng liên vận' },
    { name: 'Nông sản & Dược liệu', slug: 'nong-san-duoc-lieu', icon: '🌿', description: 'Dược liệu quý vùng cao, chè cổ thụ Shan Tuyết, cá nước lạnh Sa Pa và nông nghiệp công nghệ cao' },
    { name: 'Du lịch & Trải nghiệm', slug: 'du-lich-trai-nghiem', icon: '🧭', description: 'Hành trình thông minh 1N, 2N1Đ, 3N2Đ, nghỉ dưỡng săn mây, kinh tế đêm và lễ hội bốn mùa' },
    { name: 'Sự kiện & Diễn đàn', slug: 'su-kien-dien-dan', icon: '📅', description: 'Hội chợ thương mại quốc tế Việt - Trung, diễn đàn xúc tiến đầu tư và lễ hội văn hóa Lào Cai' }
  ]
};

module.exports = brandConfig;
