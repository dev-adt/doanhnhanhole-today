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

// Doanh nghiệp & Tổ hợp tiêu biểu trong hệ sinh thái Laocai.today
const FEATURED_ENTERPRISES = [
  {
    id: 'fansipan-legend',
    name: 'TỔ HỢP DU LỊCH & CÁP TREO FANSIPAN SA PA',
    shortName: 'Sun World Fansipan Legend',
    roleTag: 'Biểu tượng Du lịch Quốc gia Sa Pa – Lào Cai',
    roleTagEn: 'National Tourism Icon • Sa Pa – Lao Cai',
    year: '2016',
    headquarters: 'Khu Du lịch Quốc gia Sa Pa, Thị xã Sa Pa, Tỉnh Lào Cai',
    headquartersEn: 'Sa Pa National Tourist Area, Sa Pa Town, Lao Cai Province',
    sectors: 'Cáp treo kỷ lục thế giới • Quần thể văn hóa tâm linh • Nghỉ dưỡng 5 sao & Lễ hội bốn mùa',
    sectorsEn: 'World-Record Cable Car • Spiritual Cultural Complex • 5-Star Resort & Festivals',
    philosophy: 'Đánh thức Đỉnh thiêng – Nâng tầm Du lịch Việt Nam',
    philosophyEn: 'Awakening the Sacred Peak – Elevating Vietnam Tourism',
    highlight: 'Quần thể du lịch văn hóa trên đỉnh Fansipan (3.143m) đã đưa Lào Cai trở thành điểm đến quốc tế bốn mùa, kết hợp hài hòa giữa kỳ quan thiên nhiên Hoàng Liên Sơn và bản sắc văn hóa các dân tộc vùng cao Tây Bắc.',
    highlightEn: 'The cultural and tourism complex atop Fansipan (3,143m) has transformed Lao Cai into a four-season global destination, harmonizing Hoang Lien Son nature with Northwest indigenous heritage.',
    keyFocus: 'Phát triển hệ sinh thái du lịch nghỉ dưỡng đẳng cấp quốc tế, chuỗi lễ hội bốn mùa (Lễ hội Hoa Đỗ Quyên, Lễ hội Mùa Vàng, Lễ hội Tuyết) giúp du khách ở lại lâu hơn và trải nghiệm sâu hơn.',
    keyFocusEn: 'Developing world-class resort ecosystems and four-season festivals (Azalea Festival, Golden Harvest, Winter Festival) so visitors stay longer and experience deeper.',
    tags: ['Đỉnh thiêng Fansipan 3.143m', 'Khu DL Quốc gia Sa Pa', 'Du lịch Bốn mùa'],
    tagsEn: ['Fansipan Summit 3,143m', 'Sa Pa National Resort', 'Four-Season Tourism'],
    stats: [
      { label: 'Độ cao đỉnh', labelEn: 'Elevation', value: '3.143 m' },
      { label: 'Kỷ lục Guinness', labelEn: 'Guinness Records', value: '02 Kỷ lục' },
      { label: 'Vị thế', labelEn: 'Status', value: 'Biểu tượng Tây Bắc' }
    ],
    logo: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    color: '#145A3E'
  },
  {
    id: 'kim-thanh-logistics',
    name: 'TRUNG TÂM LOGISTICS & THƯƠNG MẠI QUỐC TẾ KIM THÀNH',
    shortName: 'Kim Thành Border Logistics',
    roleTag: 'Cửa ngõ Giao thương ASEAN – Trung Quốc',
    roleTagEn: 'ASEAN – China Cross-Border Trade Hub',
    year: '2012',
    headquarters: 'Khu Thương mại – Công nghiệp Kim Thành, P. Duyên Hải, TP. Lào Cai',
    headquartersEn: 'Kim Thanh Commercial – Industrial Zone, Lao Cai City',
    sectors: 'Thông quan Quốc tế • Kho ngoại quan & Kho lạnh • Vận tải Liên vận Đường sắt – Đường bộ',
    sectorsEn: 'Customs Clearance • Bonded & Cold Storage • Rail-Road Intermodal Logistics',
    philosophy: 'Kết nối Hành lang Kinh tế – Thông suốt Chuỗi Cung ứng',
    philosophyEn: 'Connecting Economic Corridors – Seamless Supply Chains',
    highlight: 'Nằm tại tâm điểm hành lang kinh tế Côn Minh – Lào Cai – Hà Nội – Hải Phòng, Khu thương mại Kim Thành là cầu nối trực tiếp hàng hóa nông sản, điện tử, máy móc và nguyên liệu giữa Việt Nam, ASEAN và thị trường Tây Nam Trung Quốc.',
    highlightEn: 'Situated at the heart of the Kunming – Lao Cai – Hanoi – Hai Phong economic corridor, directly linking agricultural produce, electronics, and raw materials between ASEAN and Southwest China.',
    keyFocus: 'Hiện đại hóa hạ tầng cửa khẩu thông minh, mở rộng hệ thống kho lạnh bảo quản nông sản xuất khẩu, kết nối ga đường sắt liên vận quốc tế và cảng cạn ICD Lào Cai.',
    keyFocusEn: 'Modernizing smart border gate infrastructure, expanding cold-chain storage for agro-exports, and connecting international rail terminals with Lao Cai ICD dry port.',
    tags: ['Cửa khẩu Quốc tế Kim Thành', 'Liên vận Đường sắt & Cao tốc', 'Cầu nối ASEAN - Vân Nam'],
    tagsEn: ['Kim Thanh Intl Border Gate', 'Rail & Highway Intermodal', 'ASEAN - Yunnan Bridge'],
    stats: [
      { label: 'Quy mô KKT', labelEn: 'Zone Scale', value: '15.929 ha' },
      { label: 'Tuyến biên giới', labelEn: 'Border Line', value: '182 km' },
      { label: 'Thông quan', labelEn: 'Clearance', value: 'Cửa khẩu số' }
    ],
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    color: '#1B6E8C'
  },
  {
    id: 'traphaco-sapa',
    name: 'CÔNG TY DƯỢC LIỆU QUÝ & NÔNG SẢN VÙNG CAO LÀO CAI',
    shortName: 'Dược liệu & OCOP Lào Cai',
    roleTag: 'Chuỗi Dược liệu GACP-WHO & OCOP 5 Sao',
    roleTagEn: 'GACP-WHO Herbal Chain & 5-Star OCOP',
    year: '2014',
    headquarters: 'Thị xã Sa Pa & Khu Công nghiệp Đông Phố Mới, TP. Lào Cai',
    headquartersEn: 'Sa Pa Town & Dong Pho Moi Industrial Park, Lao Cai City',
    sectors: 'Chế biến sâu Atiso, Tam thất, Đương quy • Chè Shan Tuyết Cổ Thụ • Nông sản Hữu cơ',
    sectorsEn: 'Artichoke, Panax & Angelica Extraction • Ancient Shan Tuyet Tea • Organic Agri',
    philosophy: 'Tinh hoa Dược liệu Đại ngàn – Chuẩn mực Quốc tế',
    philosophyEn: 'Highland Herbal Quintessence – Global Standards',
    highlight: 'Tiên phong liên kết hàng ngàn hộ đồng bào vùng cao Sa Pa, Bắc Hà, Bát Xát, Mường Khương phát triển vùng trồng dược liệu sạch đạt chuẩn GACP-WHO và nâng tầm đặc sản OCOP Lào Cai vươn ra thế giới.',
    highlightEn: 'Pioneering partnerships with thousands of highland households across Sa Pa, Bac Ha, Bat Xat, and Muong Khuong to cultivate GACP-WHO medicinal herbs and 5-star OCOP specialties.',
    keyFocus: 'Đầu tư công nghệ chiết xuất dược liệu hiện đại, truy xuất nguồn gốc số hóa từng vùng trồng và phát triển dòng sản phẩm chăm sóc sức khỏe, trà thảo mộc cao cấp xuất khẩu.',
    keyFocusEn: 'Investing in advanced herbal extraction technology, digital plantation traceability, and premium healthcare & organic tea exports.',
    tags: ['Chuẩn dược liệu GACP-WHO', 'Atiso Sa Pa & Chè Shan Tuyết', 'Sản phẩm OCOP 5 Sao'],
    tagsEn: ['GACP-WHO Certified Herbs', 'Sa Pa Artichoke & Shan Tea', '5-Star OCOP Products'],
    stats: [
      { label: 'Vùng dược liệu', labelEn: 'Herbal Area', value: '4.000+ ha' },
      { label: 'Tiêu chuẩn', labelEn: 'Standard', value: 'GACP-WHO' },
      { label: 'Sản phẩm OCOP', labelEn: 'OCOP Items', value: '200+ Sản phẩm' }
    ],
    logo: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80',
    color: '#D99B26'
  },
  {
    id: 'adt-international',
    name: 'CÔNG TY CỔ PHẦN ADT QUỐC TẾ (ĐỐI TÁC CÔNG NGHỆ)',
    shortName: 'ADT Quốc tế',
    roleTag: 'Đơn vị Kiến trúc Nền tảng Số & AI Đa ngôn ngữ',
    roleTagEn: 'Digital Platform & Multilingual AI Architect',
    year: '2015',
    headquarters: 'Hà Nội & Văn phòng Đại diện Kết nối Số Lào Cai',
    headquartersEn: 'Hanoi & Lao Cai Digital Connection Representative Office',
    sectors: 'Nền tảng Laocai.today • Trợ lý AI Đa ngôn ngữ • Hệ điều hành Doanh nghiệp Orion & Edunow',
    sectorsEn: 'Laocai.today Platform • Multilingual AI Agent • Orion ERP & Edunow',
    philosophy: 'Chuyển đổi số Thực chất – Kết nối Lào Cai với Thế giới',
    philosophyEn: 'Practical Digital Transformation – Connecting Lao Cai to the World',
    highlight: 'Đơn vị phát triển và vận hành hạ tầng công nghệ Laocai.today, tích hợp mô hình Media + Data + Platform + AI giúp số hóa hồ sơ doanh nghiệp, xúc tiến đầu tư và hỗ trợ du khách bằng 5 ngôn ngữ tự động.',
    highlightEn: 'Architect and operator of the Laocai.today technological infrastructure, integrating Media + Data + Platform + AI to digitize enterprises, promote investment, and assist visitors in 5 languages.',
    keyFocus: 'Triển khai hệ sinh thái Trợ lý AI phường xã, nền tảng quản trị thông minh Orion và chương trình đào tạo kỹ năng số Edunow.today cho cộng đồng doanh nghiệp và nhân lực địa phương.',
    keyFocusEn: 'Deploying Ward AI assistants, Orion intelligent enterprise management, and Edunow.today digital training for local businesses and workforce.',
    tags: ['Kiến trúc 3 Lớp Số hóa', 'Trợ lý AI 5 Ngôn ngữ', 'Hệ sinh thái Orion & Edunow'],
    tagsEn: ['3-Layer Digital Architecture', '5-Language AI Assistant', 'Orion & Edunow Ecosystem'],
    stats: [
      { label: 'Ngôn ngữ AI', labelEn: 'AI Languages', value: '05 Ngôn ngữ' },
      { label: 'Vận hành', labelEn: 'Operation', value: '24/7 Realtime' },
      { label: 'Trụ cột số', labelEn: 'Digital Pillars', value: 'Media•Data•AI' }
    ],
    logo: '/images/adt_logo.svg',
    color: '#B83B2A'
  }
];

