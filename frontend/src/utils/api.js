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
 * Fallback data cho Phutho.today phản ánh toàn diện tỉnh Phú Thọ mới sau sáp nhập
 * (Bao gồm ba không gian: Phú Thọ cội nguồn, Vĩnh Phúc công nghiệp & nghỉ dưỡng, Hòa Bình văn hóa Mường & hồ sinh thái)
 */
export const FALLBACK_POSTS = [
  {
    id: 'pt-post-1',
    title: 'Phú Thọ Mới Sau Sáp Nhập: Không Gian Phát Triển 9.361 km² và Tầm Vóc Cực Tăng Trưởng Kinh Tế Hàng Đầu Vùng Thủ Đô',
    slug: 'phu-tho-moi-sau-sap-nhap-khong-gian-phat-trien-va-tam-voc-cuc-tang-truong',
    category: 'Khám phá Phú Thọ',
    sub_category: 'Đất Tổ Hùng Vương & Di sản',
    summary: 'Nghị quyết 202/2025/QH15 mở ra kỷ nguyên mới khi hợp nhất ba không gian Phú Thọ, Vĩnh Phúc và Hòa Bình thành một thực thể kinh tế - văn hóa hùng mạnh với hơn 4 triệu dân và 148 đơn vị hành chính cấp xã.',
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Biên tập Phutho.today',
    company_name: 'Viện Nghiên cứu Phát triển Kinh tế Liên vùng',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    views: 5240,
    is_featured: 1
  },
  {
    id: 'pt-post-2',
    title: 'Hành Lang Công Nghiệp Công Nghệ Cao & Chuỗi Cung Ứng Toàn Cầu: Trục Động Lực Vĩnh Phúc – Việt Trì – Lương Sơn',
    slug: 'hanh-lang-cong-nghiep-cong-nghe-cao-va-chuoi-cung-ung-toan-cau',
    category: 'Đầu tư & Hợp tác',
    sub_category: 'Khu & Cụm công nghiệp trọng điểm',
    summary: 'Sự kết hợp giữa thủ phủ ô tô, xe máy, linh kiện bán dẫn Vĩnh Phúc với các KCN quy mô lớn tại Phú Thọ (Phú Hà, Cẩm Khê) và Hòa Bình (Lương Sơn, Nhuận Trạch) tạo thành hệ sinh thái công nghiệp khép kín hàng đầu miền Bắc.',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Trung tâm Xúc tiến Đầu tư Phutho.today',
    company_name: 'Ban Quản lý Các Khu Công Nghiệp Tỉnh',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    views: 4180,
    is_featured: 1
  },
  {
    id: 'pt-post-3',
    title: 'Vòng Cung Du Lịch Di Sản & Nghỉ Dưỡng: Về Cội Nguồn Đất Tổ, Chạm Mây Tam Đảo và Khám Phá Kỳ Quan Hồ Hòa Bình',
    slug: 'vong-cung-du-lich-di-san-va-nghi-duong-phu-tho-moi',
    category: 'Du lịch & Trải nghiệm',
    sub_category: 'Điểm đến & Thắng cảnh 3 vùng',
    summary: 'Chiến lược phát triển du lịch đa trải nghiệm: từ di sản tâm linh Đền Hùng - Hát Xoan UNESCO, nghỉ dưỡng mù sương Tam Đảo - Tây Thiên, suối khoáng nóng Thanh Thủy đến du thuyền khám phá 47 hòn đảo xanh Hồ Hòa Bình và thung lũng Mai Châu.',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Phòng Phát triển Sản phẩm Du lịch',
    company_name: 'Hiệp hội Du lịch & Dịch vụ Tỉnh Phú Thọ',
    company_tier: 'Platinum',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    views: 3890,
    is_featured: 1
  },
  {
    id: 'pt-post-4',
    title: 'Tinh Hoa OCOP 3 Vùng Miền: Bưởi Đoan Hùng, Chè Long Cốc, Cam Cao Phong và Nông Sản Sạch Tam Đảo Vươn Tầm Quốc Tế',
    slug: 'tinh-hoa-ocop-3-vung-mien-phu-tho-vinh-phuc-hoa-binh',
    category: 'Sản phẩm địa phương & OCOP',
    sub_category: 'Sản phẩm OCOP tiêu biểu',
    summary: 'Xây dựng bản đồ nông sản số và chứng nhận xuất xứ cho các đặc sản trứ danh: bưởi đặc sản Đoan Hùng, trà Shan Tuyết đồi chè Long Cốc, cam lòng vàng Cao Phong, rau su su an toàn Tam Đảo và rượu cần truyền thống xứ Mường.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Nông nghiệp & Phát triển Nông thôn',
    company_name: 'Liên minh Hợp tác xã Tỉnh Phú Thọ',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 27).toISOString(),
    views: 2950,
    is_featured: 1
  },
  {
    id: 'pt-post-5',
    title: 'Trợ Lý AI Phutho.today: Hướng Dẫn Tra Cứu Địa Chỉ Hành Chính Sau Sáp Nhập và Kết Nối Giao Thương 24/7',
    slug: 'tro-ly-ai-phutho-today-tra-cuu-dia-chi-va-ket-noi-giao-thuong',
    category: 'Tri thức & Đào tạo số',
    sub_category: 'Chuyển đổi số & Ứng dụng AI',
    summary: 'Ứng dụng công nghệ AI tạo sinh (Gemini Flash RAG) để giải quyết bài toán tra cứu 148 xã/phường mới, ánh xạ từ các địa danh cũ Vĩnh Phúc, Hòa Bình, Phú Thọ giúp người dân, doanh nghiệp và đối tác đầu tư tra cứu thông tin chính xác trong tích tắc.',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Khối Công nghệ & AI ADT Quốc tế',
    company_name: 'Công ty Cổ phần ADT Quốc tế',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    views: 3410,
    is_featured: 1
  },
  {
    id: 'pt-post-6',
    title: 'Danh Mục Dự Án Trọng Điểm Thu Hút Đầu Tư Giai Đoạn 2026 – 2030 Tại Tỉnh Phú Thọ Mới',
    slug: 'danh-muc-du-an-trong-diem-thu-hut-dau-tu-phu-tho-2026-2030',
    category: 'Đầu tư & Hợp tác',
    sub_category: 'Danh mục dự án kêu gọi hợp tác',
    summary: 'Công bố các dự án hạ tầng đô thị ven sông Hồng - sông Lô, KCN sinh thái, trung tâm logistics kết nối cao tốc Nội Bài - Lào Cai và các tổ hợp du lịch nghỉ dưỡng cao cấp quanh Hồ Hòa Bình và sườn nam Tam Đảo.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Tổ Công tác Xúc tiến Đầu tư',
    company_name: 'Cổng Dữ liệu Đầu tư Phutho.today',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 4620,
    is_featured: 1
  }
];

