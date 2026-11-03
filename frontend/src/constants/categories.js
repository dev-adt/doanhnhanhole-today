/**
 * Cấu hình Chuyên mục chính và Lĩnh vực con mặc định cho Laocai.today
 * (Đồng bộ theo Tài liệu Giới thiệu dự án Laocai.today & Hệ sinh thái số Lào Cai)
 * Lưu ý: Dữ liệu được tải động từ API /api/categories (Quản lý chuyên mục trong Admin).
 */

export const CATEGORIES_DATA = [
  {
    id: 'kham-pha-lao-cai',
    name: 'Khám phá Lào Cai',
    name_en: 'Discover Lao Cai',
    order_index: 1,
    subcategories: [
      'Điểm đến & Thắng cảnh',
      'Bản sắc Văn hóa Tây Bắc',
      'Ẩm thực Vùng cao',
      'Di sản & Tâm linh'
    ]
  },
  {
    id: 'doanh-nghiep-san-pham',
    name: 'Doanh nghiệp & Sản phẩm',
    name_en: 'Enterprises & Products',
    order_index: 2,
    subcategories: [
      'Danh bạ Doanh nghiệp',
      'Sản phẩm OCOP & Đặc sản',
      'Khởi nghiệp Đổi mới sáng tạo',
      'Showroom số'
    ]
  },
  {
    id: 'du-an-dau-tu',
    name: 'Dự án & Đầu tư',
    name_en: 'Investment & Projects',
    order_index: 3,
    subcategories: [
      'Danh mục Dự án Kêu gọi',
      'Khu & Cụm công nghiệp',
      'Chính sách & Ưu đãi Đầu tư'
    ]
  },
  {
    id: 'cua-khau-logistics',
    name: 'Cửa khẩu & Logistics',
    name_en: 'Border Gate & Logistics',
    order_index: 4,
    subcategories: [
      'Khu Kinh tế Cửa khẩu Lào Cai',
      'Xuất nhập khẩu ASEAN - Trung Quốc',
      'Hạ tầng Giao thông & Liên vận'
    ]
  },
  {
    id: 'nong-san-duoc-lieu',
    name: 'Nông sản & Dược liệu',
    name_en: 'Highland Agri & Herbs',
    order_index: 5,
    subcategories: [
      'Dược liệu quý & Chè Shan Tuyết',
      'Nông nghiệp Công nghệ cao',
      'Thương hiệu & Thị trường'
    ]
  },
  {
    id: 'du-lich-trai-nghiem',
    name: 'Du lịch & Trải nghiệm',
    name_en: 'Tourism & Experiences',
    order_index: 6,
    subcategories: [
      'Hành trình 2N1Đ & 3N2Đ',
      'Nghỉ dưỡng, Săn mây & Kinh tế đêm'
    ]
  },
  {
    id: 'su-kien-dien-dan',
    name: 'Sự kiện & Diễn đàn',
    name_en: 'Events & Forums',
    order_index: 7,
    subcategories: [
      'Hội chợ Thương mại Quốc tế',
      'Diễn đàn Xúc tiến Đầu tư',
      'Lễ hội Bốn mùa Lào Cai'
    ]
  }
];

export const ALL_CATEGORIES = CATEGORIES_DATA.map(c => c.name);

export const getSubcategoriesByCategory = (categoryName) => {
  const cat = CATEGORIES_DATA.find(c => c.name === categoryName);
  return cat ? cat.subcategories : [];
};