// Danh sách đối tác hiển thị trên thanh carousel
const PARTNER_COMPANIES = [
  { id: 1, name: 'Minh Đăng Group', logo: '/images/companies/minh-dang-group.jpg' },
  { id: 2, name: 'Eakar Vina', logo: '/images/companies/eakar-vina.jpg' },
  { id: 3, name: 'CTP Group (HNX: CTP)', logo: '/images/companies/ctp-group.png' },
  { id: 4, name: 'Bazan Heritage Coffee', logo: '/images/companies/bazan-coffee.jpg' },
  { id: 5, name: 'VNT Import Export', logo: '/images/companies/vnt.png' },
  { id: 6, name: 'Phúc Vinh Port & Logistics', logo: '/images/companies/phuc-vinh.png' },
  { id: 7, name: 'MD Homes', logo: '/images/companies/md-homes.png' }
];

// 8 Điểm đến & Động lực Kinh tế Tiêu biểu Lào Cai (Chương 13 & 21)
const TOP_DESTINATIONS = [
  {
    id: 1,
    title: 'Đỉnh Thiêng Fansipan & Thung Lũng Mường Hoa',
    titleEn: 'Fansipan Summit & Muong Hoa Valley',
    location: 'Khu Du lịch Quốc gia Sa Pa (3.143m)',
    locationEn: 'Sa Pa National Tourist Area (3,143m)',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Khám phá Lào Cai')}`
  },
  {
    id: 2,
    title: 'Khu Kinh Tế Cửa Khẩu Quốc Tế Lào Cai – Kim Thành',
    titleEn: 'Lao Cai – Kim Thanh International Border Economic Zone',
    location: 'TP. Lào Cai & Hành lang Kinh tế ASEAN – TQ',
    locationEn: 'Lao Cai City & ASEAN – China Corridor',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85',
    category: 'investment',
    link: `/posts?category=${encodeURIComponent('Cửa khẩu & Logistics')}`
  },
  {
    id: 3,
    title: 'Cao Nguyên Trắng Bắc Hà & Dinh Hoàng A Tưởng',
    titleEn: 'Bac Ha White Plateau & Hoang A Tuong Palace',
    location: 'Huyện Bắc Hà — Di sản Chợ phiên & Đua ngựa',
    locationEn: 'Bac Ha District — Market & Horse Racing Heritage',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Du lịch & Trải nghiệm')}`
  },
  {
    id: 4,
    title: 'Dược Liệu Quý Vùng Cao & Chè Cổ Thụ Shan Tuyết',
    titleEn: 'Precious Highland Herbs & Ancient Shan Tuyet Tea',
    location: 'Sa Pa, Bắc Hà, Mường Khương & Bát Xát',
    locationEn: 'Sa Pa, Bac Ha, Muong Khuong & Bat Xat',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85',
    category: 'coffee',
    link: `/posts?category=${encodeURIComponent('Nông sản & Dược liệu')}`
  },
  {
    id: 5,
    title: 'Đại Ngàn Y Tý & Thiên Đường Săn Mây Biên Giới',
    titleEn: 'Y Ty Primeval Forest & Cloud Hunting Paradise',
    location: 'Huyện Bát Xát — Bản sắc Hà Nhì & Cột mốc Lũng Pô',
    locationEn: 'Bat Xat District — Ha Nhi Culture & Lung Po',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Khám phá Lào Cai')}`
  },
  {
    id: 6,
    title: 'KCN Tằng Loỏng, Đông Phố Mới & Võ Lao',
    titleEn: 'Tang Loong, Dong Pho Moi & Vo Lao Industrial Parks',
    location: 'Bảo Thắng, TP. Lào Cai & Văn Bàn',
    locationEn: 'Bao Thang, Lao Cai City & Van Ban',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=85',
    category: 'investment',
    link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`
  },
  {
    id: 7,
    title: 'Nông Nghiệp Công Nghệ Cao & Cá Hồi Nước Lạnh',
    titleEn: 'High-Tech Agriculture & Cold-Water Salmon',
    location: 'Thác Bạc Sa Pa, Ngũ Chỉ Sơn & Bảo Yên',
    locationEn: 'Sa Pa Silver Waterfall, Ngu Chi Son & Bao Yen',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85',
    category: 'agritech',
    link: `/posts?category=${encodeURIComponent('Nông sản & Dược liệu')}`
  },
  {
    id: 8,
    title: 'Đèo Ô Quy Hồ & Không Gian Kinh Tế Đêm Tây Bắc',
    titleEn: 'O Quy Ho Pass & Northwest Night Economy',
    location: 'Hoàng Liên Sơn, Thị xã Sa Pa & TP. Lào Cai',
    locationEn: 'Hoang Lien Son, Sa Pa Town & Lao Cai City',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Du lịch & Trải nghiệm')}`
  }
];

