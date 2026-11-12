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
    body: `
      <h2>1. Điểm khởi đầu của niềm tin và tầm nhìn kết nối toàn cầu</h2>
      <p><strong>Doanhnhanhole.today</strong> được hình thành với định hướng xây dựng cộng đồng doanh nhân Họ Lê toàn cầu và những người bạn trên một nền tảng số có tổ chức, có Ban Thư ký điều phối và quy chế minh bạch. Mối liên kết dòng tộc Họ Lê là điểm khởi đầu của sự tin cậy; giá trị bền vững của cộng đồng được chứng minh bằng chất lượng kết nối giao thương, đầu tư và đào tạo thực chất.</p>
      <h3>Năm trụ cột hoạt động trọng tâm</h3>
      <ul>
        <li><strong>Kết nối Giao thương có điều phối:</strong> Sàn cơ hội mua bán, tìm nhà phân phối, đại lý và đối tác cung ứng được Ban Thư ký rà soát và ghép cặp theo năng lực.</li>
        <li><strong>Du lịch & Hành trình Về nguồn:</strong> Các chương trình tri ân cội nguồn Họ Lê kết hợp đoàn khảo sát nhà máy, khu công nghiệp của doanh nghiệp hội viên (Biz-Tour).</li>
        <li><strong>Xúc tiến Đầu tư & Dự án:</strong> Phiên giới thiệu dự án định kỳ hàng quý với quy trình tiếp cận phòng dữ liệu (Data Room) có kiểm soát và bảo mật.</li>
        <li><strong>Bài học Điều hành thực tế:</strong> Kho tri thức quản trị đúc kết từ các tình huống thật của chủ doanh nghiệp theo cấu trúc 4 phần rõ ràng.</li>
        <li><strong>Đào tạo & Cố vấn khởi nghiệp (Mentorship 1-kèm-3):</strong> Đồng hành 8 tuần cùng doanh nhân trẻ và triển khai 6 chuyên đề quản trị hiện đại.</li>
      </ul>
      <blockquote>"Mỗi kết nối trên Doanhnhanhole.today đều có đầu mối tiếp nhận, có thời hạn phản hồi trong 48 giờ làm việc và có khảo sát đánh giá hiệu quả sau kết nối."</blockquote>
    `,
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Điều hành Doanhnhanhole.today',
    company_name: 'Ban Sáng lập Doanh nhân Họ Lê Toàn cầu',
    company_tier: 'Diamond',
    contact_info: 'Ban Thư ký Điều phối • Hotline: 0986 354 152 • Email: banthuky@doanhnhanhole.today',
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
    body: `
      <h2>Quyền lợi và cam kết đồng hành cùng 100 Doanh nhân Tiên phong</h2>
      <p>Chương trình <strong>"100 Doanh Nhân Tiên Phong"</strong> là bước khởi đầu chiến lược của nền tảng <strong>Doanhnhanhole.today</strong> nhằm quy tụ các chủ doanh nghiệp tiêu biểu thuộc 4 nhóm ngành trọng điểm: Sản xuất & Xuất khẩu, Thương mại & Phân phối, Du lịch & Dịch vụ, và Công nghệ & Khởi nghiệp.</p>
      <h3>Quy trình 4 bước xử lý cơ hội giao thương</h3>
      <ol>
        <li><strong>Chuẩn hóa Hồ sơ Năng lực:</strong> Ban biên tập hỗ trợ biên tập hồ sơ doanh nghiệp, sản phẩm chủ lực, năng lực cung ứng và cấp huy hiệu <em>Hồ sơ Xác minh Cơ bản</em>.</li>
        <li><strong>Đăng tải Nhu cầu Hợp tác Rõ ràng:</strong> Nêu rõ quy cách hàng hóa, sản lượng, khu vực phân phối hoặc tiêu chuẩn đối tác cần tìm.</li>
        <li><strong>Ban Thư ký Rà soát & Ghép cặp (48h):</strong> Đối chiếu danh bạ năng lực hội viên để giới thiệu từ 02–03 đối tác phù hợp nhất.</li>
        <li><strong>Theo dõi Sau Kết nối:</strong> Ghi nhận phản hồi và hỗ trợ tháo gỡ vướng mắc để tiến tới ký kết hợp đồng thương mại.</li>
      </ol>
    `,
    image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Thư ký Điều phối Kết nối',
    company_name: 'Trung tâm Điều phối Giao thương Họ Lê',
    company_tier: 'Diamond',
    contact_info: 'Trung tâm Điều phối Giao thương • Hotline: 0986 354 152 • Email: banthuky@doanhnhanhole.today',
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
    body: `
      <h2>Cấu trúc 4 phần của một Bài học Điều hành thực chiến</h2>
      <p>Khác với các bài viết lý thuyết chung chung, mọi bài chia sẻ trong chuyên mục <strong>Bài học Điều hành</strong> trên Doanhnhanhole.today đều tuân thủ cấu trúc thực tiễn:</p>
      <ul>
        <li><strong>1. Bối cảnh doanh nghiệp:</strong> Doanh nghiệp sản xuất hàng tiêu dùng quy mô 180 nhân sự đối mặt với chi phí vận chuyển quốc tế tăng cao và vòng quay công nợ kéo dài 75 ngày.</li>
        <li><strong>2. Quyết định điều hành:</strong> Rà soát danh mục SKU, cắt giảm 35% mã hàng biên lợi nhuận thấp, chuyển sang mô hình phân phối đại lý vùng kết hợp đặt hàng định kỳ trên nền tảng số.</li>
        <li><strong>3. Kết quả định lượng sau 6 tháng:</strong> Giảm 28% chi phí lưu kho, rút ngắn chu kỳ thu hồi công nợ xuống 42 ngày và tăng trưởng doanh thu kênh B2B nội khối thêm 22%.</li>
        <li><strong>4. Nguyên tắc rút ra cho hội viên:</strong> Kiểm soát dòng tiền thực thu trước khi mở rộng quy mô tín dụng thương mại cho đại lý mới.</li>
      </ul>
    `,
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Hội đồng Cố vấn Quản trị',
    company_name: 'Khối Đào tạo & Chia sẻ Kinh nghiệm',
    company_tier: 'Platinum',
    contact_info: 'Ban Biên tập Bài học Điều hành • Email: banthuky@doanhnhanhole.today',
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
    body: `
      <h2>Gắn kết chiều sâu văn hóa dòng tộc với khảo sát năng lực sản xuất thực tế</h2>
      <p>Các chương trình <strong>Hành trình Về nguồn & Biz-Tour Khảo sát Doanh nghiệp</strong> được thiết kế chuyên biệt cho doanh nhân Họ Lê và những người bạn trong nước cũng như kiều bào ở nước ngoài.</p>
      <h3>Điểm nổi bật của chương trình</h3>
      <ul>
        <li>Dâng hương tri ân tại các di tích lịch sử gắn liền với truyền thống dòng họ Lê, tìm hiểu tư liệu lịch sử đã qua kiểm chứng.</li>
        <li>Thăm trực tiếp dây chuyền sản xuất, khu công nghiệp và trung tâm R&D của các doanh nghiệp hội viên tiêu biểu.</li>
        <li>Tổ chức phiên làm việc bàn tròn (Roundtable Matching) ngay tại doanh nghiệp để trao đổi cơ hội cung ứng nguyên vật liệu, gia công OEM/ODM và hợp tác phân phối.</li>
      </ul>
    `,
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Kết nối Du lịch & Văn hóa',
    company_name: 'Nhóm Chuyên đề Du lịch & Dịch vụ',
    company_tier: 'Gold',
    contact_info: 'Ban Kết nối Du lịch & Sự kiện • Hotline: 0986 354 152',
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
    body: `
      <h2>Đồng hành truyền nghề và nâng cao năng lực quản trị thế hệ kế thừa</h2>
      <p>Nhằm phát huy tinh thần tương trợ giữa các thế hệ doanh nhân Họ Lê và cộng đồng doanh nghiệp bạn hữu, <strong>Doanhnhanhole.today</strong> triển khai chương trình <strong>Mentorship 1-kèm-3 trong 8 tuần</strong> cùng 6 chuyên đề đào tạo thực chiến:</p>
      <ol>
        <li>Quản trị dòng tiền và tài chính dành cho chủ doanh nghiệp.</li>
        <li>Tổ chức hệ thống bán hàng B2B và phát triển kênh phân phối.</li>
        <li>Ứng dụng AI và chuyển đổi số thực chất trong vận hành doanh nghiệp.</li>
        <li>Quản trị nhân sự, xây dựng đội ngũ kế cận và văn hóa doanh nghiệp.</li>
        <li>Quản trị pháp lý hợp đồng và phòng ngừa rủi ro thương mại.</li>
        <li>Xây dựng thương hiệu doanh nghiệp gắn với uy tín người đứng đầu.</li>
      </ol>
    `,
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Đào tạo & Phát triển Năng lực',
    company_name: 'Học viện Doanh nhân Họ Lê',
    company_tier: 'Diamond',
    contact_info: 'Ban Đào tạo & Cố vấn • Email: banthuky@doanhnhanhole.today',
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
    body: `
      <h2>Minh bạch thông tin dự án và bảo mật tuyệt đối dữ liệu nhạy cảm</h2>
      <p>Chuyên mục <strong>Đầu tư & Dự án</strong> trên <strong>Doanhnhanhole.today</strong> hoạt động như một kênh giới thiệu cơ hội hợp tác đầu tư có chọn lọc giữa các hội viên:</p>
      <ul>
        <li><strong>Tóm tắt dự án công khai:</strong> Nêu rõ pháp nhân chủ dự án, lĩnh vực, quy mô vốn kêu gọi, hình thức hợp tác (cổ phần, liên doanh, hợp tác kinh doanh BCC) và tiến độ hiện tại.</li>
        <li><strong>Quy trình Data Room có kiểm soát:</strong> Báo cáo tài chính chi tiết và hồ sơ pháp lý chuyên sâu chỉ được mở quyền truy cập khi nhà đầu tư đã xác minh danh tính và được chủ dự án phê duyệt.</li>
        <li><strong>Nguyên tắc miễn trừ và thẩm định độc lập:</strong> Ban điều hành đóng vai trò kết nối và chuẩn hóa thông tin ban đầu; các bên tham gia thực hiện thẩm định độc lập (Due Diligence) trước khi ra quyết định đầu tư.</li>
      </ul>
    `,
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    author_name: 'Ban Kết nối Đầu tư',
    company_name: 'Hội đồng Xúc tiến Đầu tư Doanhnhanhole.today',
    company_tier: 'Diamond',
    contact_info: 'Ban Kết nối Đầu tư • Hotline: 0986 354 152 • Email: banthuky@doanhnhanhole.today',
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
    content: `
      <h3>Nội dung chương trình</h3>
      <p>Phiên Giao thương định kỳ hàng tháng của <strong>Doanhnhanhole.today</strong> tập trung vào hiệu quả kết nối thực chất cho hội viên:</p>
      <ul>
        <li><strong>08:30 - 09:15:</strong> Đón tiếp đại biểu, xác nhận hồ sơ năng lực và trao chứng nhận <em>100 Doanh nhân Tiên phong</em>.</li>
        <li><strong>09:15 - 10:45:</strong> Phiên Pitching ngắn (3 phút/doanh nghiệp) giới thiệu nhu cầu mua hàng, tìm đại lý phân phối và nguồn cung ứng.</li>
        <li><strong>10:45 - 12:00:</strong> Phiên ghép cặp 1-1 (Business Matching) tại các bàn chuyên đề: Sản xuất - Xuất khẩu, Thương mại - Phân phối, Du lịch - Dịch vụ, Công nghệ - Đầu tư.</li>
        <li><strong>13:30 - 16:30:</strong> Tọa đàm Bài học Điều hành thực tế và ký kết biên bản ghi nhớ hợp tác (MOU) giữa các doanh nghiệp hội viên.</li>
      </ul>
    `,
    start_date: '2026-12-05 08:30:00',
    event_date: '2026-12-05 08:30:00',
    end_date: '2026-12-05 17:00:00',
    location: 'Trung tâm Hội nghị Quốc tế, Hà Nội & Kết nối Trực tuyến Toàn cầu (Zoom)',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Điều hành & Ban Thư ký Doanhnhanhole.today',
    short_desc: 'Sự kiện kết nối trực tiếp và trực tuyến dành cho các doanh nhân Họ Lê và những người bạn: giới thiệu năng lực, ghép cặp 1-1 theo nhu cầu mua bán - phân phối đã qua Ban thư ký rà soát.',
    is_paid: 0,
    price: 0,
    max_tickets: 300,
    capacity: 300,
    registered_tickets: 215,
    registered_count: 215,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-2',
    title: 'Hành Trình Về Nguồn Họ Lê & Đoàn Khảo Sát Doanh Nghiệp Sản Xuất Quý IV (Biz-Tour)',
    slug: 'hanh-trinh-ve-nguon-ho-le-va-doan-khao-sat-doanh-nghiep-quy-4',
    description: 'Chuyến hành trình dâng hương khu di tích lịch sử Lam Kinh kết hợp thăm 03 tổ hợp nhà máy sản xuất - chế biến xuất khẩu của hội viên doanh nhân Họ Lê tại khu vực Bắc Trung Bộ.',
    content: `
      <h3>Lịch trình Khảo sát Thực địa & Tri ân Cội nguồn</h3>
      <p>Chương trình kết hợp hài hòa giữa văn hóa dòng tộc và xúc tiến thương mại công nghiệp:</p>
      <ul>
        <li><strong>Ngày 1 (Sáng):</strong> Lễ dâng hương tri ân tại Khu di tích lịch sử Lam Kinh (Thanh Hóa) và giao lưu cùng Hội Doanh nhân Họ Lê địa phương.</li>
        <li><strong>Ngày 1 (Chiều):</strong> Khảo sát thực tế dây chuyền chế biến nông sản xuất khẩu và nhà máy vật liệu công nghệ cao tại KCN Nghi Sơn.</li>
        <li><strong>Ngày 2:</strong> Tọa đàm liên kết chuỗi cung ứng Bắc – Trung – Nam và tổng kết các cơ hội hợp tác đầu tư sau chuyến đi.</li>
      </ul>
    `,
    start_date: '2026-12-19 07:00:00',
    event_date: '2026-12-19 07:00:00',
    end_date: '2026-12-20 19:30:00',
    location: 'Hà Nội – Khu Di tích Lam Kinh (Thanh Hóa) – KCN Nghi Sơn',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Kết nối Du lịch & Đầu mối Khu vực Miền Bắc',
    short_desc: 'Chuyến hành trình dâng hương khu di tích lịch sử Lam Kinh kết hợp thăm 03 tổ hợp nhà máy sản xuất - chế biến xuất khẩu của hội viên doanh nhân Họ Lê tại khu vực Bắc Trung Bộ.',
    is_paid: 1,
    price: 1500000,
    max_tickets: 80,
    capacity: 80,
    registered_tickets: 64,
    registered_count: 64,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-3',
    title: 'Đối Thoại Chuyên Gia & Chuyên Đề: Ứng Dụng AI Và Chuyển Đổi Số Thực Chiến Cho Chủ Doanh Nghiệp',
    slug: 'doi-thoai-chuyen-gia-ung-dung-ai-va-chuyen-doi-so-thuc-chien',
    description: 'Chương trình đào tạo thực hành nằm trong chuỗi 6 chuyên đề cốt lõi của Doanhnhanhole.today, phối hợp cùng chuyên gia công nghệ ADT Quốc tế hướng dẫn tối ưu vận hành và bán hàng bằng AI.',
    content: `
      <h3>Chuyên đề Đào tạo Thực chiến dành cho Lãnh đạo Doanh nghiệp</h3>
      <p>Buổi đào tạo tập trung vào các công cụ và quy trình có thể áp dụng ngay trong doanh nghiệp vừa và nhỏ:</p>
      <ul>
        <li>Xây dựng Trợ lý AI nội bộ phục vụ tra cứu quy trình, báo giá và chăm sóc khách hàng B2B.</li>
        <li>Tự động hóa quy trình tiếp nhận cơ hội giao thương và quản trị danh bạ đối tác.</li>
        <li>Phiên hỏi đáp 1-1 và tư vấn lộ trình chuyển đổi số phù hợp với ngân sách của từng doanh nghiệp hội viên.</li>
      </ul>
    `,
    start_date: '2027-01-10 08:30:00',
    event_date: '2027-01-10 08:30:00',
    end_date: '2027-01-10 16:30:00',
    location: 'Tổ hợp Hội thảo Doanh nhân, TP. Hồ Chí Minh & Livestream Hội viên',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Đào tạo & Đối tác Công nghệ ADT Quốc tế',
    short_desc: 'Chương trình đào tạo thực hành nằm trong chuỗi 6 chuyên đề cốt lõi của Doanhnhanhole.today, phối hợp cùng chuyên gia công nghệ ADT Quốc tế hướng dẫn tối ưu vận hành và bán hàng bằng AI.',
    is_paid: 0,
    price: 0,
    max_tickets: 200,
    capacity: 200,
    registered_tickets: 148,
    registered_count: 148,
    status: 'upcoming'
  },
  {
    id: 'hl-evt-4',
    title: 'Phiên Giới Thiệu Cơ Hội Đầu Tư & Đón Đoàn Doanh Nhân Việt Ở Nước Ngoài Về Tìm Hiểu Thị Trường',
    slug: 'phien-gioi-thieu-co-hoi-dau-tu-va-don-doanh-nhan-kieu-bao',
    description: 'Trình bày 08 hồ sơ dự án hợp tác mở rộng nhà máy, hệ thống phân phối và chuyển giao công nghệ với phần nhận xét độc lập của hội đồng chuyên gia tài chính - pháp lý.',
    content: `
      <h3>Kết nối Nguồn lực Đầu tư Trong nước & Quốc tế</h3>
      <p>Sự kiện quy tụ các nhà đầu tư cá nhân, quỹ đầu tư đồng hành và đoàn doanh nhân Họ Lê cùng bạn hữu từ Châu Âu, Bắc Mỹ, Nhật Bản, Hàn Quốc về Việt Nam tìm kiếm cơ hội hợp tác:</p>
      <ul>
        <li>Trình bày 08 dự án đã qua vòng rà soát hồ sơ cơ bản của Ban Kết nối Đầu tư.</li>
        <li>Phiên phản biện độc lập từ chuyên gia tài chính, kiểm toán và pháp lý dự án.</li>
        <li>Hướng dẫn quy trình đăng ký quyền truy cập Data Room bảo mật và làm việc trực tiếp với chủ dự án.</li>
      </ul>
    `,
    start_date: '2027-01-24 08:30:00',
    event_date: '2027-01-24 08:30:00',
    end_date: '2027-01-24 17:30:00',
    location: 'Khách sạn Melia Hà Nội & Phòng Họp Trực Tuyến Quốc Tế',
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=85',
    organizer_name: 'Ban Kết nối Đầu tư & Đầu mối Quốc tế Doanhnhanhole.today',
    short_desc: 'Trình bày 08 hồ sơ dự án hợp tác mở rộng nhà máy, hệ thống phân phối và chuyển giao công nghệ với phần nhận xét độc lập của hội đồng chuyên gia tài chính - pháp lý.',
    is_paid: 1,
    price: 500000,
    max_tickets: 150,
    capacity: 150,
    registered_tickets: 112,
    registered_count: 112,
    status: 'upcoming'
  }
];