export const CATEGORY_LABELS = {
  // Lao Cai Specific Categories
  'Khám phá Lào Cai': { vi: 'Khám phá Lào Cai', en: 'Discover Lao Cai', zh: '探索老街', ja: 'ラオカイ探索', ko: '라오까이 탐방' },
  'Doanh nghiệp & Sản phẩm': { vi: 'Doanh nghiệp & Sản phẩm', en: 'Enterprises & Products', zh: '企业与产品', ja: '企業・製品', ko: '기업 및 제품' },
  'Dự án & Đầu tư': { vi: 'Dự án & Đầu tư', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Đầu tư & Dự án': { vi: 'Dự án & Đầu tư', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Cửa khẩu & Logistics': { vi: 'Cửa khẩu & Logistics', en: 'Border Trade & Logistics', zh: '口岸经济与物流', ja: '国境貿易・物流', ko: '국경무역 및 물류' },
  'Kinh tế Cửa khẩu': { vi: 'Kinh tế Cửa khẩu', en: 'Border Gate Economy', zh: '口岸经济', ja: '国境経済', ko: '국경 경제' },
  'Nông sản & Dược liệu': { vi: 'Nông sản & Dược liệu', en: 'Highland Agri & Herbs', zh: '高原农产品与药材', ja: '高原農産物・薬草', ko: '고원 농산물 및 약초' },
  'Du lịch & Trải nghiệm': { vi: 'Du lịch & Trải nghiệm', en: 'Tourism & Experiences', zh: '旅游与体验', ja: '観光・体験', ko: '관광 및 체험' },
  'Dữ liệu & Báo cáo': { vi: 'Dữ liệu & Báo cáo', en: 'Data & Reports', zh: '数据与报告', ja: 'データ・レポート', ko: '데이터 및 보고서' },
  'Sự kiện & Diễn đàn': { vi: 'Sự kiện & Diễn đàn', en: 'Events & Forums', zh: '活动与论坛', ja: 'イベント・フォーラム', ko: '이벤트 및 포럼' },

  // Backward-compatible Categories
  'Khám phá Đắk Lắk': { vi: 'Khám phá Lào Cai', en: 'Discover Lao Cai', zh: '探索老街', ja: 'ラオカイ探索', ko: '라오까이 탐방' },
  'Nông sản & Cà phê': { vi: 'Nông sản & Dược liệu', en: 'Highland Agri & Herbs', zh: '高原农产品与药材', ja: '高原農産物・薬草', ko: '고원 농산물 및 약초' },
  'Cà phê Đắk Lắk': { vi: 'Nông sản & Dược liệu', en: 'Highland Agri & Herbs', zh: '高原农产品与药材', ja: '高原農産物・薬草', ko: '고원 농산물 및 약초' },
  'Kinh tế Biển': { vi: 'Cửa khẩu & Logistics', en: 'Border Trade & Logistics', zh: '口岸经济与物流', ja: '国境貿易・物流', ko: '국경무역 및 물류' },
  'Tư vấn Vay vốn & Tài chính': { vi: 'Tư vấn Vay vốn', en: 'Loan & Finance', zh: '贷款与金融', ja: '融資・金融', ko: '대출 및 금융' },
  'Truyền thông Thương hiệu': { vi: 'Truyền thông', en: 'Brand & PR', zh: '品牌传媒', ja: 'ブランドPR', ko: '브랜드 홍보' },
  'Marketing & Bán hàng': { vi: 'Marketing & Bán hàng', en: 'Marketing & Sales', zh: '营销与销售', ja: '営業・マーケティング', ko: '마케팅 및 영업' },
  'Ứng dụng AI & Công nghệ': { vi: 'Ứng dụng AI', en: 'AI & Tech', zh: 'AI与技术', ja: 'AI・テクノロジー', ko: 'AI 및 기술' },
  'Thực hành ESG & Phát triển bền vững': { vi: 'Thực hành ESG', en: 'ESG Practice', zh: 'ESG实践', ja: 'ESG実践', ko: 'ESG 실천' },
  'Hiệp hội & Giao thương': { vi: 'Hiệp hội & Đối tác', en: 'Associations', zh: '协会与合作', ja: '協会・パートナー', ko: '협회 및 파트너' },
  'Tài chính - Ngân hàng': { vi: 'Tài chính - Ngân hàng', en: 'Finance & Banking', zh: '金融与银行', ja: '金融・銀行', ko: '금융 및 은행' },
  'Bất động sản & Xây dựng': { vi: 'Bất động sản & Xây dựng', en: 'Real Estate & Construction', zh: '房地产与建筑', ja: '不動産・建設', ko: '부동산 및 건설' },
  'Công nghệ - Chuyển đổi số': { vi: 'Công nghệ - Chuyển đổi số', en: 'Tech & Digital Transformation', zh: '数字化转型', ja: 'DX・テクノロジー', ko: '디지털 전환' },
  'Khởi nghiệp - Đổi mới sáng tạo': { vi: 'Khởi nghiệp - Đổi mới sáng tạo', en: 'Startups & Innovation', zh: '创新创业', ja: 'スタートアップ', ko: '스타트업 및 혁신' },
  'Pháp luật - Chính sách': { vi: 'Pháp luật - Chính sách', en: 'Legal & Policy', zh: '法律政策', ja: '法律・政策', ko: '법률 및 정책' },
  'Doanh nghiệp & Xã hội': { vi: 'Doanh nghiệp & Xã hội', en: 'Business & Society', zh: '企业与社会', ja: '企業と社会', ko: '기업과 사회' },
  'Thị trường - Tiêu dùng': { vi: 'Thị trường - Tiêu dùng', en: 'Market & Consumer', zh: '市场与消费', ja: '市場・消費', ko: '시장 및 소비' },
  'Nông nghiệp - Môi trường': { vi: 'Nông nghiệp - Môi trường', en: 'Agriculture & Environment', zh: '农业与环境', ja: '農業・環境', ko: '농업 및 환경' },
  'Công nghiệp - Năng lượng': { vi: 'Công nghiệp - Năng lượng', en: 'Industry & Energy', zh: '工业与能源', ja: '産業・エネルギー', ko: '산업 및 에너지' },
  'Du lịch - Dịch vụ': { vi: 'Du lịch - Dịch vụ', en: 'Tourism & Services', zh: '旅游与服务', ja: '観光・サービス', ko: '관광 및 서비스' }
};

export const SUBCATEGORY_LABELS = {
  // Lao Cai Subcategories
  'Điểm đến & Thắng cảnh': { vi: 'Điểm đến & Thắng cảnh', en: 'Destinations & Landscapes', zh: '景点与景观', ja: '観光名所・風景', ko: '명소 및 경관' },
  'Bản sắc Văn hóa Tây Bắc': { vi: 'Bản sắc Văn hóa Tây Bắc', en: 'Northwest Cultural Identity', zh: '西北民族文化', ja: '北西部の民族文化', ko: '서북부 민족 문화' },
  'Ẩm thực Vùng cao': { vi: 'Ẩm thực Vùng cao', en: 'Highland Cuisine', zh: '高原特色美食', ja: '高原グルメ', ko: '고원 전통 요리' },
  'Di sản & Tâm linh': { vi: 'Di sản & Tâm linh', en: 'Heritage & Spirituality', zh: '遗产与心灵文化', ja: '遺産・スピリチュアル', ko: '유산 및 영성' },
  'Di sản & Lịch sử': { vi: 'Di sản & Lịch sử', en: 'Heritage & History', zh: '遗产与历史', ja: '遺産・歴史', ko: '유산 및 역사' },
  'Danh bạ Doanh nghiệp': { vi: 'Danh bạ Doanh nghiệp', en: 'Business Directory', zh: '企业名录', ja: '企業名鑑', ko: '기업 디렉토리' },
  'Sản phẩm OCOP & Đặc sản': { vi: 'Sản phẩm OCOP & Đặc sản', en: 'OCOP & Local Specialties', zh: 'OCOP与地方特产', ja: 'OCOP・特産品', ko: 'OCOP 및 특산품' },
  'Sản phẩm OCOP & Nông sản': { vi: 'Sản phẩm OCOP & Nông sản', en: 'OCOP & Agro-products', zh: 'OCOP与农产品', ja: 'OCOP・農産物', ko: 'OCOP 및 농산물' },
  'Khởi nghiệp Đổi mới sáng tạo': { vi: 'Khởi nghiệp Đổi mới sáng tạo', en: 'Startups & Innovation', zh: '创新创业', ja: 'スタートアップ・革新', ko: '스타트업 및 혁신' },
  'Showroom số': { vi: 'Showroom số', en: 'Digital Showroom', zh: '数字展厅', ja: 'デジタルショールーム', ko: '디지털 쇼룸' },
  'Danh mục Dự án Kêu gọi': { vi: 'Danh mục Dự án Kêu gọi', en: 'Invited Projects', zh: '招商引资项目', ja: '誘致プロジェクト', ko: '유치 프로젝트' },
  'Khu & Cụm công nghiệp': { vi: 'Khu & Cụm công nghiệp', en: 'Industrial Parks & Clusters', zh: '工业区与产业集群', ja: '工業団地・集積地', ko: '산업단지 및 클러스터' },
  'Chính sách & Ưu đãi Đầu tư': { vi: 'Chính sách & Ưu đãi Đầu tư', en: 'Incentive Policies', zh: '投资优惠政策', ja: '投資優遇政策', ko: '투자 우대 정책' },
  'Khu Kinh tế Cửa khẩu Lào Cai': { vi: 'Khu Kinh tế Cửa khẩu Lào Cai', en: 'Lao Cai Border Economic Zone', zh: '老街口岸经济区', ja: 'ラオカイ国境経済区', ko: '라오까이 국경경제구역' },
  'Xuất nhập khẩu ASEAN - Trung Quốc': { vi: 'Xuất nhập khẩu ASEAN - Trung Quốc', en: 'ASEAN - China Cross-border Trade', zh: '东盟-中国进出口贸易', ja: 'ASEAN・中国輸出入', ko: '아세안-중국 수출입' },
  'Hạ tầng Giao thông & Liên vận': { vi: 'Hạ tầng Giao thông & Liên vận', en: 'Transport & Intermodal Logistics', zh: '交通与国际联运基础设施', ja: '交通・国際連帯輸送', ko: '교통 및 복합물류 인프라' },
  'Dược liệu quý & Chè Shan Tuyết': { vi: 'Dược liệu quý & Chè Shan Tuyết', en: 'Precious Herbs & Shan Tuyet Tea', zh: '珍贵药材与雪山古树茶', ja: '貴重薬草・シャントゥエット茶', ko: '희귀 약초 및 산뚜옛 차' },
  'Nông nghiệp Công nghệ cao': { vi: 'Nông nghiệp Công nghệ cao', en: 'High-Tech Agriculture', zh: '高科技农业', ja: 'ハイテク農業', ko: '첨단 농업' },
  'Thương hiệu & Thị trường': { vi: 'Thương hiệu & Thị trường', en: 'Brand & Markets', zh: '品牌与市场', ja: 'ブランド・市場', ko: '브랜드 및 시장' },
  'Hành trình 2N1Đ & 3N2Đ': { vi: 'Hành trình 2N1Đ & 3N2Đ', en: '2D1N & 3D2N Itineraries', zh: '2天1夜与3天2夜行程', ja: '2泊3日モデルコース', ko: '2박 3일 추천 일정' },
  'Nghỉ dưỡng, Săn mây & Kinh tế đêm': { vi: 'Nghỉ dưỡng, Săn mây & Kinh tế đêm', en: 'Resorts, Cloud Hunting & Night Economy', zh: '度假、云海观赏与夜间经济', ja: 'リゾート・雲海・ナイトエコノミー', ko: '리조트, 운해 및 야간 경제' },
  'Du lịch Sinh thái & Bản làng': { vi: 'Du lịch Sinh thái & Bản làng', en: 'Ecotourism & Villages', zh: '生态与村落旅游', ja: 'エコツーリズム・集落', ko: '생태 및 마을 관광' },
  'Hội chợ Thương mại Quốc tế': { vi: 'Hội chợ Thương mại Quốc tế', en: 'International Trade Fair', zh: '国际贸易博览会', ja: '国際貿易見本市', ko: '국제 무역 박람회' },
  'Diễn đàn Xúc tiến Đầu tư': { vi: 'Diễn đàn Xúc tiến Đầu tư', en: 'Investment Promotion Forum', zh: '投资促进论坛', ja: '投資促進フォーラム', ko: '투자 촉진 포럼' },
  'Lễ hội Bốn mùa Lào Cai': { vi: 'Lễ hội Bốn mùa Lào Cai', en: 'Lao Cai Four-Season Festivals', zh: '老街四季节庆', ja: 'ラオカイ四季祭り', ko: '라오까이 사계절 축제' },
  'Giao thương & Kết nối B2B': { vi: 'Giao thương & Kết nối B2B', en: 'B2B Trade & Networking', zh: 'B2B商务对接', ja: 'B2Bビジネスマッチング', ko: 'B2B 무역 및 네트워킹' }
};

export const getCategoryLabel = (cat, lang = 'vi') => {
  if (!cat) return '';
  const l = lang || 'vi';
  if (typeof cat === 'object') {
    if (cat.name) {
      if (CATEGORY_LABELS[cat.name]?.[l]) return CATEGORY_LABELS[cat.name][l];
      if (l === 'en' && cat.name_en) return String(cat.name_en);
      if (l !== 'vi' && CATEGORY_LABELS[cat.name]?.en) return CATEGORY_LABELS[cat.name].en;
      return String(cat.name);
    }
    return '';
  }
  if (typeof cat === 'string') {
    if (CATEGORY_LABELS[cat]?.[l]) return CATEGORY_LABELS[cat][l];
    if (l !== 'vi' && CATEGORY_LABELS[cat]?.en) return CATEGORY_LABELS[cat].en;
    return cat;
  }
  return String(cat);
};

export const getSubCategoryLabel = (sub, lang = 'vi') => {
  if (!sub) return '';
  const l = lang || 'vi';
  if (typeof sub === 'object') {
    if (sub.name) {
      if (SUBCATEGORY_LABELS[sub.name]?.[l]) return SUBCATEGORY_LABELS[sub.name][l];
      if (l === 'en' && sub.name_en) return String(sub.name_en);
      if (l !== 'vi' && SUBCATEGORY_LABELS[sub.name]?.en) return SUBCATEGORY_LABELS[sub.name].en;
      return String(sub.name);
    }
    return '';
  }
  if (typeof sub === 'string') {
    if (SUBCATEGORY_LABELS[sub]?.[l]) return SUBCATEGORY_LABELS[sub][l];
    if (l !== 'vi' && SUBCATEGORY_LABELS[sub]?.en) return SUBCATEGORY_LABELS[sub].en;
    return sub;
  }
  return String(sub);
};

export default CATEGORIES_DATA;
