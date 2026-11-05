/**
 * Cấu hình Chuyên mục chính và Lĩnh vực con mặc định cho Phutho.today
 * (Đồng bộ theo Tài liệu Đề án dự án Phutho.today - Tỉnh Phú Thọ Mới)
 * Lưu ý: Dữ liệu được tải động từ API /api/categories (Quản lý chuyên mục trong Admin).
 */

export const CATEGORIES_DATA = [
  {
    id: 'kham-pha-phu-tho',
    name: 'Khám phá Phú Thọ',
    name_en: 'Discover Phu Tho',
    order_index: 1,
    subcategories: [
      'Đất Tổ Hùng Vương & Di sản',
      'Tam Đảo & Tây Thiên Vĩnh Phúc',
      'Kỳ quan Hồ Hòa Bình & Bản sắc Mường',
      'Tra cứu địa chỉ sau sáp nhập'
    ]
  },
  {
    id: 'du-lich-trai-nghiem',
    name: 'Du lịch & Trải nghiệm',
    name_en: 'Tourism & Experiences',
    order_index: 2,
    subcategories: [
      'Điểm đến & Thắng cảnh 3 vùng',
      'Lịch trình gợi ý (1N, 2N1Đ, 3N2Đ)',
      'Nghỉ dưỡng & Khoáng nóng Onsen',
      'Ẩm thực bản địa & Trải nghiệm'
    ]
  },
  {
    id: 'doanh-nghiep-giao-thuong',
    name: 'Doanh nghiệp & Giao thương',
    name_en: 'Enterprises & Trade',
    order_index: 3,
    subcategories: [
      'Danh bạ Doanh nghiệp 3 vùng',
      'Hồ sơ năng lực & Cung ứng',
      'Nhu cầu mua hàng & Hợp tác B2B',
      'Showroom số doanh nghiệp'
    ]
  },
  {
    id: 'san-pham-dia-phuong',
    name: 'Sản phẩm địa phương & OCOP',
    name_en: 'Local Produce & OCOP',
    order_index: 4,
    subcategories: [
      'Sản phẩm OCOP tiêu biểu',
      'Đặc sản Đất Tổ (Bưởi, Chè Long Cốc)',
      'Đặc sản Vĩnh Phúc (Su su, Mật ong)',
      'Đặc sản Hòa Bình (Cam Cao Phong, Rượu cần)'
    ]
  },
  {
    id: 'dau-tu-hop-tac',
    name: 'Đầu tư & Hợp tác',
    name_en: 'Investment & Cooperation',
    order_index: 5,
    subcategories: [
      'Khu & Cụm công nghiệp trọng điểm',
      'Hành lang kinh tế & Quy hoạch liên vùng',
      'Chính sách & Ưu đãi đầu tư',
      'Danh mục dự án kêu gọi hợp tác'
    ]
  },
  {
    id: 'tri-thuc-dao-tao',
    name: 'Tri thức & Đào tạo số',
    name_en: 'Knowledge & Digital Skills',
    order_index: 6,
    subcategories: [
      'Chuyển đổi số & Ứng dụng AI',
      'Kỹ năng du lịch & Dịch vụ đa ngữ',
      'Nghiên cứu kinh tế & Báo cáo thị trường'
    ]
  },
  {
    id: 'su-kien-dien-dan',
    name: 'Sự kiện & Diễn đàn',
    name_en: 'Events & Forums',
    order_index: 7,
    subcategories: [
      'Lễ hội truyền thống (Đền Hùng, Tây Thiên, Mường Bi)',
      'Diễn đàn Xúc tiến Đầu tư & Thương mại',
      'Hội chợ & Triển lãm OCOP Liên vùng'
    ]
  }
];

export const ALL_CATEGORIES = CATEGORIES_DATA.map(c => c.name);

export const getSubcategoriesByCategory = (categoryName) => {
  const cat = CATEGORIES_DATA.find(c => c.name === categoryName);
  return cat ? cat.subcategories : [];
};

export const CATEGORY_LABELS = {
  // Phu Tho Specific Categories
  'Khám phá Phú Thọ': { vi: 'Khám phá Phú Thọ', en: 'Discover Phu Tho', zh: '探索富寿', ja: 'フート探索', ko: '푸토 탐방' },
  'Du lịch & Trải nghiệm': { vi: 'Du lịch & Trải nghiệm', en: 'Tourism & Experiences', zh: '旅游与体验', ja: '観光・体験', ko: '관광 및 체험' },
  'Doanh nghiệp & Giao thương': { vi: 'Doanh nghiệp & Giao thương', en: 'Enterprises & Trade', zh: '企业与商贸', ja: '企業・商取引', ko: '기업 및 교역' },
  'Doanh nghiệp & Sản phẩm': { vi: 'Doanh nghiệp & Giao thương', en: 'Enterprises & Trade', zh: '企业与商贸', ja: '企業・商取引', ko: '기업 및 교역' },
  'Sản phẩm địa phương & OCOP': { vi: 'Sản phẩm địa phương & OCOP', en: 'Local Produce & OCOP', zh: '地方特产与OCOP', ja: '特産品・OCOP', ko: '지역 특산품 및 OCOP' },
  'Đầu tư & Hợp tác': { vi: 'Đầu tư & Hợp tác', en: 'Investment & Cooperation', zh: '投资与合作', ja: '投資・連携', ko: '투자 및 협력' },
  'Dự án & Đầu tư': { vi: 'Đầu tư & Hợp tác', en: 'Investment & Cooperation', zh: '投资与合作', ja: '投資・連携', ko: '투자 및 협력' },
  'Tri thức & Đào tạo số': { vi: 'Tri thức & Đào tạo số', en: 'Knowledge & Digital Skills', zh: '知识与数字技能', ja: '知識・デジタル育成', ko: '지식 및 디지털 역량' },
  'Sự kiện & Diễn đàn': { vi: 'Sự kiện & Diễn đàn', en: 'Events & Forums', zh: '活动与论坛', ja: 'イベント・フォーラム', ko: '이벤트 및 포럼' }
};

export const getCategoryLabel = (categoryInput, lang = 'vi') => {
  if (!categoryInput) return '';
  const langKey = (lang || 'vi').toLowerCase();
  const categoryName = typeof categoryInput === 'object' ? (categoryInput.name || '') : String(categoryInput);
  if (!categoryName) return '';

  if (CATEGORY_LABELS[categoryName] && CATEGORY_LABELS[categoryName][langKey]) {
    return CATEGORY_LABELS[categoryName][langKey];
  }
  const found = CATEGORIES_DATA.find(c => c.name === categoryName || c.id === categoryName || (typeof categoryInput === 'object' && c.id === categoryInput.id));
  if (found) {
    if (langKey === 'en' && found.name_en) return found.name_en;
    return found.name;
  }
  if (typeof categoryInput === 'object' && categoryInput.name_en && langKey === 'en') {
    return categoryInput.name_en;
  }
  return categoryName;
};

export const getSubCategoryLabel = (subInput, lang = 'vi') => {
  if (!subInput) return '';
  if (typeof subInput === 'object') {
    if (lang === 'en' && subInput.name_en) return subInput.name_en;
    return subInput.name || '';
  }
  return String(subInput);
};
