/**
 * BRAND CONFIGURATION (CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG)
 * -------------------------------------------------------------
 * File này quản lý toàn bộ thông tin nhận diện thương hiệu của nền tảng Laocai.today.
 * Định vị: Nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai tích hợp Trợ lý AI đa ngôn ngữ.
 * Triết lý: "Kết nối con người – Kết nối doanh nghiệp – Kết nối Lào Cai với thế giới" (Media + Data + Platform + AI)
 */

export const brandConfig = {
  // Thông tin định danh thương hiệu
  brandName: 'Laocai.today',         // Tên thương hiệu hiển thị chính
  brandShortName: 'Lào Cai',         // Tên viết tắt ngắn gọn (tránh trùng .today)
  platformName: 'Laocai.today Digital Platform',
  companyLegalName: 'Nền tảng Kết nối Hợp tác, Xúc tiến Đầu tư & Quảng bá Lào Cai',
  partnerLegalName: 'Công ty Cổ phần ADT Quốc tế',
  
  // Slogan & Định vị theo tài liệu Giới thiệu dự án Laocai.today
  slogan: 'Kết nối con người • Kết nối doanh nghiệp • Kết nối Lào Cai với thế giới',
  tagline: 'Lào Cai – Đỉnh thiêng hội tụ, Cửa ngõ giao thương ASEAN – Trung Quốc',
  description: 'Laocai.today là nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai tích hợp Trợ lý AI đa ngôn ngữ.',
  
  // Tên miền & Đường dẫn
  domain: 'laocai.today',
  demoDomain: 'dev.laocai.today',
  baseUrl: 'https://laocai.today',
  demoUrl: 'https://dev.laocai.today',
  apiBaseUrl: '/api',

  // Nhận diện hình ảnh & Logo
  logo: {
    primary: '/logo_icon.svg',
    dark: '/logo_icon.svg',
    icon: '/logo_icon.svg',
    alt: 'Laocai.today Logo',
    favicon: '/favicon.svg',
    defaultThumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    fallbackCompanyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
  },

  // Hệ màu chuẩn cảm hứng Tây Bắc - Đỉnh Fansipan, Rừng đại ngàn, Vàng mùa lúa chín & Đỏ thổ cẩm
  colors: {
    forestGreen: '#145A3E',   // Xanh đại ngàn Hoàng Liên (Màu chủ đạo, nút hành động)
    coffeeOrange: '#D99B26',  // Vàng mùa lúa chín ruộng bậc thang (Điểm nhấn, nội dung nổi bật)
    oceanBlue: '#1B6E8C',     // Xanh sương mây & Cửa khẩu quốc tế
    creamBg: '#F6F8F5',       // Trắng sương mây vùng cao (Nền trang thoáng đãng)
    charcoalDark: '#12261E',  // Xanh chàm thổ cẩm đậm (Tiêu đề và nội dung)
    brocadeRed: '#B83B2A',    // Đỏ thổ cẩm & Hoa đỗ quyên rừng
    primary: '#145A3E',
    primaryHover: '#0F4630',
    primaryDark: '#0A2E1F',
    primaryLight: '#F6F8F5',
    secondary: '#1B6E8C',
    accent: '#D99B26',
    accentGlow: 'rgba(217, 155, 38, 0.4)',
    gold: '#D99B26',
    bazanBrown: '#8C3A2B',
    coffee: '#132A21',
    cream: '#F6F8F5',
    darkBg: '#0D211A',
    darkCard: '#153026'
  },

  // Trợ lý Trí tuệ Nhân tạo (AI Assistant)
  aiAssistant: {
    name: 'AI Lào Cai Assistant',
    shortName: 'Lào Cai AI',
    title: 'Trợ lý AI Xúc tiến Đầu tư, Giao thương & Du lịch Lào Cai Đa ngôn ngữ',
    avatar: '/ai_robot_avatar-removebg.png',
    welcomeMessage: 'Xin chào! Tôi là Trợ lý AI đa ngôn ngữ của Laocai.today. Tôi có thể hỗ trợ quý vị tra cứu cơ hội đầu tư Khu kinh tế cửa khẩu Lào Cai, các KCN Tằng Loỏng - Đông Phố Mới, chuỗi nông sản dược liệu vùng cao, doanh nghiệp địa phương và thiết kế hành trình khám phá Sa Pa – Fansipan – Bắc Hà – Y Tý 24/7.',
    systemRole: 'Bạn là trợ lý AI chuyên nghiệp đa ngôn ngữ của nền tảng Laocai.today — Nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai. Hãy tư vấn sâu sắc, chuẩn xác, giàu thông tin và truyền cảm hứng về cơ hội đầu tư, Khu kinh tế cửa khẩu Quốc tế Lào Cai - Kim Thành, logistics biên giới ASEAN - Trung Quốc, công nghiệp chế biến sâu, nông sản dược liệu quý (Atiso, tam thất, chè Shan Tuyết, cá hồi Sa Pa), bản sắc văn hóa các dân tộc Tây Bắc và hành trình du lịch thông minh bốn mùa ("Ở lại lâu hơn, trải nghiệm sâu hơn").',
    quickSuggestions: [
      'Chính sách ưu đãi đầu tư tại Khu Kinh tế Cửa khẩu Lào Cai & Kim Thành',
      'Gợi ý hành trình khám phá Sa Pa – Fansipan – Bắc Hà – Y Tý 3 ngày 2 đêm',
      'Tìm doanh nghiệp dược liệu vùng cao, chè Shan Tuyết & nông sản OCOP Lào Cai',
      'Tiềm năng logistics liên vận quốc tế và Cảng hàng không Sa Pa'
    ]
  },

  // Thông tin liên hệ & Văn phòng
  contact: {
    hotline: '0214 3888 999',
    techHotline: '0986 354 152',
    email: 'contact@laocai.today',
    supportEmail: 'support@laocai.today',
    address: 'Đại lộ Trần Hưng Đạo, Phường Nam Cường, TP. Lào Cai, Tỉnh Lào Cai',
    techAddress: '26 TT23 Khu đô thị Văn Phú, P. Kiến Hưng, Hà Nội',
    workingHours: '08:00 - 17:30 (Thứ 2 - Thứ 6)',
    copyright: '© 2026 Laocai.today — Nền tảng phát triển & vận hành bởi ADT Quốc tế.'
  },

  // Thông tin thanh toán / Chuyển khoản sự kiện (VietQR)
  bankAccount: {
    bankName: 'Techcombank',
    bankBranch: 'CN Lào Cai / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // Mạng xã hội
  socials: {
    facebook: 'https://facebook.com/laocai.today',
    youtube: 'https://youtube.com/@laocai.today',
    zalo: 'https://zalo.me/laocaitoday',
    linkedin: 'https://linkedin.com/company/laocai-today'
  },

  // Thông tin Đăng ký Hội viên & Gói dịch vụ
  membership: {
    benefitsTitle: 'Quyền lợi Hội viên Laocai.today',
    badgeText: 'Mạng lưới kết nối doanh nghiệp, thương mại biên giới & nhà đầu tư Lào Cai',
    tiers: [
      { id: 'Standard', name: 'Khám phá (Cơ bản)', badge: 'Thành viên Khám phá' },
      { id: 'Silver', name: 'Doanh nghiệp Kết nối', badge: 'Đối tác Bạc' },
      { id: 'Gold', name: 'Doanh nghiệp Tiêu biểu', badge: 'Đối tác Vàng' },
      { id: 'Diamond', name: 'Nhà đầu tư Chiến lược', badge: 'Đối tác Kim Cương' }
    ]
  }
};

export const BRAND_CONFIG = brandConfig;
export default brandConfig;
