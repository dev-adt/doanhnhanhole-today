import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAIBot from '../components/FloatingAIBot';
import SEOHead from '../components/SEOHead';
import SpotlightBanner from '../components/SpotlightBanner';
import brandConfig from '../brand.config';
import { getCategoryLabel } from '../constants/categories';
import { fetchJsonWithTimeout, FALLBACK_POSTS, FALLBACK_EVENTS, FALLBACK_MEMBERS } from '../utils/api';
import './HomePhuTho.css';

// Helper format ngày giờ cho sự kiện (Ví dụ: 08:30 Thứ Hai, 26/04/2026)
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
      <div style={{ background: '#0E382B', color: '#FFE082', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', minWidth: '45px' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13px' }}>{String(timeLeft.days).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#A7E8BD' }}>Ngày</div>
      </div>
      <div style={{ background: '#0E382B', color: '#FFE082', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', minWidth: '45px' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13px' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#A7E8BD' }}>Giờ</div>
      </div>
      <div style={{ background: '#0E382B', color: '#FFE082', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', minWidth: '45px' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13px' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#A7E8BD' }}>Phút</div>
      </div>
      <div style={{ background: '#0E382B', color: '#FFE082', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', minWidth: '45px' }}>
        <span className="notranslate" translate="no" style={{ fontWeight: '800', fontSize: '13px' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#A7E8BD' }}>Giây</div>
      </div>
    </div>
  );
});

// ==============================================================================
// 1. DỮ LIỆU ĐẶC SẮC: BA KHÔNG GIAN HỘI TỤ (TRI-ZONE PANORAMA)
// ==============================================================================
const TOP_TRI_ZONES = [
  {
    id: 'zone-phutho',
    name: 'Không Gian Đất Tổ & Cội Nguồn',
    nameEn: 'Ancestral Land & Cultural Heritage',
    subTitle: 'Phú Thọ Trước Sắp Xếp • Di Sản UNESCO & Đồi Chè Trung Du',
    tag: 'ĐẤT TỔ HÙNG VƯƠNG',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=85',
    desc: 'Cội nguồn thiêng liêng của dân tộc Việt Nam với Di sản Tín ngưỡng Thờ cúng Hùng Vương và Hát Xoan Phú Thọ được UNESCO vinh danh; vẻ đẹp kỳ vĩ của "ốc đảo" đồi chè hình bát úp Long Cốc, Vườn Quốc gia Xuân Sơn và suối khoáng nóng Thanh Thủy.',
    keyPoints: [
      {
        icon: 'ti-building-monument',
        title: 'Di Sản Văn Hóa & Tâm Linh UNESCO',
        desc: 'Quần thể Khu di tích Lịch sử Đền Hùng trên núi Nghĩa Lĩnh, làn điệu Hát Xoan làng cổ và hệ thống đền chùa nghìn năm tuổi.'
      },
      {
        icon: 'ti-mountain',
        title: 'Cảnh Quan Sinh Thái & Khoáng Nóng Onsen',
        desc: 'Đồi chè Long Cốc (mệnh danh vịnh Hạ Long vùng trung du), Rừng nguyên sinh Xuân Sơn và tổ hợp khoáng nóng Thanh Thủy Onsen.'
      },
      {
        icon: 'ti-building-factory',
        title: 'Công Nghiệp & Đặc Sản Vang Danh',
        desc: 'KCN Phú Hà, KCN Cẩm Khê, hóa chất Lâm Thao cùng đặc sản Bưởi Đoan Hùng, Chè đinh Long Cốc, Thịt chua Thanh Sơn.'
      }
    ],
    categoryLink: '/posts?category=Khám%20phá%20Phú%20Thọ'
  },
  {
    id: 'zone-vinhphuc',
    name: 'Thủ Phủ Công Nghiệp & Nghỉ Dưỡng Mây Ngàn',
    nameEn: 'High-Tech Industry & Misty Cloud Retreats',
    subTitle: 'Vĩnh Phúc Trước Sắp Xếp • Cực Tăng Trưởng FDI & Tam Đảo Mù Sương',
    tag: 'CÔNG NGHIỆP CÔNG NGHỆ CAO',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    desc: 'Vùng đất giao thoa hoàn hảo giữa cực tăng trưởng sản xuất ô tô, xe máy, linh kiện điện tử hàng đầu miền Bắc (Toyota, Honda, Sumitomo) với thiên đường nghỉ dưỡng 4 mùa Tam Đảo, cội nguồn Phật giáo Tây Thiên và hồ sinh thái Đại Lải.',
    keyPoints: [
      {
        icon: 'ti-cloud-fog',
        title: 'Khu Du Lịch Quốc Gia Tam Đảo & Tây Thiên',
        desc: 'Thị trấn sương mây Tam Đảo ở độ cao 900m, Quần thể Danh thắng & Thiền viện Trúc Lâm Tây Thiên, Đại bảo tháp Mandala thiêng liêng.'
      },
      {
        icon: 'ti-cpu',
        title: 'Hệ Sinh Thái FDI & Công Nghệ Cao Hàng Đầu',
        desc: 'KCN Thăng Long Vĩnh Phúc, KCN Bá Thiện 1-2, KCN Khai Quang - nơi quy tụ chuỗi cung ứng chính xác của Toyota, Honda, Compal, Piaggio.'
      },
      {
        icon: 'ti-leaf',
        title: 'Nghỉ Dưỡng Sinh Thái & Nông Sản Sạch Núi Cao',
        desc: 'Tổ hợp nghỉ dưỡng 5 sao Flamingo Đại Lải cùng đặc sản ngọn Su su Tam Đảo, mật ong hoa rừng và rượu dừa Tiên Tửu.'
      }
    ],
    categoryLink: '/posts?category=Đầu%20tư%20%26%20Hợp%20tác'
  },
  {
    id: 'zone-hoabinh',
    name: 'Không Gian Văn Hóa Mường & Kỳ Quan Hồ Sông Đà',
    nameEn: 'Muong Culture & Lake Wonderland',
    subTitle: 'Hòa Bình Trước Sắp Xếp • Năng Lượng Thủy Điện & Thung Lũng Mai Châu',
    tag: 'BẢN SẮC MƯỜNG & HỒ SINH THÁI',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
    desc: 'Bản hùng ca trên dòng sông Đà với Công trình Thủy điện thế kỷ; vùng lòng hồ Hòa Bình mệnh danh "vịnh Hạ Long trên núi" với 47 hòn đảo xanh kỳ vĩ; thung lũng lúa Mai Châu mộc mạc và suối khoáng nóng thiên nhiên Kim Bôi.',
    keyPoints: [
      {
        icon: 'ti-sail-boat',
        title: 'Kỳ Quan Hồ Hòa Bình & Thủy Điện Lịch Sử',
        desc: 'Khu Du lịch Quốc gia Hồ Hòa Bình với 47 hòn đảo lớn nhỏ, trải nghiệm du thuyền trên vịnh hồ và chiêm bái đền Thác Bờ linh thiêng.'
      },
      {
        icon: 'ti-home-heart',
        title: 'Văn Hóa Mường Đậm Đà & Thung Lũng Mai Châu',
        desc: 'Không gian Mo Mường, cồng chiêng Mường, khám phá bản Lác - Pà Cò, nghề dệt thổ cẩm cổ truyền và nhà sàn người Thái bên ruộng lúa.'
      },
      {
        icon: 'ti-brand-appstore',
        title: 'Nông Sản Chỉ Dẫn Địa Lý & Suối Khoáng Kim Bôi',
        desc: 'Cam lòng vàng Cao Phong nức tiếng, Rượu cần Mường Động, cá lăng sông Đà cùng nguồn khoáng nóng trị liệu Kim Bôi.'
      }
    ],
    categoryLink: '/posts?category=Du%20lịch%20%26%20Trải%20nghiệm'
  }
];

// ==============================================================================
// 2. BỐN HÀNH LANG PHÁT TRIỂN CHIẾN LƯỢC
// ==============================================================================
const STRATEGIC_CORRIDORS = [
  {
    id: 'corridor-1',
    number: 'HÀNH LANG 01',
    title: 'Đô Thị - Công Nghiệp Công Nghệ Cao (Vĩnh Phúc – Việt Trì)',
    desc: 'Trục động lực bứt phá gắn liền tuyến cao tốc Nội Bài – Lào Cai. Hạt nhân thu hút vốn FDI thế hệ mới cho sản xuất ô tô, xe máy, cơ khí chính xác và chất bán dẫn.',
    tags: ['KCN Thăng Long', 'Bá Thiện', 'Phú Hà', 'FDI Công nghệ cao']
  },
  {
    id: 'corridor-2',
    number: 'HÀNH LANG 02',
    title: 'Văn Hóa Di Sản & Nghỉ Dưỡng Sinh Thái Sông Hồng – Sông Lô',
    desc: 'Trục kết nối tâm linh cội nguồn Đền Hùng – Tây Thiên – Tam Đảo – Onsen Thanh Thủy. Tôn vinh di sản UNESCO và phát triển du lịch chăm sóc sức khỏe.',
    tags: ['Đền Hùng', 'Tây Thiên', 'Tam Đảo', 'Onsen Thanh Thủy']
  },
  {
    id: 'corridor-3',
    number: 'HÀNH LANG 03',
    title: 'Kinh Tế Xanh Hồ Hòa Bình – Thung Lũng Mai Châu',
    desc: 'Khai thác tối đa nguồn năng lượng sạch sông Đà, chuỗi du thuyền khám phá 47 hòn đảo xanh và mô hình du lịch cộng đồng bản địa gắn với văn hóa Mường - Thái.',
    tags: ['Hồ Hòa Bình', 'Thủy điện Sông Đà', 'Mai Châu', 'Văn hóa Mường']
  },
  {
    id: 'corridor-4',
    number: 'HÀNH LANG 04',
    title: 'Nông Sản Chế Biến Sâu & Dược Liệu Trung Du - Núi Cao',
    desc: 'Tập trung vùng bưởi đặc sản Đoan Hùng, vùng chè Shan Tuyết Long Cốc, cam Cao Phong và chuỗi nông nghiệp sạch công nghệ cao đáp ứng tiêu chuẩn xuất khẩu.',
    tags: ['Bưởi Đoan Hùng', 'Chè Long Cốc', 'Cam Cao Phong', 'OCOP 5 Sao']
  }
];

// ==============================================================================
// 3. HỆ SINH THÁI CÔNG NGHIỆP TRỌNG ĐIỂM (KHÔNG DÙNG PODIUM CÀ PHÊ DAKLAK)
// ==============================================================================
const KEY_INDUSTRIAL_PARKS = [
  {
    name: 'KCN Thăng Long Vĩnh Phúc',
    sub: 'Tập đoàn Sumitomo Corporation (Nhật Bản)',
    area: '213 Hécta',
    location: 'Bình Xuyên, Tỉnh Phú Thọ',
    sectors: 'Linh kiện điện tử, cơ khí chính xác, thiết bị quang học & công nghệ cao',
    status: 'Đã lấp đầy >85% • Hạ tầng chuẩn sinh thái'
  },
  {
    name: 'KCN Bá Thiện I & II',
    sub: 'Tổ hợp Công nghệ Cao & Phụ trợ',
    area: '500+ Hécta',
    location: 'Bình Xuyên, Tỉnh Phú Thọ',
    sectors: 'Linh kiện bán dẫn, màn hình thông minh, phụ tùng ô tô & xe máy',
    status: 'Thu hút hàng loạt tập đoàn FDI Hàn Quốc, Nhật Bản'
  },
  {
    name: 'KCN Phú Hà (Viglacera)',
    sub: 'Tổng Công ty Viglacera - CTCP',
    area: '350 Hécta',
    location: 'Thị xã Phú Thọ, Tỉnh Phú Thọ',
    sectors: 'Thiết bị điện tử viễn thông, phụ tùng ô tô, công nghiệp lắp ráp',
    status: 'Giao thông thuận tiện, sát Cao tốc Nội Bài – Lào Cai'
  },
  {
    name: 'KCN Khai Quang',
    sub: 'Trung tâm Công nghiệp Vĩnh Yên',
    area: '221 Hécta',
    location: 'TP. Vĩnh Yên, Tỉnh Phú Thọ',
    sectors: 'Sản xuất phụ tùng ô tô, xe máy, cơ khí chế tạo, may mặc cao cấp',
    status: 'Vị trí đô thị trung tâm, nguồn nhân lực dồi dào'
  },
  {
    name: 'KCN Cẩm Khê',
    sub: 'KCN Đa Ngành Quy Mô Lớn',
    area: '450 Hécta',
    location: 'Huyện Cẩm Khê, Tỉnh Phú Thọ',
    sectors: 'Chế biến nông lâm sản, sản xuất cơ khí, vật liệu xây dựng mới',
    status: 'Sẵn sàng quỹ đất sạch quy mô lớn thu hút đầu tư'
  },
  {
    name: 'KCN Lương Sơn & Nhuận Trạch',
    sub: 'Vùng Đệm Công Nghiệp Cửa Ngõ Tây Hà Nội',
    area: '440 Hécta',
    location: 'Lương Sơn, Tỉnh Phú Thọ',
    sectors: 'Cơ khí chính xác, điện tử, dược phẩm, kho bãi logistics',
    status: 'Cách trung tâm Hà Nội chỉ 35km theo QL6 & Đại lộ Thăng Long'
  }
];

// ==============================================================================
// 4. BỐN LỊCH TRÌNH TRẢI NGHIỆM ĐẶC SẮC (CURATED ITINERARIES)
// ==============================================================================
const CURATED_ITINERARIES = [
  {
    id: 'tour-1',
    label: 'Về Nguồn Đất Tổ & Onsen (2N1Đ)',
    badge: 'DI SẢN TÂM LINH & KHOÁNG NÓNG NGHỈ DƯỠNG',
    title: 'Hành Trình Về Cội Nguồn Đất Tổ – Đồi Chè Long Cốc – Onsen Thanh Thủy',
    summary: 'Dâng hương chiêm bái Đền Hùng linh thiêng, thưởng thức làn điệu Hát Xoan làng cổ An Thái, đón bình minh mờ ảo trên đồi chè bát úp Long Cốc và ngâm mình trong nguồn khoáng nóng Thanh Thủy tự nhiên.',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm',
    suitability: 'Gia đình, Đoàn cơ quan, Nghỉ dưỡng chữa lành',
    steps: [
      { time: 'Ngày 1 - Sáng', title: 'Dâng hương tại Đền Hùng & Đền Mẫu Âu Cơ', desc: 'Leo núi Nghĩa Lĩnh, viếng Đền Hạ, Đền Trung, Đền Thượng và Lăng Hùng Vương; chiêm ngưỡng Bảo tàng Hùng Vương.' },
      { time: 'Ngày 1 - Chiều', title: 'Thưởng thức Hát Xoan làng cổ & Check-in Việt Trì', desc: 'Trải nghiệm không gian Di sản văn hóa phi vật thể tại miếu Lãi Lèn, dạo quanh công viên Văn Lang và cầu đi bộ ánh sáng.' },
      { time: 'Ngày 2 - Sáng', title: 'Săn sương sớm tại Đồi chè hình bát úp Long Cốc', desc: 'Khám phá đồi chè đẹp bậc nhất Việt Nam trong màn sương sớm bồng bềnh, thưởng thức chè đinh hữu cơ hảo hạng.' },
      { time: 'Ngày 2 - Chiều', title: 'Tắm khoáng nóng thiên nhiên Onsen Thanh Thủy', desc: 'Thư giãn trong nguồn khoáng radon quý hiếm theo phong cách Onsen Nhật Bản trước khi khởi hành về Hà Nội.' }
    ]
  },
  {
    id: 'tour-2',
    label: 'Chạm Vào Biển Mây Tam Đảo (2N1Đ)',
    badge: 'NGHỈ DƯỠNG 4 MÙA & KHÔNG GIAN THIỀN TỰ',
    title: 'Hành Trình Chạm Vào Biển Mây Tam Đảo – Quần Thể Tây Thiên – Flamingo Đại Lải',
    summary: 'Tận hưởng trọn vẹn 4 mùa trong một ngày tại thị trấn mây Tam Đảo, chiêm bái cội nguồn Phật giáo Trúc Lâm Tây Thiên và hòa mình vào không gian nghệ thuật sinh thái Flamingo Đại Lải Resort.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm',
    suitability: 'Cặp đôi, Giới trẻ, Nghỉ dưỡng cao cấp',
    steps: [
      { time: 'Ngày 1 - Sáng', title: 'Cáp treo Tây Thiên & Thiền viện Trúc Lâm', desc: 'Đi cáp treo ngắm rừng nguyên sinh Tam Đảo, dâng hương Đền Thờ Quốc Mẫu Tây Thiên và tĩnh tâm tại Thiền viện Trúc Lâm.' },
      { time: 'Ngày 1 - Chiều & Tối', title: 'Thị trấn Tam Đảo & Săn mây Cầu Mây', desc: 'Check-in Nhà thờ đá cổ, tháp truyền hình, ngắm hoàng hôn buông xuống thị trấn mây và thưởng thức đồ nướng, ngọn su su.' },
      { time: 'Ngày 2 - Sáng', title: 'Khám phá Thác Bạc & Quán Gió Tam Đảo', desc: 'Nhâm nhi tách cà phê view trọn thung lũng sương mù, dạo bước qua các nẻo đường rợp bóng cây xanh mát lành.' },
      { time: 'Ngày 2 - Chiều', title: 'Nghỉ dưỡng & Check-in Hồ Đại Lải (Flamingo)', desc: 'Tham quan Không gian nghệ thuật Art in the Forest giữa rừng thông ngút ngàn và du thuyền dạo quanh mặt hồ biếc.' }
    ]
  },
  {
    id: 'tour-3',
    label: 'Bản Hùng Ca Sông Đà & Mai Châu (3N2Đ)',
    badge: 'KỲ QUAN HỒ SINH THÁI & VĂN HÓA MƯỜNG - THÁI',
    title: 'Hành Trình Khám Phá Kỳ Quan Hồ Hòa Bình – Bản Lác Mai Châu – Suối Khoáng Kim Bôi',
    summary: 'Du thuyền thưởng ngoạn 47 hòn đảo xanh trên lòng hồ Hòa Bình, hòa mình vào không gian văn hóa bản Lác mộc mạc và thư giãn với suối khoáng nóng tự nhiên Kim Bôi.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
    duration: '3 Ngày 2 Đêm',
    suitability: 'Du khách quốc tế, Khám phá văn hóa, Nhiếp ảnh',
    steps: [
      { time: 'Ngày 1', title: 'Nhà máy Thủy điện Hòa Bình & Du thuyền Hồ Thác Bờ', desc: 'Thăm công trình thế kỷ Thủy điện Hòa Bình, du thuyền lướt trên vịnh hồ ngọc bích, viếng Đền Chúa Thác Bờ và động Thác Bờ.' },
      { time: 'Ngày 2', title: 'Đèo Thung Khe & Thung lũng Mai Châu thanh bình', desc: 'Check-in Đèo Đá Trắng mờ ảo trong mây, xuống thung lũng Mai Châu đạp xe ngắm ruộng lúa, xem múa xòe và nghỉ đêm homestay bản Lác.' },
      { time: 'Ngày 3', title: 'Suối khoáng nóng Kim Bôi & Mua sắm Cam Cao Phong', desc: 'Ngâm bồn khoáng ấm tự nhiên Kim Bôi giải tỏa mệt mỏi, ghé vườn cam Cao Phong trĩu quả mua đặc sản OCOP mang về.' }
    ]
  },
  {
    id: 'tour-4',
    label: 'Khảo Sát Đầu Tư & FDI B2B (2N1Đ)',
    badge: 'DÀNH RIÊNG CHO NHÀ ĐẦU TƯ & TẬP ĐOÀN CÔNG NGHIỆP',
    title: 'Chương Trình Khảo Sát KCN Thăng Long Vĩnh Phúc – KCN Phú Hà & Quỹ Đất Sạch',
    summary: 'Chuyến khảo sát thực địa dành cho các đoàn doanh nghiệp FDI, đối tác cơ khí chính xác, điện tử muốn tìm hiểu quỹ đất sạch công nghiệp và chính sách ưu đãi của tỉnh Phú Thọ mới.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85',
    duration: '2 Ngày 1 Đêm (B2B)',
    suitability: 'Doanh nghiệp FDI, Quỹ đầu tư, Hiệp hội sản xuất',
    steps: [
      { time: 'Phiên 1', title: 'Làm việc tại KCN Thăng Long Vĩnh Phúc & KCN Bá Thiện', desc: 'Khảo sát hạ tầng trạm điện 110kV, nhà máy xử lý nước thải, hệ sinh thái cấp phép một cửa và chuỗi cung ứng linh kiện phụ trợ.' },
      { time: 'Phiên 2', title: 'Khảo sát KCN Phú Hà (Viglacera) & Nút giao Cao tốc', desc: 'Đánh giá quỹ đất sạch 350ha sẵn sàng bàn giao, thời gian logistics về Cảng biển Hải Phòng và Cảng Hàng không Quốc tế Nội Bài.' },
      { time: 'Phiên 3', title: 'Tọa đàm Xúc tiến Đầu tư & Cơ chế Ưu đãi Thuế', desc: 'Gặp gỡ trực tiếp Ban Quản lý các KCN tỉnh Phú Thọ, tiếp cận Data Room dự án và chính sách ưu đãi thuế TNDN.' }
    ]
  }
];

// ==============================================================================
// 5. TINH HOA OCOP 3 VÙNG MIỀN (REGIONAL OCOP SHOWCASE)
// ==============================================================================
const REGIONAL_OCOP_PRODUCTS = [
  {
    name: 'Bưởi Đặc Sản Đoan Hùng',
    origin: 'Đoan Hùng, Tỉnh Phú Thọ',
    star: 'OCOP 5 SAO',
    desc: 'Hương thơm nồng nàn đặc trưng, múi bưởi dày ráo nước, tép mọng vàng óng, vị ngọt mát thanh tao không nơi nào sánh bằng.',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Chè Đinh Bát Tiên Long Cốc',
    origin: 'Tân Sơn, Tỉnh Phú Thọ',
    star: 'OCOP 4 SAO',
    desc: 'Búp chè một tôm hái trên những quả đồi bát úp Long Cốc sương sớm, nước xanh trong sánh vàng, hương cốm non ngọt sâu lắng.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Cam Lòng Vàng Cao Phong',
    origin: 'Cao Phong, Tỉnh Phú Thọ',
    star: 'OCOP 4 SAO',
    desc: 'Chỉ dẫn địa lý nức tiếng Tây Bắc, vỏ mỏng mọng nước, tép vàng ươm, vị ngọt đậm đà bổ dưỡng được người tiêu dùng cả nước ưa chuộng.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Rau Su Su Sạch Tam Đảo',
    origin: 'Tam Đảo, Tỉnh Phú Thọ',
    star: 'OCOP 4 SAO',
    desc: 'Trồng ở độ cao gần 1.000m quanh năm mù sương mát rượi, ngọn su su giòn ngọt tự nhiên, không hóa chất bảo quản, chuẩn vị rau vùng cao.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Thịt Chua Thanh Sơn',
    origin: 'Thanh Sơn, Tỉnh Phú Thọ',
    star: 'OCOP 4 SAO',
    desc: 'Đặc sản truyền thống của người Mường: thịt lợn lửng lên men tự nhiên với thính ngô rang thơm nức, ăn kèm lá sung lá ổi tuyệt hảo.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Rượu Cần Mường Động',
    origin: 'Kim Bôi, Tỉnh Phú Thọ',
    star: 'OCOP 3 SAO',
    desc: 'Rượu nếp nương men lá rừng ủ trong ché sành cổ truyền, vị ngọt nồng ấm, biểu tượng của sự hiếu khách và tình thân cộng đồng.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Mật Ong Hoa Rừng Tây Thiên',
    origin: 'Tam Đảo, Tỉnh Phú Thọ',
    star: 'OCOP 4 SAO',
    desc: 'Khai thác từ các loài hoa rừng tự nhiên trong Vườn Quốc gia Tam Đảo, mật đặc sánh màu hổ phách, giàu dinh dưỡng và enzyme kháng khuẩn.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gạo Nếp Nương Mai Châu',
    origin: 'Mai Châu, Tỉnh Phú Thọ',
    star: 'OCOP 3 SAO',
    desc: 'Hạt gạo nếp tròn mẩy dẻo thơm trứ danh được bà con người Thái trồng trên nương cao, nguyên liệu tinh túy làm nên món xôi ngũ sắc.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  }
];

// ==============================================================================
// 6. CÂU HỎI THƯỜNG GẶP & HƯỚNG DẪN TRA CỨU ĐỊA CHỈ SAU SÁP NHẬP (FAQ)
// ==============================================================================
const FAQ_ITEMS = [
  {
    q: 'Tỉnh Phú Thọ mới sau sáp nhập gồm những đơn vị hành chính nào theo Nghị quyết 202/2025/QH15?',
    a: 'Theo Nghị quyết số 202/2025/QH15 của Quốc hội, tỉnh Phú Thọ mới được xác lập trên cơ sở sắp xếp toàn bộ diện tích và dân số của ba tỉnh Vĩnh Phúc, Hòa Bình và Phú Thọ trước đây. Tỉnh mới có diện tích 9.361,38 km², dân số trên 4,02 triệu người, gồm 148 đơn vị hành chính cấp xã (133 xã và 15 phường). Nền tảng Phutho.today giữ nguyên chiều sâu lịch sử của cả ba không gian để phục vụ tìm kiếm và giao thương liên vùng.'
  },
  {
    q: 'Làm thế nào để tra cứu địa chỉ hành chính cũ sang 148 xã/phường mới trên Phutho.today?',
    a: 'Người dùng có thể nhập tên xã, huyện hoặc tỉnh cũ (ví dụ: "Tam Đảo", "Mai Châu", "Lâm Thao", "Vĩnh Tường", "Lương Sơn") vào thanh tìm kiếm thông minh hoặc hỏi trực tiếp Trợ lý AI Phutho.today. Hệ thống đã nạp bảng đối chiếu địa danh chính thức để hiển thị địa chỉ hành chính hiện hành kèm liên kết di sản cũ tương ứng.'
  },
  {
    q: 'Chính sách ưu đãi thu hút đầu tư tại các Khu công nghiệp tỉnh Phú Thọ mới ra sao?',
    a: 'Tỉnh Phú Thọ mới áp dụng cơ chế một cửa liên thông tại Ban Quản lý các Khu công nghiệp; ưu đãi thuế Thu nhập Doanh nghiệp theo quy định của Chính phủ đối với các KCN tại địa bàn kinh tế khó khăn; hỗ trợ giải phóng mặt bằng, cấp điện - nước - cáp quang đồng bộ tận chân hàng rào dự án; và kết nối tuyển dụng nguồn nhân lực kỹ thuật cao từ các trường đại học, cao đẳng liên vùng.'
  },
  {
    q: 'Doanh nghiệp đăng ký Hội viên trên Phutho.today nhận được những quyền lợi gì?',
    a: 'Hội viên gói Silver được duyệt tự động ngay lập tức để có trang hồ sơ số chuẩn SEO, đăng bài viết cơ hội kinh doanh, giới thiệu sản phẩm OCOP và nhận vé tham dự sự kiện. Hội viên Gold và Platinum được tiếp cận mạng lưới B2B liên vùng, hỗ trợ kết nối trực tiếp với các tập đoàn FDI trong chuỗi cung ứng ô tô - điện tử và ưu tiên tư vấn từ đối tác công nghệ ADT Quốc tế.'
  },
  {
    q: 'Trợ lý Trí tuệ Nhân tạo AI Phú Thọ Assistant có thể giúp tôi những gì?',
    a: 'AI Phú Thọ Assistant hoạt động 24/7 theo mô hình RAG nạp dữ liệu địa phương. Trợ lý có thể gợi ý chi tiết các lịch trình du lịch (1N, 2N1Đ, 3N2Đ), tra cứu thông số kỹ thuật và chính sách KCN, tìm kiếm doanh nghiệp cung ứng, báo giá vé sự kiện và tiếp nhận trực tiếp nhu cầu hợp tác đầu tư để chuyển đến bộ phận chuyên trách xử lý.'
  }
];

export const Home = () => {
  const { role, user } = useAuth();
  const { currentLang, t } = useTranslation();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');

  // Active Tab State cho 3 Không gian Hội tụ
  const [activeZoneId, setActiveZoneId] = useState('zone-phutho');
  const activeZone = useMemo(() => {
    return TOP_TRI_ZONES.find(z => z.id === activeZoneId) || TOP_TRI_ZONES[0];
  }, [activeZoneId]);

  // Active Tab State cho Lịch trình
  const [activeTourId, setActiveTourId] = useState('tour-1');
  const activeTour = useMemo(() => {
    return CURATED_ITINERARIES.find(item => item.id === activeTourId) || CURATED_ITINERARIES[0];
  }, [activeTourId]);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Form Tư vấn / Tiếp nhận đầu tư (POST /api/leads)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Phú Thọ',
    serviceNeed: 'Tư vấn Du lịch, Lịch trình & Trải nghiệm 3 Vùng',
    companyName: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Dynamic Live Posts, Events, Members
  const [latestPosts, setLatestPosts] = useState(FALLBACK_POSTS);
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [featuredMembers, setFeaturedMembers] = useState(FALLBACK_MEMBERS);

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

  // Cuộn mượt xuống Form Tư vấn
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F5' }}>
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <SpotlightBanner />
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ========================================================
            1. HERO SECTION & SMART METRICS BAR
            ======================================================== */}
        <section className="pt-hero-section">
          <div className="pt-hero-glow-orb-1" />
          <div className="pt-hero-glow-orb-2" />
          <div className="pt-section-container" style={{ width: '100%' }}>
            <div className="pt-hero-content">
              <div className="pt-hero-badge">
                <i className="ti ti-crown"></i>
                <span>Nền tảng số đa ngôn ngữ • Tỉnh Phú Thọ Mới</span>
              </div>
              <h1 className="pt-hero-title">
                Phú Thọ Mới — Kết Nối Di Sản, <br />
                <span className="pt-gold-text">Du Lịch & Hội Tụ Đầu Tư</span>
              </h1>
              <p className="pt-hero-subtitle">
                Hợp nhất ba không gian phát triển <strong>Phú Thọ • Vĩnh Phúc • Hòa Bình</strong> theo Nghị quyết 202/2025/QH15. 
                Cội nguồn Đất Tổ Hùng Vương, Cực tăng trưởng công nghiệp công nghệ cao và Kỳ quan sinh thái Tây Bắc.
              </p>

              {/* Smart Integrated Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-hero-search-box">
                <select 
                  className="pt-hero-search-scope notranslate" 
                  translate="no"
                  value={searchScope}
                  onChange={(e) => setSearchScope(e.target.value)}
                >
                  <option value="all">Tất cả dữ liệu</option>
                  <option value="posts">Điểm đến & Bài viết</option>
                  <option value="members">Doanh nghiệp B2B</option>
                  <option value="events">Sự kiện & Diễn đàn</option>
                </select>
                <input 
                  type="text"
                  className="pt-hero-search-input"
                  placeholder={currentLang === 'en' ? 'Search destinations, industrial parks, OCOP, 148 wards...' : 'Tìm kiếm điểm đến, KCN, sản phẩm OCOP, 148 xã/phường mới...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="pt-hero-search-btn">
                  <i className="ti ti-search"></i>
                  <span>{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</span>
                </button>
              </form>

              {/* Quick Tags Suggestions */}
              <div className="pt-hero-quick-tags">
                <span style={{ fontWeight: '600' }}>Gợi ý nhanh:</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('Đền Hùng'); navigate('/posts?search=Đền%20Hùng'); }}>🏛️ Đền Hùng</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('Tam Đảo'); navigate('/posts?search=Tam%20Đảo'); }}>☁️ Tam Đảo</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('Hồ Hòa Bình'); navigate('/posts?search=Hồ%20Hòa%20Bình'); }}>🌊 Hồ Hòa Bình</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('KCN Thăng Long Vĩnh Phúc'); navigate('/posts?search=Thăng%20Long'); }}>⚙️ KCN Thăng Long</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('Bưởi Đoan Hùng'); navigate('/posts?search=Đoan%20Hùng'); }}>🌿 Bưởi Đoan Hùng</span>
                <span className="pt-hero-tag-chip" onClick={() => { setSearchQuery('148 xã phường mới'); navigate('/posts?search=148%20xã%20phường'); }}>📍 148 Xã/Phường</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vital Metrics Bar Under Hero */}
        <div className="pt-section-container pt-metrics-bar-wrapper">
          <div className="pt-metrics-bar">
            <div className="pt-metric-col">
              <div className="pt-metric-icon"><i className="ti ti-map-2"></i></div>
              <div className="pt-metric-number notranslate" translate="no">9.361 km²</div>
              <div className="pt-metric-label">Diện tích hợp nhất</div>
            </div>
            <div className="pt-metric-col">
              <div className="pt-metric-icon"><i className="ti ti-users"></i></div>
              <div className="pt-metric-number notranslate" translate="no">4,02+ Triệu</div>
              <div className="pt-metric-label">Dân số toàn tỉnh</div>
            </div>
            <div className="pt-metric-col">
              <div className="pt-metric-icon"><i className="ti ti-building-community"></i></div>
              <div className="pt-metric-number notranslate" translate="no">148</div>
              <div className="pt-metric-label">Đơn vị hành chính cấp xã</div>
            </div>
            <div className="pt-metric-col">
              <div className="pt-metric-icon"><i className="ti ti-compass"></i></div>
              <div className="pt-metric-number notranslate" translate="no">03 Vùng</div>
              <div className="pt-metric-label">Không gian hội tụ</div>
            </div>
            <div className="pt-metric-col">
              <div className="pt-metric-icon"><i className="ti ti-cpu"></i></div>
              <div className="pt-metric-number notranslate" translate="no">Top 1</div>
              <div className="pt-metric-label">Hệ sinh thái Ô tô & Bán dẫn</div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. INTERACTIVE TRI-ZONE PANORAMA HUB (KHÔNG GIAN BA VÙNG HỘI TỤ)
            ======================================================== */}
        <section className="pt-trizone-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-layout-grid"></i>
                <span>Không Gian Phát Triển Sau Sắp Xếp</span>
              </div>
              <h2 className="pt-section-title">
                Ba Không Gian Hội Tụ — <span className="pt-highlight">Chiều Sâu Di Sản & Động Lực Kinh Tế</span>
              </h2>
              <p className="pt-section-desc">
                Phutho.today giữ nguyên bản sắc văn hóa và thế mạnh kinh tế đặc trưng của cả ba khu vực trước sắp xếp, 
                giúp người dân và đối tác dễ dàng tra cứu, trải nghiệm và hợp tác đầu tư.
              </p>
            </div>

            {/* Tri-Zone Selector Tabs */}
            <div className="pt-trizone-tabs">
              {TOP_TRI_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  className={`pt-trizone-tab-btn ${activeZoneId === zone.id ? 'active' : ''}`}
                  onClick={() => setActiveZoneId(zone.id)}
                >
                  <i className={zone.id === 'zone-phutho' ? 'ti ti-building-monument' : zone.id === 'zone-vinhphuc' ? 'ti ti-cpu' : 'ti ti-sail-boat'}></i>
                  <span>{zone.name}</span>
                </button>
              ))}
            </div>

            {/* Active Tri-Zone Showcase Card */}
            <div className="pt-trizone-card">
              <div className="pt-trizone-visual" style={{ backgroundImage: `url(${activeZone.image})` }}>
                <div className="pt-trizone-visual-overlay">
                  <div className="pt-trizone-visual-badge">{activeZone.tag}</div>
                  <h3 className="pt-trizone-visual-title">{activeZone.name}</h3>
                  <p className="pt-trizone-visual-desc">{activeZone.desc}</p>
                </div>
              </div>

              <div className="pt-trizone-details">
                <div className="pt-trizone-keypoints">
                  {activeZone.keyPoints.map((kp, idx) => (
                    <div key={idx} className="pt-trizone-point">
                      <div className="pt-trizone-point-icon">
                        <i className={`ti ${kp.icon}`}></i>
                      </div>
                      <div>
                        <div className="pt-trizone-point-title">{kp.title}</div>
                        <div className="pt-trizone-point-desc">{kp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-trizone-action-row">
                  <Link to={activeZone.categoryLink} className="pt-btn-primary">
                    <i className="ti ti-arrow-right"></i>
                    <span>Khám phá điểm đến & dự án</span>
                  </Link>
                  <button 
                    onClick={() => scrollToConsult(activeZone.name)}
                    className="pt-btn-outline"
                  >
                    <i className="ti ti-mail"></i>
                    <span>Kết nối giao thương vùng</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. FOUR STRATEGIC GROWTH CORRIDORS (4 HÀNH LANG PHÁT TRIỂN)
            ======================================================== */}
        <section className="pt-corridors-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-map-route"></i>
                <span>Trục Động Lực Phát Triển</span>
              </div>
              <h2 className="pt-section-title">
                Bốn Hành Lang Kinh Tế — <span className="pt-highlight">Kết Nối Liên Vùng & Toàn Cầu</span>
              </h2>
              <p className="pt-section-desc">
                Cửa ngõ kết nối Vùng Thủ đô Hà Nội với Tây Bắc và Hành lang kinh tế xuyên biên giới Côn Minh – Lào Cai – Hà Nội – Hải Phòng.
              </p>
            </div>

            <div className="pt-corridors-grid">
              {STRATEGIC_CORRIDORS.map((c) => (
                <div key={c.id} className="pt-corridor-card">
                  <div className="pt-corridor-num">{c.number}</div>
                  <h3 className="pt-corridor-title">{c.title}</h3>
                  <p className="pt-corridor-desc">{c.desc}</p>
                  <div className="pt-corridor-tags">
                    {c.tags.map((t, idx) => (
                      <span key={idx} className="pt-corridor-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            4. INDUSTRIAL SUPPLY CHAIN & HIGH-TECH PARKS (HỆ SINH THÁI KCN)
            ======================================================== */}
        <section className="pt-industrial-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-building-factory-2"></i>
                <span>Cực Sản Xuất Công Nghiệp Mũi Nhọn</span>
              </div>
              <h2 className="pt-section-title">
                Hệ Sinh Thái Khu Công Nghiệp — <span className="pt-highlight">Chuỗi Cung Ứng Bán Dẫn & Ô Tô</span>
              </h2>
              <p className="pt-section-desc">
                Hội tụ các tập đoàn FDI hàng đầu thế giới (Toyota, Honda, Sumitomo, Compal, Prime) 
                cùng quỹ đất công nghiệp sạch sẵn sàng đón làn sóng đầu tư thế hệ mới.
              </p>
            </div>

            <div className="pt-industrial-grid">
              {KEY_INDUSTRIAL_PARKS.map((park, idx) => (
                <div key={idx} className="pt-industrial-card">
                  <div>
                    <div className="pt-industrial-top">
                      <span className="pt-industrial-badge">{park.sub}</span>
                      <span className="pt-industrial-area-pill">{park.area}</span>
                    </div>
                    <h3 className="pt-industrial-name">{park.name}</h3>
                    <div className="pt-industrial-loc">
                      <i className="ti ti-map-pin"></i>
                      <span>{park.location}</span>
                    </div>
                    <div className="pt-industrial-sectors">
                      <div className="pt-industrial-sectors-title">Lĩnh vực trọng tâm</div>
                      <div className="pt-industrial-sectors-text">{park.sectors}</div>
                    </div>
                  </div>
                  <div className="pt-industrial-footer">
                    <div className="pt-industrial-status">
                      <span className="pt-status-dot"></span>
                      <span>{park.status}</span>
                    </div>
                    <button 
                      onClick={() => scrollToConsult(`Khảo sát đầu tư tại ${park.name}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--pt-gold)', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Khảo sát →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. CURATED HERITAGE & WELLNESS ITINERARIES (HÀNH TRÌNH KHÁM PHÁ)
            ======================================================== */}
        <section className="pt-itineraries-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-compass"></i>
                <span>Gợi Ý Hành Trình Khám Phá</span>
              </div>
              <h2 className="pt-section-title">
                Hành Trình Trải Nghiệm — <span className="pt-highlight">Ở Lại Lâu Hơn, Trải Nghiệm Sâu Hơn</span>
              </h2>
              <p className="pt-section-desc">
                Các tuyến tour thiết kế chuyên sâu kết nối Đất Tổ linh thiêng, mù sương Tam Đảo và kỳ quan Hồ Hòa Bình.
              </p>
            </div>

            {/* Itinerary Tabs */}
            <div className="pt-itinerary-tabs">
              {CURATED_ITINERARIES.map((item) => (
                <button
                  key={item.id}
                  className={`pt-itinerary-tab-btn ${activeTourId === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTourId(item.id)}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Active Itinerary Card */}
            <div className="pt-itinerary-active-card">
              <div className="pt-itinerary-hero-img" style={{ backgroundImage: `url(${activeTour.image})` }}>
                <div className="pt-itinerary-hero-overlay" />
                <div className="pt-itinerary-hero-content">
                  <span className="pt-itinerary-badge">{activeTour.badge}</span>
                  <h3 className="pt-itinerary-title">{activeTour.title}</h3>
                  <div className="pt-itinerary-meta-chips">
                    <span><i className="ti ti-clock"></i> {activeTour.duration}</span>
                    <span><i className="ti ti-user-check"></i> {activeTour.suitability}</span>
                  </div>
                </div>
              </div>

              <div className="pt-itinerary-steps-panel">
                <div>
                  <div style={{ fontSize: '13.5px', color: '#556E63', marginBottom: '20px', lineHeight: '1.6' }}>
                    {activeTour.summary}
                  </div>
                  <div className="pt-itinerary-steps-list">
                    {activeTour.steps.map((st, idx) => (
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

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(14, 56, 43, 0.08)' }}>
                  <Link 
                    to={`/ai-chat?q=${encodeURIComponent(`Hãy gợi ý chi tiết cho tôi về lịch trình: ${activeTour.title}`)}`}
                    className="pt-btn-primary"
                  >
                    <i className="ti ti-sparkles"></i>
                    <span>Hỏi Trợ lý AI chi tiết tour</span>
                  </Link>
                  <button 
                    onClick={() => scrollToConsult(activeTour.title)}
                    className="pt-btn-outline"
                  >
                    <i className="ti ti-calendar-event"></i>
                    <span>Tư vấn đặt tour đoàn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. REGIONAL OCOP & LOCAL PRODUCE (SẢN PHẨM BẢN ĐỊA)
            ======================================================== */}
        <section className="pt-ocop-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-award"></i>
                <span>Nông Sản & Đặc Sản Bản Địa</span>
              </div>
              <h2 className="pt-section-title">
                Tinh Hoa OCOP 3 Vùng Miền — <span className="pt-highlight">Đậm Đà Hương Vị Quê Hương</span>
              </h2>
              <p className="pt-section-desc">
                Các sản phẩm đạt chứng nhận OCOP 3 đến 5 sao có nguồn gốc kiểm chứng, kết nối trực tiếp với các HTX uy tín.
              </p>
            </div>

            <div className="pt-ocop-grid">
              {REGIONAL_OCOP_PRODUCTS.map((p, idx) => (
                <div key={idx} className="pt-ocop-card">
                  <div className="pt-ocop-img-wrap" style={{ backgroundImage: `url(${p.image})` }}>
                    <div className="pt-ocop-star-badge">{p.star}</div>
                    <div className="pt-ocop-origin-tag">{p.origin}</div>
                  </div>
                  <div className="pt-ocop-body">
                    <div>
                      <h3 className="pt-ocop-name">{p.name}</h3>
                      <p className="pt-ocop-desc">{p.desc}</p>
                    </div>
                    <div className="pt-ocop-footer">
                      <Link to="/posts?category=Sản%20phẩm%20địa%20phương%20%26%20OCOP" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Xem chi tiết →
                      </Link>
                      <button 
                        onClick={() => scrollToConsult(`Tìm nguồn cung cấp ${p.name}`)}
                        style={{ background: 'none', border: 'none', color: 'var(--pt-gold)', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Kết nối HTX
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            7. KEY EVENTS & FORUMS (SỰ KIỆN & LỄ HỘI)
            ======================================================== */}
        <section className="pt-events-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-calendar"></i>
                <span>Lễ Hội & Diễn Đàn Trọng Điểm</span>
              </div>
              <h2 className="pt-section-title">
                Sự Kiện Đang & Sắp Diễn Ra — <span className="pt-highlight">Đăng Ký Tham Gia Vé QR</span>
              </h2>
              <p className="pt-section-desc">
                Cập nhật các đại lễ truyền thống, tuần lễ văn hóa du lịch và hội nghị xúc tiến kinh tế tỉnh Phú Thọ mới.
              </p>
            </div>

            <div className="pt-events-grid">
              {eventsList.map((evt) => (
                <div key={evt.id} className="pt-event-card">
                  <div className="pt-event-img" style={{ backgroundImage: `url(${evt.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'})` }} />
                  <div className="pt-event-body">
                    <div>
                      <div className="pt-event-date-row">
                        <i className="ti ti-calendar-event"></i>
                        <span>{formatEventDateTime(evt.start_date)}</span>
                      </div>
                      <h3 className="pt-event-title">{evt.title}</h3>
                      <div className="pt-event-location">
                        <i className="ti ti-map-pin"></i>
                        <span>{evt.location}</span>
                      </div>
                      <HomeEventCountdown eventDate={evt.start_date} />
                    </div>

                    <div className="pt-event-footer-row">
                      <div className="pt-event-price">
                        {formatEventPrice(evt)}
                      </div>
                      <button 
                        className="pt-btn-ticket"
                        onClick={() => handleOpenRegisterModal(evt)}
                      >
                        <i className="ti ti-ticket"></i>
                        <span>Đăng ký vé QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            8. FEATURED ENTERPRISES & B2B DIRECTORY (DOANH NGHIỆP)
            ======================================================== */}
        <section className="pt-enterprises-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-building"></i>
                <span>Mạng Lưới Hội Viên Tiên Phong</span>
              </div>
              <h2 className="pt-section-title">
                Doanh Nghiệp Tiêu Biểu — <span className="pt-highlight">Kết Nối Chuỗi Giá Trị</span>
              </h2>
              <p className="pt-section-desc">
                Các doanh nghiệp FDI, tập đoàn sản xuất và đơn vị dịch vụ uy tín đã được xác thực hồ sơ trên Phutho.today.
              </p>
            </div>

            <div className="pt-enterprises-slider">
              {featuredMembers.map((m) => (
                <div key={m.id} className="pt-enterprise-card">
                  <div>
                    <span className={`pt-enterprise-tier-badge pt-tier-${(m.tier || 'silver').toLowerCase()}`}>
                      HỘI VIÊN {String(m.tier || 'SILVER').toUpperCase()}
                    </span>
                    <h3 className="pt-enterprise-name">{m.name}</h3>
                    <div className="pt-enterprise-ind">{m.industry}</div>
                    <div style={{ fontSize: '12px', color: '#556E63', lineHeight: '1.5', marginBottom: '12px' }}>
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
          </div>
        </section>

        {/* ========================================================
            9. ARTICLES & REGIONAL RESEARCH (TIN TỨC & DỰ ÁN)
            ======================================================== */}
        <section className="pt-news-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-news"></i>
                <span>Dữ Liệu & Tin Tức Kinh Tế</span>
              </div>
              <h2 className="pt-section-title">
                Tin Tức & Báo Cáo Nghiên Cứu — <span className="pt-highlight">Cập Nhật Mới Nhất</span>
              </h2>
              <p className="pt-section-desc">
                Thông tin chính sách, dữ liệu đầu tư và bài viết khám phá du lịch có nguồn dẫn chứng tin cậy.
              </p>
            </div>

            <div className="pt-news-grid">
              {latestPosts.map((post) => (
                <Link key={post.id} to={`/posts/${post.slug || post.id}`} className="pt-news-card">
                  <div 
                    className="pt-news-thumb"
                    style={{ backgroundImage: `url(${post.image_url || 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80'})` }}
                  >
                    <span className="pt-news-category-badge">{post.category}</span>
                  </div>
                  <div className="pt-news-content">
                    <div>
                      <h3 className="pt-news-title">{post.title}</h3>
                      <p className="pt-news-excerpt">{post.summary}</p>
                    </div>
                    <div className="pt-news-meta">
                      <span>{post.author_name || brandConfig.brandName}</span>
                      <span><i className="ti ti-eye"></i> {post.views || 120}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            10. STRATEGIC LEAD CAPTURE FORM (TIẾP NHẬN ĐẦU TƯ)
            ======================================================== */}
        <section id="tu-van" className="pt-consult-section">
          <div className="pt-section-container">
            <div className="pt-consult-wrapper">
              <div className="pt-consult-header">
                <h2>Kết Nối Giao Thương & Xúc Tiến Đầu Tư</h2>
                <p>
                  Gửi yêu cầu hợp tác để được Tổ Công tác Xúc tiến Đầu tư tỉnh Phú Thọ mới liên hệ hỗ trợ trực tiếp trong vòng 24 giờ làm việc.
                </p>
              </div>

              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: '48px', color: '#4ADE80', marginBottom: '12px' }}></i>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Gửi Thông Tin Thành Công!</h3>
                  <p style={{ color: '#D1E5DA', fontSize: '14.5px' }}>
                    Cảm ơn Quý vị đã quan tâm đến tỉnh Phú Thọ mới. Ban Biên tập & Bộ phận Xúc tiến Đầu tư Phutho.today sẽ phản hồi qua Số điện thoại / Email đã cung cấp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit}>
                  <div className="pt-consult-grid-inputs">
                    <div className="pt-form-group">
                      <label>Họ và tên người liên hệ (*)</label>
                      <input 
                        type="text" 
                        className="pt-form-control" 
                        placeholder="Nguyễn Văn A" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="pt-form-group">
                      <label>Số điện thoại liên hệ (*)</label>
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
                      <label>Email liên hệ</label>
                      <input 
                        type="email" 
                        className="pt-form-control" 
                        placeholder="contact@company.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="pt-form-group">
                      <label>Tên Doanh nghiệp / Đơn vị (*)</label>
                      <input 
                        type="text" 
                        className="pt-form-control" 
                        placeholder="Công ty Cổ phần / Hợp tác xã..." 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="pt-form-group full-width">
                      <label>Lĩnh vực quan tâm kết nối</label>
                      <select 
                        className="pt-form-control"
                        value={formData.serviceNeed}
                        onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
                      >
                        <option value="Tư vấn Du lịch, Lịch trình & Trải nghiệm 3 Vùng">Tư vấn Du lịch, Lịch trình & Trải nghiệm 3 Vùng</option>
                        <option value="Khảo sát Địa điểm Đầu tư KCN & Thuê Đất Công nghiệp">Khảo sát Địa điểm Đầu tư KCN & Thuê Đất Công nghiệp</option>
                        <option value="Kết nối Cung ứng & Mua hàng Nông sản OCOP B2B">Kết nối Cung ứng & Mua hàng Nông sản OCOP B2B</option>
                        <option value="Đăng ký Gia nhập Hội viên Doanh nghiệp Phutho.today">Đăng ký Gia nhập Hội viên Doanh nghiệp Phutho.today</option>
                        <option value="Hợp tác Tổ chức Sự kiện & Diễn đàn Xúc tiến">Hợp tác Tổ chức Sự kiện & Diễn đàn Xúc tiến</option>
                      </select>
                    </div>
                    <div className="pt-form-group full-width">
                      <label>Nội dung chi tiết nhu cầu</label>
                      <textarea 
                        className="pt-form-control" 
                        rows="3" 
                        placeholder="Mô tả cụ thể quy mô dự án, mặt hàng cần tìm nguồn cung, số lượng khách du lịch..."
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
                    {formLoading ? 'Đang gửi thông tin...' : 'Gửi Đăng Ký Kết Nối Đầu Tư'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            11. FAQ ACCORDION (HỎI ĐÁP & TRA CỨU ĐỊA CHỈ SAU SÁP NHẬP)
            ======================================================== */}
        <section className="pt-faq-section">
          <div className="pt-section-container">
            <div className="pt-section-header">
              <div className="pt-section-badge">
                <i className="ti ti-help"></i>
                <span>Giải Đáp & Hướng Dẫn</span>
              </div>
              <h2 className="pt-section-title">
                Câu Hỏi Thường Gặp — <span className="pt-highlight">Tra Cứu Sau Sắp Xếp</span>
              </h2>
              <p className="pt-section-desc">
                Cung cấp câu trả lời chuẩn xác cho các thắc mắc về đơn vị hành chính mới, quy hoạch và thủ tục kết nối.
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
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
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
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            animation: 'ptFadeIn 0.25s ease'
          }}>
            <div style={{ background: '#0E382B', color: '#FFFFFF', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#FFE082', fontWeight: '750', textTransform: 'uppercase' }}>Đăng Ký Vé Sự Kiện Trực Tuyến</div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginTop: '2px' }}>{registerModalEvent.title}</h3>
              </div>
              <button 
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
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0E382B', marginBottom: '8px' }}>Đăng Ký Thành Công!</h4>
                  <p style={{ fontSize: '13.5px', color: '#4D6359', marginBottom: '16px' }}>
                    Mã vé điện tử của Quý vị: <strong style={{ color: '#C59325', fontSize: '16px' }}>{regSuccessData.ticketCode || regSuccessData.ticket_code || 'PT-2026-TICKET'}</strong>
                  </p>
                  <div style={{ background: '#F4F7F5', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: '#334D41' }}>
                    Quý vị vui lòng lưu lại mã vé hoặc ảnh chụp màn hình để xuất trình tại bàn check-in sự kiện.
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="pt-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterEventSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#12241D' }}>Họ và tên đại biểu (*)</label>
                      <input 
                        type="text" 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#12241D' }}>Số điện thoại nhận vé SMS (*)</label>
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
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#12241D' }}>Email nhận vé điện tử</label>
                      <input 
                        type="email" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '5px', color: '#12241D' }}>Đơn vị / Doanh nghiệp</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                        value={regForm.company}
                        onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                        placeholder="Công ty TNHH..."
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
                      className="pt-btn-primary"
                      disabled={submittingReg}
                      style={{ flex: 2, justifyContent: 'center' }}
                    >
                      {submittingReg ? 'Đang xuất vé...' : 'Xác Nhận Đăng Ký'}
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
