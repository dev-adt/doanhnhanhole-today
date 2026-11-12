/**
 * Fast & Resilient API Client with strict timeouts & fallbacks
 * Prevents endless loading spinners when backend/network is slow or recovering.
 */

export const DEFAULT_TIMEOUT_MS = 10000;

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Yêu cầu mạng hết thời gian chờ (${timeoutMs}ms): ${url}`);
    }
    throw error;
  }
}

export async function fetchJsonWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const res = await fetchWithTimeout(url, options, timeoutMs);
  if (!res.ok) {
    let errMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) errMsg = errJson.error;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return await res.json();
}

/**
 * Fallback data cho Doanhnhanhole.today phản ánh đúng Tài liệu Đề án
 * "Doanh nhân Họ Lê Toàn cầu & Những người bạn" (Giao thương • Du lịch • Đầu tư • Chia sẻ kinh nghiệm • Đào tạo)
 */
export const FALLBACK_POSTS = [
  {
    id: 'hl-post-1',
    title: 'Ra Mắt Đề Án Nền Tảng Số Doanhnhanhole.today: Kết Nối Doanh Nhân Họ Lê Toàn Cầu & Những Người Bạn',
    slug: 'ra-mat-de-an-nen-tang-so-doanhnhanhole-today-ket-noi-toan-cau',
    category: 'Cộng đồng & Danh bạ',
    sub_category: '100 Doanh nhân Tiên phong',
    summary: 'Xây dựng cộng đồng doanh nhân có Ban điều phối và nền tảng số dùng chung. Mối liên kết Họ Lê là điểm khởi đầu của niềm tin; giá trị cộng đồng được chứng minh bằng chất lượng kết nối thực chất và kết quả phục vụ hội viên.',
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Điều hành Doanhnhanhole.today',
    company_name: 'Ban Sáng lập Doanh nhân Họ Lê Toàn cầu',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    views: 6820,
    is_featured: 1
  },
  {
    id: 'hl-post-2',
    title: 'Chương Trình "100 Doanh Nhân Tiên Phong": Chuẩn Hóa Hồ Sơ Năng Lực & Khởi Động Sàn Giao Thương Có Điều Phối',
    slug: 'chuong-trinh-100-doanh-nhan-tien-phong-chuan-hoa-ho-so-va-ket-noi',
    category: 'Cơ hội Giao thương',
    sub_category: 'Nhu cầu Mua hàng & Tìm nhà cung cấp',
    summary: 'Mời 100 doanh nhân đầu tiên theo nhóm ngành (Sản xuất & Xuất khẩu, Thương mại & Phân phối, Du lịch & Dịch vụ, Công nghệ & Khởi nghiệp). Mỗi thành viên được hỗ trợ chuẩn hóa hồ sơ xác minh và xử lý ít nhất 01 nhu cầu hợp tác cụ thể trong 48 giờ.',
    image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Thư ký Điều phối Kết nối',
    company_name: 'Trung tâm Điều phối Giao thương Họ Lê',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    views: 5140,
    is_featured: 1
  },
  {
    id: 'hl-post-3',
    title: 'Bài Học Điều Hành Thực Tế: Tái Cấu Trúc Hệ Thống Phân Phối & Quản Trị Dòng Tiền Khi Mở Rộng Thị Trường Xuất Khẩu',
    slug: 'bai-hoc-dieu-hanh-tai-cau-truc-phan-phoi-va-quan-tri-dong-tien',
    category: 'Bài học Điều hành',
    sub_category: 'Tình huống Quản trị Thực tế',
    summary: 'Chuyên mục Bài học điều hành chia sẻ từ tình huống thật của doanh nhân hội viên: Bối cảnh thị trường biến động, Quyết định cắt giảm tồn kho 35%, Kết quả sau 6 tháng và 4 nguyên tắc áp dụng ngay cho doanh nghiệp vừa và nhỏ.',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Hội đồng Cố vấn Quản trị',
    company_name: 'Khối Đào tạo & Chia sẻ Kinh nghiệm',
    company_tier: 'Platinum',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    views: 4390,
    is_featured: 1
  },
  {
    id: 'hl-post-4',
    title: 'Hành Trình Về Nguồn Họ Lê & Biz-Tour Khảo Sát Nhà Máy: Kết Hợp Chiều Sâu Văn Hóa Với Cơ Hội Hợp Tác Đầu Tư',
    slug: 'hanh-trinh-ve-nguon-ho-le-va-biz-tour-khao-sat-nha-may',
    category: 'Du lịch & Về nguồn',
    sub_category: 'Hành trình Về nguồn Họ Lê',
    summary: 'Thiết kế các chương trình du lịch kết hợp thăm doanh nghiệp hội viên, hành trình tri ân cội nguồn Họ Lê và đón đoàn doanh nhân Việt ở nước ngoài về tìm hiểu thị trường với chuẩn mực minh bạch dịch vụ và đầu mối phụ trách.',
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Kết nối Du lịch & Văn hóa',
    company_name: 'Nhóm Chuyên đề Du lịch & Dịch vụ',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    views: 3820,
    is_featured: 1
  },
  {
    id: 'hl-post-5',
    title: 'Chương Trình Cố Vấn Khởi Nghiệp 8 Tuần (Mentorship 1-Kèm-3) & 6 Chuyên Đề Đào Tạo Chủ Doanh Nghiệp',
    slug: 'chuong-trinh-co-van-khoi-nghiep-8-tuan-va-6-chuyen-de-dao-tao',
    category: 'Đào tạo & Cố vấn',
    sub_category: 'Cố vấn Khởi nghiệp 8 Tuần (1-kèm-3)',
    summary: 'Thí điểm mô hình 01 doanh nhân giàu kinh nghiệm hướng dẫn 01 đến 03 doanh nhân trẻ trong 8 tuần với cam kết bảo mật và mục tiêu xây dựng kế hoạch cải thiện kinh doanh thực chất.',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Đào tạo & Phát triển Năng lực',
    company_name: 'Học viện Doanh nhân Họ Lê',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    views: 3650,
    is_featured: 1
  },
  {
    id: 'hl-post-6',
    title: 'Phiên Giới Thiệu Cơ Hội Đầu Tư Hàng Quý: Quy Trình Tiếp Cận Tài Liệu Dự Án Có Kiểm Soát & Thẩm Định Độc Lập',
    slug: 'phien-gioi-thieu-co-hoi-dau-tu-hang-quy-va-data-room-kiem-soat',
    category: 'Đầu tư & Dự án',
    sub_category: 'Phiên Giới thiệu Cơ hội Đầu tư Quý',
    summary: 'Danh mục dự án mở rộng nhà máy, phát triển chuỗi phân phối và chuyển giao công nghệ. Hồ sơ công bố rõ chủ thể, mục tiêu vốn và tiến độ; tài liệu chi tiết chỉ mở cho nhà đầu tư được chủ hồ sơ chấp thuận.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Kết nối Đầu tư',
    company_name: 'Hội đồng Xúc tiến Đầu tư Doanhnhanhole.today',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 4910,
    is_featured: 1
  }
];

export const FALLBACK_EVENTS = [
  {
    id: 'hl-evt-1',
    title: 'Phiên Giao Thương Hàng Tháng & Lễ Chào Đón "100 Doanh Nhân Tiên Phong" Họ Lê Toàn Cầu',
    slug: 'phien-giao-thuong-hang-thang-va-chao-don-100-doanh-nhan-tien-phong',
    description: 'Sự kiện kết nối trực tiếp và trực tuyến dành cho các doanh nhân Họ Lê và những người bạn: giới thiệu năng lực, ghép cặp 1-1 theo nhu cầu mua bán - phân phối đã qua Ban thư ký rà soát.',
    start_date: '2026-12-05 08:30:00',
    end_date: '2026-12-05 17:00:00',
    location: 'Trung tâm Hội nghị Quốc tế, Hà Nội & Kết nối Trực tuyến Toàn cầu (Zoom)',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Điều hành & Ban Thư ký Doanhnhanhole.today',
    is_paid: 0,
    price: 0,
    max_tickets: 300,
    registered_tickets: 215,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-2',
    title: 'Hành Trình Về Nguồn Họ Lê & Đoàn Khảo Sát Doanh Nghiệp Sản Xuất Quý IV (Biz-Tour)',
    slug: 'hanh-trinh-ve-nguon-ho-le-va-doan-khao-sat-doanh-nghiep-quy-4',
    description: 'Chuyến hành trình dâng hương khu di tích lịch sử Lam Kinh kết hợp thăm 03 tổ hợp nhà máy sản xuất - chế biến xuất khẩu của hội viên doanh nhân Họ Lê tại khu vực Bắc Trung Bộ.',
    start_date: '2026-12-19 07:00:00',
    end_date: '2026-12-20 19:30:00',
    location: 'Hà Nội – Khu Di tích Lam Kinh (Thanh Hóa) – KCN Nghi Sơn',
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Kết nối Du lịch & Đầu mối Khu vực Miền Bắc',
    is_paid: 1,
    price: 1500000,
    max_tickets: 80,
    registered_tickets: 64,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-3',
    title: 'Đối Thoại Chuyên Gia & Chuyên Đề: Ứng Dụng AI Và Chuyển Đổi Số Thực Chiến Cho Chủ Doanh Nghiệp',
    slug: 'doi-thoai-chuyen-gia-ung-dung-ai-va-chuyen-doi-so-thuc-chien',
    description: 'Chương trình đào tạo thực hành nằm trong chuỗi 6 chuyên đề cốt lõi của Doanhnhanhole.today, phối hợp cùng chuyên gia công nghệ ADT Quốc tế hướng dẫn tối ưu vận hành và bán hàng bằng AI.',
    start_date: '2027-01-10 08:30:00',
    end_date: '2027-01-10 16:30:00',
    location: 'Tổ hợp Hội thảo Doanh nhân, TP. Hồ Chí Minh & Livestream Hội viên',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Đào tạo & Đối tác Công nghệ ADT Quốc tế',
    is_paid: 0,
    price: 0,
    max_tickets: 200,
    registered_tickets: 148,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-4',
    title: 'Phiên Giới Thiệu Cơ Hội Đầu Tư & Đón Đoàn Doanh Nhân Việt Ở Nước Ngoài Về Tìm Hiểu Thị Trường',
    slug: 'phien-gioi-thieu-co-hoi-dau-tu-va-don-doanh-nhan-kieu-bao',
    description: 'Trình bày 08 hồ sơ dự án hợp tác mở rộng nhà máy, hệ thống phân phối và chuyển giao công nghệ với phần nhận xét độc lập của hội đồng chuyên gia tài chính - pháp lý.',
    start_date: '2027-01-24 08:30:00',
    end_date: '2027-01-24 17:30:00',
    location: 'Khách sạn Melia Hà Nội & Phòng Họp Trực Tuyến Quốc Tế',
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Kết nối Đầu tư & Đầu mối Quốc tế Doanhnhanhole.today',
    is_paid: 1,
    price: 500000,
    max_tickets: 150,
    registered_tickets: 112,
    status: 'upcoming'
  }
];

export const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: 'Công ty Cổ phần ADT Quốc tế (Đối tác Công nghệ Triển khai)',
    tax_code: '0108234567',
    industry: 'Công nghệ số, Nền tảng AI & Chuyển đổi số',
    tier: 'Platinum',
    city: 'Hà Nội',
    address: 'Khu đô thị Văn Phú, P. Kiến Hưng, Hà Nội',
    is_featured: 1,
    description: 'Đơn vị phát triển nền tảng công nghệ, hệ sinh thái cổng thông tin số đa ngôn ngữ, quản trị hội viên và Trợ lý AI có kiểm soát cho cộng đồng doanh nhân.'
  },
  {
    id: 2,
    name: 'Tập đoàn Sản xuất & Xuất nhập khẩu Nông sản Lê Gia',
    tax_code: '0312456789',
    industry: 'Sản xuất & Xuất khẩu • Nông sản thực phẩm',
    tier: 'Diamond',
    city: 'TP. Hồ Chí Minh',
    address: 'Khu chế xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    is_featured: 1,
    description: 'Doanh nghiệp tiên phong trong chuỗi chế biến sâu nông sản Việt xuất khẩu sang thị trường Châu Âu, Nhật Bản và Bắc Mỹ; tìm kiếm đại lý phân phối nội địa.'
  },
  {
    id: 3,
    name: 'Công ty Cổ phần Đầu tư Hạ tầng & Thương mại Đông Đô',
    tax_code: '0105678912',
    industry: 'Thương mại & Phân phối • Vật liệu & Logistics',
    tier: 'Gold',
    city: 'Thanh Hóa',
    address: 'Đại lộ Lê Lợi, TP. Thanh Hóa',
    is_featured: 1,
    description: 'Hệ thống kho vận và phân phối vật tư công nghiệp, vật liệu xây dựng xanh trên toàn trục Bắc - Nam; sẵn sàng hợp tác kho bãi cùng hội viên.'
  },
  {
    id: 4,
    name: 'Công ty TNHH Lữ hành Di sản & Sự kiện Doanh nhân Toàn Cầu',
    tax_code: '0401987654',
    industry: 'Du lịch & Dịch vụ • Tổ chức Biz-Tour & MICE',
    tier: 'Gold',
    city: 'Đà Nẵng',
    address: 'Đường Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
    is_featured: 1,
    description: 'Đơn vị chuyên tổ chức các đoàn hành trình về nguồn Họ Lê, tour khảo sát nhà máy kết hợp hội nghị MICE trong nước và quốc tế.'
  }
];
