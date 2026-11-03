import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAIBot from '../components/FloatingAIBot';
import SEOHead from '../components/SEOHead';
import brandConfig from '../brand.config';
import { getCategoryLabel } from '../constants/categories';
import { fetchJsonWithTimeout, FALLBACK_POSTS, FALLBACK_EVENTS, FALLBACK_MEMBERS } from '../utils/api';
import './HomeDakLak.css';

// Helper format ngày giờ cho sự kiện (Ví dụ: 13:30 Thứ Năm, 22/10/2026)
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

// Helper format giá vé sự kiện
const formatEventPrice = (evt) => {
  if (!evt || !evt.is_paid || !evt.price || Number(evt.price) === 0) {
    return 'Miễn phí';
  }
  return `${Number(evt.price).toLocaleString('vi-VN')} đ`;
};

// Sub-component đếm ngược sự kiện trang chủ độc lập
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
    <div className="daklak-event-countdown-grid">
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">NGÀY</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">GIỜ</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">PHÚT</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">GIÂY</span>
      </div>
    </div>
  );
});

// 8 Lối vào nhanh Hệ sinh thái số Lào Cai (Chương 12 & 18 - Tài liệu Giới thiệu dự án)
const QUICK_ACCESS_ITEMS = [
  {
    id: 'qa-1',
    icon: 'ti-mountain',
    title: 'Khám phá Lào Cai',
    titleEn: 'Discover Lao Cai',
    desc: 'Fansipan, Sa Pa, Bắc Hà, Y Tý & bản sắc Tây Bắc',
    descEn: 'Fansipan, Sa Pa, Bac Ha, Y Ty & Northwest heritage',
    link: `/posts?category=${encodeURIComponent('Khám phá Lào Cai')}`
  },
  {
    id: 'qa-2',
    icon: 'ti-truck-delivery',
    title: 'Kinh tế Cửa khẩu',
    titleEn: 'Border Gate & Logistics',
    desc: 'KKT Cửa khẩu Kim Thành, XNK ASEAN – Trung Quốc',
    descEn: 'Kim Thanh Border Gate, ASEAN – China Logistics',
    link: `/posts?category=${encodeURIComponent('Cửa khẩu & Logistics')}`
  },
  {
    id: 'qa-3',
    icon: 'ti-chart-Histogram',
    title: 'Dự án & Đầu tư',
    titleEn: 'Investment & Projects',
    desc: 'KCN Tằng Loỏng, Võ Lao, Đông Phố Mới & ưu đãi',
    descEn: 'Industrial parks, master plan & incentives',
    link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`
  },
  {
    id: 'qa-4',
    icon: 'ti-compass',
    title: 'Lịch trình Du lịch AI',
    titleEn: 'AI Smart Itineraries',
    desc: 'Tour mẫu 1N, 2N1Đ, 3N2Đ & tùy chỉnh bằng AI',
    descEn: '1D, 2D1N, 3D2N tours & AI customization',
    link: '#hanh-trinh-thong-minh',
    isAnchor: true
  },
  {
    id: 'qa-5',
    icon: 'ti-leaf',
    title: 'Dược liệu & OCOP',
    titleEn: 'Herbs & OCOP Specialties',
    desc: 'Atiso, tam thất, chè Shan Tuyết, cá hồi Sa Pa',
    descEn: 'Artichoke, Shan Tuyet tea, cold-water salmon',
    link: `/posts?category=${encodeURIComponent('Nông sản & Dược liệu')}`
  },
  {
    id: 'qa-6',
    icon: 'ti-building-community',
    title: 'Showroom Doanh nghiệp',
    titleEn: 'Enterprise Directory',
    desc: 'Danh bạ doanh nghiệp xác thực & kết nối B2B',
    descEn: 'Verified company profiles & B2B networking',
    link: '/members'
  },
  {
    id: 'qa-7',
    icon: 'ti-calendar-event',
    title: 'Sự kiện & Hội chợ',
    titleEn: 'Events & Trade Fairs',
    desc: 'Hội chợ Việt – Trung, diễn đàn đầu tư & vé QR',
    descEn: 'Viet – China trade fairs, forums & QR tickets',
    link: '/events'
  },
  {
    id: 'qa-8',
    icon: 'ti-sparkles',
    title: 'Trợ lý AI Đa ngôn ngữ',
    titleEn: 'Multilingual AI Assistant',
    desc: 'Tư vấn đầu tư, thương mại & du lịch 24/7',
    descEn: '24/7 AI advisor in VI, EN, ZH, JA, KO',
    link: '/ai-chat'
  }
];

// 4 Hành trình Trải nghiệm Thông minh ("Mỗi du khách ở lại lâu hơn, trải nghiệm sâu hơn" - Chương 17 & 19)
const SMART_ITINERARIES = [
  {
    id: '1d',
    tabLabel: 'Hành trình 1 Ngày',
    tabLabelEn: '1-Day Express',
    icon: 'ti-sun-high',
    badge: 'TRẢI NGHIỆM TRONG NGÀY • CỬA KHẨU & ĐỈNH THIÊNG',
    badgeEn: '1-DAY HIGHLIGHT • BORDER GATE & SACRED PEAK',
    title: 'Lào Cai – Sa Pa – Đỉnh Thiêng Fansipan Trong 1 Ngày Trọn Vẹn',
    titleEn: 'Lao Cai City – Sa Pa – Fansipan Summit in 1 Complete Day',
    summary: 'Hành trình tối ưu cho du khách và đoàn công tác kết hợp tham quan Cửa khẩu Quốc tế Lào Cai, Đền Thượng linh thiêng và chinh phục Nóc nhà Đông Dương 3.143m.',
    summaryEn: 'Optimal itinerary for visitors and business delegations combining Lao Cai International Border Gate, Thuong Temple, and conquering the 3,143m Roof of Indochina.',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85',
    duration: '1 Ngày (07:30 – 21:00)',
    budget: '1.450.000 – 2.200.000 VNĐ',
    suitability: 'Khách công vụ, Gia đình, Cặp đôi',
    aiPrompt: 'Hãy thiết kế chi tiết lịch trình khám phá TP. Lào Cai - Sa Pa - Đỉnh Fansipan trong 1 ngày kèm gợi ý nhà hàng cá hồi ngon',
    steps: [
      { time: '07:30 - 09:30', title: 'TP. Lào Cai – Cột mốc Biên giới & Đền Thượng', desc: 'Dâng hương tại Đền Thượng cổ kính nơi ngã ba sông Hồng – Nậm Thi, tham quan Cửa khẩu Quốc tế Lào Cai & Khu thương mại Kim Thành.' },
      { time: '10:00 - 14:30', title: 'Cáp treo Fansipan & Quần thể Tâm linh trên Mây', desc: 'Di chuyển lên Sa Pa (35 phút), đi tàu hỏa leo núi Mường Hoa và cáp treo 3 dây chinh phục đỉnh Fansipan 3.143m, thưởng thức buffet vùng cao.' },
      { time: '15:00 - 18:00', title: 'Bản Cát Cát & Thác Tiên Sa', desc: 'Dạo bước giữa thung lũng ruộng bậc thang, khám phá nghề dệt thổ cẩm, chạm bạc truyền thống của đồng bào H’Mông.' },
      { time: '18:30 - 21:00', title: 'Ẩm thực Cá hồi Nước lạnh & Phố Đêm Sa Pa', desc: 'Thưởng thức lẩu cá hồi – cá tầm nước lạnh Sa Pa, dạo quanh Nhà thờ Đá và không gian văn hóa Chợ đêm Tây Bắc.' }
    ]
  },
  {
    id: '2d1n',
    tabLabel: '2 Ngày 1 Đêm (Phổ biến)',
    tabLabelEn: '2 Days 1 Night (Popular)',
    icon: 'ti-cloud',
    badge: 'LỊCH TRÌNH ĐƯỢC YÊU THÍCH NHẤT • SĂN MÂY & NGHỈ DƯỠNG',
    badgeEn: 'MOST POPULAR • CLOUD HUNTING & HIGHLAND RESORT',
    title: 'Sa Pa – Fansipan – Thung Lũng Mường Hoa – Đèo Ô Quy Hồ (2N1Đ)',
    titleEn: 'Sa Pa – Fansipan – Muong Hoa Valley – O Quy Ho Pass (2D1N)',
    summary: 'Trải nghiệm trọn vẹn 4 mùa trong một ngày tại Sa Pa: săn biển mây trên đỉnh Hoàng Liên, tắm lá thuốc người Dao Đỏ Tả Phìn và tận hưởng hoàng hôn trên Tứ đại đỉnh đèo Ô Quy Hồ.',
    summaryEn: 'Experience four seasons in a single day: cloud hunting on Hoang Lien peaks, Red Dao herbal bath in Ta Phin, and sunset over O Quy Ho Pass.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm',
    budget: '2.800.000 – 4.500.000 VNĐ',
    suitability: 'Gia đình, Nhóm bạn, Nghỉ dưỡng',
    aiPrompt: 'Lập lịch trình du lịch Sa Pa - Fansipan - Mường Hoa - Ô Quy Hồ 2 ngày 1 đêm nghỉ dưỡng kết hợp tắm lá thuốc Dao đỏ',
    steps: [
      { time: 'Ngày 1 - Sáng', title: 'Chinh phục Đỉnh Thiêng Fansipan & Vườn Hoa Đỗ Quyên', desc: 'Check-in Cổng Trời Thanh Vân Đắc Lộ, Đại tượng Phật A Di Đà và cột cờ Nóc nhà Đông Dương giữa biển mây bồng bềnh.' },
      { time: 'Ngày 1 - Chiều & Tối', title: 'Thung lũng Mường Hoa – Tắm lá thuốc Dao Đỏ & Kinh tế đêm', desc: 'Khám phá bãi đá cổ Sa Pa tại bản Lao Chải – Tả Van, ngâm bồn gỗ Pơ-mu lá thuốc cổ truyền và thưởng thức đồ nướng, thắng cố đêm sương.' },
      { time: 'Ngày 2 - Sáng', title: 'Đèo Ô Quy Hồ – Thác Bạc – Cầu Kính Rồng Mây', desc: 'Chinh phục một trong Tứ đại đỉnh đèo hùng vĩ nhất Việt Nam ở độ cao 2.000m, ngắm dãy Hoàng Liên Sơn trùng điệp.' },
      { time: 'Ngày 2 - Chiều', title: 'Bản Tả Phìn & Mua sắm Đặc sản OCOP Lào Cai', desc: 'Trải nghiệm hái dâu, thưởng thức cao mềm Atiso Sa Pa, trà Shan Tuyết cổ thụ, thịt trâu gác bếp và tương ớt Mường Khương chuẩn OCOP.' }
    ]
  },
  {
    id: '3d2n',
    tabLabel: '3 Ngày 2 Đêm (Chuyên sâu)',
    tabLabelEn: '3 Days 2 Nights (Deep)',
    icon: 'ti-map-route',
    badge: 'VÒNG CUNG DI SẢN TÂY BẮC • SA PA – Y TÝ – BẮC HÀ',
    badgeEn: 'NORTHWEST HERITAGE LOOP • SA PA – Y TY – BAC HA',
    title: 'Hành Trình Di Sản: Sa Pa – Đại Ngàn Y Tý – Cao Nguyên Trắng Bắc Hà (3N2Đ)',
    titleEn: 'Heritage Loop: Sa Pa – Y Ty Cloud Paradise – Bac Ha White Plateau (3D2N)',
    summary: 'Hành trình thực hiện hóa chiến lược "Ở lại lâu hơn, trải nghiệm sâu hơn": Kết nối Sa Pa sầm uất với biển mây nguyên sơ Y Tý (Bát Xát) và sắc màu phiên chợ vùng cao Bắc Hà.',
    summaryEn: 'Realizing the "Stay longer, experience deeper" strategy: Connecting vibrant Sa Pa with pristine Y Ty cloud seas and colorful Bac Ha highland markets.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
    duration: '3 Ngày 2 Đêm',
    budget: '4.200.000 – 6.800.000 VNĐ',
    suitability: 'Khách quốc tế, Nhiếp ảnh, Khám phá văn hóa',
    aiPrompt: 'Tư vấn lịch trình 3 ngày 2 đêm khám phá Sa Pa - Săn mây Y Tý - Chợ phiên Bắc Hà và Dinh Hoàng A Tưởng',
    steps: [
      { time: 'Ngày 1', title: 'Sa Pa – Đỉnh Fansipan – Đèo Ô Quy Hồ – Mường Hum', desc: 'Tham quan đỉnh Fansipan buổi sáng, chiều vượt cung đường đèo Ô Quy Hồ – Mường Hum ngắm ruộng bậc thang A Lù, nghỉ đêm homestay trình tường tại Y Tý.' },
      { time: 'Ngày 2', title: 'Săn mây Ngải Thầu Thượng – Công viên Choản Thèn (Y Tý)', desc: 'Đón bình minh trên biển mây Y Tý ở độ cao 2.300m, tìm hiểu kiến trúc nhà trình tường độc đáo của người Hà Nhì Đen và cột mốc biên giới Lũng Pô nơi con sông Hồng chảy vào đất Việt.' },
      { time: 'Ngày 3', title: 'Cao nguyên trắng Bắc Hà – Dinh Hoàng A Tưởng – Chè Shan Tuyết', desc: 'Hòa mình vào phiên chợ vùng cao Bắc Hà rực rỡ thổ cẩm, tham quan Dinh thự Vua Mèo Hoàng A Tưởng, thưởng thức phở hồng, rượu ngô Bản Phố và vùng chè cổ thụ Bản Liền.' },
      { time: 'Kết thúc', title: 'Đền Bảo Hà (Ông Hoàng Bảy) & Cao tốc Nội Bài – Lào Cai', desc: 'Chiêm bái di tích quốc gia Đền Bảo Hà bên dòng sông Hồng trước khi trở về theo tuyến cao tốc hiện đại.' }
    ]
  },
  {
    id: 'biz',
    tabLabel: 'Khảo sát Đầu tư & Giao thương',
    tabLabelEn: 'Investment & Trade Mission',
    icon: 'ti-briefcase',
    badge: 'DÀNH CHO NHÀ ĐẦU TƯ & ĐOÀN DOANH NGHIỆP B2B',
    badgeEn: 'FOR INVESTORS & B2B ENTERPRISE DELEGATIONS',
    title: 'Hành Trình Xúc Tiến Đầu Tư: KKT Cửa Khẩu Kim Thành – KCN Tằng Loỏng – Vùng Dược Liệu',
    titleEn: 'Investment Mission: Kim Thanh Border Zone – Tang Loong IP – Herbal Zones',
    summary: 'Chương trình khảo sát thực địa dành cho các tập đoàn, quỹ đầu tư và đối tác xuất nhập khẩu muốn kết nối trực tiếp với Ban Quản lý Khu kinh tế và doanh nghiệp chủ lực Lào Cai.',
    summaryEn: 'Field survey program for corporations, investment funds, and trade partners connecting directly with Lao Cai Economic Zone Authority and flagship enterprises.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm (B2B)',
    budget: 'Theo đoàn công tác / Hỗ trợ kết nối',
    suitability: 'Nhà đầu tư, Doanh nghiệp XNK, Hiệp hội',
    aiPrompt: 'Tôi muốn tìm hiểu quy trình khảo sát đầu tư tại Khu kinh tế cửa khẩu Lào Cai, KCN Tằng Loỏng và chính sách ưu đãi thuế',
    steps: [
      { time: 'Phiên 1', title: 'Khảo sát Cửa khẩu Quốc tế Kim Thành & Ga Đường sắt Liên vận', desc: 'Tham quan thực tế luồng thông quan điện tử, kho ngoại quan, trung tâm kiểm dịch nông sản xuất nhập khẩu Việt – Trung và quy hoạch Cảng cạn ICD.' },
      { time: 'Phiên 2', title: 'Làm việc tại KCN Đông Phố Mới, KCN Tằng Loỏng & KCN Võ Lao', desc: 'Khảo sát quỹ đất sạch công nghiệp chế biến sâu, hạ tầng điện – nước – logistics và tọa đàm với Ban Quản lý Khu kinh tế tỉnh Lào Cai.' },
      { time: 'Phiên 3', title: 'Khảo sát Vùng Dược liệu GACP-WHO & Tổ hợp Du lịch Sa Pa', desc: 'Tham quan mô hình chuỗi giá trị dược liệu công nghệ cao, nhà máy chiết xuất Atiso – tam thất và các dự án bất động sản nghỉ dưỡng sinh thái.' },
      { time: 'Phiên 4', title: 'Phiên Kết nối B2B (Business Matching) & Ký kết MOU', desc: 'Gặp gỡ trực tiếp các doanh nghiệp hội viên Diamond/Gold trong mạng lưới Laocai.today và nhận bộ hồ sơ Data Room dự án.' }
    ]
  }
];

// Dữ liệu Hành lang Kinh tế Côn Minh – Lào Cai – Hà Nội – Hải Phòng & Cửa khẩu số
const TRADE_CORRIDOR_NODES = [
  {
    id: 0,
    step: 'CHẶNG 01',
    name: 'Côn Minh (Vân Nam) & Tây Nam Trung Quốc',
    nameEn: 'Kunming (Yunnan) & Southwest China Hub',
    sub: 'Thị trường 400+ triệu dân & Nguồn hàng xuất nhập khẩu',
    subEn: '400M+ Consumer Market & Import-Export Sourcing',
    icon: 'ti-building-skyscraper',
    metric: '400M+',
    metricLbl: 'Dân số tiếp cận',
    metricLblEn: 'Market Reach',
    highlight: 'Điểm khởi nguồn hành lang kinh tế nối tỉnh Vân Nam và vùng Tây Nam Trung Quốc trực tiếp đến biên giới Lào Cai. Nhu cầu khổng lồ về nông sản, trái cây nhiệt đới, thủy hải sản và khoáng sản chế biến từ Việt Nam & ASEAN.',
    highlightEn: 'Starting origin of the economic corridor connecting Yunnan and Southwest China to Lao Cai. Huge demand for tropical agricultural produce, seafood, and processed minerals from ASEAN.',
    tags: ['Thị trường Tây Nam Trung Quốc', 'Vân Nam ⇄ Lào Cai', 'Thương mại song phương'],
    tagsEn: ['Southwest China Market', 'Yunnan ⇄ Lao Cai', 'Bilateral Trade'],
    stats: [
      { label: 'Quy mô thị trường', labelEn: 'Market Size', val: '400+ Triệu dân' },
      { label: 'Kết nối cao tốc', labelEn: 'Expressway', val: 'Côn Minh – Hà Khẩu' },
      { label: 'Tuyến đường sắt', labelEn: 'Rail Corridor', val: 'Khổ 1.435mm chuẩn' },
      { label: 'Mặt hàng trọng điểm', labelEn: 'Key Produce', val: 'Nông sản • Phân bón' }
    ]
  },
  {
    id: 1,
    step: 'CHẶNG 02',
    name: 'Cửa Khẩu Quốc Tế Kim Thành & Ga Quốc Tế Lào Cai',
    nameEn: 'Kim Thanh Intl Border Gate & Rail Port',
    sub: 'Tâm điểm thông quan số & Kho lạnh liên vận quốc tế',
    subEn: 'Digital Customs & Cold-Chain Rail Hub',
    icon: 'ti-truck-delivery',
    metric: '4,5+ Tỷ USD',
    metricLbl: 'Mục tiêu kim ngạch',
    metricLblEn: 'Target Turnover',
    highlight: 'Hạ tầng cửa khẩu thông minh hiện đại nhất miền Bắc: phân luồng tự động, kho lạnh bảo quản nông sản tươi, trạm kiểm dịch một cửa và ga đường sắt liên vận trực tiếp sang ga Hà Khẩu Bắc đi sâu vào mạng lưới Á – Âu.',
    highlightEn: 'State-of-the-art smart border gate: automatic vehicle dispatching, cold-chain storage for fresh fruits, single-window quarantine, and international rail link connecting to the Eurasian network.',
    tags: ['Cửa khẩu số thông minh', 'Kho lạnh nông sản tươi', 'Đường sắt liên vận Á – Âu'],
    tagsEn: ['Smart Digital Border', 'Agri Cold Storage', 'Eurasian Rail Link'],
    stats: [
      { label: 'Thời gian thông quan', labelEn: 'Clearance Time', val: 'Chỉ 3 - 5 Phút' },
      { label: 'Năng lực thông xe', labelEn: 'Truck Capacity', val: '1.200+ Xe/Ngày' },
      { label: 'Nền tảng cửa khẩu', labelEn: 'Platform', val: 'Cửa khẩu số 24/7' },
      { label: 'Phương thức', labelEn: 'Modality', val: 'Đường bộ & Đường sắt' }
    ]
  },
  {
    id: 2,
    step: 'CHẶNG 03',
    name: 'Khu Kinh Tế Cửa Khẩu Lào Cai (15.929 ha) & KCN Tằng Loỏng',
    nameEn: 'Lao Cai Border EZ (15,929 ha) & Tang Loong IP',
    sub: 'Gia công xuất khẩu, kho ngoại quan & chế biến sâu',
    subEn: 'Export Processing, Bonded Hub & Mineral Refining',
    icon: 'ti-building-factory-2',
    metric: '15.929 ha',
    metricLbl: 'Quy mô KKT Cửa khẩu',
    metricLblEn: 'EZ Total Area',
    highlight: 'Một trong 8 Khu kinh tế cửa khẩu trọng điểm quốc gia, ưu đãi thuế TNDN 10% trong 15 năm. Trung tâm công nghiệp chế biến sâu khoáng sản Tằng Loỏng, logistics hậu cần Kim Thành – Bản Vược và công nghiệp sạch Đông Phố Mới.',
    highlightEn: 'One of Vietnam’s 8 key national border economic zones with 10% corporate income tax incentives for 15 years. Mineral refining at Tang Loong IP and smart logistics at Kim Thanh – Ban Vua.',
    tags: ['8 KKT Trọng điểm Quốc gia', 'Thuế ưu đãi 10%', 'Kho ngoại quan & Chế biến'],
    tagsEn: ['Top 8 National EZs', '10% Tax Incentive', 'Bonded & Processing Hub'],
    stats: [
      { label: 'Diện tích quy hoạch', labelEn: 'Planned Area', val: '15.929 Hécta' },
      { label: 'KCN Tằng Loỏng', labelEn: 'Tang Loong IP', val: '1.100 Hécta' },
      { label: 'Chính sách ưu đãi', labelEn: 'Incentive Policy', val: 'Ưu đãi cao nhất' },
      { label: 'Định hướng', labelEn: 'Orientation', val: 'Công nghiệp Xanh' }
    ]
  },
  {
    id: 3,
    step: 'CHẶNG 04',
    name: 'Cao Tốc Nội Bài – Lào Cai & Cảng Hàng Không Sa Pa',
    nameEn: 'Noi Bai – Lao Cai Expressway & Sa Pa Airport',
    sub: 'Trục động lực dọc sông Hồng & Cảng hàng không cấp 4C',
    subEn: 'Red River Artery & 4C-Class Regional Airport',
    icon: 'ti-plane-departure',
    metric: '3,0 Triệu',
    metricLbl: 'Khách sân bay/năm',
    metricLblEn: 'Pax/Year Capacity',
    highlight: 'Tuyến cao tốc 265 km rút ngắn thời gian di chuyển từ Hà Nội lên Lào Cai chỉ còn hơn 3 giờ. Cảng hàng không Sa Pa (Cam Cọn – Bảo Yên) cấp 4C với công suất 3 triệu khách/năm mở toang cánh cửa kết nối đối tác toàn cầu.',
    highlightEn: 'The 265 km expressway cuts travel time from Hanoi to Lao Cai to 3.5 hours. Sa Pa 4C-class Airport (3M passengers/year) unlocks direct worldwide access for investors and high-end tourists.',
    tags: ['Cao tốc 4-6 làn xe', 'Sân bay Sa Pa 4C', 'Trục dọc Sông Hồng'],
    tagsEn: ['4-6 Lane Expressway', 'Sa Pa 4C Airport', 'Red River Corridor'],
    stats: [
      { label: 'Thời gian Hà Nội', labelEn: 'Hanoi Transit', val: '3,5 Giờ cao tốc' },
      { label: 'Cấp sân bay', labelEn: 'Airport Standard', val: 'Chuẩn 4C ICAO' },
      { label: 'Vận tải hàng hóa', labelEn: 'Air Cargo', val: 'Logistics Hàng không' },
      { label: 'Tiến độ kết nối', labelEn: 'Connectivity', val: 'Hoàn thiện 2026' }
    ]
  },
  {
    id: 4,
    step: 'CHẶNG 05',
    name: 'Hà Nội – Cảng Biển Quốc Tế Hải Phòng & ASEAN',
    nameEn: 'Hanoi – Hai Phong Deep Seaport & ASEAN',
    sub: 'Cửa ngõ vươn ra đại dương & Chuỗi cung ứng toàn cầu',
    subEn: 'Ocean Deep Seaport & Global Supply Chains',
    icon: 'ti-anchor',
    metric: '100M+ Tấn',
    metricLbl: 'Năng lực cảng biển',
    metricLblEn: 'Seaport Capacity',
    highlight: 'Cảng nước sâu quốc tế Lạch Huyện – Hải Phòng tiếp nhận tàu trọng tải 150.000 DWT đi trực tiếp châu Mỹ, châu Âu. Đưa Lào Cai trở thành "hạt nhân cầu nối" vận tải đa phương thức xuyên biên giới Á – Âu và ASEAN.',
    highlightEn: 'Hai Phong Lach Huyen deep seaport accommodates 150,000 DWT container vessels to US/EU routes, positioning Lao Cai as the vital multimodal bridge between ASEAN and Southwest China.',
    tags: ['Cảng nước sâu Lạch Huyện', 'Kết nối ASEAN - TQ', 'Vận tải Biển toàn cầu'],
    tagsEn: ['Deep Seaport Lach Huyen', 'ASEAN - China Link', 'Global Maritime Trade'],
    stats: [
      { label: 'Thời gian tới Cảng', labelEn: 'Port Transit', val: '5 - 6 Giờ xe chạy' },
      { label: 'Tàu tiếp nhận', labelEn: 'Vessel Capacity', val: '150.000 DWT' },
      { label: 'Tuyến hàng hải', labelEn: 'Shipping Routes', val: 'Đi thẳng Mỹ & EU' },
      { label: 'Hệ thống vận hành', labelEn: 'System', val: 'Đa phương thức' }
    ]
  }
];

// Bộ ảnh dự phòng chất lượng cao mang đậm cảnh sắc Lào Cai (Fansipan, ruộng bậc thang, cửa khẩu, dược liệu)
const FALLBACK_POST_IMAGES = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85'
];

// Hàm lấy ảnh bài viết an toàn
const getPostThumb = (post, index = 0) => {
  if (!post) return FALLBACK_POST_IMAGES[index % FALLBACK_POST_IMAGES.length];
  const candidate = post.image_url || post.thumbnail || post.cover_image;
  if (candidate && typeof candidate === 'string' && candidate.trim() !== '' && candidate !== 'null' && candidate !== 'undefined') {
    return candidate.trim();
  }
  return FALLBACK_POST_IMAGES[index % FALLBACK_POST_IMAGES.length];
};

export const Home = () => {
  const { role, user, token } = useAuth();
  const { currentLang, t } = useTranslation();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập thực tế
  const memberToken = typeof window !== 'undefined' ? localStorage.getItem('member_token') : null;
  const isActuallyLoggedIn = Boolean((role && role !== 'guest' && user) || memberToken);
  const isLoggedIn = isActuallyLoggedIn;

  // Lấy thông tin user từ context hoặc localStorage
  const effectiveUser = useMemo(() => {
    if (user) return user;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('member_user');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  }, [user]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');

  // Hero Site-wide Search Bar State
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // Smart Itinerary Active Tab State (Chương 17 & 19)
  const [activeItineraryId, setActiveItineraryId] = useState('2d1n');
  const currentItinerary = useMemo(() => {
    return SMART_ITINERARIES.find(item => item.id === activeItineraryId) || SMART_ITINERARIES[0];
  }, [activeItineraryId]);

  // Hero Ambient Background Video State & Refs (Lao Cai Exclusive Background Video)
  const [isHeroInView, setIsHeroInView] = useState(true);
  const heroSectionRef = useRef(null);
  const heroBgVideoRef = useRef(null);

  const heroVideoPoster = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1280&q=85';
  const heroBgVideoSrc = '/videos/hero_bg_laocai.mp4';

  useEffect(() => {
    const sectionEl = heroSectionRef.current;
    if (!sectionEl || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const bgVideo = heroBgVideoRef.current;
    if (!bgVideo) return;
    bgVideo.muted = true;
    if (isHeroInView) {
      const p = bgVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      bgVideo.pause();
    }
  }, [isHeroInView, heroBgVideoSrc]);

  // AI Special Topic Slider (Single Card 5s infinite auto-cycle)
  const [aiSlideIndex, setAiSlideIndex] = useState(0);
  const [isAiSlideHovered, setIsAiSlideHovered] = useState(false);

  useEffect(() => {
    if (isAiSlideHovered) return;
    const interval = setInterval(() => {
      setAiSlideIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAiSlideHovered]);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Investment Projects Filter State
  const [selectedSector, setSelectedSector] = useState('all');

  // State Hành lang Kinh tế Côn Minh – Lào Cai – Hải Phòng
  const [activeCorridorNode, setActiveCorridorNode] = useState(1); // Mặc định: Kim Thành & Ga quốc tế

  // Form Tư vấn & Hợp tác đầu tư (POST /api/leads)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Lào Cai',
    serviceNeed: 'Đầu tư Khu kinh tế cửa khẩu & Logistics Lào Cai',
    companyName: '',
    notes: '',
    agreeTerms: true
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Quick Event Registration Modal State
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    quantity: 1,
    createAccount: false,
    accountLogin: '',
    accountPassword: '',
    accountConfirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accountNotice, setAccountNotice] = useState('');
  const [accountWarning, setAccountWarning] = useState('');
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState(null);
  const [paidFlowStep, setPaidFlowStep] = useState('transfer');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Dynamic Live Posts
  const [latestPosts, setLatestPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('laocai_cached_home_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_POSTS;
  });
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Dynamic Live Events
  const [eventsList, setEventsList] = useState(() => {
    try {
      const cached = localStorage.getItem('laocai_cached_home_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_EVENTS;
  });

  // Dynamic Live Members
  const [featuredMembers, setFeaturedMembers] = useState(() => {
    try {
      const cached = localStorage.getItem('laocai_cached_home_members');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_MEMBERS;
  });

  // Dữ liệu và ảnh bìa trực tiếp của 3 bài viết chuyên đề AI
  const [aiTopicPosts, setAiTopicPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('laocai_cached_ai_topic_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return { wardAi: null, orion: null, edunow: null };
  });

  // Tải dữ liệu song song từ API (Promise.allSettled) có Timeout 8s
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [postsRes, eventsRes, membersRes] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=12', {}, 8000),
          fetchJsonWithTimeout('/api/events?limit=4', {}, 8000),
          fetchJsonWithTimeout('/api/members?limit=4', {}, 8000)
        ]);

        if (isMounted) {
          if (postsRes.status === 'fulfilled' && postsRes.value?.success && Array.isArray(postsRes.value.data) && postsRes.value.data.length > 0) {
            setLatestPosts(postsRes.value.data);
            try {
              localStorage.setItem('laocai_cached_home_posts', JSON.stringify(postsRes.value.data));
            } catch (e) {}
          }
          if (eventsRes.status === 'fulfilled' && eventsRes.value?.success && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0) {
            setEventsList(eventsRes.value.data);
            try {
              localStorage.setItem('laocai_cached_home_events', JSON.stringify(eventsRes.value.data));
            } catch (e) {}
          }
          if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value.data) && membersRes.value.data.length > 0) {
            setFeaturedMembers(membersRes.value.data);
            try {
              localStorage.setItem('laocai_cached_home_members', JSON.stringify(membersRes.value.data));
            } catch (e) {}
          }
        }

        // Tải đồng thời 3 bài viết chuyên đề AI
        const aiTargets = [
          { key: 'wardAi', slug: 'tro-ly-ai-phuong-xa' },
          { key: 'orion', slug: 'orion-chat-loc-tinh-hoa-cua-erp-multimodel-ai-va-nen-tang-xay-dung-ai-agent-de-tao-thanh-mot-he-dieu-hanh-quan-tri-thong-minh-danh-cho-doanh-nghiep' },
          { key: 'edunow', slug: 'edunowai-giai-phap-tro-ly-ai-tuyen-sinh-thong-minh-danh-cho-cac-co-so-giao-duc' }
        ];
        Promise.allSettled(
          aiTargets.map(t => fetchJsonWithTimeout(`/api/posts/${encodeURIComponent(t.slug)}`, {}, 6000))
        ).then(aiResults => {
          if (!isMounted) return;
          const aiMap = {};
          aiTargets.forEach((t, i) => {
            const res = aiResults[i];
            if (res.status === 'fulfilled' && res.value?.success && res.value?.data) {
              aiMap[t.key] = res.value.data;
            }
          });
          if (Object.keys(aiMap).length > 0) {
            setAiTopicPosts(prev => {
              const merged = { ...prev, ...aiMap };
              try {
                localStorage.setItem('laocai_cached_ai_topic_posts', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('Lỗi tải dữ liệu động trang chủ:', err);
      }
    };
    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // Hiệu ứng cuộn lướt (Scroll Reveal)
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else {
            entry.target.classList.remove('is-revealed');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => observer.observe(el));
    };

    observeAll();
    const t1 = setTimeout(observeAll, 300);
    const t2 = setTimeout(observeAll, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [latestPosts, filteredDestinations, featuredMembers, eventsList, activeItineraryId]);

  // Xử lý Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchScope === 'members') {
        navigate(`/members?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchScope === 'events') {
        navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Cuộn mượt xuống Form Tư vấn & Tự động gán lĩnh vực quan tâm
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
      alert(currentLang === 'en' ? 'Please fill in Name, Phone, and Company (*)' : 'Vui lòng điền Họ tên, Số điện thoại và Tên tổ chức/doanh nghiệp (*)');
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
          notes: `Lĩnh vực quan tâm: ${formData.serviceNeed}. Ghi chú: ${formData.notes || 'Không có'}`
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

  // Xử lý mở Modal đăng ký vé
  const handleOpenRegisterModal = (evt) => {
    if (!evt) return;
    setRegisterModalEvent(evt);
    setRegSuccessData(null);
    setPaidFlowStep('transfer');
    setProofFile(null);
    setProofPreview('');
    setAccountNotice('');
    setAccountWarning('');
    if (isActuallyLoggedIn && effectiveUser) {
      setRegForm({
        fullName: effectiveUser.contact_name || effectiveUser.name || '',
        phone: effectiveUser.phone || '',
        email: effectiveUser.email || '',
        company: effectiveUser.name || '',
        quantity: 1,
        createAccount: false,
        accountLogin: '',
        accountPassword: '',
        accountConfirmPassword: ''
      });
    } else {
      setRegForm({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        quantity: 1,
        createAccount: false,
        accountLogin: '',
        accountPassword: '',
        accountConfirmPassword: ''
      });
    }
  };

  const handleCloseModal = () => {
    setRegisterModalEvent(null);
    setRegSuccessData(null);
    setPaidFlowStep('transfer');
    setProofFile(null);
    setProofPreview('');
    setAccountNotice('');
    setAccountWarning('');
  };

  const verifyAccountNotExists = async (phoneToCheck, emailToCheck, loginToCheck) => {
    if (isActuallyLoggedIn) {
      setAccountWarning('');
      return true;
    }
    const p = (phoneToCheck !== undefined ? phoneToCheck : regForm.phone).trim();
    const e = (emailToCheck !== undefined ? emailToCheck : regForm.email).trim();
    const u = (loginToCheck !== undefined ? loginToCheck : regForm.accountLogin).trim();

    if (!p && !e && !u) {
      setAccountWarning('');
      return true;
    }

    try {
      setCheckingAccount(true);
      const res = await fetch('/api/events/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, email: e, username: u })
      });
      const data = await res.json();
      if (data.exists) {
        setAccountWarning(data.message || 'Email hoặc Số điện thoại này đã được đăng ký tài khoản trong hệ thống. Vui lòng kiểm tra lại hoặc đăng nhập trước khi mua vé.');
        return false;
      } else {
        setAccountWarning('');
        return true;
      }
    } catch {
      return true;
    } finally {
      setCheckingAccount(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('Dung lượng ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitPaymentProof = async () => {
    if (!proofFile || !regSuccessData?.id) {
      alert('Vui lòng tải lên ảnh chụp màn hình giao dịch chuyển khoản thành công.');
      return;
    }
    setUploadingProof(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const res = await fetch(`/api/events/registrations/${regSuccessData.id}/payment-proof`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: proofFile.name,
              base64Data,
              ticket_code: regSuccessData.ticket_code
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setPaidFlowStep('pending_approval');
          } else {
            alert(data.error || 'Không thể gửi ảnh chuyển khoản.');
          }
        } catch (err) {
          alert('Lỗi gửi ảnh chuyển khoản: ' + err.message);
        } finally {
          setUploadingProof(false);
        }
      };
      reader.readAsDataURL(proofFile);
    } catch (err) {
      setUploadingProof(false);
      alert('Lỗi đọc tệp ảnh: ' + err.message);
    }
  };

  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerModalEvent) return;

    if (!regForm.fullName.trim() || !regForm.phone.trim()) {
      alert('Vui lòng điền Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    if (!isActuallyLoggedIn) {
      const isAvailable = await verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
      if (!isAvailable) {
        alert(accountWarning || 'Email hoặc Số điện thoại này đã được đăng ký tài khoản trong hệ thống. Vui lòng kiểm tra lại thông tin.');
        return;
      }
    }

    if (!isActuallyLoggedIn && regForm.createAccount) {
      const login = regForm.accountLogin.trim() || regForm.phone.trim() || regForm.email.trim();
      if (!login) {
        alert('Vui lòng nhập Tài khoản (Email hoặc Số điện thoại) để tạo tài khoản theo dõi vé.');
        return;
      }
      if (!regForm.accountPassword) {
        alert('Vui lòng nhập mật khẩu cho tài khoản theo dõi vé.');
        return;
      }
      if (regForm.accountPassword.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (regForm.accountPassword !== regForm.accountConfirmPassword) {
        alert('Mật khẩu xác nhận không khớp. Vui lòng nhập lại chính xác.');
        return;
      }
    }

    setSubmittingReg(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const authToken = memberToken || token;
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;

      const res = await fetch(`/api/events/${registerModalEvent.id}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: regForm.fullName.trim(),
          phone: regForm.phone.trim(),
          email: regForm.email.trim() || null,
          company: regForm.company.trim() || null,
          quantity: parseInt(regForm.quantity, 10) || 1,
          member_id: effectiveUser?.id || user?.id || null,
          create_account: isActuallyLoggedIn ? false : regForm.createAccount,
          account_login: regForm.accountLogin.trim() || regForm.phone.trim() || regForm.email.trim(),
          account_password: regForm.accountPassword,
          account_confirm_password: regForm.accountConfirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccessData(data.registration);
        setPaidFlowStep('transfer');
        setProofFile(null);
        setProofPreview('');
        if (data.account_message) {
          setAccountNotice(data.account_message);
        }
      } else {
        alert(data.error || 'Đăng ký vé chưa thành công');
      }
    } catch (err) {
      console.error('Register ticket error:', err);
      alert('Có lỗi kết nối khi đăng ký vé: ' + err.message);
    } finally {
      setSubmittingReg(false);
    }
  };

  // 5 Câu hỏi thường gặp (Bản sắc Laocai.today)
  const faqs = [
    {
      q: currentLang === 'en' ? 'What is Laocai.today and who does it serve?' : 'Laocai.today là gì và phục vụ những nhóm đối tượng nào?',
      a: currentLang === 'en' 
        ? 'Laocai.today is the cooperation, investment promotion, and regional branding platform of Lao Cai Province integrated with a Multilingual AI Assistant. It serves tourists, local enterprises, cross-border traders, domestic & foreign investors, and the global Lao Cai community.'
        : 'Laocai.today là nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai tích hợp Trợ lý AI đa ngôn ngữ. Nền tảng phục vụ 5 nhóm chính: Du khách trong nước & quốc tế, Doanh nghiệp & HTX địa phương, Thương nhân xuất nhập khẩu cửa khẩu, Nhà đầu tư chiến lược và Cộng đồng người Lào Cai xa quê.'
    },
    {
      q: currentLang === 'en' ? 'How does the Multilingual AI Assistant help tourists and investors?' : 'Trợ lý AI đa ngôn ngữ trên Laocai.today hỗ trợ du khách và nhà đầu tư như thế nào?',
      a: currentLang === 'en'
        ? 'Powered by Gemini Flash and connected to Lao Cai’s verified database, our AI Assistant communicates fluently in Vietnamese, English, Chinese, Japanese, and Korean. It designs custom 1D/2D1N/3D2N itineraries and matches investors with projects in Kim Thanh Border Zone, Tang Loong IP, and high-tech herbal zones.'
        : 'Trợ lý AI hỗ trợ 5 ngôn ngữ (Việt – Anh – Trung – Nhật – Hàn), kết nối trực tiếp với cơ sở dữ liệu quy hoạch Khu kinh tế cửa khẩu Lào Cai, các khu công nghiệp, danh bạ doanh nghiệp và điểm đến Sa Pa – Bắc Hà – Y Tý để tư vấn lịch trình, thủ tục đầu tư và ghép nối đối tác B2B 24/7.'
    },
    {
      q: currentLang === 'en' ? 'What benefits do Lao Cai businesses receive when joining?' : 'Doanh nghiệp và HTX tại Lào Cai tham gia nền tảng được hưởng quyền lợi gì?',
      a: currentLang === 'en'
        ? 'Enterprises receive a verified Digital Showroom, promote OCOP & medicinal herb products, connect with ASEAN–China buyers, and enjoy instant automatic approval when registering for the Silver tier.'
        : 'Doanh nghiệp được cấp Hồ sơ năng lực số (Showroom số) có dấu xác thực, quảng bá sản phẩm OCOP vùng cao, dược liệu, dịch vụ du lịch – khách sạn – logistics, đăng tin cơ hội giao thương và được duyệt tự động ngay lập tức khi đăng ký gói Silver.'
    },
    {
      q: currentLang === 'en' ? 'How can I register for trade fairs & investment forums with QR tickets?' : 'Làm thế nào để đăng ký tham dự Hội chợ thương mại và Diễn đàn đầu tư bằng vé QR?',
      a: currentLang === 'en'
        ? 'Click "Details & Register" on any upcoming event on the homepage. Enter your contact info to immediately receive an electronic QR ticket on screen for fast check-in at the venue.'
        : 'Quý vị chỉ cần nhấn "Xem chi tiết & Đăng ký" tại mục Sự kiện sắp diễn ra, điền Họ tên và Số điện thoại. Hệ thống sẽ cấp ngay Mã vé điện tử kèm QR Code độc nhất trên màn hình để check-in tự động tại sự kiện.'
    },
    {
      q: currentLang === 'en' ? 'Can I install Laocai.today as an app on my smartphone (PWA)?' : 'Tôi có thể cài đặt Laocai.today như ứng dụng trên điện thoại (PWA) không?',
      a: currentLang === 'en'
        ? 'Yes! Laocai.today supports Progressive Web App (PWA) technology. Tap "Install PWA App" in the menu or footer to add Laocai.today directly to your home screen.'
        : 'Hoàn toàn được! Laocai.today tích hợp công nghệ PWA hiện đại. Quý vị chỉ cần nhấn nút "Cài đặt ứng dụng PWA" trên menu hoặc chân trang để thêm biểu tượng Laocai.today ra màn hình chính điện thoại, truy cập cực nhanh ngay cả khi sóng yếu vùng cao.'
    }
  ];

  // Dữ liệu sự kiện Hero + tối đa 3 Sự kiện phụ
  const heroEvent = (eventsList && eventsList.length > 0) ? eventsList[0] : null;
  const subEvents = useMemo(() => {
    return (eventsList && eventsList.length > 1) ? eventsList.slice(1, 4) : [];
  }, [eventsList]);

  return (
    <div className="daklak-home">
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <Navbar />

      <main id="main-content">
        {/* ========================================================
            SECTION 1: HERO LAOCAI.TODAY — ĐỈNH THIÊNG HỘI TỤ & CỬA NGÕ GIAO THƯƠNG
            ======================================================== */}
        <section className="gt-hero-section" id="home" ref={heroSectionRef}>
          {/* Ambient Background Video */}
          <div className="gt-hero-bg-video-wrap" aria-hidden="true">
            <video
              ref={heroBgVideoRef}
              className="gt-hero-bg-video"
              src={heroBgVideoSrc}
              poster={heroVideoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            <div className="gt-hero-bg-video-overlay" />
          </div>

          {/* Ambient Glow Orbs */}
          <div className="gt-hero-ambient-glow orb-1" aria-hidden="true" />
          <div className="gt-hero-ambient-glow orb-2" aria-hidden="true" />
          <div className="gt-hero-ambient-glow orb-3" aria-hidden="true" />
          <div className="gt-hero-bg-map" aria-hidden="true" />

          <div className="gt-hero-container">
            {/* Left Column: Heading, Subtitle & Action */}
            <div className="gt-hero-left scroll-reveal scroll-reveal-left">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(20, 90, 62, 0.12)',
                border: '1px solid rgba(20, 90, 62, 0.28)',
                color: '#145A3E',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '14px',
                width: 'fit-content'
              }}>
                <i className="ti ti-sparkles" style={{ color: '#D99B26' }} />
                <span>{currentLang === 'en' ? 'LAOCAI.TODAY • AI-POWERED REGIONAL ECOSYSTEM' : 'LAOCAI.TODAY • NỀN TẢNG KẾT NỐI ĐẦU TƯ, GIAO THƯƠNG & DU LỊCH SỐ'}</span>
              </div>

              <h1 className="gt-hero-title">
                {currentLang === 'en' ? 'Discover Lao Cai' : 'Khám phá Lào Cai'}<br />
                <span className="gt-hero-highlight">
                  {currentLang === 'en' ? 'Sacred Peak' : 'Đỉnh Thiêng'}
                  <svg className="gt-highlight-curve" viewBox="0 0 180 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14C45 4 135 4 176 14" stroke="#D99B26" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span> {currentLang === 'en' ? '& Trade Gateway' : '& Cửa Ngõ Quốc Tế'}
              </h1>

              <p className="gt-hero-desc">
                {currentLang === 'en'
                  ? 'Connecting people, enterprises, and global investors to Lao Cai — where the 3,143m Roof of Indochina meets the strategic ASEAN – China economic corridor, precious highland herbs, and vibrant Northwest heritage.'
                  : 'Nền tảng kết nối hợp tác, xúc tiến đầu tư và quảng bá Lào Cai tích hợp Trợ lý AI đa ngôn ngữ — Nơi hội tụ đỉnh thiêng Fansipan 3.143m, cửa ngõ giao thương ASEAN – Trung Quốc, dược liệu quý vùng cao và bản sắc Tây Bắc.'}
              </p>

              <div className="gt-hero-action-row">
                <a 
                  href="#tin-tuc-tieu-diem" 
                  className="gt-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('tin-tuc-tieu-diem');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <i className="ti ti-chart-arrows-vertical" />
                  <span>{currentLang === 'en' ? 'Investment & News' : 'Cơ Hội Đầu Tư & Tin Tức'}</span>
                </a>
                <a 
                  href="#hanh-trinh-thong-minh" 
                  className="gt-btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('hanh-trinh-thong-minh');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <i className="ti ti-compass" />
                  <span>{currentLang === 'en' ? 'Smart Itineraries' : 'Hành Trình Du Lịch AI'}</span>
                </a>
                <div className="gt-flight-trail">
                  <svg className="gt-flight-svg" viewBox="0 0 140 40" fill="none">
                    <path d="M5 25 C40 45, 80 5, 125 22" stroke="#D99B26" strokeWidth="2.5" strokeDasharray="6 6" fill="none" />
                    <polygon points="125,22 135,16 131,28" fill="#D99B26" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Translucent Glassmorphic Strategic Pulse Showcase (No Intro Video Player — Lets Background Video Shine) */}
            <div className="gt-hero-visuals scroll-reveal scroll-reveal-right">
              <div style={{
                width: '100%',
                maxWidth: '580px',
                background: 'rgba(9, 27, 20, 0.56)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '24px',
                border: '1px solid rgba(217, 155, 38, 0.42)',
                padding: '24px',
                boxShadow: '0 24px 52px rgba(4, 15, 11, 0.45)',
                color: '#FFFFFF'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '14px',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#34D399',
                      boxShadow: '0 0 10px #34D399',
                      display: 'inline-block'
                    }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.6px', color: '#FFE082', textTransform: 'uppercase' }}>
                      {currentLang === 'en' ? 'LAO CAI STRATEGIC PULSE • LIVE GATEWAY' : 'TÂM ĐIỂM ĐỊA KINH TẾ & BẢN SẮC LÀO CAI'}
                    </span>
                  </div>
                  <span style={{
                    background: 'rgba(217, 155, 38, 0.2)',
                    border: '1px solid rgba(217, 155, 38, 0.45)',
                    color: '#FFE082',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    ASEAN ⇄ KUNMING
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {[
                    {
                      icon: 'ti-mountain',
                      metric: '3.143m',
                      title: currentLang === 'en' ? 'Fansipan Sacred Peak' : 'Đỉnh Thiêng Fansipan',
                      sub: currentLang === 'en' ? 'Sa Pa • Y Ty • Bac Ha 4-Season Tourism' : 'Du lịch quốc tế Sa Pa • Y Tý • Bắc Hà',
                      target: '#kham-pha-dia-danh',
                      accent: '#FFE082'
                    },
                    {
                      icon: 'ti-truck-delivery',
                      metric: '4,5+ Tỷ USD',
                      title: currentLang === 'en' ? 'Kim Thanh Border Gate' : 'Cửa Khẩu Kim Thành',
                      sub: currentLang === 'en' ? 'Kunming – Lao Cai – Hai Phong Corridor' : 'Hành lang Côn Minh – Lào Cai – Hải Phòng',
                      target: '#top-khu-cong-nghiep',
                      accent: '#6EE7B7'
                    },
                    {
                      icon: 'ti-building-factory-2',
                      metric: '120+ Dự Án',
                      title: currentLang === 'en' ? 'Industrial & FDI Hubs' : 'Đầu Tư & KCN Tằng Loỏng',
                      sub: currentLang === 'en' ? 'Deep Processing, Logistics & Clean Energy' : 'Chế biến sâu, Logistics & Năng lượng sạch',
                      target: '#tin-tuc-tieu-diem',
                      accent: '#93C5FD'
                    },
                    {
                      icon: 'ti-plant-2',
                      metric: '260+ OCOP',
                      title: currentLang === 'en' ? 'Highland Herbs & Agro' : 'Dược Liệu & Nông Sản Quý',
                      sub: currentLang === 'en' ? 'Shan Tuyet Tea, Angelica, Artichoke, Salmon' : 'Chè Shan Tuyết, Đương quy, Atiso, Cá hồi',
                      target: '#top-xuat-khau-ca-phe',
                      accent: '#FCA5A5'
                    }
                  ].map((item, idx) => (
                    <a
                      key={idx}
                      href={item.target}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.querySelector(item.target);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        textDecoration: 'none',
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(217, 155, 38, 0.16)';
                        e.currentTarget.style.borderColor = 'rgba(217, 155, 38, 0.55)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="notranslate" translate="no" style={{ fontSize: '1.25rem', fontWeight: 900, color: item.accent }}>
                          {item.metric}
                        </span>
                        <i className={`ti ${item.icon}`} style={{ fontSize: '1.25rem', color: item.accent, opacity: 0.9 }} />
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>{item.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.78)', lineHeight: 1.35 }}>{item.sub}</div>
                    </a>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'rgba(13, 38, 28, 0.72)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#E2ECE7', fontWeight: 600 }}>
                    <i className="ti ti-robot" style={{ color: '#FFE082', fontSize: '1.1rem' }} />
                    <span>{currentLang === 'en' ? 'AI Lao Cai Assistant: Multilingual B2B & Travel Support' : 'Trợ lý AI Lào Cai: Tư vấn đầu tư, cửa khẩu & lịch trình 24/7'}</span>
                  </div>
                  <Link
                    to="/ai-chat"
                    style={{
                      background: 'linear-gradient(135deg, #D99B26 0%, #B87D14 100%)',
                      color: '#091B14',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      padding: '6px 12px',
                      borderRadius: '999px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{currentLang === 'en' ? 'Ask AI Now' : 'Hỏi AI ngay'}</span>
                    <i className="ti ti-arrow-up-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Site-wide Search Bar */}
          <div className="gt-hero-search-wrapper scroll-reveal scroll-reveal-up">
            <form 
              className="gt-hero-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (heroSearchQuery.trim()) {
                  navigate(`/posts?search=${encodeURIComponent(heroSearchQuery.trim())}`);
                }
              }}
            >
              <div className="gt-hero-search-input-group">
                <i className="ti ti-search gt-hero-search-icon" />
                <input
                  type="text"
                  className="gt-hero-search-input"
                  placeholder={currentLang === 'en' ? 'Search Lao Cai: Fansipan, Sa Pa, Kim Thanh Border Gate, industrial parks, OCOP herbs...' : 'Bạn muốn tìm gì tại Lào Cai? (Fansipan, Sa Pa, Cửa khẩu Kim Thành, KCN Tằng Loỏng, dược liệu OCOP...)'}
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                />
                {heroSearchQuery && (
                  <button 
                    type="button" 
                    className="gt-hero-search-clear" 
                    onClick={() => setHeroSearchQuery('')}
                    aria-label="Xóa"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
                <button type="submit" className="gt-hero-search-btn">
                  <span>{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</span>
                  <i className="ti ti-arrow-right" />
                </button>
              </div>
              <div className="gt-hero-search-tags">
                <span className="gt-search-tag-label">{currentLang === 'en' ? 'Trending in Lao Cai:' : 'Từ khóa nổi bật:'}</span>
                {['Khu kinh tế cửa khẩu', 'Fansipan Sa Pa', 'Bắc Hà Y Tý', 'Dược liệu vùng cao', 'Chè Shan Tuyết', 'Đầu tư Lào Cai'].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="gt-search-tag-pill"
                    onClick={() => {
                      setHeroSearchQuery(tag);
                      navigate(`/posts?search=${encodeURIComponent(tag)}`);
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* ========================================================
            SECTION 1.5: 8 LỐI VÀO NHANH HỆ SINH THÁI SỐ LAOCAI.TODAY
            (Theo Chương 12 & 18 Tài liệu Giới thiệu dự án)
            ======================================================== */}
        <section className="laocai-quick-access-section" aria-label="Lối vào nhanh hệ sinh thái Lào Cai">
          <div className="daklak-container">
            <div className="laocai-quick-access-grid">
              {QUICK_ACCESS_ITEMS.map((item, idx) => (
                item.isAnchor ? (
                  <a
                    key={item.id}
                    href={item.link}
                    className={`laocai-qa-card scroll-reveal scroll-reveal-up stagger-${(idx % 4) + 1}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const targetEl = document.querySelector(item.link);
                      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="laocai-qa-icon">
                      <i className={`ti ${item.icon}`} />
                    </div>
                    <div className="laocai-qa-body">
                      <h3 className="laocai-qa-title">{currentLang === 'en' ? item.titleEn : item.title}</h3>
                      <p className="laocai-qa-desc">{currentLang === 'en' ? item.descEn : item.desc}</p>
                    </div>
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={item.link}
                    className={`laocai-qa-card scroll-reveal scroll-reveal-up stagger-${(idx % 4) + 1}`}
                  >
                    <div className="laocai-qa-icon">
                      <i className={`ti ${item.icon}`} />
                    </div>
                    <div className="laocai-qa-body">
                      <h3 className="laocai-qa-title">{currentLang === 'en' ? item.titleEn : item.title}</h3>
                      <p className="laocai-qa-desc">{currentLang === 'en' ? item.descEn : item.desc}</p>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: TIÊU ĐIỂM & TIN TỨC MỚI NHẤT LÀO CAI
            ======================================================== */}
        <section className="news-spotlight-section" id="tin-tuc-tieu-diem">
          <div className="daklak-container">
            <div className="spotlight-header scroll-reveal scroll-reveal-down">
              <div>
                <span className="daklak-section-badge">
                  <i className="ti ti-news" style={{ marginRight: '6px' }} />
                  {currentLang === 'en' ? 'Lao Cai Newsroom & Economic Pulse' : 'Bảng Tin & Tiêu Điểm Thời Sự Lào Cai'}
                </span>
                <h2 className="spotlight-title">
                  {currentLang === 'en' ? 'Latest News, Border Trade & Investment Updates' : 'Tin Tức Mới Nhất & Nhịp Đập Lào Cai Hôm Nay'}
                </h2>
              </div>
              <Link to="/posts" className="spotlight-view-all">
                <span>{currentLang === 'en' ? 'View all articles' : 'Xem tất cả bài viết'}</span>
                <i className="ti ti-arrow-right" />
              </Link>
            </div>

            <div className="spotlight-main-grid">
              {/* Lead Story */}
              {latestPosts.length > 0 && (
                <div className="spotlight-lead-card scroll-reveal scroll-reveal-left" onClick={() => navigate(`/posts/${latestPosts[0].slug || latestPosts[0].id}`)}>
                  <div className="spotlight-lead-img-wrap">
                    <img
                      src={getPostThumb(latestPosts[0], 0)}
                      alt={latestPosts[0].title}
                      onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[0]; }}
                    />
                    <span className="spotlight-lead-badge">{latestPosts[0].category || 'Tiêu Điểm Lào Cai'}</span>
                  </div>
                  <div className="spotlight-lead-content">
                    <div className="spotlight-meta">
                      <span className="spotlight-meta-item">
                        <i className="ti ti-calendar" />
                        {latestPosts[0].created_at ? new Date(latestPosts[0].created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </span>
                      {latestPosts[0].author_name && (
                        <span className="spotlight-meta-item">
                          <i className="ti ti-user" />
                          {latestPosts[0].author_name}
                        </span>
                      )}
                      <span className="spotlight-meta-item spotlight-tag-live">
                        <span className="live-dot" /> Mới cập nhật
                      </span>
                    </div>
                    <h3 className="spotlight-lead-title">{latestPosts[0].title}</h3>
                    <p className="spotlight-lead-summary">
                      {latestPosts[0].summary || latestPosts[0].short_desc || 'Bấm để đọc toàn bộ bài viết, phân tích chuyên sâu về kinh tế cửa khẩu, đầu tư và du lịch Lào Cai...'}
                    </p>
                    <div className="spotlight-lead-cta">
                      <span>Đọc toàn bộ bài viết →</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed tin mới bên phải */}
              <div className="spotlight-feed-list scroll-reveal scroll-reveal-right">
                <div className="spotlight-feed-header">
                  <h4><i className="ti ti-bolt" /> Dòng sự kiện & Cơ hội mới</h4>
                  <span className="feed-counter">{latestPosts.length} bài viết</span>
                </div>

                <div className="spotlight-feed-items">
                  {latestPosts.slice(1, 5).map((post, idx) => (
                    <div
                      key={post.id || post.slug || idx}
                      className="spotlight-feed-item"
                      onClick={() => navigate(`/posts/${post.slug || post.id}`)}
                    >
                      <div className="feed-item-thumb">
                        <img
                          src={getPostThumb(post, idx + 1)}
                          alt={post.title}
                          onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[(idx + 1) % FALLBACK_POST_IMAGES.length]; }}
                        />
                      </div>
                      <div className="feed-item-info">
                        <div className="feed-item-cat">{post.category || 'Tin tức Lào Cai'}</div>
                        <h5 className="feed-item-title">{post.title}</h5>
                        <span className="feed-item-time">
                          <i className="ti ti-clock" />
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {latestPosts.length <= 1 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Đang đồng bộ hóa dữ liệu bài viết mới...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 3 bài tiếp theo dạng cards */}
            {latestPosts.length > 5 && (
              <div className="spotlight-sub-grid">
                {latestPosts.slice(5, 8).map((post, idx) => (
                  <div
                    key={post.id || post.slug || idx}
                    className="spotlight-sub-card"
                    onClick={() => navigate(`/posts/${post.slug || post.id}`)}
                  >
                    <div className="sub-card-img-wrap">
                      <img
                        src={getPostThumb(post, idx + 5)}
                        alt={post.title}
                        onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[(idx + 5) % FALLBACK_POST_IMAGES.length]; }}
                      />
                      <span className="sub-card-cat">{post.category || 'Tin thời sự'}</span>
                    </div>
                    <div className="sub-card-body">
                      <div className="sub-card-date">
                        <i className="ti ti-calendar" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Mới'}</span>
                      </div>
                      <h4 className="sub-card-title">{post.title}</h4>
                      <p className="sub-card-desc">{post.summary || post.short_desc || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            SECTION 4: HÀNH TRÌNH TRẢI NGHIỆM THÔNG MINH LÀO CAI
            (Chương 17 & 19: "Mỗi du khách ở lại lâu hơn, trải nghiệm sâu hơn và chi tiêu nhiều hơn")
            ======================================================== */}
        <section className="laocai-itinerary-section" id="hanh-trinh-thong-minh">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down" style={{ marginBottom: '28px' }}>
              <span className="daklak-section-badge" style={{ background: 'rgba(217, 155, 38, 0.2)', color: '#FFE082', border: '1px solid rgba(217, 155, 38, 0.45)' }}>
                <i className="ti ti-route" style={{ marginRight: '6px' }} />
                {currentLang === 'en' ? 'SMART TOURISM & INVESTMENT ITINERARIES' : 'CHIẾN LƯỢC DU LỊCH & KHẢO SÁT THÔNG MINH'}
              </span>
              <h2 className="daklak-section-title" style={{ color: '#FFFFFF', marginTop: '10px' }}>
                {currentLang === 'en' ? 'Stay Longer • Experience Deeper in Lao Cai' : 'Hành Trình Gợi Ý: Ở Lại Lâu Hơn – Trải Nghiệm Sâu Hơn'}
              </h2>
              <p className="daklak-section-desc" style={{ color: '#C8DAD0' }}>
                {currentLang === 'en'
                  ? 'Select a curated itinerary below or ask our Multilingual AI Assistant to personalize your journey across Sa Pa, Fansipan, Bac Ha, Y Ty, and Kim Thanh Border Gate.'
                  : 'Khám phá các lịch trình mẫu kết nối trọn vẹn Sa Pa – Fansipan – Bắc Hà – Y Tý – Cửa khẩu Quốc tế Lào Cai, hoặc cá nhân hóa tức thì cùng Trợ lý AI đa ngôn ngữ.'}
              </p>
            </div>

            {/* 4 Nút chọn Lịch trình */}
            <div className="laocai-itin-tabs scroll-reveal scroll-reveal-up">
              {SMART_ITINERARIES.map((itin) => (
                <button
                  key={itin.id}
                  type="button"
                  className={`laocai-itin-tab-btn ${activeItineraryId === itin.id ? 'active' : ''}`}
                  onClick={() => setActiveItineraryId(itin.id)}
                >
                  <i className={`ti ${itin.icon}`} />
                  <span>{currentLang === 'en' ? itin.tabLabelEn : itin.tabLabel}</span>
                </button>
              ))}
            </div>

            {/* Khung chi tiết Lịch trình đang chọn */}
            <div className="laocai-itin-showcase scroll-reveal scroll-reveal-up">
              <div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#FFE082',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  {currentLang === 'en' ? currentItinerary.badgeEn : currentItinerary.badge}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3, margin: '0 0 10px' }}>
                  {currentLang === 'en' ? currentItinerary.titleEn : currentItinerary.title}
                </h3>
                <p style={{ fontSize: '0.94rem', color: '#DCE7E1', lineHeight: 1.6, margin: 0 }}>
                  {currentLang === 'en' ? currentItinerary.summaryEn : currentItinerary.summary}
                </p>

                <div className="laocai-itin-timeline">
                  {currentItinerary.steps.map((step, sIdx) => (
                    <div key={sIdx} className="laocai-itin-step">
                      <span className="laocai-itin-step-time">{step.time}</span>
                      <div className="laocai-itin-step-info">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="laocai-itin-visual-card">
                <img
                  src={currentItinerary.image}
                  alt={currentItinerary.title}
                  className="laocai-itin-visual-img"
                />
                <div className="laocai-itin-visual-body">
                  <div className="laocai-itin-metrics">
                    <div className="laocai-itin-metric-box">
                      <div className="laocai-itin-metric-label">{currentLang === 'en' ? 'Duration' : 'Thời lượng'}</div>
                      <div className="laocai-itin-metric-val">{currentItinerary.duration}</div>
                    </div>
                    <div className="laocai-itin-metric-box">
                      <div className="laocai-itin-metric-label">{currentLang === 'en' ? 'Estimated Cost' : 'Chi phí dự kiến'}</div>
                      <div className="laocai-itin-metric-val">{currentItinerary.budget}</div>
                    </div>
                    <div className="laocai-itin-metric-box" style={{ gridColumn: 'span 2' }}>
                      <div className="laocai-itin-metric-label">{currentLang === 'en' ? 'Recommended For' : 'Phù hợp với'}</div>
                      <div className="laocai-itin-metric-val">{currentItinerary.suitability}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    <Link
                      to={`/ai-chat?prompt=${encodeURIComponent(currentItinerary.aiPrompt)}`}
                      className="btn-daklak-gold"
                      style={{ justifyContent: 'center', width: '100%', padding: '12px 18px', fontWeight: 800 }}
                    >
                      <i className="ti ti-sparkles" />
                      <span>{currentLang === 'en' ? 'Customize This Itinerary with AI' : 'Tùy chỉnh lịch trình này bằng Trợ lý AI'}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToConsult(`Đặt lịch trình / Khảo sát: ${currentItinerary.title}`)}
                      className="btn-daklak-outline"
                      style={{ justifyContent: 'center', width: '100%', padding: '10px 18px', color: '#FFE082', borderColor: 'rgba(217, 155, 38, 0.5)' }}
                    >
                      <i className="ti ti-headset" />
                      <span>{currentLang === 'en' ? 'Request Tour / Delegation Support' : 'Đăng ký Hỗ trợ Đoàn & Kết nối Dịch vụ'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            MODULE 1: SƠ ĐỒ TƯƠNG TÁC HÀNH LANG KINH TẾ QUỐC TẾ & CỬA KHẨU THÔNG MINH
            (Côn Minh – Lào Cai – Hà Nội – Hải Phòng • Cửa ngõ ASEAN – Trung Quốc)
            ======================================================== */}
        <section className="laocai-corridor-section" id="hanh-lang-kinh-te">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down" style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span className="laocai-corridor-badge">
                <i className="ti ti-route" />
                {currentLang === 'en' ? 'STRATEGIC INTERNATIONAL TRADE CORRIDOR' : 'HÀNH LANG KINH TẾ QUỐC TẾ & CỬA KHẨU THÔNG MINH'}
              </span>
              <h2 className="daklak-section-title" style={{ color: '#FFFFFF' }}>
                {currentLang === 'en' ? 'Kunming – Lao Cai – Hanoi – Hai Phong Economic Artery' : 'Hành Lang Côn Minh – Lào Cai – Hà Nội – Hải Phòng'}
              </h2>
              <p className="daklak-section-desc" style={{ color: '#C8DAD0', maxWidth: '780px', margin: '0 auto' }}>
                {currentLang === 'en'
                  ? 'Interactive overview of the vital multimodal trade corridor bridging Southwest China (400M+ people) with Vietnam’s seaports and ASEAN economies.'
                  : 'Sơ đồ tương tác chuỗi hạ tầng huyết mạch kết nối thị trường hơn 400 triệu dân Tây Nam Trung Quốc qua cửa ngõ Lào Cai đến hệ thống cảng biển quốc tế và khối ASEAN.'}
              </p>
            </div>

            {/* Sơ đồ 5 Chặng Hành Lang */}
            <div className="laocai-corridor-pipeline">
              {TRADE_CORRIDOR_NODES.map((node) => {
                const isActive = activeCorridorNode === node.id;
                return (
                  <div
                    key={node.id}
                    className={`laocai-corridor-node ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCorridorNode(node.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="laocai-corridor-step-num">
                      <i className="ti ti-circle-check-filled" />
                      <span>{node.step}</span>
                    </div>
                    <div className="laocai-corridor-node-icon">
                      <i className={`ti ${node.icon}`} />
                    </div>
                    <div className="laocai-corridor-node-title">
                      {currentLang === 'en' ? node.nameEn : node.name}
                    </div>
                    <div className="laocai-corridor-node-sub">
                      {currentLang === 'en' ? node.subEn : node.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thẻ Chi Tiết Chặng Đang Chọn */}
            {(() => {
              const selectedNode = TRADE_CORRIDOR_NODES[activeCorridorNode] || TRADE_CORRIDOR_NODES[1];
              return (
                <div className="laocai-corridor-detail-card scroll-reveal scroll-reveal-up">
                  <div className="laocai-corridor-info">
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(217, 155, 38, 0.2)',
                      border: '1px solid rgba(217, 155, 38, 0.45)',
                      color: '#FFE082',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      marginBottom: '14px'
                    }}>
                      <i className="ti ti-pin" />
                      {selectedNode.step} • {currentLang === 'en' ? 'STRATEGIC NODE ANALYSIS' : 'TÂM ĐIỂM CHIẾN LƯỢC'}
                    </span>
                    <h3>{currentLang === 'en' ? selectedNode.nameEn : selectedNode.name}</h3>
                    <p>{currentLang === 'en' ? selectedNode.highlightEn : selectedNode.highlight}</p>

                    <div className="laocai-corridor-tags">
                      {(currentLang === 'en' ? selectedNode.tagsEn : selectedNode.tags).map((tg, tIdx) => (
                        <span key={tIdx} className="laocai-corridor-tag">
                          <i className="ti ti-check" />
                          {tg}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: '26px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/posts?category=${encodeURIComponent('Cửa khẩu & Logistics')}`}
                        className="btn-daklak-gold"
                        style={{ padding: '11px 24px', fontSize: '0.9rem' }}
                      >
                        <i className="ti ti-external-link" />
                        <span>{currentLang === 'en' ? 'Customs & Logistics Data' : 'Dữ liệu Cửa khẩu & Logistics'}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => scrollToConsult(`Tư vấn đầu tư & Logistics: ${selectedNode.name}`)}
                        className="btn-daklak-outline"
                        style={{ padding: '11px 24px', fontSize: '0.9rem', borderColor: '#FFE082', color: '#FFE082' }}
                      >
                        <i className="ti ti-mail-forward" />
                        <span>{currentLang === 'en' ? 'Connect Investment Desk' : 'Kết nối Ban Xúc tiến Đầu tư'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="laocai-corridor-stats-grid">
                    {selectedNode.stats.map((st, sIdx) => (
                      <div key={sIdx} className="laocai-corridor-stat-box">
                        <div className="laocai-corridor-stat-lbl">
                          {currentLang === 'en' ? st.labelEn : st.label}
                        </div>
                        <div className="laocai-corridor-stat-val notranslate" translate="no">
                          {st.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ========================================================
            SECTION 8: HOẠT ĐỘNG TRỌNG ĐIỂM - SỰ KIỆN SẮP DIỄN RA TẠI LÀO CAI
            ======================================================== */}
        <section className="daklak-home-events-section" id="su-kien">
          <div className="daklak-container">
            <div className="daklak-events-header">
              <div className="daklak-events-header-left">
                <span className="daklak-events-badge">
                  <i className="ti ti-flame" style={{ marginRight: '5px' }} />
                  {currentLang === 'en' ? 'Key Activities & Forums' : 'HOẠT ĐỘNG TRỌNG ĐIỂM LÀO CAI'}
                </span>
                <h2 className="daklak-events-title">
                  {currentLang === 'en' ? 'Upcoming Events & Trade Fairs' : 'SỰ KIỆN, HỘI CHỢ & DIỄN ĐÀN SẮP DIỄN RA'}
                </h2>
                <p className="daklak-events-desc">
                  {currentLang === 'en'
                    ? 'Join international border trade fairs, investment promotion forums, and four-season cultural festivals in Lao Cai.'
                    : 'Cập nhật các hội chợ thương mại quốc tế Việt – Trung, diễn đàn xúc tiến đầu tư và lễ hội bốn mùa giúp doanh nghiệp và du khách kết nối trực tiếp.'}
                </p>
              </div>
              <div className="daklak-events-header-right">
                <Link to="/events" className="daklak-events-view-all">
                  <span>{currentLang === 'en' ? 'View all events' : 'Xem tất cả sự kiện'}</span>
                  <i className="ti ti-arrow-right" />
                </Link>
              </div>
            </div>

            {heroEvent ? (
              <>
                <div className="daklak-event-hero-card">
                  <div className="daklak-event-hero-content">
                    <div className="daklak-event-hero-tags">
                      <span className="daklak-hero-tag highlight">
                        <i className="ti ti-sparkles" />
                        {currentLang === 'en' ? 'Featured Event' : 'SỰ KIỆN NỔI BẬT'}
                      </span>
                      <span className="daklak-hero-tag fee">
                        {formatEventPrice(heroEvent)}
                      </span>
                      <span className="daklak-event-hero-time">
                        <i className="ti ti-clock" />
                        {formatEventDateTime(heroEvent.event_date)}
                      </span>
                    </div>

                    <h3 className="daklak-event-hero-title">
                      <Link to={`/events/${heroEvent.slug || heroEvent.id}`}>
                        {heroEvent.title}
                      </Link>
                    </h3>

                    <p className="daklak-event-hero-desc">
                      {heroEvent.short_desc || heroEvent.description}
                    </p>

                    <div className="daklak-event-hero-countdown-block">
                      <div className="daklak-countdown-title">
                        <i className="ti ti-hourglass-empty" />
                        <span>{currentLang === 'en' ? 'Event starts in' : 'SỰ KIỆN BẮT ĐẦU SAU'}</span>
                      </div>
                      <HomeEventCountdown eventDate={heroEvent.event_date} />
                    </div>

                    <div className="daklak-event-hero-footer">
                      <div className="daklak-event-hero-location" title={heroEvent.location || 'TP. Lào Cai, Tỉnh Lào Cai'}>
                        <i className="ti ti-map-pin" />
                        <span>{heroEvent.location || 'TP. Lào Cai, Tỉnh Lào Cai'}</span>
                      </div>

                      <div className="daklak-event-hero-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenRegisterModal(heroEvent)}
                          className="btn-daklak-event-register"
                        >
                          <span>{currentLang === 'en' ? 'Details & Register' : 'Xem chi tiết & Đăng ký'}</span>
                          <i className="ti ti-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="daklak-event-hero-image-wrap">
                    <img
                      src={heroEvent.image_url || heroEvent.poster_url || FALLBACK_POST_IMAGES[0]}
                      alt={heroEvent.title}
                      className="daklak-event-hero-img"
                      onError={(e) => {
                        e.target.src = FALLBACK_POST_IMAGES[0];
                      }}
                    />
                    <div className="daklak-event-hero-img-overlay" />
                  </div>
                </div>

                {subEvents.length > 0 && (
                  <div className="daklak-event-sub-grid">
                    {subEvents.map((evt, idx) => (
                      <div key={evt.id || idx} className="daklak-event-sub-card">
                        <div className="daklak-event-sub-thumb-wrap">
                          <img
                            src={evt.image_url || evt.poster_url || FALLBACK_POST_IMAGES[(idx + 1) % FALLBACK_POST_IMAGES.length]}
                            alt={evt.title}
                            className="daklak-event-sub-img"
                            onError={(e) => {
                              e.target.src = FALLBACK_POST_IMAGES[(idx + 1) % FALLBACK_POST_IMAGES.length];
                            }}
                          />
                          <span className="daklak-event-sub-price-badge">
                            {formatEventPrice(evt)}
                          </span>
                        </div>

                        <div className="daklak-event-sub-body">
                          <div className="daklak-event-sub-time">
                            <i className="ti ti-clock" />
                            <span>{formatEventDateTime(evt.event_date)}</span>
                          </div>

                          <h4 className="daklak-event-sub-title" title={evt.title}>
                            <Link to={`/events/${evt.slug || evt.id}`}>{evt.title}</Link>
                          </h4>

                          <p className="daklak-event-sub-desc">
                            {evt.short_desc || evt.description}
                          </p>

                          <div className="daklak-event-sub-footer">
                            <div className="daklak-event-sub-loc" title={evt.location || 'TP. Lào Cai'}>
                              <i className="ti ti-map-pin" />
                              <span>{evt.location || 'TP. Lào Cai, Tỉnh Lào Cai'}</span>
                            </div>
                            <Link to={`/events/${evt.slug || evt.id}`} className="daklak-event-sub-link">
                              <span>{currentLang === 'en' ? 'Details' : 'Chi tiết'}</span>
                              <i className="ti ti-chevron-right" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="daklak-events-empty-box" style={{
                padding: '3.5rem 2rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #CBD5E1',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                margin: '1rem 0'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#F8FAFC',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '28px'
                }}>
                  <i className="ti ti-calendar-off" />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
                  {currentLang === 'en' ? 'No Upcoming Events At This Time' : 'Hiện tại không có sự kiện nào'}
                </h4>
                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  {currentLang === 'en'
                    ? 'All upcoming trade summits, economic forums, and cultural events will be updated here as soon as announced.'
                    : 'Các hội thảo xúc tiến thương mại, diễn đàn kinh tế và sự kiện văn hóa mới tại Lào Cai sẽ được cập nhật sớm nhất.'}
                </p>
                <Link
                  to="/events"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#145A3E',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '13.5px'
                  }}
                >
                  <i className="ti ti-calendar" />
                  <span>{currentLang === 'en' ? 'View All Events' : 'Xem trang sự kiện'}</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            SECTION 10: LÀM CHỦ AI - BỨT PHÁ TƯƠNG LAI (SPECIAL AI TOPIC)
            ======================================================== */}
        <section className="daklak-section daklak-ai-showcase-section" id="lam-chu-ai">
          <div className="daklak-container">
            <div className="daklak-ai-section-header">
              <div className="daklak-ai-badge-wrapper">
                <span className="daklak-ai-special-badge">
                  <i className="ti ti-sparkles" /> {currentLang === 'en' ? 'SPECIAL TOPIC • MASTERING AI FOR THE FUTURE' : '« CHUYÊN ĐỀ ĐẶC BIỆT • LÀM CHỦ AI BỨT PHÁ TƯƠNG LAI »'}
                </span>
              </div>
              <h2 className="daklak-ai-section-title">
                {currentLang === 'en' ? 'Mastering AI – ' : 'Làm Chủ AI – '}
                <span className="daklak-ai-title-gradient">
                  {currentLang === 'en' ? 'Unlocking the Future' : 'Bứt Phá Tương Lai'}
                </span>
              </h2>
              <p className="daklak-ai-section-desc">
                {currentLang === 'en'
                  ? 'Knowledge space, digital transformation solutions, and AI technology built on 3 core pillars: Ward AI, Orion Ecosystem, and Edunow.today Digital Training.'
                  : 'Không gian tri thức, giải pháp chuyển đổi số và công nghệ trí tuệ nhân tạo với 3 trụ cột: AI phường xã, Hệ sinh thái Orion và Đào tạo số Edunow.today.'}
              </p>
            </div>

            {(() => {
              const wardAiPost = aiTopicPosts?.wardAi || latestPosts.find(p => p.slug === 'tro-ly-ai-phuong-xa');
              const orionPost = aiTopicPosts?.orion || latestPosts.find(p => p.slug && p.slug.includes('orion-chat-loc'));
              const edunowPost = aiTopicPosts?.edunow || latestPosts.find(p => p.slug && p.slug.includes('edunowai'));

              const wardAiImg = wardAiPost?.image_url || wardAiPost?.cover_image || wardAiPost?.thumbnail;
              const orionImg = orionPost?.image_url || orionPost?.cover_image || orionPost?.thumbnail;
              const edunowImg = edunowPost?.image_url || edunowPost?.cover_image || edunowPost?.thumbnail;

              const aiSlides = [
                {
                  id: 0,
                  tag: currentLang === 'en' ? 'Ward AI Assistant' : 'AI phường xã',
                  pillClass: 'daklak-ai-pill-cyan',
                  img: wardAiImg,
                  alt: wardAiPost?.title || "Trợ lý AI phường xã",
                  catClass: 'daklak-ai-cat-cyan',
                  catIcon: 'ti-robot',
                  catTitle: currentLang === 'en' ? 'Foundation AI Technology' : 'Công nghệ AI cơ sở',
                  title: currentLang === 'en' ? 'Ward & Commune AI Assistant' : 'Trợ lý AI phường xã',
                  link: '/posts/tro-ly-ai-phuong-xa',
                  summary: currentLang === 'en'
                    ? 'Local-level AI application supporting administration, citizen inquiries 24/7, and speeding up digital governance.'
                    : 'Trợ lý AI phường xã phục vụ công tác điều hành, hỗ trợ cán bộ và người dân tra cứu thủ tục, tiếp nhận phản ánh và số hóa dịch vụ công cơ sở 24/7.'
                },
                {
                  id: 1,
                  tag: 'Orion',
                  pillClass: 'daklak-ai-pill-gold',
                  img: orionImg,
                  alt: orionPost?.title || "Hệ sinh thái Orion",
                  catClass: 'daklak-ai-cat-gold',
                  catIcon: 'ti-cpu',
                  catTitle: currentLang === 'en' ? 'Intelligent AI Platform' : 'Nền tảng AI thông minh',
                  title: currentLang === 'en'
                    ? 'Orion: Distilling ERP, Multi-Model AI & AI Agent Platform into an Intelligent Operating System for Enterprises'
                    : 'Orion chắt lọc tinh hoa của ERP, Multi-Model AI và nền tảng xây dựng AI Agent để tạo thành một hệ điều hành quản trị thông minh dành cho doanh nghiệp',
                  link: '/posts/orion-chat-loc-tinh-hoa-cua-erp-multimodel-ai-va-nen-tang-xay-dung-ai-agent-de-tao-thanh-mot-he-dieu-hanh-quan-tri-thong-minh-danh-cho-doanh-nghiep',
                  summary: currentLang === 'en'
                    ? 'Unified intelligent enterprise operating system combining ERP and multi-model AI to automate business workflows.'
                    : 'Orion chắt lọc tinh hoa của ERP, Multi-Model AI và nền tảng xây dựng AI Agent để tạo thành một hệ điều hành quản trị thông minh dành cho doanh nghiệp.'
                },
                {
                  id: 2,
                  tag: 'Edunow.today',
                  pillClass: 'daklak-ai-pill-green',
                  img: edunowImg,
                  alt: edunowPost?.title || "EDUNOW.AI",
                  catClass: 'daklak-ai-cat-green',
                  catIcon: 'ti-school',
                  catTitle: currentLang === 'en' ? 'Training & Digital Skills' : 'Đào tạo & Kỹ năng số',
                  title: currentLang === 'en'
                    ? 'EDUNOW.AI: Smart Admissions AI Assistant Solution for Educational Institutions'
                    : 'EDUNOW.AI Giải pháp Trợ lý AI tuyển sinh thông minh dành cho các cơ sở giáo dục',
                  link: '/posts/edunowai-giai-phap-tro-ly-ai-tuyen-sinh-thong-minh-danh-cho-cac-co-so-giao-duc',
                  summary: currentLang === 'en'
                    ? 'Smart admissions consulting AI assistant and comprehensive digital skills training platform.'
                    : 'EDUNOW.AI Giải pháp Trợ lý AI tuyển sinh thông minh dành cho các cơ sở giáo dục, tư vấn tuyển sinh 24/7 và chuyển đổi số đào tạo.'
                }
              ];

              return (
                <div 
                  className="daklak-ai-slider-container"
                  onMouseEnter={() => setIsAiSlideHovered(true)}
                  onMouseLeave={() => setIsAiSlideHovered(false)}
                >
                  <button
                    type="button"
                    className="daklak-ai-nav-arrow daklak-ai-nav-prev"
                    onClick={() => setAiSlideIndex(prev => (prev - 1 + 3) % 3)}
                    aria-label="Bài viết trước"
                  >
                    <i className="ti ti-chevron-left" />
                  </button>

                  <div className="daklak-ai-slider-viewport">
                    <div 
                      className="daklak-ai-slider-track"
                      style={{ transform: `translateX(-${aiSlideIndex * 100}%)` }}
                    >
                      {aiSlides.map((slide, sIdx) => (
                        <div key={sIdx} className="daklak-ai-slide-card">
                          <div className="daklak-ai-card" style={{ margin: 0, height: '100%' }}>
                            <div className="daklak-ai-card-img-wrap">
                              <span className={`daklak-ai-card-pill ${slide.pillClass}`}>
                                <i className={`ti ${slide.catIcon}`} /> {slide.tag}
                              </span>
                              <div className="daklak-ai-img-container">
                                <img 
                                  src={slide.img || "/images/adt_logo.svg"} 
                                  alt={slide.alt} 
                                  className={`daklak-ai-card-img ${!slide.img ? 'daklak-ai-card-fallback-logo' : ''}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/adt_logo.svg";
                                    e.target.classList.add('daklak-ai-card-fallback-logo');
                                  }}
                                />
                              </div>
                            </div>
                            <div className="daklak-ai-card-body">
                              <div className={`daklak-ai-card-category ${slide.catClass}`}>
                                <i className={`ti ${slide.catIcon}`} /> {slide.catTitle}
                              </div>
                              <h3 className="daklak-ai-card-title">
                                <Link to={slide.link}>
                                  {slide.title}
                                </Link>
                              </h3>
                              <p className="daklak-ai-card-summary">
                                {slide.summary}
                              </p>
                              <div className="daklak-ai-card-footer">
                                <span className="daklak-ai-card-author">Công ty cổ phần ADT Quốc Tế</span>
                                <Link to={slide.link} className="daklak-ai-card-link">
                                  {currentLang === 'en' ? 'Read More' : 'Đọc chi tiết'} <i className="ti ti-arrow-right" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="daklak-ai-nav-arrow daklak-ai-nav-next"
                    onClick={() => setAiSlideIndex(prev => (prev + 1) % 3)}
                    aria-label="Bài viết tiếp theo"
                  >
                    <i className="ti ti-chevron-right" />
                  </button>

                  <div className="daklak-ai-slider-indicators">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`daklak-ai-indicator ${aiSlideIndex === idx ? 'active' : ''}`}
                        onClick={() => setAiSlideIndex(idx)}
                        aria-label={`Chuyển đến bài ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ========================================================
            SECTION 11: HỘI VIÊN TIÊU BIỂU (CỘNG ĐỒNG DOANH NGHIỆP LÀO CAI)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Verified Directory' : 'Hội Viên Tiêu Biểu'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Leading Enterprises & Ecosystem Partners' : 'Showroom Số Doanh Nghiệp Lào Cai'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Verified profiles of top local companies, cross-border logistics operators, and strategic investment partners in Lao Cai.'
                  : 'Hồ sơ năng lực số của các doanh nghiệp tiêu biểu đã xác thực trong mạng lưới Laocai.today, sẵn sàng kết nối giao thương B2B và hợp tác đầu tư.'}
              </p>
            </div>

            <div className={`members-grid count-${Math.min(4, featuredMembers.length || 3)}`}>
              {featuredMembers.map((m, mIdx) => (
                <div key={m.id} className={`member-card scroll-reveal scroll-reveal-up stagger-${(mIdx % 3) + 1}`}>
                  <div className="member-card-header">
                    <img 
                      src={m.logo_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80'} 
                      alt={m.company_name || m.name} 
                      className="member-logo"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="member-info">
                      <h4>{m.company_name || m.name}</h4>
                      <span className="member-tier-pill">⭐ {m.tier || 'Thành viên'} Partner</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5', flexGrow: 1 }}>
                    {m.bio || m.description || `Lĩnh vực hoạt động: ${m.industry || 'Thương mại, Du lịch & Nông sản Dược liệu'}.`}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(20, 90, 62, 0.1)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {m.address || 'TP. Lào Cai, Tỉnh Lào Cai'}</span>
                    <Link to="/members" className="quick-access-link" style={{ fontSize: '0.85rem' }}>
                      Xem Showroom →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="scroll-reveal scroll-reveal-up" style={{ textAlign: 'center', marginTop: '35px' }}>
              <Link to="/members" className="btn-daklak-primary">
                <i className="ti ti-address-book" />
                <span>{currentLang === 'en' ? 'Explore Full Enterprise Directory' : 'Tra cứu Danh bạ Toàn bộ Doanh nghiệp'}</span>
              </Link>
            </div>
          </div>
        </section>



        {/* ========================================================
            SECTION 13: LÀO CAI BẰNG NHỮNG CON SỐ BIẾT NÓI (DATA DASHBOARD)
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: '#EBF2EE' }}>
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down" style={{ marginBottom: '30px' }}>
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Regional Indicators' : 'Dữ Liệu Kinh Tế & Tiềm Năng'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Lao Cai by Key Indicators' : 'Lào Cai Bằng Những Con Số Biết Nói'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Key socio-economic, border trade, and tourism metrics illustrating the strategic position of Lao Cai Province.'
                  : 'Các chỉ số tổng hợp khẳng định vị thế cực tăng trưởng vùng Trung du và Miền núi phía Bắc, cầu nối giao thương Việt Nam – ASEAN – Trung Quốc.'}
              </p>
            </div>

            <div className="data-stats-grid">
              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-1">
                <div className="data-stat-num">3.143 m</div>
                <div className="data-stat-label">Đỉnh Thiêng Fansipan</div>
                <div className="data-stat-sub">Nóc nhà Đông Dương – Biểu tượng Sa Pa</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-2">
                <div className="data-stat-num">15.929 ha</div>
                <div className="data-stat-label">KKT Cửa khẩu Lào Cai</div>
                <div className="data-stat-sub">1 trong 8 KKT cửa khẩu trọng điểm QG</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-3">
                <div className="data-stat-num">8,5+ Triệu</div>
                <div className="data-stat-label">Lượt Du khách / Năm</div>
                <div className="data-stat-sub">Trung tâm du lịch 4 mùa quốc tế</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-4">
                <div className="data-stat-num">4.000+ ha</div>
                <div className="data-stat-label">Dược liệu & Chè Cổ thụ</div>
                <div className="data-stat-sub">Vùng nguyên liệu chuẩn GACP-WHO</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-5">
                <div className="data-stat-num">200+</div>
                <div className="data-stat-label">Sản phẩm OCOP Vùng cao</div>
                <div className="data-stat-sub">Đạt chuẩn từ 3 sao đến 5 sao Quốc gia</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-6">
                <div className="data-stat-num">05 Ngôn ngữ</div>
                <div className="data-stat-label">Trợ lý AI 24/7</div>
                <div className="data-stat-sub">Việt • Anh • Trung • Nhật • Hàn</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 14: GÓI THAM GIA MẠNG LƯỚI HỘI VIÊN LAOCAI.TODAY
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Membership' : 'Gia Nhập Mạng Lưới'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Flexible Membership Packages' : 'Lựa Chọn Gói Hội Viên Laocai.today'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Join our verified business community in Lao Cai to expand your cross-border network, promote OCOP & tourism services, and connect with investors.'
                  : 'Gia nhập cộng đồng doanh nghiệp, hợp tác xã và nhà đầu tư Lào Cai. Gói Khám phá & Gói Silver được hệ thống phê duyệt tự động ngay lập tức.'}
              </p>
            </div>

            <div className="tiers-grid">
              {/* Tier 1 */}
              <div className="tier-card scroll-reveal scroll-reveal-left">
                <div>
                  <span className="tier-badge">CƠ BẢN</span>
                  <h3 className="tier-title">Khám Phá</h3>
                  <div className="tier-price">Miễn phí</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Xem đầy đủ tin tức, quy hoạch & sự kiện</li>
                    <li>✓ Tra cứu danh bạ doanh nghiệp Lào Cai</li>
                    <li>✓ Hỏi đáp Trợ lý AI đa ngôn ngữ miễn phí</li>
                    <li>✓ Đăng ký vé QR tham gia hội chợ, diễn đàn</li>
                  </ul>
                </div>
                <Link to="/register" className="btn-daklak-outline" style={{ color: 'var(--primary-coffee)', borderColor: 'var(--border-strong)', justifyContent: 'center' }}>
                  Đăng ký miễn phí
                </Link>
              </div>

              {/* Tier 2 */}
              <div className="tier-card featured scroll-reveal scroll-reveal-up stagger-1">
                <div>
                  <span className="tier-badge" style={{ background: 'var(--bazan-red)', color: '#FFF' }}>PHỔ BIẾN NHẤT</span>
                  <h3 className="tier-title">Doanh Nghiệp Kết Nối</h3>
                  <div className="tier-price" style={{ color: 'var(--bazan-red)' }}>Silver Partner</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Tự động duyệt ngay lập tức</li>
                    <li>✓ Cấp Showroom số doanh nghiệp xác thực</li>
                    <li>✓ Đăng bài viết, sản phẩm OCOP & giao thương</li>
                    <li>✓ Nhận yêu cầu kết nối B2B trực tiếp</li>
                    <li>✓ Ưu tiên hiển thị trong danh bạ Lào Cai</li>
                  </ul>
                </div>
                <Link to="/register" className="btn-daklak-primary" style={{ justifyContent: 'center' }}>
                  Đăng ký Silver Ngay
                </Link>
              </div>

              {/* Tier 3 */}
              <div className="tier-card scroll-reveal scroll-reveal-up stagger-2">
                <div>
                  <span className="tier-badge" style={{ background: 'rgba(217, 155, 38, 0.2)', color: '#B3832B' }}>CAO CẤP</span>
                  <h3 className="tier-title">Doanh Nghiệp Tiêu Biểu</h3>
                  <div className="tier-price" style={{ color: 'var(--primary-coffee)' }}>Gold Partner</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Đầy đủ quyền lợi gói Silver</li>
                    <li>✓ Huy hiệu Đối tác Vàng chứng nhận</li>
                    <li>✓ Bài PR chuyên đề quảng bá đa ngôn ngữ</li>
                    <li>✓ Ghép đôi ưu tiên với Đối tác XNK & Đầu tư</li>
                    <li>✓ Hỗ trợ chuẩn hóa hồ sơ năng lực số</li>
                  </ul>
                </div>
                <button onClick={() => scrollToConsult('Gói Hội viên Gold Partner')} className="btn-daklak-gold" style={{ justifyContent: 'center' }}>
                  Tư vấn Nâng hạng
                </button>
              </div>

              {/* Tier 4 */}
              <div className="tier-card scroll-reveal scroll-reveal-right">
                <div>
                  <span className="tier-badge" style={{ background: 'rgba(20, 90, 62, 0.2)', color: 'var(--forest-green)' }}>CHIẾN LƯỢC</span>
                  <h3 className="tier-title">Nhà Đầu Tư Chiến Lược</h3>
                  <div className="tier-price" style={{ color: 'var(--forest-green)' }}>Diamond VIP</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Tiếp cận bộ hồ sơ dự án Data Room</li>
                    <li>✓ Kết nối khảo sát KKT cửa khẩu & KCN</li>
                    <li>✓ Tham dự các phiên tọa đàm xúc tiến đầu tư</li>
                    <li>✓ Cố vấn xúc tiến & dịch thuật AI 1 kèm 1</li>
                  </ul>
                </div>
                <button onClick={() => scrollToConsult('Gói Đối tác Chiến lược Diamond')} className="btn-daklak-outline" style={{ color: 'var(--forest-green)', borderColor: 'var(--forest-green)', justifyContent: 'center' }}>
                  Liên hệ Chuyên gia
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 15: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'FAQ' : 'Hỏi & Đáp'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp Về Laocai.today'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Common inquiries regarding Laocai.today ecosystem features, memberships, and investor services.'
                  : 'Giải đáp những thắc mắc phổ biến về cơ chế vận hành, Trợ lý AI đa ngôn ngữ và quyền lợi tham gia mạng lưới Laocai.today.'}
              </p>
            </div>

            <div className="faq-list scroll-reveal scroll-reveal-left">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                const questionId = `faq-q-${index}`;
                const panelId = `faq-panel-${index}`;
                return (
                  <div key={index} className="faq-item">
                    <button 
                      id={questionId}
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <i className={`ti ti-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--forest-green)' }} />
                    </button>
                    {isOpen && (
                      <div 
                        id={panelId}
                        role="region"
                        aria-labelledby={questionId}
                        className="faq-answer"
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 16: FORM ĐĂNG KÝ TƯ VẤN & HỢP TÁC ĐẦU TƯ (id="tu-van")
            ======================================================== */}
        <section className="daklak-section" id="tu-van" style={{ backgroundColor: '#E5EFEA' }}>
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Consultation & Partnership' : 'Đăng Ký Tư Vấn & Kết Nối'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Partner with Laocai.today' : 'Đăng Ký Tư Vấn & Hợp Tác Đầu Tư Tại Lào Cai'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Submit your enterprise details or project inquiries. Our investment & trade specialists will contact you within 24 hours.'
                  : 'Quý doanh nghiệp, nhà đầu tư và đối tác vui lòng gửi thông tin yêu cầu. Ban kết nối đầu tư & thương mại Laocai.today sẽ liên hệ hỗ trợ trong vòng 24 giờ.'}
              </p>
            </div>

            <div className="consult-form-box scroll-reveal scroll-reveal-right">
              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ fontSize: '3rem', color: 'var(--forest-green)', marginBottom: '14px' }}>✓</div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-coffee)', marginBottom: '10px' }}>
                    {currentLang === 'en' ? 'Submission Successful!' : 'Đã Tiếp Nhận Thông Tin Thành Công!'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                    Cảm ơn quý đơn vị đã quan tâm tới hệ sinh thái số Laocai.today. Chuyên viên tư vấn sẽ trực tiếp kết nối qua số điện thoại <strong>{formData.phone}</strong>.
                  </p>
                  <button 
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        city: 'Lào Cai',
                        serviceNeed: 'Đầu tư Khu kinh tế cửa khẩu & Logistics Lào Cai',
                        companyName: '',
                        notes: '',
                        agreeTerms: true
                      });
                    }}
                    className="btn-daklak-primary"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit}>
                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label htmlFor="consult-fullName">Họ và tên người liên hệ (*)</label>
                      <input 
                        id="consult-fullName"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-phone">Số điện thoại liên hệ (*)</label>
                      <input 
                        id="consult-phone"
                        type="tel"
                        className="daklak-form-input"
                        placeholder="Ví dụ: 0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label htmlFor="consult-email">Email làm việc</label>
                      <input 
                        id="consult-email"
                        type="email"
                        className="daklak-form-input"
                        placeholder="Ví dụ: contact@laocai.today"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-companyName">Tên Doanh nghiệp / Đơn vị (*)</label>
                      <input 
                        id="consult-companyName"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Công ty CP Đầu tư & Thương mại Quốc tế"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label htmlFor="consult-city">Tỉnh / Thành phố / Quốc gia</label>
                      <input 
                        id="consult-city"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Lào Cai, Hà Nội, TP.HCM..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-serviceNeed">Lĩnh vực quan tâm & nhu cầu hợp tác</label>
                      <select 
                        id="consult-serviceNeed"
                        className="daklak-form-select"
                        value={formData.serviceNeed}
                        onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
                      >
                        <option value="Đầu tư Khu kinh tế cửa khẩu & Logistics Lào Cai">Đầu tư Khu kinh tế cửa khẩu & Logistics Lào Cai</option>
                        <option value="Thuê đất KCN Tằng Loỏng, Đông Phố Mới, Võ Lao">Thuê đất KCN Tằng Loỏng, Đông Phố Mới, Võ Lao</option>
                        <option value="Hợp tác Chuỗi Dược liệu vùng cao & Chè Shan Tuyết">Hợp tác Chuỗi Dược liệu vùng cao & Chè Shan Tuyết</option>
                        <option value="Đầu tư Du lịch nghỉ dưỡng Sa Pa – Bắc Hà – Y Tý">Đầu tư Du lịch nghỉ dưỡng Sa Pa – Bắc Hà – Y Tý</option>
                        <option value="Mở Showroom số & Quảng bá sản phẩm OCOP Lào Cai">Mở Showroom số & Quảng bá sản phẩm OCOP Lào Cai</option>
                        <option value="Kết nối Xuất nhập khẩu ASEAN – Trung Quốc">Kết nối Xuất nhập khẩu ASEAN – Trung Quốc</option>
                        <option value="Tham gia Mạng lưới Hội viên Doanh nghiệp Laocai.today">Tham gia Mạng lưới Hội viên Doanh nghiệp Laocai.today</option>
                      </select>
                    </div>
                  </div>

                  <div className="daklak-form-group">
                    <label htmlFor="consult-notes">Chi tiết nhu cầu & nội dung cần hỗ trợ</label>
                    <textarea 
                      id="consult-notes"
                      rows="3"
                      className="daklak-form-textarea"
                      placeholder="Mô tả cụ thể về quy mô dự án, sản phẩm cần kết nối giao thương hoặc lịch trình khảo sát tại Lào Cai..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                    <input 
                      type="checkbox" 
                      id="agreeTerms" 
                      checked={formData.agreeTerms} 
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })} 
                      required
                    />
                    <label htmlFor="agreeTerms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      Tôi đồng ý chia sẻ thông tin để Ban xúc tiến Laocai.today liên hệ tư vấn theo chính sách bảo mật.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-daklak-primary"
                    disabled={formLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem' }}
                  >
                    {formLoading ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Kết Nối Ngay'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>


      </main>

      {/* QUICK EVENT REGISTRATION MODAL */}
      {registerModalEvent && (
        <div className="daklak-modal-overlay" onClick={handleCloseModal}>
          <div
            className="daklak-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: 0,
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#ffffff',
              position: 'relative'
            }}
          >
            <button
              type="button"
              className="daklak-modal-close"
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'background 0.2s'
              }}
              title="Đóng"
            >
              ✕
            </button>

            {regSuccessData ? (
              Number(regSuccessData.total_amount) > 0 ? (
                paidFlowStep === 'transfer' ? (
                  <>
                    <div style={{ background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(217, 155, 38, 0.25)',
                        color: 'var(--gong-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontSize: '24px'
                      }}>
                        <i className="ti ti-credit-card"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                        Thanh Toán & Kích Hoạt Vé
                      </h3>
                      <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, color: '#DCE7E1' }}>
                        {regSuccessData.event_title}
                      </p>
                    </div>

                    <div style={{ padding: '1.25rem 1.5rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '12.5px', color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', border: '1px solid #E2E8F0' }}>
                        <div><strong>Khách tham dự:</strong> {regSuccessData.full_name} ({regSuccessData.phone})</div>
                        <div><strong>Số lượng vé:</strong> {regSuccessData.quantity} vé · <strong>Mã đăng ký:</strong> <code style={{ fontWeight: '700', color: '#145A3E' }}>{regSuccessData.ticket_code}</code></div>
                      </div>

                      <div style={{ border: '1px solid #FCD34D', backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: '800', fontSize: '14px', marginBottom: '8px' }}>
                          <i className="ti ti-building-bank"></i>
                          <span>Thông tin thanh toán chuyển khoản</span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#78350F', marginBottom: '10px' }}>
                          Tổng số tiền cần thanh toán:{' '}
                          <strong style={{ fontSize: '17px', color: '#B45309' }}>
                            {Number(regSuccessData.total_amount).toLocaleString('vi-VN')} VNĐ
                          </strong>
                        </div>

                        {regSuccessData.vietqr_url && (
                          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <img
                              src={regSuccessData.vietqr_url}
                              alt="VietQR Chuyển khoản"
                              style={{ maxWidth: '240px', width: '100%', borderRadius: '8px', border: '1px solid #FDE68A', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                            />
                            <div style={{ fontSize: '11px', color: '#78350F', marginTop: '4px' }}>
                              Quét mã VietQR bằng ứng dụng ngân hàng bất kỳ để chuyển khoản tự động
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: '12px', color: '#451A03', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><strong>Ngân hàng:</strong> {regSuccessData.bank_info?.bank_name} ({regSuccessData.bank_info?.bank_branch})</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                            <span><strong>Số tài khoản:</strong> <code style={{ fontSize: '13px', fontWeight: '800' }}>{regSuccessData.bank_info?.account_number}</code></span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regSuccessData.bank_info?.account_number, 'bank')}
                              style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#D97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              {copiedBank ? 'Đã chép!' : 'Sao chép'}
                            </button>
                          </div>
                          <div><strong>Chủ tài khoản:</strong> {regSuccessData.bank_info?.account_holder}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                            <span><strong>Nội dung CK:</strong> <code style={{ fontSize: '12px', fontWeight: '800', color: '#B45309' }}>{regSuccessData.payment_note}</code></span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regSuccessData.payment_note, 'note')}
                              style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#D97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              {copiedNote ? 'Đã chép!' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        border: '2px dashed #145A3E',
                        backgroundColor: '#F4F9F6',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#145A3E', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <i className="ti ti-upload"></i>
                          <span>Tải ảnh chuyển khoản thành công (Bắt buộc) *</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#1E4635', margin: '0 0 12px', lineHeight: 1.4 }}>
                          Sau khi chuyển khoản qua ngân hàng, quý khách vui lòng tải ảnh biên lai giao dịch thành công để Ban tổ chức kiểm duyệt và kích hoạt vé.
                        </p>

                        {proofPreview ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ maxHeight: '180px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#ffffff' }}>
                              <img src={proofPreview} alt="Ảnh chuyển khoản" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#145A3E', fontWeight: '600' }}>✓ Đã chọn ảnh: {proofFile?.name}</span>
                              <label style={{ fontSize: '11px', color: '#2563EB', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
                                Đổi ảnh khác
                                <input type="file" accept="image/*" onChange={handleProofChange} style={{ display: 'none' }} />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem',
                            border: '1px dashed #145A3E',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            gap: '6px'
                          }}>
                            <i className="ti ti-photo-plus" style={{ fontSize: '30px', color: '#145A3E' }}></i>
                            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#145A3E' }}>Nhấn vào đây để tải ảnh bill chuyển khoản</span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 20MB)</span>
                            <input type="file" accept="image/*" onChange={handleProofChange} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff', color: '#64748B', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitPaymentProof}
                        disabled={!proofFile || uploadingProof}
                        style={{
                          padding: '9px 22px',
                          borderRadius: '8px',
                          border: 'none',
                          background: proofFile ? 'linear-gradient(135deg, #145A3E 0%, #0D3826 100%)' : '#94A3B8',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: proofFile && !uploadingProof ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {uploadingProof ? (<><i className="ti ti-loader animate-spin"></i> Đang gửi ảnh...</>) : (<><i className="ti ti-send"></i> Gửi ảnh xác nhận thanh toán</>)}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(217, 155, 38, 0.25)', color: 'var(--gong-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '26px' }}>
                        <i className="ti ti-clock"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>Đã Gửi Thông Tin Thanh Toán!</h3>
                      <p style={{ fontSize: '12.5px', opacity: 0.9, margin: 0, color: '#DCE7E1' }}>{regSuccessData.event_title}</p>
                    </div>
                    <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', backgroundColor: '#F59E0B', color: '#ffffff', fontSize: '11.5px', fontWeight: '800', padding: '3px 12px', borderRadius: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Trạng thái: Chờ duyệt thanh toán
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400E', marginBottom: '6px' }}>
                          Ban tổ chức đang kiểm tra và đối soát chuyển khoản
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
                          Chứng từ chuyển khoản của bạn đã được tiếp nhận thành công. Sau khi xác nhận hợp lệ, Ban tổ chức sẽ kích hoạt vé tham dự chính thức.
                        </p>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Mã đăng ký:</strong> <code style={{ fontWeight: '700', color: '#0F172A' }}>{regSuccessData.ticket_code}</code></div>
                        <div><strong>Khách tham dự:</strong> {regSuccessData.full_name}</div>
                        <div><strong>Số lượng:</strong> {regSuccessData.quantity} vé · <strong>Tổng tiền:</strong> {Number(regSuccessData.total_amount).toLocaleString('vi-VN')} VNĐ</div>
                      </div>
                      {accountNotice && (
                        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: 1.45 }}>
                          <strong>Tài khoản theo dõi:</strong> {accountNotice}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                      {isLoggedIn ? (
                        <Link to="/member-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#145A3E', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-ticket"></i> Vào Dashboard theo dõi
                        </Link>
                      ) : (
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#145A3E', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-login"></i> Đăng nhập Dashboard
                        </Link>
                      )}
                      <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                        Hoàn tất
                      </button>
                    </div>
                  </>
                )
              ) : (
                // SỰ KIỆN MIỄN PHÍ: HIỂN THỊ MÃ VÉ VÀ QR CODE
                <>
                  <div style={{ background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(217, 155, 38, 0.25)', color: 'var(--gong-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '24px' }}>
                      <i className="ti ti-check"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>Đăng Ký Tham Gia Thành Công!</h3>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, color: '#DCE7E1' }}>{regSuccessData.event_title}</p>
                  </div>

                  <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ border: '2px dashed #145A3E', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#F4F9F6', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#145A3E', fontWeight: '700', letterSpacing: '0.6px' }}>
                        MÃ VÉ THAM DỰ CHÍNH THỨC
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#091B14', letterSpacing: '1px', margin: '4px 0 10px' }}>
                        {regSuccessData.ticket_code}
                      </div>

                      {regSuccessData.qr_image ? (
                        <div style={{ width: '180px', height: '180px', margin: '0 auto', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <img src={regSuccessData.qr_image} alt="Mã QR Check-in" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{ width: '180px', height: '180px', margin: '0 auto', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <img src={`/api/events/qr/${encodeURIComponent(regSuccessData.ticket_code)}`} alt="Mã QR Check-in" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                        Vui lòng xuất trình mã QR này tại quầy lễ tân để check-in vào sự kiện.
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #E2E8F0' }}>
                      <div><strong>Người tham dự:</strong> {regSuccessData.full_name}</div>
                      <div><strong>Số điện thoại:</strong> {regSuccessData.phone}</div>
                      <div><strong>Số lượng:</strong> {regSuccessData.quantity} vé (Miễn phí)</div>
                      {regSuccessData.company && <div><strong>Đơn vị:</strong> {regSuccessData.company}</div>}
                    </div>

                    {accountNotice && (
                      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <i className="ti ti-check-circle" style={{ fontSize: '18px', color: '#1E63E9', flexShrink: 0, marginTop: '2px' }}></i>
                        <div>
                          <strong>Tài khoản theo dõi vé:</strong> {accountNotice}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff', color: '#334155', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <i className="ti ti-printer"></i> In vé
                    </button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isLoggedIn ? (
                        <Link to="/member-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#145A3E', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-ticket"></i> Vào Dashboard
                        </Link>
                      ) : (
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#145A3E', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-login"></i> Đăng nhập
                        </Link>
                      )}
                      <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                        Hoàn tất
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : (
              // FORM ĐĂNG KÝ VÉ
              <>
                <div style={{ background: 'linear-gradient(135deg, #091B14 0%, #145A3E 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gong-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    ĐĂNG KÝ VÉ NHANH
                  </span>
                  <h3 style={{ fontSize: '18px', color: '#FFFFFF', margin: '4px 0 6px', fontWeight: '800', lineHeight: 1.3 }}>
                    {registerModalEvent.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#DCE7E1', margin: 0 }}>
                    {Number(registerModalEvent.is_paid) === 1 && Number(registerModalEvent.price) > 0
                      ? `Giá vé: ${Number(registerModalEvent.price).toLocaleString('vi-VN')} VNĐ / vé • Chuyển khoản VietQR tiện lợi`
                      : 'Vé tham gia: Miễn phí (Free Pass) • Nhận mã QR tức thời.'}
                  </p>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
                  <form onSubmit={handleQuickRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Họ và tên (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn An"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Số điện thoại (*)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={regForm.phone}
                        onChange={(e) => {
                          setRegForm(prev => ({ ...prev, phone: e.target.value }));
                          if (accountWarning) setAccountWarning('');
                        }}
                        onBlur={() => {
                          if (!isActuallyLoggedIn) {
                            verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Email (để nhận vé điện tử)
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={regForm.email}
                        onChange={(e) => {
                          setRegForm(prev => ({ ...prev, email: e.target.value }));
                          if (accountWarning) setAccountWarning('');
                        }}
                        onBlur={() => {
                          if (!isActuallyLoggedIn) {
                            verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Tên đơn vị / Doanh nghiệp
                      </label>
                      <input
                        type="text"
                        placeholder="Công ty Cổ phần / Hợp tác xã..."
                        value={regForm.company}
                        onChange={(e) => setRegForm(prev => ({ ...prev, company: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Số lượng vé tham gia
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={regForm.quantity}
                        onChange={(e) => setRegForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {isActuallyLoggedIn ? (
                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '4px'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1E40AF',
                          flexShrink: 0
                        }}>
                          <i className="ti ti-user-check" style={{ fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
                          Tài khoản: <strong>{effectiveUser?.name || effectiveUser?.username || effectiveUser?.email}</strong>
                          <div style={{ fontSize: '11px', color: '#1E3A8A' }}>Vé đăng ký sẽ tự động gán vào tài khoản này để theo dõi.</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <input
                            type="checkbox"
                            id="chkHomeCreateAcc"
                            checked={regForm.createAccount}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRegForm(prev => ({
                                ...prev,
                                createAccount: checked,
                                accountLogin: checked && !prev.accountLogin ? (prev.email || prev.phone) : prev.accountLogin
                              }));
                              if (checked) {
                                verifyAccountNotExists(regForm.phone, regForm.email, regForm.email || regForm.phone);
                              }
                            }}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#145A3E' }}
                          />
                          <label htmlFor="chkHomeCreateAcc" style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                            Tạo tài khoản để theo dõi vé
                          </label>
                        </div>

                        {regForm.createAccount && (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '10px 12px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            marginTop: '2px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <i className="ti ti-user-plus"></i>
                              <span>Thiết lập tài khoản thành viên:</span>
                            </div>

                            <div>
                              <input
                                type="text"
                                required={regForm.createAccount}
                                placeholder="Tài khoản (Email hoặc Số điện thoại) *"
                                value={regForm.accountLogin}
                                onChange={(e) => {
                                  setRegForm(prev => ({ ...prev, accountLogin: e.target.value }));
                                  if (accountWarning) setAccountWarning('');
                                }}
                                onBlur={() => {
                                  if (!isActuallyLoggedIn) {
                                    verifyAccountNotExists(regForm.phone, regForm.email, regForm.accountLogin);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>

                            <div style={{ position: 'relative' }}>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required={regForm.createAccount}
                                placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
                                value={regForm.accountPassword}
                                onChange={(e) => setRegForm(prev => ({ ...prev, accountPassword: e.target.value }))}
                                style={{
                                  width: '100%',
                                  padding: '8px 32px 8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  color: '#64748B',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  fontSize: '14px'
                                }}
                                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              >
                                <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                              </button>
                            </div>

                            <div>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required={regForm.createAccount}
                                placeholder="Xác nhận mật khẩu *"
                                value={regForm.accountConfirmPassword}
                                onChange={(e) => setRegForm(prev => ({ ...prev, accountConfirmPassword: e.target.value }))}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {accountWarning && (
                      <div style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginTop: '4px'
                      }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: '16px', color: '#DC2626', flexShrink: 0, marginTop: '2px' }}></i>
                        <div>
                          <div style={{ fontWeight: '600' }}>{accountWarning}</div>
                          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#B91C1C' }}>
                            👉 <Link to="/login" style={{ color: '#DC2626', fontWeight: '700', textDecoration: 'underline' }}>Đăng nhập tài khoản tại đây</Link> hoặc nhập Email / SĐT khác hợp lệ.
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingReg || checkingAccount}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #145A3E 0%, #0D3826 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: submittingReg || checkingAccount ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        boxShadow: '0 4px 12px rgba(20, 90, 62, 0.35)',
                        transition: 'transform 0.15s ease, opacity 0.15s'
                      }}
                    >
                      {submittingReg ? 'Đang cấp vé...' : checkingAccount ? 'Đang kiểm tra tài khoản...' : (Number(registerModalEvent?.is_paid) === 1 && Number(registerModalEvent?.price) > 0 ? 'Tiếp tục thanh toán & Đăng ký' : 'Xác nhận & Cấp vé ngay')}
                    </button>

                    <div style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginTop: '4px', lineHeight: 1.4 }}>
                      {Number(registerModalEvent?.is_paid) === 1 && Number(registerModalEvent?.price) > 0
                        ? 'Sự kiện có phí: Vui lòng chuyển khoản và tải ảnh xác nhận để kích hoạt vé.'
                        : 'Bạn sẽ nhận được mã QR ngay sau khi hoàn tất đăng ký.'}
                      {!isLoggedIn && (
                        <div style={{ marginTop: '2px' }}>
                          Đã có tài khoản?{' '}
                          <Link to="/login" style={{ color: '#145A3E', textDecoration: 'none', fontWeight: '600' }}>
                            Tra cứu tại đây
                          </Link>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
      <FloatingAIBot />
    </div>
  );
};

export default Home;