// Bảng xếp hạng Top 10 Thương hiệu Nông sản, Dược liệu & OCOP Lào Cai vs Top 10 Giao thương Cửa khẩu & Đầu tư Chiến lược
const TOP_EXPORTERS_TAY_NGUYEN = {
  title: 'Top 10 Thương Hiệu Dược Liệu, Nông Sản & OCOP Lào Cai',
  titleEn: 'Top 10 Lao Cai Medicinal Herbs, Agro & OCOP Brands',
  sub: 'Những chuỗi sản phẩm đặc hữu vùng cao tạo nên danh tiếng và giá trị gia tăng bền vững của tỉnh Lào Cai',
  subEn: 'Flagship highland specialty chains driving sustainable value and brand prestige for Lao Cai Province',
  top3: [
    {
      name: 'Dược Liệu Quý Sa Pa – Bắc Hà (Chuẩn GACP-WHO)',
      sub: 'Thị xã Sa Pa & Huyện Bắc Hà, Lào Cai',
      logo: '/images/exporters/simexco.svg',
      highlight: 'Vùng trồng và nhà máy chiết xuất cao mềm Atiso, tam thất, đương quy, chùa dù lớn nhất vùng Tây Bắc đạt chuẩn quốc tế.',
      highlightEn: 'Largest GACP-WHO certified artichoke, panax, and medicinal herb cultivation & extraction chain in Northwest Vietnam.',
      pill: 'Chuỗi Dược liệu Công nghệ cao'
    },
    {
      name: 'Chè Cổ Thụ Shan Tuyết Hữu Cơ Bản Liền – Mường Khương',
      sub: 'Huyện Bắc Hà & Mường Khương, Lào Cai',
      logo: '/images/exporters/intime.svg',
      highlight: 'Danh trà cổ thụ hàng trăm năm tuổi trên đỉnh núi mờ sương đạt chứng nhận Organic Châu Âu và OCOP 5 sao cấp Quốc gia.',
      highlightEn: 'Centuries-old mountain Shan Tuyet tea certified EU Organic and National 5-Star OCOP.',
      pill: 'OCOP 5 Sao & Xuất khẩu EU'
    },
    {
      name: 'Cá Hồi, Cá Tầm Nước Lạnh & Quế Hữu Cơ Lào Cai',
      sub: 'Sa Pa, Bát Xát, Bảo Yên & Văn Bàn',
      logo: '/images/exporters/an-thai.svg',
      highlight: 'Thủ phủ nuôi cá nước lạnh lớn nhất miền Bắc kết hợp vùng nguyên liệu hơn 50.000 ha quế hữu cơ chưng cất tinh dầu xuất khẩu.',
      highlightEn: 'Northern Vietnam’s largest cold-water salmon & sturgeon hub paired with 50,000+ ha of organic cinnamon oil exports.',
      pill: 'Nông nghiệp Đặc sản Chủ lực'
    }
  ],
  rest: [
    'Gạo Séng Cù Mường Vi – Bát Xát',
    'Mận Tam Hoa & Lê Tai Nung Bắc Hà',
    'Tương Ớt Mường Khương & Thịt Gác Bếp',
    'Rượu Ngô Bản Phố & Cốm Bắc Hà',
    'Mật Ong Hoa Rừng Hoàng Liên Sơn',
    'Rau & Hoa Ôn Đới Công Nghệ Cao Sa Pa',
    'Thổ Cẩm Truyền Thống Lan Rừng – Tả Phìn'
  ]
};

const TOP_EXPORTERS_WORLD = {
  title: 'Top 10 Động Lực Giao Thương Cửa Khẩu & Logistics Quốc Tế',
  titleEn: 'Top 10 Cross-Border Trade & International Logistics Drivers',
  sub: 'Các trung tâm hạ tầng, logistics liên vận và tập đoàn chiến lược trên hành lang Côn Minh – Lào Cai – Hà Nội – Hải Phòng',
  subEn: 'Key infrastructure hubs, intermodal logistics, and strategic operators along the Kunming – Lao Cai – Hai Phong corridor',
  top3: [
    {
      name: 'Khu Thương Mại – Công Nghiệp Kim Thành (Cửa Khẩu Quốc Tế)',
      sub: 'Cửa khẩu Quốc tế đường bộ số II Kim Thành, TP. Lào Cai',
      logo: '/images/exporters/neumann.svg',
      highlight: 'Tâm điểm thông quan hàng hóa xuất nhập khẩu nông sản, trái cây tươi, thiết bị điện tử và nguyên liệu giữa Việt Nam – Trung Quốc.',
      highlightEn: 'Primary customs clearance hub for fresh produce, electronics, and industrial materials between Vietnam and China.',
      pill: 'Cửa khẩu Quốc tế Thông minh'
    },
    {
      name: 'Tổ Hợp Đường Sắt Liên Vận Quốc Tế & Cảng Cạn ICD Lào Cai',
      sub: 'Ga Quốc tế Lào Cai – Kết nối Hà Khẩu (Vân Nam) & Châu Âu',
      logo: '/images/exporters/ldc.svg',
      highlight: 'Tuyến đường sắt liên vận trực tiếp nối cảng biển Hải Phòng qua Lào Cai sang Vân Nam (Trung Quốc) và tuyến đường sắt Á – Âu.',
      highlightEn: 'Direct international rail link connecting Hai Phong seaports through Lao Cai to Yunnan (China) and Eurasian rail corridors.',
      pill: 'Liên vận Đường sắt Á – Âu'
    },
    {
      name: 'Cảng Hàng Không Sa Pa & Trục Cao Tốc Nội Bài – Lào Cai',
      sub: 'Xã Cam Cọn, Huyện Bảo Yên & Trục Động lực Dọc sông Hồng',
      logo: '/images/exporters/ecom.svg',
      highlight: 'Dự án sân bay cấp 4C công suất 1,5 – 3 triệu khách/năm cùng cao tốc mở rộng hoàn thiện mạng lưới giao thông Đa phương thức.',
      highlightEn: '4C-class airport project (1.5–3M passengers/year) and expanded expressway completing multimodal transport connectivity.',
      pill: 'Hạ tầng Chiến lược Quốc gia'
    }
  ],
  rest: [
    'Cửa khẩu Phụ Bản Vược (Bát Xát)',
    'Cửa khẩu Quốc tế Mường Khương',
    'Hệ thống Kho Ngoại quan & Kho Lạnh Kim Thành',
    'Trung tâm Kiểm nghiệm – Kiểm dịch Nông sản XNK',
    'Hành lang Thương mại Điện tử Xuyên biên giới',
    'Tổ hợp Đô thị & Dịch vụ Biên mậu Lào Cai',
    'Mạng lưới Logistics Chuỗi Lạnh ASEAN – Vân Nam'
  ]
};