export const FALLBACK_EVENTS = [
  {
    id: 'pt-evt-1',
    title: 'Đại Lễ Giỗ Tổ Hùng Vương & Tuần Lễ Văn Hóa Du Lịch Đất Tổ 2026',
    slug: 'gio-to-hung-vuong-va-tuan-le-van-hoa-du-lich-dat-to-2026',
    description: 'Sự kiện văn hóa tâm linh lớn nhất trong năm quy tụ hàng triệu đồng bào cả nước và kiều bào về nguồn tại Khu Di tích Lịch sử Quốc gia đặc biệt Đền Hùng.',
    start_date: '2026-04-26 07:30:00',
    end_date: '2026-04-27 22:00:00',
    location: 'Khu Di tích Lịch sử Quốc gia Đặc biệt Đền Hùng, TP. Việt Trì',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Tổ chức Lễ hội Đền Hùng',
    is_paid: 0,
    price: 0,
    max_tickets: 5000,
    registered_tickets: 3420,
    status: 'upcoming'
  },
  {
    id: 'pt-evt-2',
    title: 'Diễn Đàn Doanh Nghiệp & Xúc Tiến Đầu Tư Tỉnh Phú Thọ Mới 2026',
    slug: 'dien-dan-doanh-nghiep-va-xuc-tien-dau-tu-phu-tho-moi-2026',
    description: 'Hội nghị đối thoại trực tiếp giữa lãnh đạo tỉnh, các tập đoàn FDI đa quốc gia và cộng đồng doanh nghiệp ba vùng về quy hoạch liên vùng và chính sách ưu đãi đầu tư.',
    start_date: '2026-05-15 08:30:00',
    end_date: '2026-05-15 17:30:00',
    location: 'Trung tâm Hội nghị Quốc tế Flamingo Đại Lải, Tỉnh Phú Thọ',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Trung tâm Xúc tiến Đầu tư & Thương mại Phutho.today',
    is_paid: 1,
    price: 350000,
    max_tickets: 600,
    registered_tickets: 418,
    status: 'upcoming'
  },
  {
    id: 'pt-evt-3',
    title: 'Lễ Hội Mây Ngàn Tam Đảo & Tuần Lễ Thiền Trà Tây Thiên 2026',
    slug: 'le-hoi-may-ngan-tam-dao-va-tuan-le-thien-tra-tay-thien',
    description: 'Chuỗi hoạt động tôn vinh cảnh sắc thiên nhiên Tam Đảo, không gian văn hóa Phật giáo Trúc Lâm Tây Thiên và trải nghiệm ẩm thực đặc sản núi cao.',
    start_date: '2026-06-06 09:00:00',
    end_date: '2026-06-08 21:00:00',
    location: 'Khu Du lịch Quốc gia Tam Đảo & Danh thắng Tây Thiên',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Hiệp hội Du lịch Tam Đảo - Tây Thiên',
    is_paid: 0,
    price: 0,
    max_tickets: 1200,
    registered_tickets: 850,
    status: 'upcoming'
  },
  {
    id: 'pt-evt-4',
    title: 'Ngày Hội Văn Hóa Chiêng Mường & Tuần Lễ Du Lịch Sinh Thái Hồ Hòa Bình',
    slug: 'ngay-hoi-van-hoa-chieng-muong-va-tuan-le-du-lich-ho-hoa-binh',
    description: 'Trình diễn không gian di sản Mo Mường, cồng chiêng Mường, đua thuyền kayak trên vịnh hồ Hòa Bình và khám phá bản văn hóa Thái Mai Châu.',
    start_date: '2026-07-18 08:00:00',
    end_date: '2026-07-20 20:00:00',
    location: 'Cảng Du thuyền Hồ Hòa Bình & Bản Lác, Thung lũng Mai Châu',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Sở Văn hóa, Thể thao và Du lịch',
    is_paid: 0,
    price: 0,
    max_tickets: 2000,
    registered_tickets: 1350,
    status: 'upcoming'
  }
];

