import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAIBot from '../components/FloatingAIBot';
import SEOHead from '../components/SEOHead';
import brandConfig from '../brand.config';
import { fetchJsonWithTimeout, FALLBACK_POSTS, FALLBACK_EVENTS, FALLBACK_MEMBERS } from '../utils/api';
import './HomePhuTho.css';
import './HomeDoanhNhanHoLe.css';

// Helper format ngày giờ cho sự kiện (Ví dụ: 08:30 Thứ Bảy, 05/12/2026)
const formatEventDateTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    let dateStr = String(dateVal).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + '+07:00';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateVal);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const dayName = dayNames[d.getDay()];
    const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return `${timeStr} ${dayName}, ${dateFormatted}`;
  } catch (e) {
    return String(dateVal);
  }
};

// Helper format ngày đăng cho bài viết
const formatPostDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    let dateStr = String(dateVal).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + '+07:00';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateVal);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    return String(dateVal);
  }
};

// Helper format giá vé sự kiện
const formatEventPrice = (evt) => {
  if (!evt || !evt.is_paid || !evt.price || Number(evt.price) === 0) {
    return 'Miễn phí';
  }
  return `${Number(evt.price).toLocaleString('vi-VN')} đ`;
};

// Sub-component đếm ngược sự kiện trang chủ độc lập (Chống re-render toàn trang khi đồng hồ nhảy giây)
const HomeEventCountdown = React.memo(({ eventDate }) => {
  const calculateTimeLeft = (date) => {
    if (!date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    let dateStr = String(date).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + '+07:00';
    }
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(eventDate));

  useEffect(() => {
    if (!eventDate) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
      <div style={{ background: '#0B1D3A', color: '#F5C257', padding: '5px 9px', borderRadius: '8px', textAlign: 'center', minWidth: '48px', border: '1px solid rgba(212,154,42,0.35)' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13.5px' }}>{String(timeLeft.days).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#B8C7DC' }}>Ngày</div>
      </div>
      <div style={{ background: '#0B1D3A', color: '#F5C257', padding: '5px 9px', borderRadius: '8px', textAlign: 'center', minWidth: '48px', border: '1px solid rgba(212,154,42,0.35)' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13.5px' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#B8C7DC' }}>Giờ</div>
      </div>
      <div style={{ background: '#0B1D3A', color: '#F5C257', padding: '5px 9px', borderRadius: '8px', textAlign: 'center', minWidth: '48px', border: '1px solid rgba(212,154,42,0.35)' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13.5px' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#B8C7DC' }}>Phút</div>
      </div>
      <div style={{ background: '#0B1D3A', color: '#F5C257', padding: '5px 9px', borderRadius: '8px', textAlign: 'center', minWidth: '48px', border: '1px solid rgba(212,154,42,0.35)' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13.5px' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#B8C7DC' }}>Giây</div>
      </div>
    </div>
  );
});

// ==============================================================================
// 1. HỆ THỐNG CHỈ TIÊU MỤC TIÊU (MỤC 2 ĐỀ ÁN: 90 NGÀY THÍ ĐIỂM & 12 THÁNG VẬN HÀNH)
// ==============================================================================
const KPI_METRICS_DATA = {
  pilot90: [
    { icon: 'ti-shield-check', value: '100', label: 'Hồ sơ xác minh cơ bản', sub: 'Xác nhận liên hệ, vai trò & tổ chức' },
    { icon: 'ti-world', value: '03', label: 'Quốc gia / Vùng lãnh thổ', sub: 'Việt Nam làm nền tảng & mở rộng' },
    { icon: 'ti-briefcase', value: '30', label: 'Nhu cầu hợp tác được duyệt', sub: 'Có đầu mối & thời hạn xử lý rõ' },
    { icon: 'ti-users-group', value: '20', label: 'Cuộc gặp đúng nhu cầu', sub: 'Hai bên đồng ý & trao đổi thực tế' },
    { icon: 'ti-heart-handshake', value: '≥ 80%', label: 'Hài lòng sau hoạt động', sub: 'Khảo sát độc lập sau kết nối' }
  ],
  year12: [
    { icon: 'ti-shield-check', value: '500', label: 'Hồ sơ xác minh cơ bản', sub: '100 hội viên doanh nghiệp trả phí' },
    { icon: 'ti-world', value: '10', label: 'Quốc gia / Vùng lãnh thổ', sub: 'Đầu mối quốc tế ≥ 10 thành viên/địa bàn' },
    { icon: 'ti-briefcase', value: '200', label: 'Nhu cầu hợp tác được duyệt', sub: '12 phiên giao thương & gặp mặt' },
    { icon: 'ti-users-group', value: '120', label: 'Cuộc gặp đúng nhu cầu', sub: 'Theo dõi tiến triển sau 7 & 30 ngày' },
    { icon: 'ti-heart-handshake', value: '≥ 85%', label: 'Hài lòng sau hoạt động', sub: '06 lớp đào tạo • 04 tour • 04 phiên đầu tư' }
  ]
};

// ==============================================================================
// 2. NĂM TRỤ CỘT KẾT NỐI TOÀN CẦU (MỤC 1, 3, 4 ĐỀ ÁN)
// ==============================================================================
const FIVE_CORE_PILLARS = [
  {
    id: 'pillar-community',
    name: 'Mạng Lưới Doanh Nhân & Bạn Bè',
    icon: 'ti-world-latitude',
    tag: 'CỘNG ĐỒNG TIN CẬY • XÁC MINH ĐA TẦNG',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85',
    desc: 'Mối liên kết Họ Lê là điểm khởi đầu của niềm tin; giá trị cộng đồng được chứng minh bằng chất lượng kết nối. Phục vụ nhóm cốt lõi là doanh nhân, người điều hành, chuyên gia Họ Lê trong và ngoài nước cùng nhóm đồng hành là doanh nhân các dòng họ khác và bạn bè quốc tế.',
    keyPoints: [
      {
        icon: 'ti-id-badge-2',
        title: 'Danh Bạ Cấu Trúc & Huy Hiệu Xác Minh Rõ Phạm Vi',
        desc: 'Lọc theo ngành nghề, địa bàn, thị trường mục tiêu, ngôn ngữ giao tiếp và trạng thái xác minh. Huy hiệu ghi rõ ngày kiểm tra và phạm vi đã đối chiếu.'
      },
      {
        icon: 'ti-Category-2',
        title: 'Bốn Nhóm Chuyên Đề Theo Nhu Cầu Thực Tế',
        desc: 'Sinh hoạt chuyên sâu theo 4 khối: Sản xuất & Xuất khẩu • Thương mại & Phân phối • Du lịch & Dịch vụ • Công nghệ & Khởi nghiệp.'
      },
      {
        icon: 'ti-globe',
        title: 'Đầu Mối Khu Vực Trong Nước & Quốc Tế',
        desc: 'Hỗ trợ ngôn ngữ, múi giờ và kết nối địa phương khi có người phụ trách và tối thiểu 10 thành viên hoạt động tại địa bàn.'
      }
    ],
    categoryLink: '/posts?category=Cộng%20đồng%20%26%20Danh%20bạ'
  },
  {
    id: 'pillar-trade',
    name: 'Sàn Cơ Hội Giao Thương B2B',
    icon: 'ti-arrows-exchange',
    tag: 'ĐIỀU PHỐI KẾT NỐI • PHẢN HỒI TRONG 48 GIỜ',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=85',
    desc: 'Khắc phục triệt để tình trạng thông tin phân tán trên mạng xã hội hoặc mất đầu mối sau sự kiện. Mỗi nhu cầu đăng lên đều có Ban Thư ký kiểm duyệt, mời tối đa 03 đối tác phù hợp nhất và theo dõi bước tiếp theo sau cuộc gặp.',
    keyPoints: [
      {
        icon: 'ti-shopping-cart-bolt',
        title: '6 Nhóm Nhu Cầu Hợp Tác Trọng Tâm',
        desc: 'Mua hàng • Bán hàng • Tìm đại lý • Tìm nhà phân phối • Tìm nhà cung cấp • Tìm đối tác dịch vụ với tiêu chí chất lượng, sản lượng và thời hạn rõ ràng.'
      },
      {
        icon: 'ti-calendar-stats',
        title: 'Phiên Giao Thương Hàng Tháng & Khảo Sát Hàng Quý',
        desc: 'Mỗi tháng tổ chức 01 phiên giao thương theo ngành/thị trường; mỗi quý tổ chức 01 đoàn khảo sát doanh nghiệp hoặc phiên gặp đối tác.'
      },
      {
        icon: 'ti-checklist',
        title: 'Đo Lường Bằng Cuộc Gặp Thực Tế & Bước Tiếp Theo',
        desc: 'Chỉ ghi nhận kết nối thành công khi hai bên đồng ý gặp và có bước tiến triển (gửi báo giá, gửi mẫu, khảo sát, thẩm định).'
      }
    ],
    categoryLink: '/posts?category=Cơ%20hội%20Giao%20thương'
  },
  {
    id: 'pillar-tourism',
    name: 'Kết Nối Du Lịch & Về Nguồn',
    icon: 'ti-compass',
    tag: 'VỀ NGUỒN HỌ LÊ • BIZ-TOUR THĂM DOANH NGHIỆP',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    desc: 'Phát triển các chương trình du lịch kết hợp thăm doanh nghiệp, gặp gỡ hội viên và trải nghiệm văn hóa lịch sử dòng họ Lê được biên tập chuẩn mực, minh bạch về đơn vị tổ chức, chi phí và đầu mối hỗ trợ.',
    keyPoints: [
      {
        icon: 'ti-building-monument',
        title: 'Hành Trình Về Nguồn Họ Lê & Di Sản Lịch Sử',
        desc: 'Tri ân cội nguồn, kết nối tình thân dòng tộc gắn liền các di tích lịch sử được kiểm chứng nội dung cẩn trọng trước khi xuất bản.'
      },
      {
        icon: 'ti-building-factory-2',
        title: 'Du Lịch Thăm Doanh Nghiệp (Biz-Tour) & Gia Đình Doanh Nhân',
        desc: 'Tham quan trực tiếp nhà máy, mô hình vận hành của hội viên kết hợp nghỉ dưỡng gắn kết các thế hệ gia đình doanh nhân.'
      },
      {
        icon: 'ti-plane-arrival',
        title: 'Đón Doanh Nhân Việt Ở Nước Ngoài Về Tìm Hiểu Thị Trường',
        desc: 'Thiết kế lịch trình chuyên biệt đón kiều bào Họ Lê và bạn bè quốc tế về Việt Nam khảo sát thị trường, gặp gỡ đối tác địa phương.'
      }
    ],
    categoryLink: '/posts?category=Du%20lịch%20%26%20Về%20nguồn'
  },
  {
    id: 'pillar-investment',
    name: 'Xúc Tiến Đầu Tư & Dự Án',
    icon: 'ti-chart-pie',
    tag: 'DATA ROOM KIỂM SOÁT • PHIÊN GIỚI THIỆU HÀNG QUÝ',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    desc: 'Xây dựng danh mục cơ hội hợp tác đầu tư minh bạch gồm chủ thể, mục tiêu sử dụng vốn, quy mô và tiến độ. Tài liệu chi tiết chỉ mở cho nhà đầu tư được chủ hồ sơ chấp thuận.',
    keyPoints: [
      {
        icon: 'ti-building-Skyscraper',
        title: '4 Lĩnh Vực Hợp Tác Đầu Tư Trọng Điểm',
        desc: 'Mở nhà máy sản xuất • Phát triển hệ thống phân phối • Chuyển giao công nghệ • Góp vốn vào doanh nghiệp tiềm năng.'
      },
      {
        icon: 'ti-presentation-analytics',
        title: 'Phiên Giới Thiệu Cơ Hội Đầu Tư Hàng Quý',
        desc: 'Tổ chức định kỳ hàng quý có chuyên gia độc lập nhận xét và phiên hỏi đáp chuyên sâu giữa chủ dự án và nhà đầu tư.'
      },
      {
        icon: 'ti-lock-check',
        title: 'Nguyên Tắc Minh Bạch & Thẩm Định Trực Tiếp',
        desc: 'Ban vận hành không nhận tiền đầu tư trung gian và không cam kết lợi nhuận thay chủ dự án; các bên tự thẩm định và ký kết trực tiếp.'
      }
    ],
    categoryLink: '/posts?category=Đầu%20tư%20%26%20Dự%20án'
  },
  {
    id: 'pillar-training',
    name: 'Bài Học Điều Hành & Đào Tạo',
    icon: 'ti-school',
    tag: 'TÌNH HUỐNG THẬT • MENTORSHIP KHỞI NGHIỆP 8 TUẦN',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    desc: 'Chuyển hóa kinh nghiệm thương trường thành tri thức cộng đồng thông qua chuyên mục "Bài học điều hành", đối thoại chuyên gia hàng tháng, 6 chuyên đề đào tạo cốt lõi và chương trình cố vấn cho doanh nhân trẻ.',
    keyPoints: [
      {
        icon: 'ti-bulb',
        title: 'Chuyên Mục "Bài Học Điều Hành" Từ Tình Huống Thật',
        desc: 'Cấu trúc 4 phần rõ ràng: Bối cảnh — Quyết định — Kết quả — Điều có thể áp dụng, kết hợp đối thoại chuyên gia hàng tháng.'
      },
      {
        icon: 'ti-certificate',
        title: '6 Chuyên Đề Đào Tạo Thực Chiến Cho Chủ Doanh Nghiệp',
        desc: 'Quản trị DN • Bán hàng & thị trường • Tài chính chủ DN • Xuất nhập khẩu • Ứng dụng AI & chuyển đổi số • Lãnh đạo & kế thừa.'
      },
      {
        icon: 'ti-user-star',
        title: 'Cố Vấn 1 Hướng Dẫn Kèm 1–3 Doanh Nhân Trẻ Trong 8 Tuần',
        desc: 'Thống nhất mục tiêu, lịch trao đổi và cam kết bảo mật để hoàn thiện một kế hoạch cải thiện kinh doanh cụ thể sau 8 tuần.'
      }
    ],
    categoryLink: '/posts?category=Đào%20tạo%20%26%20Cố%20vấn'
  }
];

// ==============================================================================
// 3. QUY TRÌNH 7 BƯỚC KẾT NỐI CÓ ĐIỀU PHỐI (MỤC 3.4 ĐỀ ÁN)
// ==============================================================================
const CONNECTION_7_STEPS = [
  { step: '01', icon: 'ti-file-plus', title: 'Tiếp nhận nhu cầu', desc: 'Thành viên gửi nhu cầu chuẩn hóa: sản phẩm, sản lượng, thị trường, thời hạn.' },
  { step: '02', icon: 'ti-shield-check', title: 'Kiểm tra trong 48h', desc: 'Ban Thư ký rà soát tính đầy đủ và phản hồi ban đầu trong 2 ngày làm việc.' },
  { step: '03', icon: 'ti-users-plus', title: 'Đề xuất ≤ 3 đối tác', desc: 'Chọn lọc tối đa 3 doanh nghiệp phù hợp nhất theo ngành nghề & địa bàn.' },
  { step: '04', icon: 'ti-thumb-up', title: 'Xin đồng ý từng bên', desc: 'Xác nhận sự đồng thuận của cả hai phía trước khi chia sẻ liên hệ riêng.' },
  { step: '05', icon: 'ti-calendar-event', title: 'Xếp lịch gặp 1-1', desc: 'Điều phối viên hỗ trợ xếp lịch gặp trực tiếp hoặc trực tuyến đúng trọng tâm.' },
  { step: '06', icon: 'ti-trending-up', title: 'Ghi nhận tiến triển', desc: 'Cập nhật bước tiếp theo: gửi báo giá, gửi mẫu, khảo sát hoặc thẩm định.' },
  { step: '07', icon: 'ti-chart-dots-3', title: 'Hậu kiểm 7 & 30 ngày', desc: 'Hỏi lại kết quả sau 7 và 30 ngày để tháo gỡ điểm nghẽn và ghi nhận hợp tác.' }
];

// ==============================================================================
// 4. SÀN CƠ HỘI HỢP TÁC B2B MẪU (THEO CẤU TRÚC MỤC 3.2 & 12.4 ĐỀ ÁN)
// ==============================================================================
const B2B_OPPORTUNITIES = [
  {
    id: 'opp-1',
    title: 'Tìm Nhà Phân Phối Độc Quyền Nông Sản Thực Phẩm Chế Biến Sâu Tại Khu Vực Phía Bắc & Châu Âu',
    type: 'Tìm đại lý / Phân phối',
    proposer: 'Tập đoàn Sản xuất & XNK Nông sản Lê Gia (Hồ sơ Đã xác minh)',
    sector: 'Nông sản chế biến & Thực phẩm đóng gói tiêu chuẩn ISO/HACCP',
    market: 'Miền Bắc Việt Nam, Đức, Cộng hòa Séc & Ba Lan',
    scale: 'Sản lượng 20 – 50 tấn/tháng • Chiết khấu đại lý cấp 1',
    criteria: 'Đơn vị có hệ thống kho lạnh/kho khô và mạng lưới phân phối siêu thị hoặc chuỗi HORECA.',
    deadline: '30/12/2026',
    status: 'Đang ghép nối (Đã có 2/3 đối tác)',
    nextStep: 'Gửi bộ mẫu thử & bảng giá FOB/CIF'
  },
  {
    id: 'opp-2',
    title: 'Nhu Cầu Mua Bao Bì Carton Khổ Lớn & Pallet Gỗ Chuẩn Hun Trùng Phục Vụ Xuất Khẩu Điện Tử',
    type: 'Mua hàng / Nguồn cung',
    proposer: 'Công ty CP Công nghiệp Phụ trợ & Cơ khí Chính xác Lê Hoàng',
    sector: 'Bao bì công nghiệp, vật tư đóng gói & Logistics xuất khẩu',
    market: 'KCN Bắc Ninh, Hải Phòng & TP. Hồ Chí Minh',
    scale: 'Hợp đồng khung 12 tháng • 15.000 bộ/tháng',
    deadline: '15/01/2027',
    criteria: 'Nhà máy có chứng nhận FSC, đáp ứng giao hàng JIT và công nợ 30 ngày.',
    status: 'Ban Thư ký đang tiếp nhận báo giá',
    nextStep: 'Thẩm định năng lực nhà máy cung ứng'
  },
  {
    id: 'opp-3',
    title: 'Hợp Tác Góp Vốn & Chuyển Giao Công Nghệ Nhà Máy Chế Biến Dược Liệu Sinh Học Công Nghệ Cao',
    type: 'Góp vốn / Mở nhà máy',
    proposer: 'Công ty CP Dược thảo & Công nghệ Sinh học Lam Sơn',
    sector: 'Sản xuất dược liệu, thực phẩm bảo vệ sức khỏe chuẩn GMP',
    market: 'Thanh Hóa & Phân phối toàn quốc',
    scale: 'Tổng mức đầu tư giai đoạn 2: 45 tỷ VNĐ (Kêu gọi 30% vốn cổ phần)',
    deadline: '28/02/2027',
    criteria: 'Nhà đầu tư chiến lược hoặc doanh nghiệp có kênh phân phối dược phẩm/phòng khám.',
    status: 'Mở Data Room có kiểm soát',
    nextStep: 'Đăng ký quyền tiếp cận hồ sơ tài chính'
  },
  {
    id: 'opp-4',
    title: 'Tìm Đối Tác Chuyển Đổi Số, Tích Hợp AI Doanh Nghiệp & Quản Trị ERP Cho Chuỗi 15 Chi Nhánh',
    type: 'Hợp tác Dịch vụ & Xuất khẩu',
    proposer: 'Hệ thống Thương mại & Vật liệu Xây dựng Đông Đô',
    sector: 'Công nghệ thông tin, Phần mềm quản trị & Trợ lý AI nội bộ',
    market: 'Hà Nội, Đà Nẵng & TP. Hồ Chí Minh',
    scale: 'Triển khai trong 90 ngày cho 250 nhân sự kinh doanh',
    deadline: '20/12/2026',
    criteria: 'Đơn vị công nghệ có sản phẩm thực tế đã vận hành, hỗ trợ đào tạo nhân sự tại chỗ.',
    status: 'Đang xếp lịch gặp 1-1',
    nextStep: 'Demo giải pháp trực tuyến cùng Ban Giám đốc'
  },
  {
    id: 'opp-5',
    title: 'Kết Nối Đối Tác Lữ Hành & Lưu Trú Tổ Chức Đoàn Doanh Nhân Kiều Bào Về Nguồn Xuân 2027',
    type: 'Hợp tác Dịch vụ & Xuất khẩu',
    proposer: 'Ban Điều phối Du lịch & Đầu mối Doanh nhân Họ Lê tại Châu Âu',
    sector: 'Du lịch MICE, Lưu trú 4-5 sao, Vận chuyển & Sự kiện văn hóa',
    market: 'Hà Nội – Ninh Bình – Thanh Hóa – TP. Hồ Chí Minh',
    scale: 'Đoàn 60 – 80 doanh nhân Việt ở nước ngoài (8 ngày 7 đêm)',
    deadline: '10/01/2027',
    criteria: 'Đơn vị lữ hành hội viên cam kết chất lượng phục vụ, công bố rõ dịch vụ bao gồm & điều kiện hủy.',
    status: 'Đang tuyển chọn nhà cung cấp',
    nextStep: 'Gửi kịch bản chương trình & dự toán tour'
  },
  {
    id: 'opp-6',
    title: 'Tìm Đại Lý Phân Phối Thiết Bị Điện Năng Lượng Mặt Trời Áp Mái Cho Nhà Xưởng Khu Công Nghiệp',
    type: 'Tìm đại lý / Phân phối',
    proposer: 'Công ty CP Năng lượng Xanh & Kỹ thuật Lê Nguyễn',
    sector: 'Năng lượng tái tạo, giải pháp tiết kiệm điện nhà máy sản xuất',
    market: 'Miền Nam, Tây Nguyên & Nam Trung Bộ',
    scale: 'Quy mô từ 500 kWp – 5 MWp / dự án nhà xưởng',
    deadline: '31/01/2027',
    criteria: 'Doanh nghiệp cơ điện (M&E), nhà thầu xây dựng công nghiệp hoặc tư vấn môi trường.',
    status: 'Sẵn sàng kết nối ngay',
    nextStep: 'Khảo sát kỹ thuật & chia sẻ cơ chế hợp tác'
  }
];

// ==============================================================================
// 5. BỐN CHƯƠNG TRÌNH DU LỊCH VỀ NGUỒN & KHẢO SÁT DOANH NGHIỆP (MỤC 4.1 & 3.3)
// ==============================================================================
const CURATED_PROGRAMS = [
  {
    id: 'prog-1',
    label: 'Hành Trình Về Nguồn Họ Lê (2N1Đ)',
    badge: 'TRI ÂN CỘI NGUỒN • KẾT NỐI DOANH NHÂN DI SẢN',
    title: 'Hành Trình Về Nguồn Lam Kinh – Giao Lưu Doanh Nhân Họ Lê & Thăm Tổ Hợp Sản Xuất Hội Viên',
    summary: 'Chương trình kết hợp dâng hương tri ân cội nguồn tại Khu di tích lịch sử Lam Kinh (Thanh Hóa), tọa đàm văn hóa dòng tộc và thăm thực tế 02 nhà máy sản xuất tiêu biểu của doanh nhân Họ Lê.',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm (Định kỳ hàng quý)',
    suitability: 'Chủ doanh nghiệp, Hội viên Tiên phong, Gia đình doanh nhân',
    steps: [
      { time: 'Ngày 1 - Sáng', title: 'Lễ Dâng Hương Khu Di Tích Lịch Sử Lam Kinh', desc: 'Tìm hiểu lịch sử vương triều Hậu Lê qua tài liệu đã được biên tập và kiểm chứng; gắn kết tình thân giữa các thế hệ doanh nhân.' },
      { time: 'Ngày 1 - Chiều', title: 'Khảo Sát Thực Địa Nhà Máy Hội Viên Tại KCN Bắc Trung Bộ', desc: 'Tham quan dây chuyền chế biến nông sản xuất khẩu và trao đổi trực tiếp về quản trị sản xuất, tối ưu chuỗi cung ứng.' },
      { time: 'Ngày 1 - Tối', title: 'Đêm Gala "Tâm Tài Họ Lê — Cùng Mở Cơ Hội"', desc: 'Giới thiệu thành viên mới, vinh danh các cặp kết nối giao thương thành công và chia sẻ câu chuyện lập nghiệp.' },
      { time: 'Ngày 2', title: 'Phiên Ghép Cặp Giao Thương 1-1 & Khảo Sát Sau Hoạt Động', desc: 'Ban Thư ký tổ chức bàn tròn kết nối theo 4 nhóm ngành và ghi nhận các bước hợp tác tiếp theo trên nền tảng số.' }
    ]
  },
  {
    id: 'prog-2',
    label: 'Đoàn Khảo Sát Doanh Nghiệp Quý (Biz-Tour)',
    badge: 'KHẢO SÁT NHÀ MÁY • KẾT NỐI CHUỖI CUNG ỨNG B2B',
    title: 'Đoàn Khảo Sát Thực Địa Các Doanh Nghiệp Sản Xuất, Kho Vận & Phân Phối Liên Vùng',
    summary: 'Hoạt động trọng tâm hàng quý giúp hội viên tận mắt chứng kiến năng lực sản xuất, kiểm chứng chất lượng sản phẩm và làm việc trực tiếp với Ban Giám đốc các doanh nghiệp đối tác.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85',
    duration: '1 – 2 Ngày (Theo cụm ngành)',
    suitability: 'Doanh nghiệp Sản xuất, Xuất nhập khẩu, Phân phối, Logistics',
    steps: [
      { time: 'Phiên 1', title: 'Thăm Tổ Hợp Nhà Máy Sản Xuất & Trung Tâm R&D', desc: 'Trực tiếp khảo sát quy trình quản lý chất lượng, công suất thực tế và khả năng đáp ứng đơn hàng OEM/ODM.' },
      { time: 'Phiên 2', title: 'Làm Việc Cùng Hệ Thống Kho Vận & Phân Phối', desc: 'Đánh giá phương án hợp tác chia sẻ kho bãi, tối ưu chi phí vận chuyển và mở rộng đại lý vùng.' },
      { time: 'Phiên 3', title: 'Phiên Họp Bàn Tròn & Xác Nhận Bước Tiếp Theo', desc: 'Hai bên thống nhất gửi báo giá, gửi mẫu thử hoặc lập tổ công tác thẩm định hợp tác dưới sự theo dõi của Ban Thư ký.' }
    ]
  },
  {
    id: 'prog-3',
    label: 'Đón Đoàn Doanh Nhân Quốc Tế & Kiều Bào',
    badge: 'KẾT NỐI TOÀN CẦU • XÚC TIẾN THƯƠNG MẠI QUỐC TẾ',
    title: 'Chương Trình Đón Doanh Nhân Việt Ở Nước Ngoài & Bạn Bè Quốc Tế Về Tìm Hiểu Thị Trường Việt Nam',
    summary: 'Cầu nối tin cậy giúp doanh nhân Họ Lê ở nước ngoài và đối tác quốc tế tiếp cận đúng doanh nghiệp nội địa đã được xác minh, tiết kiệm thời gian khảo sát và có đầu mối theo dõi xuyên suốt.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=85',
    duration: '3 – 5 Ngày (Theo lịch đoàn quốc tế)',
    suitability: 'Doanh nhân kiều bào, Nhà nhập khẩu quốc tế, Quỹ đầu tư',
    steps: [
      { time: 'Bước 1', title: 'Tổng Hợp Nhu Cầu Trước Chuyến Đi 15 Ngày', desc: 'Đầu mối quốc tế và Ban Thư ký lọc trước danh sách tối đa 03 đối tác Việt Nam phù hợp cho từng thành viên trong đoàn.' },
      { time: 'Bước 2', title: 'Phiên Giới Thiệu Thị Trường & Cơ Hội Đầu Tư', desc: 'Cung cấp bức tranh pháp lý, thuế, xuất nhập khẩu và các dự án kêu gọi hợp tác có hồ sơ minh bạch.' },
      { time: 'Bước 3', title: 'Thăm Doanh Nghiệp Thực Tế & Trải Nghiệm Văn Hóa Quê Hương', desc: 'Kết hợp làm việc B2B tại nhà máy với hành trình văn hóa ấm áp tình quê hương, công bố minh bạch chi phí và đơn vị tổ chức.' }
    ]
  },
  {
    id: 'prog-4',
    label: 'Retreat Gia Đình Doanh Nhân & Thế Hệ Kế Thừa',
    badge: 'GẮN KẾT GIA ĐÌNH • ĐÀO TẠO THẾ HỆ KẾ CẬN (NEXTGEN)',
    title: 'Kỳ Nghỉ Dưỡng Gia Đình Doanh Nhân Kết Hợp Đối Thoại Chuyển Giao Thế Hệ Kế Thừa',
    summary: 'Không gian nghỉ dưỡng tinh tế dành cho gia đình các chủ doanh nghiệp, kết hợp tọa đàm chia sẻ kinh nghiệm giữ gìn giá trị gia đình và bồi dưỡng tư duy quản trị cho thế hệ doanh nhân trẻ kế cận.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm (Cuối tuần)',
    suitability: 'Gia đình chủ doanh nghiệp, Thế hệ F2 kế thừa, Doanh nhân trẻ',
    steps: [
      { time: 'Hoạt động 1', title: 'Tọa Đàm "Kỹ Năng Lãnh Đạo & Chuyển Giao Kế Thừa"', desc: 'Chia sẻ thực tế từ các doanh nhân đi trước về cách đồng hành cùng con cái và xây dựng đội ngũ kế cận bền vững.' },
      { time: 'Hoạt động 2', title: 'Kết Nối Mentor – Mentee Cho Doanh Nhân Trẻ Khởi Nghiệp', desc: 'Ghép cặp người hướng dẫn giàu kinh nghiệm với các bạn trẻ khởi nghiệp trong chương trình cố vấn 8 tuần.' },
      { time: 'Hoạt động 3', title: 'Giao Lưu Văn Hóa – Thể Thao & Gắn Kết Gia Đình', desc: 'Xây dựng mối thâm tình bền chặt giữa các gia đình doanh nhân Họ Lê và những người bạn trên toàn quốc.' }
    ]
  }
];

// ==============================================================================
// 6. SÁU CHUYÊN ĐỀ ĐÀO TẠO CỐT LÕI (MỤC 4.4 ĐỀ ÁN)
// ==============================================================================
const SIX_TRAINING_MODULES = [
  {
    code: 'CHUYÊN ĐỀ 01',
    icon: 'ti-building-arch',
    title: 'Quản Trị Doanh Nghiệp Hiện Đại',
    desc: 'Chuẩn hóa cơ cấu tổ chức, phân quyền điều hành, hệ thống quy trình nội bộ và quản trị mục tiêu cho doanh nghiệp vừa và nhỏ.',
    outcome: 'Đầu ra: Sơ đồ phân quyền & bộ chỉ số vận hành cốt lõi'
  },
  {
    code: 'CHUYÊN ĐỀ 02',
    icon: 'ti-chart-arrows-vertical',
    title: 'Bán Hàng & Phát Triển Thị Trường',
    desc: 'Xây dựng chiến lược kênh phân phối B2B/B2C, quản trị đội ngũ kinh doanh, chính sách đại lý và mở rộng thị trường liên vùng.',
    outcome: 'Đầu ra: Kế hoạch mở rộng kênh bán hàng & kịch bản B2B'
  },
  {
    code: 'CHUYÊN ĐỀ 03',
    icon: 'ti-coin',
    title: 'Tài Chính Dành Cho Chủ Doanh Nghiệp',
    desc: 'Đọc hiểu báo cáo quản trị, kiểm soát dòng tiền, tối ưu cấu trúc chi phí, quản trị công nợ và chuẩn bị hồ sơ tài chính minh bạch.',
    outcome: 'Đầu ra: Bảng dự báo dòng tiền 12 tháng & kiểm soát rủi ro'
  },
  {
    code: 'CHUYÊN ĐỀ 04',
    icon: 'ti-ship',
    title: 'Xuất Nhập Khẩu & Thương Mại Quốc Tế',
    desc: 'Tiêu chuẩn chất lượng hàng xuất khẩu, thủ tục hải quan, Incoterms, thanh toán quốc tế và cách làm việc với nhà mua hàng nước ngoài.',
    outcome: 'Đầu ra: Hồ sơ năng lực xuất khẩu song ngữ Việt – Anh'
  },
  {
    code: 'CHUYÊN ĐỀ 05',
    icon: 'ti-cpu',
    title: 'Ứng Dụng AI & Chuyển Đổi Số Thực Chiến',
    desc: 'Sử dụng công cụ AI có kiểm soát trong chăm sóc khách hàng, biên tập nội dung, tự động hóa báo cáo và số hóa dữ liệu doanh nghiệp.',
    outcome: 'Đầu ra: Quy trình ứng dụng AI tiết kiệm 30% thời gian vận hành'
  },
  {
    code: 'CHUYÊN ĐỀ 06',
    icon: 'ti-award',
    title: 'Kỹ Năng Lãnh Đạo & Chuyển Giao Kế Thừa',
    desc: 'Nghệ thuật dẫn dắt đội ngũ, văn hóa doanh nghiệp gắn với chữ Tín và lộ trình bồi dưỡng, chuyển giao cho thế hệ kế cận.',
    outcome: 'Đầu ra: Khung năng lực lãnh đạo & kế hoạch kế thừa'
  }
];

// ==============================================================================
// 7. LỘ TRÌNH TRIỂN KHAI 90 NGÀY & 12 THÁNG (MỤC 8 ĐỀ ÁN)
// ==============================================================================
const ROADMAP_PHASES = [
  {
    time: 'Ngày 01 – 35',
    title: 'Chốt Quy Chế, Thiết Kế & Nhóm Tiên Phong',
    desc: 'Xác nhận chủ thể vận hành, bộ quy chế hội viên, chọn 10–15 nhân sự nòng cốt, tập hợp 30 nhu cầu đầu tiên và hoàn thiện giao diện Việt – Anh.',
    output: 'Mốc kiểm soát Ngày 15 & Ngày 35'
  },
  {
    time: 'Ngày 36 – 75',
    title: 'Phát Triển Hệ Thống, AI & Phiên Kết Nối Đầu Tiên',
    desc: 'Cấu hình nền tảng số, Trợ lý AI có kiểm soát, chuẩn hóa tối thiểu 50 hồ sơ có sự đồng ý và tổ chức phiên kết nối giao thương thử nghiệm.',
    output: 'Mốc kiểm soát Ngày 60 & Ngày 75'
  },
  {
    time: 'Ngày 76 – 90',
    title: 'Nghiệm Thu, Đào Tạo & Ra Mắt Thí Điểm',
    desc: 'Đạt 100 hồ sơ xác minh cơ bản, 3 quốc gia kết nối, 30 nhu cầu hợp tác được duyệt và 20 cuộc gặp đúng nhu cầu đã diễn ra.',
    output: 'Nghiệm thu chỉ tiêu 90 ngày thí điểm'
  },
  {
    time: 'Tháng 04 – 12',
    title: 'Mở Rộng Nhóm Ngành & Mạng Lưới Quốc Tế',
    desc: 'Phát triển lũy kế 250 → 500 hồ sơ xác minh, 10 quốc gia/vùng lãnh thổ, 200 nhu cầu hợp tác, 120 cuộc gặp B2B và 100 hội viên trả phí.',
    output: 'Báo cáo hiệu quả quý & tổng kết năm'
  }
];

// ==============================================================================
// 8. CÂU HỎI THƯỜNG GẶP VỀ QUY CHẾ, XÁC MINH & BẢO MẬT (MỤC 1.4, 2.1, 6.2)
// ==============================================================================
const FAQ_ITEMS = [
  {
    q: 'Đối tượng nào được tham gia nền tảng Doanhnhanhole.today? Doanh nhân không mang họ Lê có tham gia được không?',
    a: 'Theo Mục 1.3 Đề án, nền tảng phục vụ 02 nhóm: (1) Nhóm cốt lõi gồm chủ doanh nghiệp, người điều hành, hộ kinh doanh và chuyên gia Họ Lê tại Việt Nam và nước ngoài; (2) Nhóm đồng hành gồm doanh nhân thuộc các dòng họ khác, những người bạn quốc tế, đơn vị du lịch, nhà cung cấp dịch vụ, trường đào tạo và tổ chức hỗ trợ kinh doanh phù hợp với định hướng văn minh, minh bạch của cộng đồng.'
  },
  {
    q: 'Huy hiệu "Hồ sơ Xác minh Cơ bản" trên Doanhnhanhole.today có ý nghĩa gì và được kiểm tra như thế nào?',
    a: 'Hồ sơ xác minh cơ bản cần có xác nhận thông tin liên hệ, vai trò người đại diện và đối chiếu thông tin tổ chức/mã số doanh nghiệp qua nguồn phù hợp. Huy hiệu thể hiện rõ các bước đã hoàn thành, ngày kiểm tra và phạm vi kiểm tra; họ tên hay quan hệ dòng họ không thay thế việc kiểm tra năng lực kinh doanh và trách nhiệm của thành viên.'
  },
  {
    q: 'Quy trình xử lý một yêu cầu kết nối giao thương diễn ra như thế nào để tránh bị bỏ rơi sau sự kiện?',
    a: 'Mỗi yêu cầu kết nối đi qua quy trình 7 bước có người phụ trách: Tiếp nhận nhu cầu → Kiểm tra thông tin (phản hồi ban đầu trong 2 ngày làm việc) → Đề xuất tối đa 3 đối tác phù hợp → Xin đồng ý của từng bên → Xếp lịch gặp → Ghi nhận bước tiếp theo (gửi báo giá, gửi mẫu, khảo sát) → Hỏi lại kết quả sau 7 và 30 ngày.'
  },
  {
    q: 'Thông tin liên hệ cá nhân và tài liệu dự án đầu tư của hội viên được bảo mật ra sao?',
    a: 'Mỗi hội viên có quyền lựa chọn hiển thị công khai hoặc chỉ chia sẻ thông tin liên hệ sau khi đồng ý. Tài liệu chi tiết của dự án đầu tư chỉ cung cấp cho người được chủ hồ sơ chấp thuận và không đưa vào kho hỏi đáp AI công khai. Nền tảng nghiêm cấm tải hàng loạt danh bạ để quảng cáo hoặc bán danh sách thông tin cá nhân cho nhà tài trợ.'
  },
  {
    q: 'Chương trình "100 Doanh Nhân Tiên Phong" mang lại những quyền lợi đặc biệt gì?',
    a: '100 doanh nhân đầu tiên tham gia theo nhóm ngành và địa bàn được Ban Thư ký hỗ trợ chuẩn hóa hồ sơ năng lực Việt – Anh, ưu tiên tiếp nhận và điều phối ít nhất 01 nhu cầu hợp tác cụ thể, tham gia các phiên giao thương thử nghiệm và đồng hành góp ý định hình quy chế cộng đồng.'
  }
];

export const Home = () => {
  const { user } = useAuth();
  const { currentLang } = useTranslation();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // KPI Toggle State ('pilot90' | 'year12')
  const [kpiMode, setKpiMode] = useState('year12');

  // Active Tab State cho 5 Trụ Cột Kết Nối
  const [activePillarId, setActivePillarId] = useState('pillar-community');
  const activePillar = useMemo(() => {
    return FIVE_CORE_PILLARS.find(p => p.id === activePillarId) || FIVE_CORE_PILLARS[0];
  }, [activePillarId]);

  // Filter State cho Sàn Cơ Hội Hợp Tác B2B
  const [b2bFilter, setB2bFilter] = useState('ALL');
  const filteredOpportunities = useMemo(() => {
    if (b2bFilter === 'ALL') return B2B_OPPORTUNITIES;
    return B2B_OPPORTUNITIES.filter(item => item.type === b2bFilter);
  }, [b2bFilter]);

  // Active Tab State cho 4 Chương trình Du lịch & Khảo sát
  const [activeProgId, setActiveProgId] = useState('prog-1');
  const activeProg = useMemo(() => {
    return CURATED_PROGRAMS.find(item => item.id === activeProgId) || CURATED_PROGRAMS[0];
  }, [activeProgId]);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Form Tư vấn / Tiếp nhận nhu cầu kết nối (POST /api/leads)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Hà Nội',
    serviceNeed: 'Đăng ký Chương trình 100 Doanh nhân Tiên phong & Xác minh Hồ sơ',
    companyName: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Dynamic Live Posts, Events, Members
  const [latestPosts, setLatestPosts] = useState(FALLBACK_POSTS);
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [featuredMembers, setFeaturedMembers] = useState(FALLBACK_MEMBERS);

  // Bài viết nổi bật nhất & danh sách bài viết tiếp theo
  const featuredPost = useMemo(() => {
    if (!latestPosts || latestPosts.length === 0) return null;
    return latestPosts.find((p) => p.is_featured) || latestPosts[0];
  }, [latestPosts]);

  const remainingPosts = useMemo(() => {
    if (!latestPosts || latestPosts.length <= 1) return [];
    const featuredId = featuredPost?.id;
    return latestPosts.filter((p) => p.id !== featuredId).slice(0, 4);
  }, [latestPosts, featuredPost]);

  // Sự kiện nổi bật nhất & danh sách sự kiện tiếp theo
  const featuredEvent = useMemo(() => {
    if (!eventsList || eventsList.length === 0) return null;
    return eventsList[0];
  }, [eventsList]);

  const remainingEvents = useMemo(() => {
    if (!eventsList || eventsList.length <= 1) return [];
    return eventsList.slice(1, 4);
  }, [eventsList]);

  // Quick Event Registration Modal State
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    quantity: 1
  });
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState(null);

  // Lightweight IntersectionObserver cho hiệu ứng Scroll Reveal mượt mà (không gây lag)
  useEffect(() => {
    const revealEls = document.querySelectorAll('.hl-reveal, .hl-reveal-left, .hl-reveal-right, .hl-reveal-scale');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('hl-in-view'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hl-in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Tải dữ liệu song song từ API (Promise.allSettled) có Timeout 8s
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [postsRes, eventsRes, membersRes] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=6', {}, 8000),
          fetchJsonWithTimeout('/api/events?limit=4', {}, 8000),
          fetchJsonWithTimeout('/api/members?limit=4', {}, 8000)
        ]);

        if (isMounted) {
          if (postsRes.status === 'fulfilled' && postsRes.value?.success && Array.isArray(postsRes.value.data) && postsRes.value.data.length > 0) {
            setLatestPosts(postsRes.value.data);
          }
          if (eventsRes.status === 'fulfilled' && eventsRes.value?.success && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0) {
            setEventsList(eventsRes.value.data);
          }
          if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value.data) && membersRes.value.data.length > 0) {
            setFeaturedMembers(membersRes.value.data);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu động trang chủ:', err);
      }
    };
    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // Xử lý Tìm kiếm toàn hệ thống
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Cuộn mượt xuống Form Tư vấn & Điều phối Kết nối
  const scrollToConsult = (serviceName = '') => {
    if (serviceName) {
      setFormData(prev => ({ ...prev, serviceNeed: serviceName }));
    }
    const el = document.getElementById('tu-van');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gửi Form Tư vấn chuẩn endpoint /api/leads
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.companyName) {
      alert(currentLang === 'en' ? 'Please fill in Name, Phone, and Company (*)' : 'Vui lòng điền Họ tên, Số điện thoại và Tên doanh nghiệp/đơn vị (*)');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          companyName: formData.companyName,
          memberType: formData.serviceNeed,
          notes: `Nhu cầu điều phối: ${formData.serviceNeed}. Chi tiết: ${formData.notes || 'Không có'}`
        })
      });
      if (res.ok) {
        setFormSubmitted(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Có lỗi xảy ra khi gửi thông tin');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Không thể kết nối đến máy chủ, vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  // Xử lý mở Modal đăng ký vé sự kiện
  const handleOpenRegisterModal = (evt) => {
    if (!evt) return;
    setRegisterModalEvent(evt);
    setRegSuccessData(null);
    setRegForm({
      fullName: user?.contact_name || user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      company: user?.name || '',
      quantity: 1
    });
  };

  const handleCloseModal = () => {
    setRegisterModalEvent(null);
    setRegSuccessData(null);
  };

  const handleRegisterEventSubmit = async (e) => {
    e.preventDefault();
    if (!registerModalEvent || !regForm.fullName || !regForm.phone) {
      alert('Vui lòng điền đầy đủ Họ tên và Số điện thoại!');
      return;
    }
    setSubmittingReg(true);
    try {
      const res = await fetch(`/api/events/${registerModalEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regForm.fullName,
          phone: regForm.phone,
          email: regForm.email,
          company: regForm.company,
          quantity: regForm.quantity || 1
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccessData(data.data || data);
      } else {
        alert(data.error || 'Có lỗi khi đăng ký vé sự kiện');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ để đăng ký vé');
    } finally {
      setSubmittingReg(false);
    }
  };

  const activeKpis = KPI_METRICS_DATA[kpiMode] || KPI_METRICS_DATA.year12;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC' }}>
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <Navbar />

      <main id="main-content" style={{ flex: 1 }}>
        {/* ========================================================
            1. HERO SECTION — GLOBAL L-GATEWAY & MORPHING AURA
            ======================================================== */}
        <section className="hl-hero">
          <div className="hl-hero-grid-overlay" />
          <div className="hl-morph-orb-gold" />
          <div className="hl-morph-orb-sapphire" />

          <div className="hl-container" style={{ width: '100%' }}>
            <div className="hl-hero-layout">
              {/* CỘT TRÁI: THÔNG ĐIỆP TRỌNG TÂM & TÌM KIẾM THÔNG MINH */}
              <div className="hl-reveal-left hl-in-view">
                <div className="hl-hero-pill">
                  <span className="hl-hero-pill-dot" />
                  <span>Doanh Nhân Họ Lê Toàn Cầu & Những Người Bạn</span>
                </div>

                <h1 className="hl-hero-title">
                  Kết Nối Họ Lê Toàn Cầu, <br />
                  <span className="hl-hero-gold">Cùng Mở Cơ Hội Phát Triển</span>
                </h1>

                <p className="hl-hero-subtitle">
                  Nền tảng số dùng chung có <strong>Ban điều phối chuyên trách</strong>, giúp doanh nhân Họ Lê và những người bạn trong nước & quốc tế tìm đúng đối tác, giới thiệu năng lực đã xác minh, trao đổi nhu cầu giao thương và tổ chức các chương trình hợp tác thực chất.
                </p>

                {/* 5 Trụ cột định hướng */}
                <div className="hl-hero-pillars-strip">
                  <span className="hl-hero-pillar-tag"><i className="ti ti-arrows-exchange"></i> Giao thương B2B</span>
                  <span className="hl-hero-pillar-tag"><i className="ti ti-compass"></i> Du lịch & Về nguồn</span>
                  <span className="hl-hero-pillar-tag"><i className="ti ti-chart-pie"></i> Xúc tiến Đầu tư</span>
                  <span className="hl-hero-pillar-tag"><i className="ti ti-bulb"></i> Bài học Điều hành</span>
                  <span className="hl-hero-pillar-tag"><i className="ti ti-school"></i> Đào tạo & Cố vấn</span>
                </div>

                {/* Thanh tìm kiếm trung tâm */}
                <form onSubmit={handleSearchSubmit} className="hl-search-form">
                  <div className="hl-search-icon">
                    <i className="ti ti-search"></i>
                  </div>
                  <input 
                    type="text"
                    className="hl-search-input"
                    placeholder={currentLang === 'en' ? 'Search verified enterprises, B2B demands, investment projects, executive lessons...' : 'Tìm kiếm doanh nghiệp xác minh, cơ hội mua bán, dự án đầu tư, bài học điều hành...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="hl-search-btn">
                    <span>{currentLang === 'en' ? 'Explore' : 'Tìm kiếm'}</span>
                    <i className="ti ti-arrow-right"></i>
                  </button>
                </form>

                {/* Gợi ý nhanh */}
                <div className="hl-quick-chips">
                  <span style={{ fontWeight: '700', color: '#FFE49E' }}>Khám phá nhanh:</span>
                  <span className="hl-chip" onClick={() => scrollToConsult('Đăng ký Chương trình 100 Doanh nhân Tiên phong & Xác minh Hồ sơ')}>🌟 100 Doanh nhân Tiên phong</span>
                  <span className="hl-chip" onClick={() => { setSearchQuery('Giao thương'); navigate('/posts?category=Cơ%20hội%20Giao%20thương'); }}>🤝 Sàn cơ hội B2B</span>
                  <span className="hl-chip" onClick={() => { setSearchQuery('Về nguồn'); navigate('/posts?category=Du%20lịch%20%26%20Về%20nguồn'); }}>🧭 Hành trình Về nguồn Họ Lê</span>
                  <span className="hl-chip" onClick={() => { setSearchQuery('Bài học điều hành'); navigate('/posts?category=Bài%20học%20Điều%20hành'); }}>📚 Bài học Điều hành</span>
                  <span className="hl-chip" onClick={() => { setSearchQuery('Cố vấn'); navigate('/posts?category=Đào%20tạo%20%26%20Cố%20vấn'); }}>🎓 Mentorship 8 tuần</span>
                </div>
              </div>

              {/* CỘT PHẢI: BIỂU TRƯNG 3D CÁNH CỬA THỊ TRƯỜNG & CHỮ L TOÀN CẦU */}
              <div className="hl-hero-3d-stage hl-reveal-right hl-in-view">
                <div className="hl-gateway-3d-card">
                  <div className="hl-float-chip-top">
                    <i className="ti ti-clock-bolt"></i>
                    <span>SLA Phản hồi kết nối ≤ 48 Giờ</span>
                  </div>

                  <div className="hl-gateway-arch">
                    <div className="hl-gateway-monogram-wrap">
                      <img src="/logo_icon.svg" alt="Biểu trưng Chữ L & Cánh cửa thị trường" />
                    </div>
                    <div className="hl-gateway-title">Cánh Cửa Thị Trường Toàn Cầu</div>
                    <p className="hl-gateway-sub">
                      Mối liên kết Họ Lê là điểm khởi đầu của niềm tin; giá trị cộng đồng được chứng minh bằng chất lượng kết nối và kết quả phục vụ hội viên.
                    </p>

                    <div className="hl-gateway-stats-mini">
                      <div className="hl-gw-stat">
                        <div className="hl-gw-stat-val notranslate" translate="no">90 Ngày</div>
                        <div className="hl-gw-stat-lbl">Xây dựng & Thí điểm</div>
                      </div>
                      <div className="hl-gw-stat">
                        <div className="hl-gw-stat-val notranslate" translate="no">03 → 10</div>
                        <div className="hl-gw-stat-lbl">Quốc gia kết nối</div>
                      </div>
                      <div className="hl-gw-stat">
                        <div className="hl-gw-stat-val notranslate" translate="no">100 → 500</div>
                        <div className="hl-gw-stat-lbl">Hồ sơ xác minh</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#D5E2F2' }}>
                    <span><i className="ti ti-Rosette-discount-check" style={{ color: '#4ADE80' }}></i> Hồ sơ đối chiếu thực tế</span>
                    <Link to="/register" style={{ color: '#FFE49E', fontWeight: '800', textDecoration: 'none' }}>
                      Tạo hồ sơ hội viên →
                    </Link>
                  </div>

                  <div className="hl-float-chip-bottom">
                    <i className="ti ti-shield-check" style={{ color: '#D49A2A' }}></i>
                    <span>Ban Thư ký điều phối & hậu kiểm 7–30 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. HỆ THỐNG CHỈ TIÊU MỤC TIÊU (90 NGÀY & 12 THÁNG - MỤC 2 ĐỀ ÁN)
            ======================================================== */}
        <div className="hl-container hl-kpi-bar-wrap">
          <div className="hl-kpi-bar hl-reveal hl-in-view">
            <div className="hl-kpi-top-row">
              <div className="hl-kpi-title-group">
                <i className="ti ti-target-arrow" style={{ fontSize: '20px', color: '#D49A2A' }}></i>
                <span>Hệ Thống Chỉ Tiêu Chất Lượng Kết Nối (Đo lường bằng cuộc gặp thực tế & kết quả xác nhận)</span>
              </div>
              <div className="hl-kpi-toggle-group">
                <button
                  type="button"
                  className={`hl-kpi-toggle-btn ${kpiMode === 'pilot90' ? 'active' : ''}`}
                  onClick={() => setKpiMode('pilot90')}
                >
                  Mốc 90 Ngày Thí Điểm
                </button>
                <button
                  type="button"
                  className={`hl-kpi-toggle-btn ${kpiMode === 'year12' ? 'active' : ''}`}
                  onClick={() => setKpiMode('year12')}
                >
                  Mục Tiêu 12 Tháng Vận Hành
                </button>
              </div>
            </div>

            <div className="hl-kpi-grid">
              {activeKpis.map((item, idx) => (
                <div key={idx} className="hl-kpi-item">
                  <div className="hl-kpi-icon">
                    <i className={`ti ${item.icon}`}></i>
                  </div>
                  <div className="hl-kpi-val notranslate" translate="no">{item.value}</div>
                  <div className="hl-kpi-label">{item.label}</div>
                  <div className="hl-kpi-sub">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. NĂM TRỤ CỘT KẾT NỐI TOÀN CẦU (INTERACTIVE 3D SHOWCASE)
            ======================================================== */}
        <section className="hl-pillars-section">
          <div className="hl-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-layout-grid"></i>
                <span>Cấu Trúc Hệ Sinh Thái Số Doanhnhanhole.today</span>
              </div>
              <h2 className="hl-sec-title">
                Năm Trụ Cột Kết Nối — <span className="hl-gold-accent">Chuyển Quan Hệ Cộng Đồng Thành Giá Trị Thực Chất</span>
              </h2>
              <p className="hl-sec-desc">
                Triển khai theo hướng Việt Nam làm nền tảng, từng bước kết nối doanh nhân Việt ở nước ngoài và bạn bè quốc tế trên tinh thần tự nguyện, minh bạch và tôn trọng khác biệt.
              </p>
            </div>

            {/* Pillar Selector Tabs */}
            <div className="hl-pillar-tabs hl-reveal">
              {FIVE_CORE_PILLARS.map((pillar) => (
                <button
                  key={pillar.id}
                  type="button"
                  className={`hl-pillar-tab-btn ${activePillarId === pillar.id ? 'active' : ''}`}
                  onClick={() => setActivePillarId(pillar.id)}
                >
                  <i className={`ti ${pillar.icon}`}></i>
                  <span>{pillar.name}</span>
                </button>
              ))}
            </div>

            {/* Active Pillar 3D Card */}
            <div className="hl-pillar-showcase hl-card-3d">
              <div className="hl-pillar-visual" style={{ backgroundImage: `url(${activePillar.image})` }}>
                <div className="hl-pillar-visual-overlay">
                  <div className="hl-pillar-tag">{activePillar.tag}</div>
                  <h3 className="hl-pillar-visual-title">{activePillar.name}</h3>
                  <p className="hl-pillar-visual-desc">{activePillar.desc}</p>
                </div>
              </div>

              <div className="hl-pillar-details">
                <div className="hl-pillar-points">
                  {activePillar.keyPoints.map((kp, idx) => (
                    <div key={idx} className="hl-pillar-point">
                      <div className="hl-pillar-point-icon">
                        <i className={`ti ${kp.icon}`}></i>
                      </div>
                      <div>
                        <div className="hl-pillar-point-title">{kp.title}</div>
                        <div className="hl-pillar-point-desc">{kp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hl-pillar-actions">
                  <Link to={activePillar.categoryLink} className="hl-btn-primary">
                    <i className="ti ti-arrow-right"></i>
                    <span>Khám phá chuyên mục</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => scrollToConsult(`Đăng ký kết nối: ${activePillar.name}`)}
                    className="hl-btn-outline"
                  >
                    <i className="ti ti-send"></i>
                    <span>Gửi nhu cầu cho Ban Thư ký</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. QUY TRÌNH 7 BƯỚC KẾT NỐI CÓ ĐIỀU PHỐI & 100 DOANH NHÂN TIÊN PHONG
            ======================================================== */}
        <section className="hl-workflow-section">
          <div className="hl-morph-orb-gold" style={{ top: '10%', left: '-120px', opacity: 0.45 }} />
          <div className="hl-container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge" style={{ background: 'rgba(245, 194, 87, 0.16)', color: '#FFE49E', borderColor: 'rgba(245, 194, 87, 0.45)' }}>
                <i className="ti ti-route"></i>
                <span>Giá Trị Khác Biệt Cốt Lõi (Mục 1.5 & 3.4 Đề Án)</span>
              </div>
              <h2 className="hl-sec-title">
                Quy Trình 7 Bước Kết Nối Có Điều Phối — <span style={{ color: '#F5C257' }}>Mỗi Nhu Cầu Đều Có Đầu Mối Theo Dõi</span>
              </h2>
              <p className="hl-sec-desc">
                Không tính lượt bấm liên hệ xã giao là thành công. Một cuộc gặp đúng nhu cầu chỉ được ghi nhận khi hai bên đồng ý, đã trao đổi và xác nhận có bước tiếp theo cụ thể.
              </p>
            </div>

            <div className="hl-workflow-grid">
              {CONNECTION_7_STEPS.map((st, idx) => (
                <div key={idx} className={`hl-step-card hl-reveal hl-delay-${(idx % 4) + 1}`}>
                  <div className="hl-step-num notranslate" translate="no">{st.step}</div>
                  <div className="hl-step-icon"><i className={`ti ${st.icon}`}></i></div>
                  <div className="hl-step-title">{st.title}</div>
                  <div className="hl-step-desc">{st.desc}</div>
                </div>
              ))}
            </div>

            {/* Banner Chương trình 100 Doanh nhân Tiên phong (Mục 7.3) */}
            <div className="hl-pioneer-banner hl-reveal-scale">
              <div className="hl-pioneer-left">
                <span className="hl-pioneer-badge">
                  <i className="ti ti-crown"></i> Chương trình Trọng điểm Giai đoạn Khởi đầu
                </span>
                <h3 className="hl-pioneer-title">
                  Chương Trình "100 Doanh Nhân Tiên Phong" Doanhnhanhole.today
                </h3>
                <p className="hl-pioneer-desc">
                  Mời 100 doanh nhân đầu tiên tham gia theo 4 nhóm ngành và địa bàn: được Ban Thư ký hỗ trợ hoàn thiện hồ sơ năng lực xác minh, tiếp nhận xử lý ngay ít nhất 01 nhu cầu hợp tác cụ thể và tham gia phiên giao thương thử nghiệm đầu tiên.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => scrollToConsult('Đăng ký Chương trình 100 Doanh nhân Tiên phong & Xác minh Hồ sơ')}
                  className="hl-search-btn"
                  style={{ padding: '14px 28px', fontSize: '14.5px' }}
                >
                  <i className="ti ti-award"></i>
                  <span>Đăng Ký Gia Nhập Top 100 Tiên Phong</span>
                </button>
                <Link
                  to="/register"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    padding: '13px 22px',
                    borderRadius: '99px',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    textDecoration: 'none'
                  }}
                >
                  Tạo tài khoản hội viên →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. SÀN THÔNG TIN CƠ HỘI HỢP TÁC B2B (MỤC 3.2 & 12.4 ĐỀ ÁN)
            ======================================================== */}
        <section className="hl-b2b-section">
          <div className="hl-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-briefcase"></i>
                <span>Sàn Cơ Hội Hợp Tác Có Kiểm Duyệt</span>
              </div>
              <h2 className="hl-sec-title">
                Bảng Nhu Cầu Giao Thương & Đầu Tư — <span className="hl-gold-accent">Chuẩn Hóa 12 Trường Thông Tin</span>
              </h2>
              <p className="hl-sec-desc">
                Mỗi cơ hội đều công bố rõ đơn vị đề xuất, sản phẩm/lĩnh vực, thị trường, quy mô dự kiến, tiêu chí đối tác, thời hạn và bước tiếp theo để hội viên dễ dàng thẩm định.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="hl-b2b-filter-bar hl-reveal">
              {[
                { key: 'ALL', label: 'Tất cả nhu cầu (06)' },
                { key: 'Tìm đại lý / Phân phối', label: 'Tìm đại lý / Nhà phân phối' },
                { key: 'Mua hàng / Nguồn cung', label: 'Mua hàng / Tìm nhà cung cấp' },
                { key: 'Góp vốn / Mở nhà máy', label: 'Đầu tư / Mở rộng nhà máy' },
                { key: 'Hợp tác Dịch vụ & Xuất khẩu', label: 'Dịch vụ, Công nghệ & Du lịch' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`hl-b2b-filter-btn ${b2bFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setB2bFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* B2B Opportunity Cards Grid */}
            <div className="hl-b2b-grid">
              {filteredOpportunities.map((item) => (
                <div key={item.id} className="hl-b2b-card hl-card-3d">
                  <div>
                    <div className="hl-b2b-top">
                      <span className="hl-b2b-type-badge">{item.type}</span>
                      <span className="hl-b2b-status-pill">
                        <i className="ti ti-circle-check"></i> {item.status}
                      </span>
                    </div>

                    <h3 className="hl-b2b-title">{item.title}</h3>

                    <div className="hl-b2b-meta-box">
                      <div className="hl-b2b-meta-row">
                        <span>Đơn vị đề xuất:</span>
                        <strong>{item.proposer}</strong>
                      </div>
                      <div className="hl-b2b-meta-row">
                        <span>Thị trường:</span>
                        <strong>{item.market}</strong>
                      </div>
                      <div className="hl-b2b-meta-row">
                        <span>Quy mô dự kiến:</span>
                        <strong style={{ color: '#B37B16' }}>{item.scale}</strong>
                      </div>
                      <div className="hl-b2b-meta-row">
                        <span>Thời hạn tiếp nhận:</span>
                        <strong>{item.deadline}</strong>
                      </div>
                    </div>

                    <div className="hl-b2b-criteria">
                      <strong>Tiêu chí đối tác:</strong> {item.criteria}
                    </div>
                  </div>

                  <div className="hl-b2b-footer">
                    <span style={{ color: '#3E506B', fontWeight: '600' }}>
                      <i className="ti ti-arrow-forward-up" style={{ color: '#D49A2A' }}></i> {item.nextStep}
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToConsult(`Đề nghị kết nối cơ hội: ${item.title}`)}
                      style={{
                        background: '#0B1D3A',
                        color: '#FFE49E',
                        border: 'none',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        fontWeight: '750',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Kết nối ngay →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            6. TIN TỨC, BÀI HỌC ĐIỀU HÀNH & CHÂN DUNG DOANH NHÂN (/api/posts)
            ======================================================== */}
        <section className="pt-news-section">
          <div className="pt-section-container">
            <div className="pt-section-header-row hl-reveal">
              <div className="pt-section-header-left">
                <div className="hl-sec-badge">
                  <i className="ti ti-news"></i>
                  <span>Nhịp Nội Dung Cộng Đồng • 12 Bài Trọng Tâm / Tháng</span>
                </div>
                <h2 className="pt-section-title">
                  Bài Học Điều Hành, Chân Dung & <span className="pt-highlight">Cơ Hội Hợp Tác Mới Nhất</span>
                </h2>
                <p className="pt-section-desc">
                  Tổng hợp 04 chân dung doanh nhân, 04 cơ hội hợp tác, 02 bài học điều hành thực tế, 01 thông tin đào tạo và 01 bản tin hoạt động hàng tháng.
                </p>
              </div>
              <div className="pt-section-header-right">
                <Link to="/posts" className="pt-btn-header-more">
                  <span>Xem toàn bộ bài viết</span>
                  <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="pt-articles-layout">
              {/* CỘT TRÁI: BÀI VIẾT NỔI BẬT NHẤT */}
              {featuredPost && (
                <div className="pt-post-featured-card hl-card-3d">
                  <Link to={`/posts/${featuredPost.slug || featuredPost.id}`} className="pt-post-featured-thumb-wrap">
                    <img 
                      src={featuredPost.image_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85'} 
                      alt={featuredPost.title} 
                      className="pt-post-featured-img"
                      loading="lazy"
                    />
                    <div className="pt-post-featured-badge">
                      <i className="ti ti-flame"></i>
                      <span>Tiêu Điểm Cộng Đồng</span>
                    </div>
                    <div className="pt-post-category-pill">
                      {featuredPost.category || 'Cộng đồng & Danh bạ'}
                    </div>
                  </Link>

                  <div className="pt-post-featured-body">
                    <div>
                      <div className="pt-post-date-tag">
                        <i className="ti ti-calendar"></i>
                        <span>{formatPostDate(featuredPost.created_at)}</span>
                        {featuredPost.views && (
                          <>
                            <span className="pt-dot-separator">•</span>
                            <span><i className="ti ti-eye"></i> {featuredPost.views.toLocaleString()} lượt đọc</span>
                          </>
                        )}
                      </div>

                      <h3 className="pt-post-featured-title">
                        <Link to={`/posts/${featuredPost.slug || featuredPost.id}`}>
                          {featuredPost.title}
                        </Link>
                      </h3>

                      <p className="pt-post-featured-excerpt">
                        {featuredPost.summary || featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-post-featured-meta">
                      <div className="pt-post-author-box">
                        <i className="ti ti-user-check"></i>
                        <span>{featuredPost.author_name || brandConfig.brandName}</span>
                      </div>
                      <Link to={`/posts/${featuredPost.slug || featuredPost.id}`} className="pt-btn-read-post">
                        <span>Đọc toàn văn bài viết</span>
                        <i className="ti ti-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* CỘT PHẢI: CÁC BÀI VIẾT TIẾP THEO */}
              <div className="pt-compact-posts-list">
                {remainingPosts.map((post) => (
                  <div key={post.id} className="pt-compact-post-item hl-card-3d">
                    <Link 
                      to={`/posts/${post.slug || post.id}`} 
                      className="pt-compact-post-thumb"
                      style={{ backgroundImage: `url(${post.image_url || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80'})` }}
                    />
                    <div className="pt-compact-post-content">
                      <div className="pt-compact-post-meta">
                        <span className="pt-compact-cat-badge">{post.category || 'Tin tức'}</span>
                        <span className="pt-compact-date">{formatPostDate(post.created_at)}</span>
                      </div>
                      <h4 className="pt-compact-post-title">
                        <Link to={`/posts/${post.slug || post.id}`}>
                          {post.title}
                        </Link>
                      </h4>
                      <p className="pt-compact-post-excerpt">
                        {post.summary || post.excerpt}
                      </p>
                      <div className="pt-compact-post-footer">
                        <Link to={`/posts/${post.slug || post.id}`} className="pt-compact-btn-link">
                          <span>Xem chi tiết</span>
                          <i className="ti ti-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            7. SỰ KIỆN, PHIÊN GIAO THƯƠNG THÁNG & ĐOÀN KHẢO SÁT (/api/events)
            ======================================================== */}
        <section className="pt-events-section">
          <div className="pt-section-container">
            <div className="pt-section-header-row hl-reveal">
              <div className="pt-section-header-left">
                <div className="hl-sec-badge">
                  <i className="ti ti-calendar-event"></i>
                  <span>Lịch Sinh Hoạt Thường Kỳ • Có Ghi Nhận Kết Quả</span>
                </div>
                <h2 className="pt-section-title">
                  Phiên Giao Thương, Hội Thảo & <span className="pt-highlight">Sự Kiện Sắp Diễn Ra</span>
                </h2>
                <p className="pt-section-desc">
                  Mỗi tháng 01 phiên giao thương theo ngành; mỗi quý 01 đoàn khảo sát doanh nghiệp hoặc phiên giới thiệu cơ hội đầu tư. Đăng ký vé QR trực tuyến.
                </p>
              </div>
              <div className="pt-section-header-right">
                <Link to="/events" className="pt-btn-header-more">
                  <span>Xem toàn bộ sự kiện</span>
                  <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>

            {featuredEvent && (
              <div className="pt-event-hero-banner hl-card-3d">
                <div className="pt-event-hero-visual">
                  <img 
                    src={featuredEvent.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85'} 
                    alt={featuredEvent.title} 
                    className="pt-event-hero-img"
                    loading="lazy"
                  />
                  <div className="pt-event-hero-badge">
                    <span className="pt-pulse-dot" />
                    <span>Hoạt Động Trọng Điểm Gần Nhất</span>
                  </div>
                  <div className="pt-event-hero-price">
                    {formatEventPrice(featuredEvent)}
                  </div>
                </div>

                <div className="pt-event-hero-info">
                  <div>
                    <div className="pt-event-meta-chips">
                      <div className="pt-event-chip-date">
                        <i className="ti ti-calendar-event"></i>
                        <span>{formatEventDateTime(featuredEvent.start_date || featuredEvent.event_date)}</span>
                      </div>
                      <div className="pt-event-chip-loc">
                        <i className="ti ti-map-pin"></i>
                        <span>{featuredEvent.location}</span>
                      </div>
                    </div>

                    <h3 className="pt-event-hero-title">
                      <Link to={`/events/${featuredEvent.slug || featuredEvent.id}`}>
                        {featuredEvent.title}
                      </Link>
                    </h3>

                    <p className="pt-event-hero-desc">
                      {featuredEvent.description || 'Chương trình kết nối doanh nhân Họ Lê và những người bạn: giới thiệu năng lực, ghép cặp giao thương B2B và dẫn về lịch sử theo dõi trên nền tảng.'}
                    </p>

                    <div className="pt-event-hero-timer-box">
                      <div className="pt-timer-label">
                        <i className="ti ti-clock"></i>
                        <span>Thời gian đếm ngược đến giờ khai mạc:</span>
                      </div>
                      <HomeEventCountdown eventDate={featuredEvent.start_date || featuredEvent.event_date} />
                    </div>
                  </div>

                  <div className="pt-event-hero-actions">
                    <button 
                      type="button"
                      className="pt-btn-ticket-primary"
                      onClick={() => handleOpenRegisterModal(featuredEvent)}
                    >
                      <i className="ti ti-ticket"></i>
                      <span>Đăng ký tham dự (Vé QR)</span>
                    </button>
                    <Link 
                      to={`/events/${featuredEvent.slug || featuredEvent.id}`} 
                      className="pt-btn-event-detail"
                    >
                      <span>Xem chi tiết chương trình</span>
                      <i className="ti ti-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-upcoming-events-grid">
              {remainingEvents.map((evt) => (
                <div key={evt.id} className="pt-upcoming-card hl-card-3d">
                  <div className="pt-upcoming-visual">
                    <img 
                      src={evt.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'} 
                      alt={evt.title} 
                      className="pt-upcoming-img"
                      loading="lazy"
                    />
                    <div className="pt-upcoming-price-tag">
                      {formatEventPrice(evt)}
                    </div>
                    <div className="pt-upcoming-date-pill">
                      <i className="ti ti-calendar"></i>
                      <span>{formatEventDateTime(evt.start_date || evt.event_date).split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="pt-upcoming-body">
                    <div className="pt-upcoming-loc">
                      <i className="ti ti-map-pin"></i>
                      <span>{evt.location}</span>
                    </div>

                    <h4 className="pt-upcoming-title">
                      <Link to={`/events/${evt.slug || evt.id}`}>
                        {evt.title}
                      </Link>
                    </h4>

                    <p className="pt-upcoming-desc">
                      {evt.description || `Địa điểm tổ chức: ${evt.location}`}
                    </p>

                    <div className="pt-upcoming-footer">
                      <button 
                        type="button"
                        className="pt-btn-ticket-subtle"
                        onClick={() => handleOpenRegisterModal(evt)}
                      >
                        <i className="ti ti-ticket"></i>
                        <span>Đăng ký Vé QR</span>
                      </button>
                      <Link to={`/events/${evt.slug || evt.id}`} className="pt-upcoming-link">
                        <span>Xem chi tiết</span>
                        <i className="ti ti-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            8. HÀNH TRÌNH DU LỊCH VỀ NGUỒN HỌ LÊ & BIZ-TOUR KHẢO SÁT (MỤC 4.1)
            ======================================================== */}
        <section className="pt-itineraries-section">
          <div className="pt-section-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-compass"></i>
                <span>Kết Nối Du Lịch & Khảo Sát Thực Địa (Mục 4.1 Đề Án)</span>
              </div>
              <h2 className="hl-sec-title">
                Hành Trình Về Nguồn Họ Lê & <span className="hl-gold-accent">Đoàn Khảo Sát Doanh Nghiệp (Biz-Tour)</span>
              </h2>
              <p className="hl-sec-desc">
                Mỗi chương trình đều công bố minh bạch đơn vị cung cấp dịch vụ, chi phí bao gồm, điều kiện hủy và đầu mối phụ trách; nội dung lịch sử được biên tập và kiểm chứng cẩn trọng.
              </p>
            </div>

            <div className="pt-itinerary-tabs hl-reveal">
              {CURATED_PROGRAMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pt-itinerary-tab-btn ${activeProgId === item.id ? 'active' : ''}`}
                  onClick={() => setActiveProgId(item.id)}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-itinerary-active-card hl-card-3d">
              <div className="pt-itinerary-hero-img" style={{ backgroundImage: `url(${activeProg.image})` }}>
                <div className="pt-itinerary-hero-overlay" />
                <div className="pt-itinerary-hero-content">
                  <span className="pt-itinerary-badge">{activeProg.badge}</span>
                  <h3 className="pt-itinerary-title">{activeProg.title}</h3>
                  <div className="pt-itinerary-meta-chips">
                    <span><i className="ti ti-clock"></i> {activeProg.duration}</span>
                    <span><i className="ti ti-user-check"></i> {activeProg.suitability}</span>
                  </div>
                </div>
              </div>

              <div className="pt-itinerary-steps-panel">
                <div>
                  <div style={{ fontSize: '13.5px', color: '#3E506B', marginBottom: '20px', lineHeight: '1.6' }}>
                    {activeProg.summary}
                  </div>
                  <div className="pt-itinerary-steps-list">
                    {activeProg.steps.map((st, idx) => (
                      <div key={idx} className="pt-itinerary-step-item">
                        <div className="pt-itinerary-step-time">{st.time}</div>
                        <div className="pt-itinerary-step-body">
                          <h4>{st.title}</h4>
                          <p>{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(11, 29, 58, 0.08)' }}>
                  <Link 
                    to={`/ai-chat?q=${encodeURIComponent(`Hãy tư vấn chi tiết cho tôi về chương trình: ${activeProg.title}`)}`}
                    className="hl-btn-primary"
                  >
                    <i className="ti ti-sparkles"></i>
                    <span>Hỏi Trợ lý AI về chương trình</span>
                  </Link>
                  <button 
                    type="button"
                    onClick={() => scrollToConsult(`Đăng ký tham gia đoàn: ${activeProg.title}`)}
                    className="hl-btn-outline"
                  >
                    <i className="ti ti-calendar-plus"></i>
                    <span>Đăng ký tham gia đoàn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            9. HỌC VIỆN THỰC CHIẾN: 6 CHUYÊN ĐỀ ĐÀO TẠO & CỐ VẤN 8 TUẦN (MỤC 4.4)
            ======================================================== */}
        <section className="hl-academy-section">
          <div className="hl-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-school"></i>
                <span>Phát Triển Năng Lực & Chia Sẻ Kinh Nghiệm (Mục 4.3 & 4.4)</span>
              </div>
              <h2 className="hl-sec-title">
                Sáu Chuyên Đề Đào Tạo Chủ Doanh Nghiệp & <span className="hl-gold-accent">Cố Vấn Khởi Nghiệp 8 Tuần</span>
              </h2>
              <p className="hl-sec-desc">
                Mỗi chuyên đề đều thiết kế mục tiêu học tập rõ ràng, bài thực hành áp dụng trực tiếp vào doanh nghiệp và khảo sát chất lượng sau khóa học.
              </p>
            </div>

            <div className="hl-courses-grid">
              {SIX_TRAINING_MODULES.map((course, idx) => (
                <div key={idx} className="hl-course-card hl-card-3d">
                  <div>
                    <div className="hl-course-header">
                      <div className="hl-course-icon">
                        <i className={`ti ${course.icon}`}></i>
                      </div>
                      <span className="hl-course-num">{course.code}</span>
                    </div>
                    <h3 className="hl-course-title">{course.title}</h3>
                    <p className="hl-course-desc">{course.desc}</p>
                  </div>
                  <div className="hl-course-outcome">
                    <i className="ti ti-check" style={{ color: '#D49A2A', marginRight: '6px' }}></i>
                    {course.outcome}
                  </div>
                </div>
              ))}
            </div>

            {/* Mentorship 8-Week Box */}
            <div className="hl-mentorship-box hl-reveal-scale">
              <div>
                <div className="hl-pioneer-badge">
                  <i className="ti ti-seedling"></i> Chương Trình Cố Vấn Doanh Nhân Trẻ (Mentorship)
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '850', marginBottom: '10px', color: '#FFFFFF' }}>
                  Mô Hình Cố Vấn 1 Người Hướng Dẫn Kèm 1 – 3 Doanh Nhân Trẻ Trong 8 Tuần
                </h3>
                <p style={{ fontSize: '14px', color: '#D5E2F2', lineHeight: '1.6', marginBottom: '18px' }}>
                  Người trẻ khởi nghiệp được tham gia theo chương trình riêng với người hướng dẫn giàu kinh nghiệm. Hai bên thống nhất mục tiêu, lịch trao đổi định kỳ và nguyên tắc bảo mật thông tin; không dùng tên người cố vấn để quảng cáo hoặc bảo chứng thương mại khi chưa được đồng ý.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToConsult('Đăng ký Chương trình Cố vấn Khởi nghiệp 8 tuần (Mentor / Mentee)')}
                  className="hl-search-btn"
                >
                  <i className="ti ti-user-check"></i>
                  <span>Đăng Ký Làm Mentor / Mentee Khởi Nghiệp</span>
                </button>
              </div>

              <div className="hl-mentor-steps">
                <div className="hl-mentor-step">
                  <h4>Tuần 01 – 02: Chẩn Đoán</h4>
                  <p>Xác định bài toán cốt lõi của doanh nghiệp trẻ, chốt mục tiêu 8 tuần & ký cam kết bảo mật.</p>
                </div>
                <div className="hl-mentor-step">
                  <h4>Tuần 03 – 05: Thực Thi</h4>
                  <p>Trao đổi định kỳ hàng tuần, rà soát mô hình sản phẩm, dòng tiền và kênh bán hàng.</p>
                </div>
                <div className="hl-mentor-step">
                  <h4>Tuần 06 – 07: Kết Nối</h4>
                  <p>Giới thiệu thử nghiệm với hệ sinh thái hội viên phù hợp theo năng lực thực tế.</p>
                </div>
                <div className="hl-mentor-step">
                  <h4>Tuần 08: Kế Hoạch Cải Thiện</h4>
                  <p>Hoàn thành bản kế hoạch cải thiện cụ thể và đánh giá kết quả chương trình cố vấn.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            10. DANH BẠ DOANH NGHIỆP XÁC MINH (/api/members) & QUY CHẾ 3 NHÓM HỘI VIÊN
            ======================================================== */}
        <section className="pt-enterprises-section">
          <div className="pt-section-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-building"></i>
                <span>Danh Bạ Doanh Nhân Họ Lê & Những Người Bạn</span>
              </div>
              <h2 className="hl-sec-title">
                Hồ Sơ Doanh Nghiệp Đã Xác Minh — <span className="hl-gold-accent">Minh Bạch Năng Lực & Thị Trường</span>
              </h2>
              <p className="hl-sec-desc">
                Mỗi hồ sơ thể hiện rõ doanh nghiệp, vai trò, sản phẩm, thị trường mục tiêu, ngôn ngữ giao tiếp và phạm vi đã được Ban Thư ký kiểm tra.
              </p>
            </div>

            <div className="pt-enterprises-slider" style={{ marginBottom: '56px' }}>
              {featuredMembers.map((m) => (
                <div key={m.id} className="pt-enterprise-card hl-card-3d">
                  <div>
                    <span className={`pt-enterprise-tier-badge pt-tier-${(m.tier || 'silver').toLowerCase()}`}>
                      <i className="ti ti-shield-check" style={{ marginRight: '4px' }}></i>
                      XÁC MINH • {String(m.tier || 'SILVER').toUpperCase()}
                    </span>
                    <h3 className="pt-enterprise-name">{m.name}</h3>
                    <div className="pt-enterprise-ind">{m.industry}</div>
                    <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.55', marginBottom: '12px' }}>
                      {m.description}
                    </div>
                  </div>
                  <Link to="/members" className="pt-enterprise-link">
                    <span>Xem hồ sơ năng lực</span>
                    <i className="ti ti-arrow-narrow-right"></i>
                  </Link>
                </div>
              ))}
            </div>

            {/* 3 Nhóm Hội Viên theo Quy chế Mục 6.2 & Lộ trình 90 ngày / 12 tháng Mục 8 */}
            <div className="hl-sec-header hl-reveal" style={{ marginTop: '20px' }}>
              <div className="hl-sec-badge">
                <i className="ti ti-certificate"></i>
                <span>Quy Chế Hội Viên & Lộ Trình Phát Triển (Mục 6.2 & Mục 8)</span>
              </div>
              <h2 className="hl-sec-title">
                Ba Nhóm Thành Viên & <span className="hl-gold-accent">Lộ Trình Triển Khai Bài Bản</span>
              </h2>
            </div>

            <div className="hl-tiers-grid" style={{ marginBottom: '48px' }}>
              <div className="hl-tier-card hl-card-3d">
                <span className="hl-tier-badge">Nhóm 01 • Cộng Đồng & Khởi Nghiệp</span>
                <h3 className="hl-tier-name">Thành Viên Cộng Đồng</h3>
                <p className="hl-tier-desc">
                  Dành cho doanh nhân, chuyên gia Họ Lê, người trẻ khởi nghiệp và bạn bè đồng hành bắt đầu kết nối với cộng đồng.
                </p>
                <ul className="hl-tier-list">
                  <li><i className="ti ti-circle-check"></i> <span>Tạo hồ sơ giới thiệu năng lực & lựa chọn quyền riêng tư thông tin liên hệ</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Truy cập tin tức công khai, chuyên mục Bài học điều hành & lịch sự kiện</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Đăng ký tham gia chương trình Cố vấn khởi nghiệp 8 tuần (Mentorship)</span></li>
                </ul>
                <Link to="/register" className="hl-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  Đăng ký Thành viên Cộng đồng
                </Link>
              </div>

              <div className="hl-tier-card featured hl-card-3d">
                <span className="hl-tier-badge">Nhóm 02 • Trọng Tâm Kết Nối B2B</span>
                <h3 className="hl-tier-name">Hội Viên Doanh Nghiệp</h3>
                <p className="hl-tier-desc">
                  Dành cho chủ doanh nghiệp, người điều hành có nhu cầu giao thương, mở rộng đại lý, xuất nhập khẩu và hợp tác đầu tư.
                </p>
                <ul className="hl-tier-list">
                  <li><i className="ti ti-circle-check"></i> <span>Cấp Huy hiệu Hồ sơ Xác minh Cơ bản (đối chiếu liên hệ, vai trò & pháp nhân)</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Đăng nhu cầu lên Sàn cơ hội giao thương & được Ban Thư ký ghép nối ≤ 48h</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Tham gia Phiên giao thương hàng tháng, Đoàn khảo sát quý & 6 chuyên đề đào tạo</span></li>
                </ul>
                <button
                  type="button"
                  onClick={() => scrollToConsult('Đăng ký Hội viên Doanh nghiệp & Chương trình 100 Doanh nhân Tiên phong')}
                  className="hl-search-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Gia Nhập Hội Viên Doanh Nghiệp
                </button>
              </div>

              <div className="hl-tier-card hl-card-3d">
                <span className="hl-tier-badge">Nhóm 03 • Đồng Hành & Chuyên Gia</span>
                <h3 className="hl-tier-name">Đối Tác Đồng Hành</h3>
                <p className="hl-tier-desc">
                  Dành cho các tập đoàn tài trợ chương trình, đơn vị du lịch, trường đào tạo, chuyên gia cố vấn và tổ chức hỗ trợ kinh doanh.
                </p>
                <ul className="hl-tier-list">
                  <li><i className="ti ti-circle-check"></i> <span>Đồng hành truyền thông có gắn nhãn minh bạch trong các chương trình chuyên đề</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Cung cấp dịch vụ du lịch Biz-Tour, đào tạo, tư vấn pháp lý - tài chính theo quy chế</span></li>
                  <li><i className="ti ti-circle-check"></i> <span>Cam kết bảo vệ dữ liệu: không mua bán danh sách thông tin cá nhân hội viên</span></li>
                </ul>
                <button
                  type="button"
                  onClick={() => scrollToConsult('Đăng ký làm Đối tác Đồng hành / Chuyên gia / Tài trợ chương trình')}
                  className="hl-btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Liên hệ Hợp tác Đồng hành
                </button>
              </div>
            </div>

            {/* Lộ trình 4 giai đoạn */}
            <div className="hl-roadmap-timeline">
              {ROADMAP_PHASES.map((ph, idx) => (
                <div key={idx} className="hl-phase-card hl-card-3d">
                  <div className="hl-phase-time">{ph.time}</div>
                  <h4 className="hl-phase-title">{ph.title}</h4>
                  <p className="hl-phase-desc">{ph.desc}</p>
                  <div className="hl-phase-output">
                    <i className="ti ti-flag-3"></i> {ph.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            11. FORM ĐĂNG KÝ KẾT NỐI GIAO THƯƠNG & GIA NHẬP CỘNG ĐỒNG (/api/leads)
            ======================================================== */}
        <section id="tu-van" className="pt-consult-section">
          <div className="pt-section-container">
            <div className="pt-consult-wrapper">
              <div className="pt-consult-header">
                <h2>Gửi Nhu Cầu Kết Nối & Đăng Ký Gia Nhập Cộng Đồng</h2>
                <p>
                  Ban Thư ký Doanhnhanhole.today tiếp nhận thông tin, kiểm tra và phản hồi đề xuất kết nối ban đầu trong vòng <strong>02 ngày làm việc (48 giờ)</strong>.
                </p>
              </div>

              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: '48px', color: '#4ADE80', marginBottom: '12px' }}></i>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Ban Thư Ký Đã Tiếp Nhận Yêu Cầu!</h3>
                  <p style={{ color: '#D5E2F2', fontSize: '14.5px' }}>
                    Cảm ơn Quý Doanh nhân đã gửi thông tin. Điều phối viên phụ trách ngành/khu vực của Doanhnhanhole.today sẽ liên hệ qua Số điện thoại / Email trong vòng 2 ngày làm việc để xác minh và đề xuất đối tác phù hợp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit}>
                  <div className="pt-consult-grid-inputs">
                    <div className="pt-form-group">
                      <label>Họ và tên Doanh nhân / Người đại diện (*)</label>
                      <input 
                        type="text" 
                        className="pt-form-control" 
                        placeholder="Ví dụ: Lê Văn Minh" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="pt-form-group">
                      <label>Số điện thoại / Zalo liên hệ (*)</label>
                      <input 
                        type="tel" 
                        className="pt-form-control" 
                        placeholder="0912 345 678" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="pt-form-group">
                      <label>Email nhận thông tin điều phối</label>
                      <input 
                        type="email" 
                        className="pt-form-control" 
                        placeholder="director@company.vn" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="pt-form-group">
                      <label>Tên Doanh nghiệp / Tổ chức (*)</label>
                      <input 
                        type="text" 
                        className="pt-form-control" 
                        placeholder="Công ty Cổ phần / TNHH..." 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="pt-form-group full-width">
                      <label>Nội dung đăng ký / Nhu cầu hợp tác trọng tâm</label>
                      <select 
                        className="pt-form-control"
                        value={formData.serviceNeed}
                        onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
                      >
                        <option value="Đăng ký Chương trình 100 Doanh nhân Tiên phong & Xác minh Hồ sơ">Đăng ký Chương trình 100 Doanh nhân Tiên phong & Xác minh Hồ sơ</option>
                        <option value="Gửi Nhu cầu Giao thương B2B (Mua hàng, Bán hàng, Tìm Đại lý / Nhà phân phối)">Gửi Nhu cầu Giao thương B2B (Mua hàng, Bán hàng, Tìm Đại lý / Nhà phân phối)</option>
                        <option value="Đề xuất Cơ hội Đầu tư / Yêu cầu Tiếp cận Tài liệu Dự án (Data Room)">Đề xuất Cơ hội Đầu tư / Yêu cầu Tiếp cận Tài liệu Dự án (Data Room)</option>
                        <option value="Đăng ký Hành trình Du lịch Về nguồn Họ Lê & Đoàn Khảo sát Doanh nghiệp">Đăng ký Hành trình Du lịch Về nguồn Họ Lê & Đoàn Khảo sát Doanh nghiệp</option>
                        <option value="Đăng ký 6 Chuyên đề Đào tạo & Chương trình Cố vấn Khởi nghiệp 8 tuần">Đăng ký 6 Chuyên đề Đào tạo & Chương trình Cố vấn Khởi nghiệp 8 tuần</option>
                        <option value="Đăng ký làm Đầu mối Ngành / Khu vực Quốc tế hoặc Đối tác Đồng hành">Đăng ký làm Đầu mối Ngành / Khu vực Quốc tế hoặc Đối tác Đồng hành</option>
                      </select>
                    </div>
                    <div className="pt-form-group full-width">
                      <label>Mô tả chi tiết năng lực hoặc yêu cầu đối tác (Sản phẩm, thị trường, quy mô, thời hạn)</label>
                      <textarea 
                        className="pt-form-control" 
                        rows="3" 
                        placeholder="Nêu rõ ngành nghề, sản phẩm cần mua/bán, thị trường mục tiêu, tiêu chí đối tác mong muốn..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="pt-btn-submit-consult"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Đang gửi đến Ban Thư ký...' : 'Gửi Yêu Cầu Cho Ban Thư Ký Điều Phối'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            12. CÂU HỎI THƯỜNG GẶP VỀ QUY CHẾ, XÁC MINH & BẢO MẬT (FAQ)
            ======================================================== */}
        <section className="pt-faq-section">
          <div className="pt-section-container">
            <div className="hl-sec-header hl-reveal">
              <div className="hl-sec-badge">
                <i className="ti ti-help"></i>
                <span>Nguyên Tắc Vận Hành & Minh Bạch Cộng Đồng</span>
              </div>
              <h2 className="hl-sec-title">
                Câu Hỏi Thường Gặp — <span className="hl-gold-accent">Quy Chế Hội Viên & Cơ Chế Điều Phối</span>
              </h2>
              <p className="hl-sec-desc">
                Giải đáp rõ ràng về đối tượng tham gia, quy trình xác minh hồ sơ, bảo mật dữ liệu và nguyên tắc kết nối trên Doanhnhanhole.today.
              </p>
            </div>

            <div className="pt-faq-list">
              {FAQ_ITEMS.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`pt-faq-item ${activeFaq === idx ? 'active' : ''}`}
                >
                  <div 
                    className="pt-faq-question"
                    onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  >
                    <span>{item.q}</span>
                    <i className="ti ti-chevron-down"></i>
                  </div>
                  {activeFaq === idx && (
                    <div className="pt-faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          MODAL ĐĂNG KÝ VÉ SỰ KIỆN NHANH (QR TICKET MODAL)
          ======================================================== */}
      {registerModalEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 16, 32, 0.78)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
            animation: 'hlFadeIn 0.25s ease'
          }}>
            <div style={{ background: '#0B1D3A', color: '#FFFFFF', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #D49A2A' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#F5C257', fontWeight: '750', textTransform: 'uppercase' }}>Đăng Ký Tham Dự Hoạt Động & Cấp Vé QR</div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginTop: '2px' }}>{registerModalEvent.title}</h3>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {regSuccessData ? (
                <div style={{ textAlign: 'center' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: '48px', color: '#22C55E', marginBottom: '12px' }}></i>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1D3A', marginBottom: '8px' }}>Đăng Ký Tham Dự Thành Công!</h4>
                  <p style={{ fontSize: '13.5px', color: '#3E506B', marginBottom: '16px' }}>
                    Mã vé QR của Quý Doanh nhân: <strong style={{ color: '#D49A2A', fontSize: '16px' }}>{regSuccessData.ticketCode || regSuccessData.ticket_code || 'HL-2026-TICKET'}</strong>
                  </p>
                  <div style={{ background: '#F7F9FC', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: '#3E506B' }}>
                    Ban Thư ký đã ghi nhận đăng ký của Quý vị. Vui lòng lưu lại mã vé để check-in và nhận danh sách kết nối tại sự kiện.
                  </div>
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="hl-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterEventSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#0A1628' }}>Họ và tên đại biểu (*)</label>
                      <input 
                        type="text" 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="Lê Văn A"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#0A1628' }}>Số điện thoại nhận vé QR (*)</label>
                      <input 
                        type="tel" 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="0912 345 678"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#0A1628' }}>Email nhận tài liệu chương trình</label>
                      <input 
                        type="email" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#0A1628' }}>Doanh nghiệp / Tổ chức</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.company}
                        onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                        placeholder="Công ty Cổ phần..."
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={handleCloseModal}
                      style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      className="hl-btn-primary"
                      disabled={submittingReg}
                      style={{ flex: 2, justifyContent: 'center' }}
                    >
                      {submittingReg ? 'Đang xuất vé QR...' : 'Xác Nhận Đăng Ký'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <FloatingAIBot />
    </div>
  );
};

export default Home;