// Bảng xếp hạng Top 10 Khu Kinh tế, Khu & Cụm Công nghiệp Tiêu biểu Lào Cai
const TOP_INDUSTRIAL_PARKS = {
  title: 'Top 10 Khu Kinh Tế, Khu & Cụm Công Nghiệp Trọng Điểm Lào Cai',
  titleEn: 'Top 10 Economic Zones, Industrial Parks & Clusters in Lao Cai',
  sub: 'Tâm điểm thu hút dòng vốn FDI, logistics biên giới, công nghiệp chế biến sâu và sản xuất công nghệ cao vùng Tây Bắc',
  subEn: 'Premier destinations for FDI, border logistics, deep processing, and high-tech manufacturing in Northwest Vietnam',
  top3: [
    {
      id: 'kkt-cua-khau-lao-cai',
      rank: 1,
      name: 'Khu Kinh Tế Cửa Khẩu Lào Cai & Kim Thành',
      nameEn: 'Lao Cai Border Gate Economic Zone & Kim Thanh',
      location: 'TP. Lào Cai, Bát Xát, Mường Khương (Dọc biên giới Việt – Trung)',
      locationEn: 'Lao Cai City, Bat Xat & Muong Khuong',
      scale: '15.929 ha',
      scaleEn: '15,929 Hectares',
      logo: '/images/exporters/kcn-hoa-phu.svg',
      highlight: 'Một trong 8 Khu kinh tế cửa khẩu trọng điểm quốc gia; hưởng cơ chế ưu đãi thuế, đất đai và thông quan cao nhất dành cho thương mại quốc tế, kho vận và chế biến xuất khẩu.',
      highlightEn: 'One of Vietnam’s 8 key national border gate economic zones, offering maximum tax, land, and customs incentives for international trade and export processing.',
      pill: 'KKT Cửa khẩu Trọng điểm Quốc gia',
      pillEn: 'Key National Border Economic Zone',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&subCategory=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    },
    {
      id: 'kcn-tang-loong',
      rank: 2,
      name: 'Khu Công Nghiệp Tằng Loỏng',
      nameEn: 'Tang Loong Industrial Park',
      location: 'Thị trấn Tằng Loỏng, Huyện Bảo Thắng, Tỉnh Lào Cai',
      locationEn: 'Tang Loong Town, Bao Thang District, Lao Cai',
      scale: '1.100 ha',
      scaleEn: '1,100 Hectares',
      logo: '/images/exporters/kcn-phu-xuan.svg',
      highlight: 'Khu công nghiệp chế biến sâu khoáng sản, hóa chất, phân bón và luyện kim quy mô lớn hàng đầu miền núi phía Bắc, kết nối trực tiếp đường sắt và cao tốc Nội Bài – Lào Cai.',
      highlightEn: 'Leading large-scale deep mineral processing, chemical, and metallurgical industrial park in Northern Vietnam, directly linked to rail and expressway.',
      pill: 'Trung tâm Công nghiệp Chế biến sâu',
      pillEn: 'Deep Processing Industrial Hub',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&subCategory=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    },
    {
      id: 'kcn-dong-pho-moi-vo-lao',
      rank: 3,
      name: 'KCN Đông Phố Mới, Bắc Duyên Hải & Võ Lao',
      nameEn: 'Dong Pho Moi, Bac Duyen Hai & Vo Lao IPs',
      location: 'TP. Lào Cai & Huyện Văn Bàn (Kết nối Sân bay Sa Pa)',
      locationEn: 'Lao Cai City & Van Ban District',
      scale: '650+ ha',
      scaleEn: '650+ Hectares',
      logo: '/images/exporters/kcn-mdrak.svg',
      highlight: 'Tổ hợp công nghiệp sạch, chế biến nông lâm sản, dược liệu công nghệ cao, lắp ráp điện tử và dịch vụ kho bãi hậu cần gắn liền với cửa khẩu quốc tế và sân bay Sa Pa.',
      highlightEn: 'Clean industry, high-tech agro & herbal processing, electronics assembly, and logistics complex adjacent to the international border gate and Sa Pa Airport.',
      pill: 'Công nghiệp Sạch & Chế biến CNC',
      pillEn: 'Clean Industry & High-Tech Processing',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&subCategory=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    }
  ],
  rest: [
    { name: 'Khu Công nghiệp Võ Lao (Giai đoạn mới)', nameEn: 'Vo Lao Industrial Park', location: 'Huyện Văn Bàn (200 ha)' },
    { name: 'Khu Công nghiệp Bản Qua – Bát Xát', nameEn: 'Ban Qua Industrial Park', location: 'Huyện Bát Xát' },
    { name: 'Cụm Công nghiệp Cốc My – Trịnh Tường', nameEn: 'Coc My – Trinh Tuong Cluster', location: 'Huyện Bát Xát' },
    { name: 'Cụm Công nghiệp Sơn Mãn – Vạn Hòa', nameEn: 'Son Man – Van Hoa Cluster', location: 'TP. Lào Cai' },
    { name: 'Cụm Công nghiệp Phố Ràng', nameEn: 'Pho Rang Industrial Cluster', location: 'Huyện Bảo Yên' },
    { name: 'Cụm Công nghiệp Bắc Hà (Chế biến Dược liệu)', nameEn: 'Bac Ha Herbal Cluster', location: 'Huyện Bắc Hà' },
    { name: 'Khu Logistics & Cảng cạn ICD Lào Cai', nameEn: 'Lao Cai ICD Dry Port & Logistics', location: 'TP. Lào Cai' }
  ]
};

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

  // Hero Intro Video State, Refs & Poster
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [isHeroVideoEnded, setIsHeroVideoEnded] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const heroSectionRef = useRef(null);
  const heroBgVideoRef = useRef(null);
  const heroMainVideoRef = useRef(null);

  const isViLang = !currentLang || currentLang === 'vi';
  const heroVideoPoster = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1280&q=85';
  const heroMainVideoSrc = isViLang
    ? '/videos/intro_daklak_vi.mp4'
    : '/videos/intro_daklak_en.mp4';
  const heroBgVideoSrc = isViLang
    ? '/videos/hero_bg_vi.mp4'
    : '/videos/hero_bg_en.mp4';

  useEffect(() => {
    setIsHeroVideoPlaying(false);
    setIsHeroVideoEnded(false);
    if (heroMainVideoRef.current) {
      heroMainVideoRef.current.pause();
      heroMainVideoRef.current.currentTime = 0;
    }
  }, [isViLang]);

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
    if (isHeroInView && (!isHeroVideoPlaying || isHeroVideoEnded)) {
      const p = bgVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      bgVideo.pause();
    }
  }, [isHeroInView, isHeroVideoPlaying, isHeroVideoEnded, heroBgVideoSrc]);

  const handleStartHeroVideo = () => {
    setIsHeroVideoEnded(false);
    setIsHeroVideoPlaying(true);
    const mainVideo = heroMainVideoRef.current;
    if (mainVideo) {
      mainVideo.currentTime = 0;
      mainVideo.muted = false;
      const p = mainVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  };

  const handleReplayHeroVideo = () => {
    setIsHeroVideoEnded(false);
    setIsHeroVideoPlaying(true);
    const mainVideo = heroMainVideoRef.current;
    if (mainVideo) {
      mainVideo.currentTime = 0;
      mainVideo.muted = false;
      const p = mainVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  };

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

  // Top Destinations Tab Filter
  const [activeDestTab, setActiveDestTab] = useState('all');
  const filteredDestinations = activeDestTab === 'all'
    ? TOP_DESTINATIONS.slice(0, 8)
    : TOP_DESTINATIONS.filter(d => d.category === activeDestTab).concat(TOP_DESTINATIONS.filter(d => d.category !== activeDestTab)).slice(0, 4);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Investment Projects Filter State
  const [selectedSector, setSelectedSector] = useState('all');

  // State Slider Doanh nghiệp tiêu biểu
  const [enterpriseIndex, setEnterpriseIndex] = useState(0);
  const [isEnterpriseHovered, setIsEnterpriseHovered] = useState(false);
  const handlePrevEnterprise = () => {
    setEnterpriseIndex(prev => (prev - 1 + FEATURED_ENTERPRISES.length) % FEATURED_ENTERPRISES.length);
  };
  const handleNextEnterprise = () => {
    setEnterpriseIndex(prev => (prev + 1) % FEATURED_ENTERPRISES.length);
  };

  useEffect(() => {
    if (isEnterpriseHovered) return;
    const interval = setInterval(() => {
      setEnterpriseIndex(prev => (prev + 1) % FEATURED_ENTERPRISES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isEnterpriseHovered]);

  // State Slider Đối tác của chúng tôi
  const [partnerIndex, setPartnerIndex] = useState(PARTNER_COMPANIES.length);
  const [isPartnerHovered, setIsPartnerHovered] = useState(false);
  const [withPartnerTransition, setWithPartnerTransition] = useState(true);
  const [partnerVisibleCount, setPartnerVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 640) setPartnerVisibleCount(2);
      else if (window.innerWidth <= 1024) setPartnerVisibleCount(3);
      else setPartnerVisibleCount(4);
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    if (isPartnerHovered) return;
    const interval = setInterval(() => {
      setPartnerIndex(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPartnerHovered]);

  const totalPartners = PARTNER_COMPANIES.length;
  useEffect(() => {
    if (partnerIndex >= totalPartners * 2) {
      const resetTimer = setTimeout(() => {
        setWithPartnerTransition(false);
        setPartnerIndex(totalPartners);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setWithPartnerTransition(true);
          });
        });
      }, 400);
      return () => clearTimeout(resetTimer);
    } else if (partnerIndex < totalPartners) {
      const resetTimer = setTimeout(() => {
        setWithPartnerTransition(false);
        setPartnerIndex(partnerIndex + totalPartners);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setWithPartnerTransition(true);
          });
        });
      }, 400);
      return () => clearTimeout(resetTimer);
    }
  }, [partnerIndex, totalPartners]);

  const handlePrevPartner = () => {
    setPartnerIndex(prev => prev - 1);
  };
  const handleNextPartner = () => {
    setPartnerIndex(prev => prev + 1);
  };

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

            {/* Right Column: Hero Intro Video / Visual Showcase */}
            <div className="gt-hero-visuals scroll-reveal scroll-reveal-right">
              <div className="gt-hero-video-block">
                <div className="gt-hero-video-frame">
                  <video
                    ref={heroMainVideoRef}
                    className={`gt-hero-video-player ${isHeroVideoPlaying ? 'is-active' : ''}`}
                    src={heroMainVideoSrc}
                    poster={heroVideoPoster}
                    controls={isHeroVideoPlaying && !isHeroVideoEnded}
                    playsInline
                    preload="metadata"
                    title="Khám phá Lào Cai — Đỉnh thiêng hội tụ, Cửa ngõ giao thương"
                    onPlay={() => setIsHeroVideoEnded(false)}
                    onEnded={() => setIsHeroVideoEnded(true)}
                  />

                  {!isHeroVideoPlaying && (
                    <button
                      type="button"
                      className="gt-hero-video-poster-btn"
                      aria-label="Khám phá Lào Cai"
                      onClick={handleStartHeroVideo}
                    >
                      <img
                        src={heroVideoPoster}
                        alt="Đỉnh Fansipan & Ruộng bậc thang Lào Cai"
                        className="gt-hero-video-poster-img"
                        loading="eager"
                        decoding="async"
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(9, 27, 20, 0.15) 0%, rgba(9, 27, 20, 0.72) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '18px 22px',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{
                            background: 'rgba(13, 38, 28, 0.85)',
                            border: '1px solid rgba(217, 155, 38, 0.6)',
                            color: '#FFE082',
                            padding: '5px 12px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '0.4px'
                          }}>
                            🏔️ FANSIPAN 3.143M • SA PA • BẮC HÀ • Y TÝ
                          </span>
                          <span style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #D99B26 0%, #B87D14 100%)',
                            color: '#091B14',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(217, 155, 38, 0.5)',
                            fontSize: '1.2rem'
                          }}>
                            <i className="ti ti-player-play-filled" />
                          </span>
                        </div>

                        <div>
                          <div style={{ color: '#FFE082', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                            {currentLang === 'en' ? 'GATEWAY TO NORTHWEST VIETNAM & ASEAN - CHINA' : 'TÂM ĐIỂM TÂY BẮC & HÀNH LANG CÔN MINH – LÀO CAI – HẢI PHÒNG'}
                          </div>
                          <div style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', lineHeight: 1.3 }}>
                            {currentLang === 'en' ? 'Stay Longer • Experience Deeper • Invest Smarter in Lao Cai' : 'Kết nối con người – Kết nối doanh nghiệp – Kết nối Lào Cai với thế giới'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {isHeroVideoPlaying && isHeroVideoEnded && (
                    <div className="gt-hero-video-ended-overlay">
                      <p className="gt-hero-video-ended-title">
                        {isViLang ? 'Khám phá & Kết nối Đầu tư cùng Laocai.today' : 'Explore & Connect with Laocai.today'}
                      </p>
                      <div className="gt-hero-video-cta-row">
                        <Link to="/members" className="gt-hero-video-cta gt-hero-video-cta-primary">
                          <i className="ti ti-building-community" aria-hidden="true" />
                          <span>Tìm doanh nghiệp</span>
                        </Link>
                        <Link to="/ai-chat" className="gt-hero-video-cta gt-hero-video-cta-ai">
                          <i className="ti ti-sparkles" aria-hidden="true" />
                          <span>Hỏi Trợ lý AI</span>
                        </Link>
                      </div>
                      <button
                        type="button"
                        className="gt-hero-video-replay-btn"
                        onClick={handleReplayHeroVideo}
                      >
                        <i className="ti ti-rotate-clockwise" aria-hidden="true" />
                        <span>{isViLang ? 'Xem lại video' : 'Replay video'}</span>
                      </button>
                    </div>
                  )}
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
            SECTION 2: TRỤ CỘT ĐẦU TƯ, CỬA KHẨU & ĐIỂM ĐẾN TIÊU BIỂU LÀO CAI
            ======================================================== */}
        <section className="gt-dest-section" id="top-destinations">
          <div className="gt-dest-container">
            <div className="gt-dest-header scroll-reveal scroll-reveal-down">
              <div className="gt-dest-header-left">
                <span className="daklak-section-badge" style={{ width: 'fit-content' }}>
                  <i className="ti ti-compass" style={{ marginRight: '6px' }} />
                  {currentLang === 'en' ? '5 Experience & Economic Clusters' : '5 Cụm Trải Nghiệm & Động Lực Tăng Trưởng'}
                </span>
                <h2 className="gt-section-title">
                  {currentLang === 'en' ? 'Lao Cai Strategic Hubs & Iconic Destinations' : 'Tâm Điểm Giao Thương, Đầu Tư & Danh Thắng Lào Cai'}
                </h2>
                <div className="gt-dest-tabs">
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('all')}
                  >
                    {currentLang === 'en' ? 'All 8 Highlights' : 'Tất cả 8 tâm điểm'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'tourism' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('tourism')}
                  >
                    {currentLang === 'en' ? 'Fansipan, Sa Pa, Bac Ha & Y Ty' : 'Fansipan • Sa Pa • Bắc Hà • Y Tý'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'investment' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('investment')}
                  >
                    {currentLang === 'en' ? 'Border Gate & Industrial Parks' : 'Kinh tế Cửa khẩu & KCN'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'coffee' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('coffee')}
                  >
                    {currentLang === 'en' ? 'Medicinal Herbs & Shan Tea' : 'Dược liệu & Chè Shan Tuyết'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'agritech' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('agritech')}
                  >
                    {currentLang === 'en' ? 'High-Tech Agri & Cold-Water Fish' : 'Nông nghiệp CNC & Cá nước lạnh'}
                  </button>
                </div>
              </div>
              <Link to={`/posts?category=${encodeURIComponent('Khám phá Lào Cai')}`} className="gt-dest-view-all">
                <span>{currentLang === 'en' ? 'Explore all Lao Cai hubs' : 'Khám phá toàn cảnh Lào Cai'}</span>
                <i className="ti ti-arrow-right" />
              </Link>
            </div>

            <div className="gt-dest-grid">
              {filteredDestinations.map((dest, idx) => {
                const animDir = idx % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right';
                const staggerClass = `stagger-${(idx % 4) + 1}`;
                return (
                  <div 
                    key={dest.id} 
                    className={`gt-dest-card scroll-reveal ${animDir} ${staggerClass}`}
                    onClick={() => navigate(dest.link)}
                  >
                    <div className="gt-dest-img-wrap">
                      <img src={dest.image} alt={dest.title} loading="lazy" />
                    </div>
                    <div className="gt-dest-info">
                      <h3 className="gt-dest-name">
                        {currentLang === 'en' ? dest.titleEn : dest.title}
                      </h3>
                      <p className="gt-dest-location">
                        <i className="ti ti-map-pin" style={{ color: '#D99B26', marginRight: '4px' }} />
                        {currentLang === 'en' ? dest.locationEn : dest.location}
                      </p>
                    </div>
                  </div>
                );
              })}
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
            SECTION 5: TỔ HỢP & DOANH NGHIỆP TIÊU BIỂU LÀO CAI
            ======================================================== */}
        <section className="daklak-featured-enterprise-section" id="doanh-nghiep-tieu-bieu">
          <div className="daklak-container">
            <div className="daklak-section-header" style={{ marginBottom: '35px' }}>
              <span className="daklak-section-badge">
                <i className="ti ti-building" style={{ marginRight: '4px' }} />
                {currentLang === 'en' ? 'Lao Cai Business & Investment Ecosystem' : 'Hệ Sinh Thái Tổ Hợp & Doanh Nghiệp Tiêu Biểu'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Flagship Complexes & Enterprises' : 'Tổ Hợp & Doanh Nghiệp Đầu Tàu Lào Cai'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Explore key tourism complexes, border logistics centers, medicinal herb processors, and digital technology partners driving Lao Cai’s sustainable growth.'
                  : 'Khám phá các tổ hợp du lịch, trung tâm logistics cửa khẩu quốc tế, doanh nghiệp chế biến sâu dược liệu vùng cao và đối tác công nghệ đồng hành cùng sự phát triển của Lào Cai.'}
              </p>
            </div>

            <div
              className="daklak-enterprise-slider-wrapper"
              onMouseEnter={() => setIsEnterpriseHovered(true)}
              onMouseLeave={() => setIsEnterpriseHovered(false)}
            >
              <button
                type="button"
                className="daklak-enterprise-nav-btn prev"
                onClick={handlePrevEnterprise}
                aria-label="Doanh nghiệp trước"
                title={currentLang === 'en' ? 'Previous enterprise' : 'Doanh nghiệp trước'}
              >
                <i className="ti ti-chevron-left" />
              </button>

              <button
                type="button"
                className="daklak-enterprise-nav-btn next"
                onClick={handleNextEnterprise}
                aria-label="Doanh nghiệp tiếp theo"
                title={currentLang === 'en' ? 'Next enterprise' : 'Doanh nghiệp tiếp theo'}
              >
                <i className="ti ti-chevron-right" />
              </button>

              {(() => {
                const enterprise = FEATURED_ENTERPRISES[enterpriseIndex];
                return (
                  <div className="daklak-enterprise-card">
                    <div className="daklak-enterprise-left">
                      <div className="daklak-enterprise-header-row">
                        <div className="daklak-enterprise-logo-frame">
                          <img
                            src={enterprise.logo}
                            alt={enterprise.name}
                            className="daklak-enterprise-logo-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div>
                          <span className="daklak-enterprise-role-badge">
                            <i className="ti ti-rosette-discount-check" />
                            {currentLang === 'en' ? enterprise.roleTagEn : enterprise.roleTag}
                          </span>
                          <h3 className="daklak-enterprise-name" style={{ marginTop: '6px' }}>
                            {enterprise.name}
                          </h3>
                        </div>
                      </div>

                      <div className="daklak-enterprise-meta-list">
                        <div className="daklak-enterprise-meta-item">
                          <i className="ti ti-map-pin" />
                          <span><strong>{currentLang === 'en' ? 'HQ / Location:' : 'Trụ sở / Địa bàn:'}</strong> {currentLang === 'en' ? enterprise.headquartersEn : enterprise.headquarters}</span>
                        </div>
                        <div className="daklak-enterprise-meta-item">
                          <i className="ti ti-briefcase" />
                          <span><strong>{currentLang === 'en' ? 'Core Sectors:' : 'Lĩnh vực cốt lõi:'}</strong> {currentLang === 'en' ? enterprise.sectorsEn : enterprise.sectors}</span>
                        </div>
                      </div>

                      <p className="daklak-enterprise-desc">
                        "{currentLang === 'en' ? enterprise.highlightEn : enterprise.highlight}"
                      </p>

                      <div className="daklak-enterprise-philosophy">
                        <i className="ti ti-sparkles" style={{ color: '#D99B26' }} />
                        <span>{currentLang === 'en' ? 'Core Philosophy:' : 'Tôn chỉ phát triển:'}</span>
                        <span style={{ color: '#145A3E' }}>{currentLang === 'en' ? enterprise.philosophyEn : enterprise.philosophy}</span>
                      </div>
                    </div>

                    <div className="daklak-enterprise-right">
                      <div className="daklak-enterprise-right-header">
                        <i className="ti ti-chart-arrows-vertical" />
                        <span>{currentLang === 'en' ? 'KEY HIGHLIGHTS & STRATEGY' : 'CHỈ SỐ & TRỌNG TÂM CHIẾN LƯỢC'}</span>
                      </div>

                      <div className="daklak-enterprise-stats-grid">
                        {enterprise.stats.map((st, sIdx) => (
                          <div key={sIdx} className="daklak-enterprise-stat-box">
                            <div className="daklak-enterprise-stat-val notranslate" translate="no">{st.value}</div>
                            <div className="daklak-enterprise-stat-lbl">{currentLang === 'en' ? st.labelEn : st.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="daklak-enterprise-focus-card">
                        <div className="daklak-enterprise-focus-header">
                          <i className="ti ti-target-arrow" />
                          <span>{currentLang === 'en' ? 'Strategic Direction & Value' : 'Định hướng trọng tâm & Giá trị'}</span>
                        </div>
                        <p className="daklak-enterprise-focus-text">
                          {currentLang === 'en' ? enterprise.keyFocusEn : enterprise.keyFocus}
                        </p>
                        <div className="daklak-enterprise-tags-row">
                          {(currentLang === 'en' ? enterprise.tagsEn : enterprise.tags)?.map((tag, tIdx) => (
                            <span key={tIdx} className="daklak-enterprise-tag-pill">
                              <i className="ti ti-check" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="daklak-enterprise-action-wrap">
                        <button
                          type="button"
                          className="daklak-enterprise-btn-connect"
                          onClick={() => scrollToConsult(enterprise.shortName)}
                        >
                          <i className="ti ti-mail-forward" />
                          <span>{currentLang === 'en' ? 'Connect & Partner' : 'Kết nối & Hợp tác Đầu tư'}</span>
                          <i className="ti ti-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="daklak-enterprise-dots">
                {FEATURED_ENTERPRISES.map((ent, dIdx) => (
                  <button
                    key={ent.id}
                    type="button"
                    className={`daklak-enterprise-dot ${dIdx === enterpriseIndex ? 'active' : ''}`}
                    onClick={() => setEnterpriseIndex(dIdx)}
                    aria-label={`Chuyển đến ${ent.shortName}`}
                    title={ent.shortName}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: TOP 10 THƯƠNG HIỆU DƯỢC LIỆU – OCOP & GIAO THƯƠNG CỬA KHẨU LÀO CAI
            ======================================================== */}
        <section className="daklak-coffee-exporters-section" id="top-xuat-khau-ca-phe">
          <div className="daklak-container">
            <div className="coffee-exporters-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">
                <i className="ti ti-trophy" style={{ marginRight: '6px' }} />
                {currentLang === 'en' ? 'Highland Specialties & Cross-Border Trade Leadership' : 'Định Vị Chuỗi Giá Trị Vùng Cao & Cửa Ngõ Giao Thương Quốc Tế'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Top 10 Highland Specialties & Border Trade Hubs' : 'Top 10 Thương Hiệu Đặc Sản Vùng Cao & Giao Thương Cửa Khẩu'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Strategic overview of Lao Cai’s flagship medicinal herbs, organic tea, cold-water aquaculture, and international border gate logistics corridors.'
                  : 'Bức tranh toàn cảnh về những chuỗi sản phẩm dược liệu – nông sản OCOP đặc hữu của Lào Cai và hệ thống hạ tầng cửa khẩu – logistics liên vận quốc tế.'}
              </p>
            </div>

            <div className="coffee-exporters-grid">
              {/* BLOCK 1: ĐẶC SẢN & DƯỢC LIỆU LÀO CAI */}
              <div className="coffee-exporter-column scroll-reveal scroll-reveal-left">
                <div className="exporter-column-header">
                  <div className="exporter-col-icon tay-nguyen">
                    <i className="ti ti-leaf" />
                  </div>
                  <div className="exporter-col-titles">
                    <h3>{currentLang === 'en' ? TOP_EXPORTERS_TAY_NGUYEN.titleEn : TOP_EXPORTERS_TAY_NGUYEN.title}</h3>
                    <p>{currentLang === 'en' ? TOP_EXPORTERS_TAY_NGUYEN.subEn : TOP_EXPORTERS_TAY_NGUYEN.sub}</p>
                  </div>
                </div>

                <div className="exporter-top3-list">
                  {TOP_EXPORTERS_TAY_NGUYEN.top3.map((exp, idx) => (
                    <div key={idx} className="exporter-top3-card">
                      <div className="exporter-logo-wrap">
                        <img src={exp.logo} alt={exp.name} className="exporter-brand-logo" />
                      </div>
                      <div className="exporter-top3-body">
                        <div className="exporter-top3-header">
                          <h4 className="exporter-top3-name">{exp.name}</h4>
                          <span className="exporter-top3-sub">{exp.sub}</span>
                        </div>
                        <p className="exporter-top3-highlight">
                          {currentLang === 'en' ? exp.highlightEn : exp.highlight}
                        </p>
                        <span className="exporter-top3-pill">
                          <i className="ti ti-award" /> {exp.pill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="exporter-rest-block">
                  <h5 className="exporter-rest-title">
                    <i className="ti ti-sparkles" />
                    <span>{currentLang === 'en' ? 'Other Prominent Highland OCOP Brands' : 'Các thương hiệu OCOP & đặc sản tiêu biểu tiếp theo'}</span>
                  </h5>
                  <div className="exporter-next-grid-232">
                    {TOP_EXPORTERS_TAY_NGUYEN.rest.map((name, idx) => (
                      <div key={idx} className="exporter-tag-item">
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCK 2: CỬA KHẨU & LOGISTICS QUỐC TẾ */}
              <div className="coffee-exporter-column scroll-reveal scroll-reveal-right">
                <div className="exporter-column-header">
                  <div className="exporter-col-icon the-gioi">
                    <i className="ti ti-world" />
                  </div>
                  <div className="exporter-col-titles">
                    <h3>{currentLang === 'en' ? TOP_EXPORTERS_WORLD.titleEn : TOP_EXPORTERS_WORLD.title}</h3>
                    <p>{currentLang === 'en' ? TOP_EXPORTERS_WORLD.subEn : TOP_EXPORTERS_WORLD.sub}</p>
                  </div>
                </div>

                <div className="exporter-top3-list">
                  {TOP_EXPORTERS_WORLD.top3.map((exp, idx) => (
                    <div key={idx} className="exporter-top3-card">
                      <div className="exporter-logo-wrap">
                        <img src={exp.logo} alt={exp.name} className="exporter-brand-logo" />
                      </div>
                      <div className="exporter-top3-body">
                        <div className="exporter-top3-header">
                          <h4 className="exporter-top3-name">{exp.name}</h4>
                          <span className="exporter-top3-sub">{exp.sub}</span>
                        </div>
                        <p className="exporter-top3-highlight">
                          {currentLang === 'en' ? exp.highlightEn : exp.highlight}
                        </p>
                        <span className="exporter-top3-pill">
                          <i className="ti ti-globe" /> {exp.pill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="exporter-rest-block">
                  <h5 className="exporter-rest-title">
                    <i className="ti ti-truck-delivery" />
                    <span>{currentLang === 'en' ? 'Other Key Border Gates & Logistics Hubs' : 'Các cửa khẩu & trung tâm hạ tầng tiếp theo'}</span>
                  </h5>
                  <div className="exporter-next-grid-232">
                    {TOP_EXPORTERS_WORLD.rest.map((name, idx) => (
                      <div key={idx} className="exporter-tag-item">
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: TOP 10 KHU KINH TẾ, KHU & CỤM CÔNG NGHIỆP LÀO CAI
            ======================================================== */}
        <section className="daklak-industrial-parks-section" id="top-khu-cong-nghiep">
          <div className="daklak-container">
            <div className="industrial-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">
                <i className="ti ti-building-factory-2" style={{ marginRight: '6px' }} />
                {currentLang === 'en' ? 'Key Industrial & Border Economic Infrastructure' : 'Hạ Tầng Khu Kinh Tế Cửa Khẩu & Khu Công Nghiệp Trọng Điểm'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? TOP_INDUSTRIAL_PARKS.titleEn : TOP_INDUSTRIAL_PARKS.title}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en' ? TOP_INDUSTRIAL_PARKS.subEn : TOP_INDUSTRIAL_PARKS.sub}
              </p>
            </div>

            {/* TOP 3 PODIUM (2 - 1 - 3) */}
            <div className="industrial-podium-grid">
              {/* Cột bên trái (Rank 2: KCN Tằng Loỏng) */}
              {(() => {
                const kcn2 = TOP_INDUSTRIAL_PARKS.top3[1];
                return (
                  <div 
                    key={kcn2.id} 
                    className="industrial-podium-card rank-2 scroll-reveal scroll-reveal-left"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap">
                        <img src={kcn2.logo} alt={kcn2.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title">{currentLang === 'en' ? kcn2.nameEn : kcn2.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn2.locationEn : kcn2.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn2.scaleEn : kcn2.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn2.highlightEn : kcn2.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill">
                        <i className="ti ti-building-factory" /> {currentLang === 'en' ? kcn2.pillEn : kcn2.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cột chính giữa (Rank 1: KKT Cửa khẩu Lào Cai & Kim Thành) */}
              {(() => {
                const kcn1 = TOP_INDUSTRIAL_PARKS.top3[0];
                return (
                  <div 
                    key={kcn1.id} 
                    className="industrial-podium-card rank-1 scroll-reveal scroll-reveal-up"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap gold-border">
                        <img src={kcn1.logo} alt={kcn1.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title gold-text">{currentLang === 'en' ? kcn1.nameEn : kcn1.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn1.locationEn : kcn1.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill gold-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn1.scaleEn : kcn1.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn1.highlightEn : kcn1.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill gold-highlight">
                        <i className="ti ti-world" /> {currentLang === 'en' ? kcn1.pillEn : kcn1.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cột bên phải (Rank 3: KCN Đông Phố Mới, Bắc Duyên Hải & Võ Lao) */}
              {(() => {
                const kcn3 = TOP_INDUSTRIAL_PARKS.top3[2];
                return (
                  <div 
                    key={kcn3.id} 
                    className="industrial-podium-card rank-3 scroll-reveal scroll-reveal-right"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap">
                        <img src={kcn3.logo} alt={kcn3.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title">{currentLang === 'en' ? kcn3.nameEn : kcn3.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn3.locationEn : kcn3.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn3.scaleEn : kcn3.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn3.highlightEn : kcn3.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill">
                        <i className="ti ti-truck-delivery" /> {currentLang === 'en' ? kcn3.pillEn : kcn3.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 7 CỤM / KHU CÔNG NGHIỆP CÒN LẠI (BỐ CỤC 2 - 3 - 2) */}
            <div className="industrial-rest-wrapper scroll-reveal scroll-reveal-up">
              <h5 className="exporter-rest-title">
                <i className="ti ti-building-community" />
                <span>{currentLang === 'en' ? 'Other Prominent Industrial Parks & Clusters in Lao Cai' : 'Các khu & cụm công nghiệp tiêu biểu tiếp theo tại Lào Cai'}</span>
              </h5>
              <div className="industrial-next-grid-232">
                {TOP_INDUSTRIAL_PARKS.rest.map((park, idx) => (
                  <div 
                    key={idx} 
                    className="industrial-tag-item"
                  >
                    <div className="industrial-tag-content">
                      <i className="ti ti-building-factory" />
                      <span className="industrial-tag-name">{currentLang === 'en' ? (park.nameEn || park.name) : park.name}</span>
                    </div>
                    <span className="industrial-tag-loc">{park.location}</span>
                  </div>
                ))}
              </div>
            </div>
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
            SECTION 9: KIẾN TRÚC 3 LỚP & SỨ MỆNH SỐ HÓA LAOCAI.TODAY
            (Theo Chương 6 & 7 Tài liệu Giới thiệu dự án)
            ======================================================== */}
        <section className="daklak-section" id="kham-pha">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? '3-Layer Digital Architecture' : 'Kiến Trúc 3 Lớp Hệ Sinh Thái Số'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Connecting People • Connecting Enterprises • Connecting Lao Cai to the World' : 'Kết Nối Con Người – Kết Nối Doanh Nghiệp – Kết Nối Lào Cai Với Thế Giới'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Laocai.today is engineered on a modern 3-layer digital architecture uniting Community, Open Data & Digital Showrooms, and Multilingual Artificial Intelligence.'
                  : 'Laocai.today vận hành trên kiến trúc 3 lớp liên hoàn: Lớp Cộng đồng & Bản sắc, Lớp Dữ liệu & Showroom số Doanh nghiệp, và Lớp Trí tuệ Nhân tạo Đa ngôn ngữ.'}
              </p>
            </div>

            <div className="values-grid">
              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-users-group" /></div>
                <h3>{currentLang === 'en' ? 'Layer 1: Community & Heritage' : 'Lớp 1: Cộng Đồng & Bản Sắc'}</h3>
                <p>{currentLang === 'en' ? 'Connecting citizens, tourists, experts, and the global Lao Cai diaspora while preserving Northwest cultural heritage.' : 'Lan tỏa di sản văn hóa các dân tộc Tây Bắc, kết nối du khách, chuyên gia và mạng lưới người Lào Cai xa quê trên toàn cầu.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-database" /></div>
                <h3>{currentLang === 'en' ? 'Layer 2: Data & Digital Showrooms' : 'Lớp 2: Dữ Liệu & Showroom Số'}</h3>
                <p>{currentLang === 'en' ? 'Verified profiles of enterprises, OCOP specialties, border trade logistics, industrial parks, and investment projects.' : 'Chuẩn hóa hồ sơ năng lực doanh nghiệp, sản phẩm OCOP vùng cao, dữ liệu xuất nhập khẩu cửa khẩu và danh mục dự án kêu gọi đầu tư.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-cpu" /></div>
                <h3>{currentLang === 'en' ? 'Layer 3: Multilingual AI Engine' : 'Lớp 3: Trợ Lý AI Đa Ngôn Ngữ'}</h3>
                <p>{currentLang === 'en' ? '24/7 intelligent AI advisor in 5 languages (VI, EN, ZH, JA, KO) personalizing itineraries and matching B2B partners.' : 'Trợ lý AI đa ngôn ngữ (Việt – Anh – Trung – Nhật – Hàn) tự động hóa tư vấn đầu tư, thương mại biên giới và cá nhân hóa hành trình du lịch 24/7.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-world-longitude" /></div>
                <h3>{currentLang === 'en' ? 'ASEAN – China Gateway' : 'Cửa Ngõ Giao Thương Quốc Tế'}</h3>
                <p>{currentLang === 'en' ? 'Accelerating cross-border trade, intermodal logistics, and sustainable investment across the Kunming – Lao Cai – Hai Phong corridor.' : 'Thúc đẩy giao thương xuyên biên giới, logistics liên vận quốc tế và thu hút đầu tư chiến lược trên hành lang kinh tế Côn Minh – Lào Cai – Hải Phòng.'}</p>
              </div>
            </div>
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

                  <div className="daklak-ai-slider-nav">
                    <button
                      type="button"
                      className="daklak-ai-nav-arrow"
                      onClick={() => setAiSlideIndex(prev => (prev - 1 + 3) % 3)}
                      aria-label="Bài viết trước"
                    >
                      <i className="ti ti-chevron-left" />
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
                    <button
                      type="button"
                      className="daklak-ai-nav-arrow"
                      onClick={() => setAiSlideIndex(prev => (prev + 1) % 3)}
                      aria-label="Bài viết tiếp theo"
                    >
                      <i className="ti ti-chevron-right" />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="daklak-ai-actions">
              <Link
                to="/posts?category=Doanh%20nghi%E1%BB%87p%20%26%20S%E1%BA%A3n%20ph%E1%BA%A9m&sub_category=Showroom%20s%E1%BB%91"
                className="btn-daklak-ai-category"
              >
                <i className="ti ti-layout-grid" />
                <span>{currentLang === 'en' ? 'View all AI Category Articles' : 'Xem toàn bộ bài viết chuyên mục AI'}</span>
              </Link>
              <Link to="/ai-chat" className="btn-daklak-ai-chat">
                <i className="ti ti-messages" />
                <span>{currentLang === 'en' ? 'Chat with Lao Cai AI Assistant' : 'Trò chuyện cùng Trợ lý AI Lào Cai'}</span>
              </Link>
            </div>
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
            SECTION 12: TRỤ CỘT BẢN SẮC LÀO CAI (CỬA KHẨU – DU LỊCH BỐN MÙA – DƯỢC LIỆU VÙNG CAO)
            ======================================================== */}
        <section className="daklak-section dark" id="coffee">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Core Brand Pillars' : 'Ba Trụ Cột Chiến Lược'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Border Gate Economy • Four-Season Tourism • Highland Medicinal Herbs' : 'Kinh Tế Cửa Khẩu – Du Lịch Bốn Mùa – Nông Sản Dược Liệu Quý'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Laocai.today connects the complete regional value chain: from 1,500m+ cloud-kissed herbal plateaus and international border gates to global markets.'
                  : 'Laocai.today kết nối chuỗi giá trị đặc thù của vùng đất biên cương Tây Bắc: từ vùng nguyên liệu trên mây 1.500m+, công nghệ chế biến sâu đến cửa khẩu quốc tế và thị trường toàn cầu.'}
              </p>
            </div>

            <div className="coffee-grid">
              {/* Timeline 4 Chặng */}
              <div className="coffee-timeline scroll-reveal scroll-reveal-left">
                <div className="coffee-step">
                  <div className="coffee-step-number">01</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Highland Climate & Natural Endowments' : 'Tiểu Khí Hậu Á Nhiệt Đới & Tài Nguyên Độc Bản'}</h4>
                    <p>{currentLang === 'en' ? 'Ideal 1,500m–3,143m altitude nurturing precious GACP-WHO herbs, ancient Shan Tuyet tea, and cold-water salmon.' : 'Độ cao 1.500m – 3.143m tạo nên hệ sinh thái ôn đới quý giá cho dược liệu Atiso, tam thất, chè cổ thụ Shan Tuyết, cá hồi nước lạnh và cảnh sắc 4 mùa.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">02</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Indigenous Craft & New-Model Cooperatives' : 'Tri Thức Bản Địa & Liên Kết Hợp Tác Xã Kiểu Mới'}</h4>
                    <p>{currentLang === 'en' ? 'Empowering H’Mong, Dao, Tay, Giay, and Ha Nhi communities with organic farming, eco-tourism, and digital traceability.' : 'Đồng hành cùng cộng đồng các dân tộc H’Mông, Dao, Tày, Giáy, Hà Nhì phát triển nông nghiệp hữu cơ, du lịch cộng đồng và truy xuất nguồn gốc số.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">03</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Deep Processing & Smart Industrial Zones' : 'Công Nghệ Chế Biến Sâu & Khu Công Nghiệp Đồng Bộ'}</h4>
                    <p>{currentLang === 'en' ? 'Extracting high-value pharmaceutical compounds, freeze-dried teas, and deep mineral processing across Tang Loong & Dong Pho Moi IPs.' : 'Đẩy mạnh chiết xuất dược liệu công nghệ cao, chế biến sâu nông lâm sản và công nghiệp phụ trợ tại KCN Tằng Loỏng, Đông Phố Mới và Võ Lao.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">04</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'ASEAN – China Cross-Border Gateway' : 'Cửa Khẩu Quốc Tế & Chuỗi Logistics Liên Vận'}</h4>
                    <p>{currentLang === 'en' ? 'Direct customs clearance via Kim Thanh International Border Gate, international rail, and Sa Pa Airport to global buyers.' : 'Thông quan trực tiếp qua Cửa khẩu Quốc tế Kim Thành, đường sắt liên vận Á – Âu và cao tốc Nội Bài – Lào Cai vươn ra thị trường quốc tế.'}</p>
                  </div>
                </div>
              </div>

              {/* Case Study & Chuỗi giá trị */}
              <div className="coffee-case-box scroll-reveal scroll-reveal-right">
                <h3>🌿 {currentLang === 'en' ? 'Lao Cai Value Chain Spotlight' : 'Điển Hình Chuỗi Giá Trị Đặc Thù Lào Cai'}</h3>
                
                <div className="coffee-case-highlight">
                  <h4>Hành Lang Kinh Tế Cửa Khẩu & Du Lịch – Dược Liệu Sa Pa – Bắc Hà</h4>
                  <p>
                    Sự kết hợp giữa hạ tầng Khu kinh tế cửa khẩu 15.929 ha, Khu du lịch quốc gia Sa Pa và vùng dược liệu GACP-WHO đã tạo nên mô hình kinh tế xanh – kinh tế số đặc trưng của Lào Cai giai đoạn 2026 – 2030.
                  </p>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#C8DAD0', fontStyle: 'italic', marginBottom: '20px' }}>
                  * Laocai.today cam kết tính minh bạch: Mọi hồ sơ doanh nghiệp, sản phẩm OCOP và dự án kêu gọi đầu tư đều được chuẩn hóa và cập nhật thường xuyên cùng Trợ lý AI đa ngôn ngữ.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to={`/posts?category=${encodeURIComponent('Cửa khẩu & Logistics')}`} className="btn-daklak-gold" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                    Xem Chuyên mục Cửa khẩu & Logistics
                  </Link>
                  <button onClick={() => scrollToConsult('Hợp tác Đầu tư & Giao thương Lào Cai')} className="btn-daklak-outline" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                    Kết nối Xúc tiến Đầu tư
                  </button>
                </div>
              </div>
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
                        placeholder="Ví dụ: contact@doanhnghiep.vn"
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

        {/* ========================================================
            SECTION 17: ĐỐI TÁC CỦA CHÚNG TÔI (CAROUSEL TRÊN FOOTER)
            ======================================================== */}
        <section className="daklak-partners-section" id="doi-tac">
          <div className="daklak-container">
            <h2 className="daklak-partners-title scroll-reveal scroll-reveal-down">
              {currentLang === 'en' ? 'OUR ECOSYSTEM PARTNERS' : 'ĐỐI TÁC ĐỒNG HÀNH CÙNG HỆ SINH THÁI'}
            </h2>
            <div className="daklak-partners-underline scroll-reveal scroll-reveal-scale" />

            <div
              className="daklak-partners-carousel-container scroll-reveal scroll-reveal-up"
              onMouseEnter={() => setIsPartnerHovered(true)}
              onMouseLeave={() => setIsPartnerHovered(false)}
            >
              <button
                type="button"
                className="daklak-partner-arrow-btn"
                onClick={handlePrevPartner}
                aria-label="Đối tác trước"
                title={currentLang === 'en' ? 'Previous partner' : 'Đối tác trước'}
              >
                <i className="ti ti-arrow-left" />
              </button>

              <div className="daklak-partners-viewport">
                <div
                  className="daklak-partners-track"
                  style={{
                    transform: `translateX(-${partnerIndex * (100 / partnerVisibleCount)}%)`,
                    transition: withPartnerTransition ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                  }}
                >
                  {[...PARTNER_COMPANIES, ...PARTNER_COMPANIES, ...PARTNER_COMPANIES].map((pt, pIdx) => (
                    <div
                      key={`${pt.id}-${pIdx}`}
                      className="daklak-partner-item-wrap"
                      style={{
                        flex: `0 0 ${100 / partnerVisibleCount}%`,
                        maxWidth: `${100 / partnerVisibleCount}%`
                      }}
                    >
                      <div className="daklak-partner-item" title={pt.name}>
                        <img
                          src={pt.logo}
                          alt={pt.name}
                          className="daklak-partner-logo"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="daklak-partner-arrow-btn"
                onClick={handleNextPartner}
                aria-label="Đối tác tiếp theo"
                title={currentLang === 'en' ? 'Next partner' : 'Đối tác tiếp theo'}
              >
                <i className="ti ti-arrow-right" />
              </button>
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