export const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: 'Công ty Cổ phần Supe Phốt phát & Hóa chất Lâm Thao',
    tax_code: '2600100234',
    industry: 'Hóa chất & Phân bón Nông nghiệp',
    tier: 'Platinum',
    city: 'Phú Thọ',
    address: 'Thị trấn Lâm Thao, Huyện Lâm Thao, Tỉnh Phú Thọ',
    is_featured: 1,
    description: 'Doanh nghiệp sản xuất phân bón và hóa chất quy mô hàng đầu Việt Nam, phục vụ hàng triệu nông dân toàn quốc.'
  },
  {
    id: 2,
    name: 'Tập đoàn Prime Group (KCN Bình Xuyên)',
    tax_code: '2500223456',
    industry: 'Vật liệu Xây dựng & Gạch ốp lát',
    tier: 'Diamond',
    city: 'Phú Thọ',
    address: 'Khu công nghiệp Bình Xuyên, Tỉnh Phú Thọ',
    is_featured: 1,
    description: 'Tập đoàn sản xuất gạch ốp lát và vật liệu xây dựng hàng đầu Đông Nam Á, thành viên tập đoàn SCG Thái Lan.'
  },
  {
    id: 3,
    name: 'Tổ hợp Du lịch & Nghỉ dưỡng Flamingo Đại Lải',
    tax_code: '2500334567',
    industry: 'Du lịch, Nghỉ dưỡng & Bất động sản Sinh thái',
    tier: 'Diamond',
    city: 'Phú Thọ',
    address: 'Khu du lịch Hồ Đại Lải, Tỉnh Phú Thọ',
    is_featured: 1,
    description: 'Khu nghỉ dưỡng sinh thái 5 sao đẳng cấp quốc tế, Top 10 resort đẹp nhất hành tinh giữa không gian hồ nước và rừng thông ngút ngàn.'
  },
  {
    id: 4,
    name: 'Hợp tác xã Nông nghiệp & Chè Đặc sản Long Cốc',
    tax_code: '2600889911',
    industry: 'Nông sản, Chè hữu cơ & Du lịch Cộng đồng',
    tier: 'Gold',
    city: 'Phú Thọ',
    address: 'Đồi chè Long Cốc, Tỉnh Phú Thọ',
    is_featured: 1,
    description: 'Đơn vị sản xuất chè Đinh, chè Bát Tiên và chè Shan Tuyết hữu cơ đạt chuẩn OCOP 4 sao tại danh thắng đồi chè Long Cốc.'
  }
];
