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
 * Fallback data cho Laocai.today để trang luôn hiển thị nội dung phong phú và hấp dẫn
 */
export const FALLBACK_POSTS = [
  {
    id: 'fb-post-1',
    title: 'Khu Kinh tế Cửa khẩu Lào Cai: Động lực bứt phá trở thành trung tâm giao thương ASEAN – Trung Quốc',
    slug: 'khu-kinh-te-cua-khau-lao-cai-trung-tam-giao-thuong-asean-trung-quoc',
    category: 'Cửa khẩu & Logistics',
    sub_category: 'Khu Kinh tế Cửa khẩu Lào Cai',
    summary: 'Phân tích lợi thế chiến lược của Cửa khẩu Quốc tế Kim Thành, đường sắt liên vận quốc tế, cao tốc Nội Bài – Lào Cai và Cảng hàng không Sa Pa trong việc định hình trung tâm logistics biên giới hiện đại.',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Ban Biên tập Laocai.today',
    company_name: 'Ban Quản lý Khu Kinh tế Tỉnh Lào Cai',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    views: 4120,
    is_featured: 1
  },
  {
    id: 'fb-post-2',
    title: 'Chuỗi giá trị Dược liệu quý & Chè cổ thụ Shan Tuyết Lào Cai: Từ đỉnh núi mờ sương đến thị trường quốc tế',
    slug: 'chuoi-gia-tri-duoc-lieu-quy-va-che-co-thu-shan-tuyet-lao-cai',
    category: 'Nông sản & Dược liệu',
    sub_category: 'Dược liệu quý & Chè Shan Tuyết',
    summary: 'Mô hình liên kết vùng trồng dược liệu chuẩn GACP-WHO (Atiso Sa Pa, tam thất, đương quy) và chè cổ thụ Shan Tuyết Bắc Hà – Mường Khương kết hợp chế biến sâu nâng tầm giá trị OCOP 5 sao.',
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Nhóm Nghiên cứu Kinh tế Vùng cao',
    company_name: 'Hiệp hội Dược liệu & Nông sản Lào Cai',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 3150,
    is_featured: 1
  },
  {
    id: 'fb-post-3',
    title: 'Danh mục các dự án trọng điểm kêu gọi đầu tư vào tỉnh Lào Cai giai đoạn 2026 – 2030',
    slug: 'danh-muc-du-an-trong-diem-keu-goi-dau-tu-lao-cai-2026-2030',
    category: 'Dự án & Đầu tư',
    sub_category: 'Danh mục Dự án Kêu gọi',
    summary: 'Tập trung thu hút đầu tư hạ tầng logistics Cửa khẩu Quốc tế Kim Thành – Bản Vược, công nghiệp chế biến sâu tại KCN Tằng Loỏng – Võ Lao, nông nghiệp công nghệ cao và tổ hợp nghỉ dưỡng sinh thái Sa Pa – Y Tý.',
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Trung tâm Xúc tiến Đầu tư & Thương mại',
    company_name: 'Nền tảng Kết nối Đầu tư Laocai.today',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    views: 2680,
    is_featured: 1
  },
  {
    id: 'fb-post-4',
    title: 'Chiến lược du lịch thông minh Lào Cai: "Mỗi du khách ở lại lâu hơn, trải nghiệm sâu hơn và chi tiêu nhiều hơn"',
    slug: 'chien-luoc-du-lich-thong-minh-lao-cai-o-lai-lau-hon-trai-nghiem-sau-hon',
    category: 'Du lịch & Trải nghiệm',
    sub_category: 'Hành trình 2N1Đ & 3N2Đ',
    summary: 'Kết nối hành trình khám phá đỉnh thiêng Fansipan, thung lũng Mường Hoa, cao nguyên trắng Bắc Hà và biển mây Y Tý cùng hệ sinh thái kinh tế đêm và trợ lý AI đa ngôn ngữ 24/7.',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Ban Văn hóa & Du lịch Lào Cai',
    company_name: 'Tổ hợp Du lịch & Cáp treo Fansipan Sa Pa',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    views: 2190,
    is_featured: 0
  }
];

