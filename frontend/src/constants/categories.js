/**
 * Cấu hình Chuyên mục chính và Lĩnh vực con mặc định cho Doanhnhanhole.today
 * (Đồng bộ theo Tài liệu Đề án dự án Doanh nhân Họ Lê Toàn cầu - doanhnhanhole.today)
 * Lưu ý: Dữ liệu được tải động từ API /api/categories (Quản lý chuyên mục trong Admin).
 */

export const CATEGORIES_DATA = [
  {
    id: 'cong-dong-danh-ba',
    name: 'Cộng đồng & Danh bạ',
    name_en: 'Community & Directory',
    order_index: 1,
    subcategories: [
      '100 Doanh nhân Tiên phong',
      'Mạng lưới Doanh nhân Họ Lê & Bạn bè',
      'Đầu mối Khu vực & Quốc tế',
      'Quy chế & Xác minh Hồ sơ'
    ]
  },
  {
    id: 'co-hoi-giao-thuong',
    name: 'Cơ hội Giao thương',
    name_en: 'Trade & B2B Hub',
    order_index: 2,
    subcategories: [
      'Nhu cầu Mua hàng & Tìm nhà cung cấp',
      'Nhu cầu Bán hàng & Xuất khẩu',
      'Tìm Đại lý & Nhà phân phối',
      'Hợp tác Dịch vụ & Chuỗi cung ứng'
    ]
  },
  {
    id: 'du-lich-ve-nguon',
    name: 'Du lịch & Về nguồn',
    name_en: 'Tourism & Heritage',
    order_index: 3,
    subcategories: [
      'Hành trình Về nguồn Họ Lê',
      'Du lịch Thăm doanh nghiệp (Biz-Tour)',
      'Đón Doanh nhân Việt ở nước ngoài',
      'Du lịch Gia đình Doanh nhân'
    ]
  },
  {
    id: 'dau-tu-du-an',
    name: 'Đầu tư & Dự án',
    name_en: 'Investment & Projects',
    order_index: 4,
    subcategories: [
      'Mở rộng Nhà máy & Sản xuất',
      'Phát triển Hệ thống Phân phối',
      'Chuyển giao Công nghệ & Góp vốn',
      'Phiên Giới thiệu Cơ hội Đầu tư Quý'
    ]
  },
  {
    id: 'bai-hoc-dieu-hanh',
    name: 'Bài học Điều hành',
    name_en: 'Executive Insights',
    order_index: 5,
    subcategories: [
      'Tình huống Quản trị Thực tế',
      'Chân dung Doanh nhân Họ Lê',
      'Đối thoại Chuyên gia Hàng tháng',
      'Bản tin Hoạt động Cộng đồng'
    ]
  },
  {
    id: 'dao-tao-co-van',
    name: 'Đào tạo & Cố vấn',
    name_en: 'Training & Mentorship',
    order_index: 6,
    subcategories: [
      '6 Chuyên đề Nâng cao Năng lực',
      'Cố vấn Khởi nghiệp 8 Tuần (1-kèm-3)',
      'Ứng dụng AI & Chuyển đổi số',
      'Kỹ năng Lãnh đạo & Kế thừa'
    ]
  },
  {
    id: 'su-kien-hoat-dong',
    name: 'Sự kiện & Hoạt động',
    name_en: 'Events & Networking',
    order_index: 7,
    subcategories: [
      'Phiên Giao thương Hàng tháng',
      'Đoàn Khảo sát Doanh nghiệp Quý',
      'Chào đón Thành viên mới'
    ]
  }
];

export const ALL_CATEGORIES = CATEGORIES_DATA.map(c => c.name);

export const getSubcategoriesByCategory = (categoryName) => {
  const cat = CATEGORIES_DATA.find(c => c.name === categoryName);
  return cat ? cat.subcategories : [];
};

export const CATEGORY_LABELS = {
  // Doanhnhanhole.today Categories
  'Cộng đồng & Danh bạ': { vi: 'Cộng đồng & Danh bạ', en: 'Community & Directory', zh: '社群与名录', ja: 'コミュニティ・名鑑', ko: '커뮤니티 및 디렉토리' },
  'Cơ hội Giao thương': { vi: 'Cơ hội Giao thương', en: 'Trade & B2B Hub', zh: '商贸合作机会', ja: '商談・B2B機会', ko: '비즈니스 교역 기회' },
  'Du lịch & Về nguồn': { vi: 'Du lịch & Về nguồn', en: 'Tourism & Heritage', zh: '寻根与商务旅游', ja: 'ルーツ探訪・観光', ko: '뿌리 찾기 및 비즈니스 투어' },
  'Đầu tư & Dự án': { vi: 'Đầu tư & Dự án', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Bài học Điều hành': { vi: 'Bài học Điều hành', en: 'Executive Insights', zh: '经营实战案例', ja: '経営ケーススタディ', ko: '경영 실전 인사이트' },
  'Đào tạo & Cố vấn': { vi: 'Đào tạo & Cố vấn', en: 'Training & Mentorship', zh: '培训与导师辅导', ja: '研修・メンターシップ', ko: '교육 및 멘토링' },
  'Sự kiện & Hoạt động': { vi: 'Sự kiện & Hoạt động', en: 'Events & Networking', zh: '活动与对接会', ja: 'イベント・交流会', ko: '이벤트 및 네트워킹' },
  // Backward compatibility
  'Doanh nghiệp & Giao thương': { vi: 'Cơ hội Giao thương', en: 'Trade & B2B Hub', zh: '商贸合作机会', ja: '商談・B2B機会', ko: '비즈니스 교역 기회' },
  'Đầu tư & Hợp tác': { vi: 'Đầu tư & Dự án', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Du lịch & Trải nghiệm': { vi: 'Du lịch & Về nguồn', en: 'Tourism & Heritage', zh: '寻根与商务旅游', ja: 'ルーツ探訪・観光', ko: '뿌리 찾기 및 비즈니스 투어' },
  'Tri thức & Đào tạo số': { vi: 'Đào tạo & Cố vấn', en: 'Training & Mentorship', zh: '培训与导师辅导', ja: '研修・メンターシップ', ko: '교육 및 멘토링' },
  'Sự kiện & Diễn đàn': { vi: 'Sự kiện & Hoạt động', en: 'Events & Networking', zh: '活动与对接会', ja: 'イベント・交流会', ko: '이벤트 및 네트워킹' }
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
