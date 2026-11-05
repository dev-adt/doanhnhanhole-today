/**
 * BACKEND BRAND CONFIGURATION
 * -------------------------------------------------------------
 * File cấu hình thương hiệu tập trung cho Node.js Express Backend (Phutho.today).
 * Tự động đồng bộ với biến môi trường (.env) nếu có.
 */

require('dotenv').config();

const brandConfig = {
  appName: process.env.APP_NAME || 'Phutho.today Platform',
  brandName: process.env.BRAND_NAME || 'Phutho.today',
  brandShortName: process.env.BRAND_SHORT_NAME || 'Phú Thọ',
  siteUrl: process.env.SITE_URL || 'https://phutho.today',
  demoSiteUrl: 'https://dev.phutho.today',
  
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
    bankBranch: 'CN Phú Thọ / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // AI System Persona Prompt cho Phú Thọ Mới
  ai: {
    agentName: process.env.AI_AGENT_NAME || 'AI Phú Thọ Assistant',
    systemPrompt: process.env.AI_SYSTEM_PROMPT || 
      "Bạn là trợ lý AI chuyên nghiệp đa ngôn ngữ của nền tảng Phutho.today — Nền tảng kết nối du lịch, thương mại và đầu tư tỉnh Phú Thọ mới (sắp xếp từ ba tỉnh Vĩnh Phúc, Hòa Bình và Phú Thọ theo Nghị quyết 202/2025/QH15). Quy mô tỉnh mới đạt 9.361,38 km² với hơn 4 triệu dân và 148 đơn vị hành chính cấp xã (133 xã, 15 phường). Hãy tư vấn sâu sắc, chuẩn xác, có dẫn chứng về 3 không gian văn hóa - kinh tế: Phú Thọ (Đền Hùng, Long Cốc, Xuân Sơn, Thanh Thủy, Hát Xoan), Vĩnh Phúc (Tam Đảo, Tây Thiên, Đại Lải, KCN Thăng Long Vĩnh Phúc, Bá Thiện, Khai Quang, công nghiệp ô tô, xe máy, điện tử), Hòa Bình (Hồ Hòa Bình, Thung lũng Mai Châu, Suối khoáng Kim Bôi, Thủy điện Hòa Bình, văn hóa Mường). Hỗ trợ tra cứu địa danh cũ sang đơn vị hành chính mới, gợi ý hành trình du lịch, giới thiệu sản phẩm OCOP và hướng dẫn kết nối đầu tư."
  },

  // Email Brand Info
  email: {
    fromName: process.env.SMTP_FROM_NAME || 'Ban Biên Tập Phutho.today',
    fromAddress: process.env.SMTP_FROM || `"Phutho.today" <${process.env.SMTP_USER || 'no-reply@phutho.today'}>`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@phutho.today'
  },

  // 7 Chuyên mục mặc định cho Phú Thọ Mới theo Tài liệu dự án Phutho.today
  defaultCategories: [
    { name: 'Khám phá Phú Thọ', slug: 'kham-pha-phu-tho', icon: '🏛️', description: 'Đất Tổ Hùng Vương, Tam Đảo mù sương, Hồ Hòa Bình, di sản văn hóa và hướng dẫn tra cứu địa chỉ mới' },
    { name: 'Du lịch & Trải nghiệm', slug: 'du-lich-trai-nghiem', icon: '🧭', description: 'Điểm đến, lịch trình tham khảo 2N1Đ & 3N2Đ, lưu trú, ẩm thực bản địa và suối khoáng nóng' },
    { name: 'Doanh nghiệp & Giao thương', slug: 'doanh-nghiep-giao-thuong', icon: '🏢', description: 'Danh bạ doanh nghiệp 3 vùng, hồ sơ năng lực, chuỗi cung ứng sản xuất và kết nối đối tác' },
    { name: 'Sản phẩm địa phương & OCOP', slug: 'san-pham-dia-phuong', icon: '🌿', description: 'Bưởi Đoan Hùng, chè Long Cốc, cam Cao Phong, su su Tam Đảo và nông sản thủ công 3 vùng' },
    { name: 'Đầu tư & Hợp tác', slug: 'dau-tu-hop-tac', icon: '💰', description: 'Khu công nghiệp công nghệ cao, hành lang kinh tế liên vùng, chính sách ưu đãi và cơ hội hợp tác' },
    { name: 'Tri thức & Đào tạo số', slug: 'tri-thuc-dao-tao', icon: '💡', description: 'Kiến thức kinh doanh số, ứng dụng AI trong doanh nghiệp, kỹ năng dịch vụ và tài liệu nghiên cứu' },
    { name: 'Sự kiện & Diễn đàn', slug: 'su-kien-dien-dan', icon: '📅', description: 'Giỗ Tổ Hùng Vương, Lễ hội Tây Thiên, Lễ hội Khai hạ Mường Bi và diễn đàn xúc tiến kinh tế' }
  ]
};

module.exports = brandConfig;