export const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: 'Công ty TNHH Sâm Nghị Gia Ngọc Linh (Sâm Ngọc Linh Nghị Gia)',
    tax_code: '0109256592',
    industry: 'Dược liệu Quý & Chăm sóc Sức khỏe • Sâm Ngọc Linh',
    tier: 'Diamond',
    city: 'Hà Nội',
    address: 'Tòa nhà Nghị Gia, số 168 Hồng Tiến, P. Bồ Đề, Q. Long Biên, Hà Nội',
    phone: '0938.933.777',
    contact_name: 'TS. Lê Văn Nghị (Chủ tịch)',
    website: 'https://samnghigia.com',
    is_featured: 1,
    description: 'Thương hiệu "Sâm thật – Giá trị thật" sở hữu vườn rừng Sâm Ngọc Linh nguyên sinh tại độ cao 1.500m – 1.700m (Nam Trà My, Quảng Nam) và hệ sinh thái chế phẩm chăm sóc sức khỏe đạt chuẩn ISO 22000:2018.'
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
    name: 'Công ty Cổ phần Đầu tư Hạ tầng & Thương mại Đông Đô',
    tax_code: '0105678912',
    industry: 'Thương mại & Phân phối • Vật liệu & Logistics',
    tier: 'Gold',
    city: 'Thanh Hóa',
    address: 'Đại lộ Lê Lợi, TP. Thanh Hóa',
    is_featured: 1,
    description: 'Hệ thống kho vận và phân phối vật tư công nghiệp, vật liệu xây dựng xanh trên toàn trục Bắc - Nam; sẵn sàng hợp tác kho bãi cùng hội viên.'
  }
];