export const FALLBACK_EVENTS = [
  {
    id: 'fb-evt-1',
    title: 'Hội chợ Thương mại Quốc tế Việt – Trung (Lào Cai) & Diễn đàn Kết nối Logistics ASEAN',
    slug: 'hoi-cho-thuong-mai-quoc-te-viet-trung-lao-cai-2026',
    short_desc: 'Sự kiện xúc tiến thương mại biên giới, đầu tư và du lịch quy mô quốc tế quy tụ hơn 600 gian hàng doanh nghiệp Việt Nam, Trung Quốc và các quốc gia ASEAN.',
    event_date: new Date(Date.now() + 86400000 * 18 + 3600000 * 5).toISOString(),
    location: 'Trung tâm Hội chợ Triển lãm Kim Thành, Phường Duyên Hải, TP. Lào Cai',
    organizer: 'UBND Tỉnh Lào Cai & Nền tảng Laocai.today',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    is_paid: 0,
    price: 0,
    remaining_tickets: 500,
    registered_count: 380
  },
  {
    id: 'fb-evt-2',
    title: 'Diễn đàn Xúc tiến Đầu tư Khu Kinh tế Cửa khẩu, Công nghiệp Chế biến & Hạ tầng Lào Cai 2026',
    slug: 'dien-dan-xuc-tien-dau-tu-kkt-cua-khau-cong-nghiep-lao-cai',
    short_desc: 'Đối thoại trực tiếp giữa Lãnh đạo tỉnh, các định chế tài chính, tập đoàn công nghiệp - logistics và nhà đầu tư chiến lược về cơ chế ưu đãi đặc thù tại Lào Cai.',
    event_date: new Date(Date.now() + 86400000 * 28 + 3600000 * 3).toISOString(),
    location: 'Trung tâm Hội nghị Tỉnh Lào Cai, Đại lộ Trần Hưng Đạo, TP. Lào Cai',
    organizer: 'Trung tâm Xúc tiến Đầu tư Lào Cai & ADT Quốc tế',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    is_paid: 0,
    price: 0,
    remaining_tickets: 200,
    registered_count: 145
  },
  {
    id: 'fb-evt-3',
    title: 'Festival Tinh hoa Tây Bắc — Sắc màu Văn hóa Sa Pa, Bắc Hà & Kết nối Sản phẩm OCOP Vùng cao',
    slug: 'festival-tinh-hoa-tay-bac-sac-mau-van-hoa-sa-pa-bac-ha-2026',
    short_desc: 'Không gian tôn vinh di sản văn hóa các dân tộc Tây Bắc, giải đua ngựa truyền thống Bắc Hà, lễ hội hoa đỗ quyên Fansipan và trưng bày dược liệu quý, nông sản OCOP 5 sao.',
    event_date: new Date(Date.now() + 86400000 * 38 + 3600000 * 2).toISOString(),
    location: 'Quảng trường Sân Quần, Thị xã Sa Pa & Dinh Hoàng A Tưởng, Bắc Hà',
    organizer: 'Sở Du lịch Lào Cai & Hiệp hội Du lịch Tỉnh Lào Cai',
    image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    is_paid: 0,
    price: 0,
    remaining_tickets: 320,
    registered_count: 240
  },
  {
    id: 'fb-evt-4',
    title: 'Hội thảo Chuyển đổi số & Ứng dụng Trợ lý AI Đa ngôn ngữ cho Doanh nghiệp Du lịch – Xuất nhập khẩu',
    slug: 'hoi-thao-chuyen-doi-so-va-ai-da-ngon-ngu-doanh-nghiep-lao-cai',
    short_desc: 'Giải pháp ứng dụng AI Agent đa ngôn ngữ (Việt - Trung - Anh - Nhật - Hàn) tự động hóa xúc tiến thương mại biên giới, chăm sóc du khách quốc tế và vận hành doanh nghiệp số.',
    event_date: new Date(Date.now() + 86400000 * 48 + 3600000 * 6).toISOString(),
    location: 'Khách sạn Sapaly / Mường Thanh Grand Lào Cai, TP. Lào Cai',
    organizer: 'Hiệp hội Doanh nghiệp Tỉnh Lào Cai & ADT Quốc tế',
    image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    is_paid: 1,
    price: 200000,
    remaining_tickets: 110,
    registered_count: 85
  }
];

export const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: 'Tổ hợp Du lịch & Dịch vụ Cáp treo Fansipan Sa Pa',
    company_name: 'Tổ hợp Du lịch & Dịch vụ Cáp treo Fansipan Sa Pa',
    tier: 'Platinum',
    industry: 'Du lịch Nghỉ dưỡng, Văn hóa & Giải trí Đỉnh cao',
    address: 'Khu Du lịch Quốc gia Sa Pa, Thị xã Sa Pa, Tỉnh Lào Cai',
    logo_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    bio: 'Đơn vị tiên phong kiến tạo quần thể văn hóa tâm linh và du lịch bốn mùa trên đỉnh Fansipan — Nóc nhà Đông Dương, góp phần đưa Sa Pa - Lào Cai vươn tầm điểm đến quốc tế.'
  },
  {
    id: 2,
    name: 'Công ty Cổ phần Logistics & Thương mại Quốc tế Kim Thành Lào Cai',
    company_name: 'Công ty Cổ phần Logistics & Thương mại Quốc tế Kim Thành Lào Cai',
    tier: 'Platinum',
    industry: 'Logistics Biên giới, Kho ngoại quan & Xuất nhập khẩu',
    address: 'Khu Thương mại - Công nghiệp Kim Thành, P. Duyên Hải, TP. Lào Cai',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    bio: 'Doanh nghiệp chủ lực vận hành chuỗi kho bãi thông minh, kiểm dịch nông sản lạnh và thông quan điện tử kết nối hành lang kinh tế Côn Minh – Lào Cai – Hà Nội – Hải Phòng.'
  },
  {
    id: 3,
    name: 'Công ty Cổ phần Dược liệu Hữu cơ & Nông sản Vùng cao Tây Bắc',
    company_name: 'Công ty Cổ phần Dược liệu Hữu cơ & Nông sản Vùng cao Tây Bắc',
    tier: 'Gold',
    industry: 'Dược liệu GACP-WHO, Chè Shan Tuyết & OCOP 5 Sao',
    address: 'Thị trấn Bắc Hà & Khu Công nghiệp Đông Phố Mới, Tỉnh Lào Cai',
    logo_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80',
    bio: 'Sở hữu vùng nguyên liệu Atiso Sa Pa, tam thất Bắc Hà, chè cổ thụ Shan Tuyết hữu cơ và nhà máy chiết xuất dược liệu công nghệ cao xuất khẩu sang Nhật Bản, Hàn Quốc và Châu Âu.'
  },
  {
    id: 4,
    name: 'Công ty Cổ phần ADT Quốc tế',
    company_name: 'Công ty Cổ phần ADT Quốc tế',
    tier: 'Platinum',
    industry: 'Công nghệ số, AI Đa ngôn ngữ & Nền tảng Xúc tiến Đầu tư',
    address: 'Hà Nội & Văn phòng Đại diện TP. Lào Cai',
    logo_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    bio: 'Đơn vị kiến trúc và phát triển nền tảng số Laocai.today, hệ thống Trợ lý AI đa ngôn ngữ và giải pháp chuyển đổi số toàn diện cho doanh nghiệp, địa phương.'
  }
];
