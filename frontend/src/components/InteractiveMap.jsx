import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

// Comprehensive dataset of prominent Heritage & Tourism destinations across Vietnam
const LOCATION_DATA = [
  {
    id: 'loc_1',
    name: 'Phố cổ Hội An (Quần thể Di sản UNESCO)',
    category: 'attractions',
    lat: 15.8801,
    lng: 108.3380,
    address: 'Thành phố Hội An, Tỉnh Quảng Nam',
    desc: 'Di sản Văn hóa Thế giới UNESCO với những mái ngói rêu phong, đèn lồng rực rỡ, Chùa Cầu cổ kính và nét văn hóa giao thương đặc sắc.',
    tags: ['Di sản UNESCO', 'Phố cổ', 'Đèn lồng', 'Chùa Cầu'],
    rating: 4.9,
    phone: '0235.3861.327',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_2',
    name: 'Quần thể Di tích Cố đô Huế',
    category: 'attractions',
    lat: 16.4698,
    lng: 107.5786,
    address: 'Thành phố Huế, Tỉnh Thừa Thiên Huế',
    desc: 'Quần thể di tích lịch sử cung đình triều Nguyễn gồm Đại Nội, Ngọ Môn, Điện Thái Hòa và lăng tẩm các vị hoàng đế uy nghiêm.',
    tags: ['Di sản UNESCO', 'Đại Nội Huế', 'Cố đô', 'Cung đình'],
    rating: 4.9,
    phone: '0234.3523.237',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_3',
    name: 'Bán đảo Sơn Trà & Cầu Rồng Đà Nẵng',
    category: 'attractions',
    lat: 16.0678,
    lng: 108.2208,
    address: 'Thành phố Đà Nẵng',
    desc: 'Thành phố đáng sống với Cầu Rồng phun lửa, bãi biển Mỹ Khê tuyệt mỹ, Chùa Linh Ứng và rừng nguyên sinh Sơn Trà.',
    tags: ['Thành phố đáng sống', 'Cầu Rồng', 'Mỹ Khê', 'Linh Ứng'],
    rating: 4.9,
    phone: '0236.3822.288',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_4',
    name: 'Thánh địa Mỹ Sơn (Quảng Nam)',
    category: 'attractions',
    lat: 15.7958,
    lng: 108.1245,
    address: 'Xã Duy Phú, Huyện Duy Xuyên, Tỉnh Quảng Nam',
    desc: 'Quần thể tháp Chăm cổ kính ẩn mình giữa thung lũng hùng vĩ, minh chứng cho nền văn minh Champa rực rỡ từ thế kỷ IV đến thế kỷ XIII.',
    tags: ['Di sản Thế giới', 'Tháp Chăm', 'Văn hóa Champa'],
    rating: 4.8,
    phone: '0235.3731.309',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_5',
    name: 'Vườn Quốc gia Phong Nha - Kẻ Bàng',
    category: 'attractions',
    lat: 17.5833,
    lng: 106.2833,
    address: 'Huyện Bố Trạch, Tỉnh Quảng Bình',
    desc: 'Di sản thiên nhiên thế giới với hệ thống hang động đá vôi kỳ vĩ hàng triệu năm tuổi, bao gồm Động Phong Nha, Động Thiên Đường và Sơn Đoòng.',
    tags: ['Di sản Thiên nhiên', 'Hang động', 'Động Thiên Đường', 'Sơn Đoòng'],
    rating: 4.9,
    phone: '0232.3677.021',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_6',
    name: 'Cao nguyên Đà Lạt (Thành phố ngàn hoa)',
    category: 'attractions',
    lat: 11.9404,
    lng: 108.4583,
    address: 'Thành phố Đà Lạt, Tỉnh Lâm Đồng',
    desc: 'Thành phố ngàn hoa và sương mờ với khí hậu mát mẻ quanh năm, hồ Xuân Hương thơ mộng, rừng thông bạt ngàn và đồn điền cà phê.',
    tags: ['Du lịch sinh thái', 'Ngàn hoa', 'Hồ Xuân Hương', 'Tây Bắc'],
    rating: 4.8,
    phone: '0263.3822.342',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_7',
    name: 'Quần thể danh thắng Tràng An - Bái Đính',
    category: 'attractions',
    lat: 20.2506,
    lng: 105.9042,
    address: 'Huyện Hoa Lư, Tỉnh Ninh Bình',
    desc: 'Di sản văn hóa và thiên nhiên hỗn hợp thế giới đầu tiên tại Đông Nam Á với cảnh quan sông nước kỳ thú và chùa Bái Đính nguy nga.',
    tags: ['Di sản kép UNESCO', 'Tràng An', 'Bái Đính', 'Thủy đình'],
    rating: 4.9,
    phone: '0229.3620.088',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_8',
    name: 'InterContinental Danang Sun Peninsula Resort',
    category: 'stay',
    lat: 16.1215,
    lng: 108.3142,
    address: 'Bán đảo Sơn Trà, Thành phố Đà Nẵng',
    desc: 'Khu nghỉ dưỡng 5 sao biểu tượng hàng đầu thế giới được thiết kế bởi kiến trúc sư Bill Bensley tựa lưng vào núi Sơn Trà view vịnh biển.',
    tags: ['Resort 5 sao', 'Bill Bensley', 'Sơn Trà', 'View biển'],
    rating: 5.0,
    phone: '0236.3938.888',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_9',
    name: 'Four Seasons Resort The Nam Hai',
    category: 'stay',
    lat: 15.9320,
    lng: 108.3310,
    address: 'Bãi biển Hà My, Điện Bàn, Tỉnh Quảng Nam',
    desc: 'Khu nghỉ dưỡng biệt thự biển sang trọng ven bờ biển miền Trung, kết hợp hài hòa phong thủy và nghệ thuật truyền thống Việt.',
    tags: ['Resort 5 sao', 'Biệt thự biển', 'Spa', 'Quảng Nam'],
    rating: 4.9,
    phone: '0235.3940.000',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_10',
    name: 'Ẩm thực Cung đình Huế — Không Gian Xưa',
    category: 'food',
    lat: 16.4632,
    lng: 107.5910,
    address: 'Thành phố Huế, Tỉnh Thừa Thiên Huế',
    desc: 'Trải nghiệm ẩm thực cung đình Huế tinh tế cùng các món bánh đặc sản: Bánh bèo, Bánh nậm, Bánh bột lọc, Chè hạt sen long nhãn.',
    tags: ['Ẩm thực Cung đình', 'Bánh Huế', 'Chè hạt sen', 'Đặc sản'],
    rating: 4.8,
    phone: '0234.3822.456',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_11',
    name: 'Đặc sản Mỳ Quảng & Bê Thui Cầu Mống',
    category: 'food',
    lat: 15.8750,
    lng: 108.3280,
    address: 'Quảng Nam — Đà Nẵng',
    desc: 'Món ăn biểu tượng của xứ Quảng với sợi mỳ dẻo dai, tôm thịt đậm đà, bánh tráng nướng giòn rụm và rau sống trà quế tươi ngon.',
    tags: ['Mỳ Quảng', 'Trà Quế', 'Đặc sản xứ Quảng', 'Ẩm thực'],
    rating: 4.9,
    phone: '0905.123.456',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_12',
    name: 'Làng gốm Thanh Hà & Rau Trà Quế (OCOP)',
    category: 'ocop',
    lat: 15.8720,
    lng: 108.3050,
    address: 'Hội An, Tỉnh Quảng Nam',
    desc: 'Làng nghề truyền thống hơn 500 năm tuổi với các sản phẩm gốm đất nung thủ công và vùng rau sạch Trà Quế đạt chứng nhận OCOP.',
    tags: ['Làng nghề truyền thống', 'Gốm Thanh Hà', 'Rau Trà Quế', 'OCOP'],
    rating: 4.8,
    phone: '0235.3922.388',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'loc_13',
    name: 'Chè Shan Tuyết cổ thụ Cầu Đất Đà Lạt (OCOP)',
    category: 'ocop',
    lat: 11.9050,
    lng: 108.5250,
    address: 'Cầu Đất, Thành phố Đà Lạt, Tỉnh Lâm Đồng',
    desc: 'Sản phẩm OCOP tiêu biểu của Tây Bắc, trà Shan Tuyết cổ thụ thượng hạng trồng tại độ cao trên 1.500m với hương thơm quyến rũ.',
    tags: ['Chè Shan Tuyết cổ thụ', 'Cầu Đất', 'OCOP Tây Bắc', 'Đặc sản'],
    rating: 4.9,
    phone: '0263.3855.777',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  }
];

// Category metadata for icons & badges
const CATEGORY_META = {
  all: { label: 'Tất cả địa điểm', color: '#0284c7', icon: '📍', pinColor: '#0284c7' },
  attractions: { label: 'Điểm du lịch & Lịch sử', color: '#e11d48', icon: '🏰', pinColor: '#e11d48' },
  stay: { label: 'Lưu trú / Resort', color: '#2563eb', icon: '🏨', pinColor: '#2563eb' },
  food: { label: 'Ẩm thực & Hải sản', color: '#d97706', icon: '🍤', pinColor: '#d97706' },
  ocop: { label: 'Sản phẩm OCOP', color: '#16a34a', icon: '🏅', pinColor: '#16a34a' },
  utilities: { label: 'Bãi đỗ xe / Y tế / Tiện ích', color: '#0891b2', icon: '🏥', pinColor: '#0891b2' },
  biz: { label: 'Doanh nghiệp', color: '#7c3aed', icon: '🏢', pinColor: '#7c3aed' }
};

export default function InteractiveMap() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCategory, setMapCategory] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLocId, setSelectedLocId] = useState(null);
  const [userGps, setUserGps] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const sliderRef = useRef(null);

  // Helper to build accurate Google Maps Directions URL (uses official business POI & address)
  const getGoogleMapsDirUrl = (loc) => {
    const destinationQuery = `${loc.name}, ${loc.address}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
  };

  // Filtered locations calculation
  const filteredLocations = useMemo(() => {
    return LOCATION_DATA.filter(loc => {
      const matchCat = mapCategory === 'all' || loc.category === mapCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchDesc = loc.desc.toLowerCase().includes(q);
      const matchAddr = loc.address.toLowerCase().includes(q);
      const matchTags = loc.tags.some(tag => tag.toLowerCase().includes(q));
      const matchCatLabel = (CATEGORY_META[loc.category]?.label || '').toLowerCase().includes(q);

      return matchName || matchDesc || matchAddr || matchTags || matchCatLabel;
    });
  }, [mapCategory, searchQuery]);

  // Category counts map
  const categoryCounts = useMemo(() => {
    const counts = { all: LOCATION_DATA.length };
    Object.keys(CATEGORY_META).forEach(cat => {
      if (cat !== 'all') {
        counts[cat] = LOCATION_DATA.filter(l => l.category === cat).length;
      }
    });
    return counts;
  }, []);

  // Keyboard shortcut ESC for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Invalidate Leaflet size whenever container resizes or fullscreen toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen, sidebarOpen]);

  // Reset slider position when filter changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [filteredLocations]);

  // Initialize Leaflet Map (PERSISTENT SINGLE MOUNT - NEVER UNMOUNTS)
  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !isMounted) return;
      const L = window.L;
      if (!L) return;

      // Default view centered on Vietnam / Central Heritage
      const map = L.map(mapContainerRef.current, {
        center: [16.0544, 108.2022],
        zoom: 7,
        zoomControl: true
      });
      mapInstanceRef.current = map;
      setMapReady(true);

      // Voyager tile layer (clean & high resolution)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Load Đồ Sơn GeoJSON boundary
      fetch('/Đồ Sơn.geojson')
        .then(res => res.json())
        .then(geojson => {
          if (mapInstanceRef.current) {
            L.geoJSON(geojson, {
              style: {
                color: '#0284c7',
                weight: 3,
                opacity: 0.85,
                fillColor: '#38bdf8',
                fillOpacity: 0.12,
                dashArray: '5, 5'
              }
            }).addTo(mapInstanceRef.current);
          }
        })
        .catch(err => console.log('GeoJSON load note:', err));
    };

    if (window.L) {
      initMap();
    } else {
      // Inject Leaflet CSS & JS dynamically if not loaded
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers on Map whenever filteredLocations or mapReady changes
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear previous markers
    markersMapRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersMapRef.current.clear();

    // Create custom pins for each location with CATEGORY EMOJI ICON
    filteredLocations.forEach((loc, index) => {
      const meta = CATEGORY_META[loc.category] || CATEGORY_META.all;

      // Custom HTML DivIcon Pin displaying Category Emoji Icon (🏰, 🏨, 🍤, 🏅, 🏥, 🏢)
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${meta.pinColor};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2.5px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
              line-height: 1;
            ">${meta.icon}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      // Custom Rich Popup Content
      const googleMapsDirUrl = getGoogleMapsDirUrl(loc);
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 270px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="
              background-color: ${meta.color}15;
              color: ${meta.color};
              font-weight: 700;
              font-size: 10.5px;
              padding: 3px 8px;
              border-radius: 12px;
              text-transform: uppercase;
            ">
              ${meta.icon} ${meta.label}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #d97706;">
              ★ ${loc.rating}
            </span>
          </div>

          <h3 style="font-size: 15px; font-weight: 800; color: #0c2340; margin: 0 0 6px 0; line-height: 1.35;">
            #${index + 1}. ${loc.name}
          </h3>

          <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${loc.desc}
          </p>

          <div style="font-size: 11.5px; color: #64748b; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 4px;">
            <span>📍</span>
            <span style="flex: 1; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${loc.address}</span>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
            ${loc.tags.slice(0, 3).map(t => `<span style="font-size: 10px; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">#${t}</span>`).join('')}
          </div>

          <div style="display: flex; gap: 6px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <a href="${googleMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1;
              background-color: #0284c7;
              color: #ffffff;
              text-decoration: none;
              text-align: center;
              font-size: 11.5px;
              font-weight: 700;
              padding: 6px 10px;
              border-radius: 6px;
              display: inline-block;
            ">
              🗺️ Chỉ đường
            </a>
            <button onclick="window.askAiAboutLoc('${encodeURIComponent(loc.name)}')" style="
              flex: 1;
              background-color: #f0f9ff;
              color: #0369a1;
              border: 1px solid #bae6fd;
              font-size: 11.5px;
              font-weight: 700;
              padding: 6px 10px;
              border-radius: 6px;
              cursor: pointer;
            ">
              🤖 Hỏi AI
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedLocId(loc.id);
        if (sliderRef.current && sliderRef.current.children[index]) {
          sliderRef.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      markersMapRef.current.set(loc.id, marker);
    });

    // Attach global ask AI handler for popup button
    window.askAiAboutLoc = (encodedName) => {
      const name = decodeURIComponent(encodedName);
      navigate(`/ai-chat?q=${encodeURIComponent('Cho tôi thông tin chi tiết và kinh nghiệm tham quan ' + name + ' tại Việt Nam')}`);
    };

    // Auto-fit bounds if filtered items exist
    if (filteredLocations.length > 0 && map) {
      if (filteredLocations.length === 1) {
        const single = filteredLocations[0];
        map.flyTo([single.lat, single.lng], 16, { duration: 1 });
        const m = markersMapRef.current.get(single.id);
        if (m) m.openPopup();
      } else {
        const bounds = L.latLngBounds(filteredLocations.map(l => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [filteredLocations, mapReady, navigate]);

  // Locate User GPS
  const handleLocateGps = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ Định vị GPS.');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const { latitude, longitude } = pos.coords;
        setUserGps({ lat: latitude, lng: longitude });

        const L = window.L;
        const map = mapInstanceRef.current;
        if (L && map) {
          map.flyTo([latitude, longitude], 15);
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'gps-user-pin',
              html: `<div style="background:#ef4444; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px #ef4444;"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            })
          }).addTo(map).bindPopup('📍 Vị trí GPS hiện tại của bạn').openPopup();
        }
      },
      (err) => {
        setLocatingGps(false);
        alert('Không thể lấy vị trí GPS. Vui lòng cho phép quyền vị trí trên trình duyệt.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fly to location when clicking a card
  const handleSelectCard = (loc) => {
    setSelectedLocId(loc.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
      const marker = markersMapRef.current.get(loc.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Scroll Slider horizontally
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Jump to specific card by index
  const jumpToCard = (idx, loc) => {
    if (sliderRef.current && sliderRef.current.children[idx]) {
      sliderRef.current.children[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    handleSelectCard(loc);
  };

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    if (nextState) {
      setSidebarOpen(true);
    }
  };

  return (
    <div 
      className={isFullscreen ? 'fullscreen-map-wrapper' : 'standard-map-wrapper'}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        backgroundColor: '#ffffff',
        borderRadius: isFullscreen ? 0 : '20px',
        border: isFullscreen ? 'none' : '1px solid #e2e8f0',
        padding: isFullscreen ? 0 : '1.5rem',
        boxShadow: isFullscreen ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        overflow: isFullscreen ? 'hidden' : 'visible'
      }}
    >
      {/* 
        1. STANDARD INLINE HEADER & FILTERS (RENDERED BEFORE MAP IN INLINE MODE)
      */}
      {!isFullscreen && (
        <>
          {/* MAP HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('map_badge')}
                </span>
                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                  {filteredLocations.length} / {LOCATION_DATA.length} {t('map_filter_all')}
                </span>
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #0c2340 0%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                {t('map_title')}
              </h2>
            </div>

            {/* Action Controls Top Right */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleLocateGps}
                disabled={locatingGps}
                style={{ 
                  backgroundColor: locatingGps ? '#e2e8f0' : '#f8fafc', 
                  color: '#334155',
                  border: '1px solid #cbd5e1', 
                  borderRadius: '10px', 
                  padding: '8px 14px', 
                  fontSize: '12.5px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                📍 {locatingGps ? 'Đang định vị...' : t('map_gps_btn')}
              </button>

              <button 
                onClick={toggleFullscreen}
                style={{ 
                  backgroundColor: '#f0f9ff', 
                  color: '#0284c7',
                  border: '1px solid #bae6fd', 
                  borderRadius: '10px', 
                  padding: '8px 14px', 
                  fontSize: '12.5px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                ⛶ {t('map_fullscreen_btn')} (Chuyên nghiệp)
              </button>

              <button 
                onClick={() => navigate('/ai-chat')}
                style={{ 
                  backgroundColor: '#0284c7', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  padding: '8px 14px', 
                  fontSize: '12.5px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                }}
              >
                🤖 {t('map_ask_ai_btn')}
              </button>
            </div>
          </div>

          {/* SEARCH BOX & FILTERS ROW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.2rem' }}>
            {/* Search Input Box */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm kiếm bãi tắm, biệt thự Bảo Đại, ngọn hải đăng, resort, hải sản, sản phẩm OCOP..."
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#0284c7';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' }}>
              {Object.keys(CATEGORY_META).map((cat) => {
                const isSelected = mapCategory === cat;
                const meta = CATEGORY_META[cat];
                const count = categoryCounts[cat] || 0;

                return (
                  <button
                    key={cat}
                    onClick={() => setMapCategory(cat)}
                    style={{
                      backgroundColor: isSelected ? meta.color : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? '700' : '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${meta.color}40` : 'none'
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>{t(`map_filter_${cat}`)}</span>
                    <span style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: '700'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 
        2. CRITICAL: PERSISTENT LEAFLET MAP CANVAS DOM NODE
        NEVER INSIDE ANY CONDITIONAL TERNARY OPERATOR!
        ALWAYS REMAINS MOUNTED IN THE EXACT SAME POSITION IN THE REACT DOM TREE!
      */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: isFullscreen ? '100vh' : '420px', 
          position: isFullscreen ? 'absolute' : 'relative',
          inset: isFullscreen ? 0 : 'auto',
          borderRadius: isFullscreen ? 0 : '16px', 
          overflow: 'hidden', 
          border: isFullscreen ? 'none' : '1px solid #cbd5e1', 
          marginBottom: isFullscreen ? 0 : '1.2rem',
          zIndex: 1,
          backgroundColor: '#cbd5e1'
        }}
      />

      {/* 
        3. STANDARD INLINE LOCATION SLIDER (RENDERED BELOW MAP IN INLINE MODE)
      */}
      {!isFullscreen && (
        <div style={{ marginTop: '0.5rem' }}>
          {/* Slider Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0c2340', margin: 0 }}>
                Danh sách địa điểm ({filteredLocations.length})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                • Dạng slide 1 hàng (Lướt xem nhanh)
              </span>
            </div>

            {/* Slider Prev / Next Controls */}
            {filteredLocations.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => scrollSlider('left')}
                  title="Lướt sang trái"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#334155',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  ◀
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  title="Lướt sang phải"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#334155',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Quick Index Jump Pills (#1, #2, #3...) */}
          {filteredLocations.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '8px',
              scrollbarWidth: 'none'
            }}>
              {filteredLocations.map((loc, idx) => {
                const isSelected = selectedLocId === loc.id;
                const meta = CATEGORY_META[loc.category] || CATEGORY_META.all;
                return (
                  <button
                    key={`pill_${loc.id}`}
                    onClick={() => jumpToCard(idx, loc)}
                    style={{
                      backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569',
                      border: isSelected ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 9px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>#{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Horizontal Slider (Single Row) */}
          {filteredLocations.length > 0 ? (
            <div
              ref={sliderRef}
              style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                padding: '8px 2px 14px 2px',
                scrollbarWidth: 'thin'
              }}
            >
              {filteredLocations.map((loc, index) => {
                const meta = CATEGORY_META[loc.category] || CATEGORY_META.all;
                const isSelected = selectedLocId === loc.id;
                const googleMapsDirUrl = getGoogleMapsDirUrl(loc);

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectCard(loc)}
                    style={{
                      minWidth: '290px',
                      maxWidth: '290px',
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      backgroundColor: '#ffffff',
                      border: isSelected ? `2px solid ${meta.color}` : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.2rem 1.1rem 1.1rem 1.1rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 8px 24px ${meta.color}30` : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      }
                    }}
                  >
                    {/* Stylized Index Badge (#01, #02...) */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '14px',
                      backgroundColor: isSelected ? meta.color : '#0c2340',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      letterSpacing: '0.03em'
                    }}>
                      #{String(index + 1).padStart(2, '0')}
                    </div>

                    <div>
                      {/* Category & Rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: '2px' }}>
                        <span style={{
                          backgroundColor: `${meta.color}15`,
                          color: meta.color,
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '10px'
                        }}>
                          {meta.icon} {meta.label}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#d97706' }}>
                          ★ {loc.rating}
                        </span>
                      </div>

                      {/* Location Name */}
                      <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0c2340', margin: '0 0 6px 0', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {loc.name}
                      </h4>

                      {/* Short Description */}
                      <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {loc.desc}
                      </p>
                    </div>

                    <div>
                      {/* Address */}
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📍</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{loc.address}</span>
                      </div>

                      {/* Bottom Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                          🎯 Định vị bản đồ
                        </span>
                        <a
                          href={googleMapsDirUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '11px',
                            color: '#ffffff',
                            backgroundColor: '#0284c7',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '700'
                          }}
                        >
                          Chỉ đường
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 8px 0' }}>
                Không tìm thấy địa điểm nào khớp với bộ lọc & từ khóa tìm kiếm.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setMapCategory('all'); }}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Xóa bộ lọc & Thử lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* 
        4. FULLSCREEN FLOATING OVERLAYS (ONLY ACTIVE WHEN ISFULLSCREEN IS TRUE)
      */}
      {isFullscreen && (
        <>
          {/* FLOATING ACTION BAR (TOP RIGHT) */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button 
              onClick={handleLocateGps}
              disabled={locatingGps}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#334155',
                border: '1px solid #cbd5e1', 
                borderRadius: '10px', 
                padding: '10px 16px', 
                fontSize: '13px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              📍 {locatingGps ? 'Đang định vị...' : t('map_gps_btn')}
            </button>

            <button 
              onClick={() => navigate('/ai-chat')}
              style={{ 
                backgroundColor: '#0284c7', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '10px 16px', 
                fontSize: '13px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              🤖 {t('map_ask_ai_btn')}
            </button>

            <button 
              onClick={toggleFullscreen}
              style={{ 
                backgroundColor: '#0c2340', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '10px 16px', 
                fontSize: '13px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
            >
              ✕ Thu nhỏ (ESC)
            </button>
          </div>

          {/* FLOATING TOGGLE BUTTON IF SIDEBAR COLLAPSED */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 1000,
                backgroundColor: '#ffffff',
                color: '#0c2340',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>▶ Danh sách địa điểm</span>
              <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' }}>
                {filteredLocations.length}
              </span>
            </button>
          )}

          {/* FLOATING GOOGLE MAPS STYLE LEFT SIDEBAR PANEL */}
          {sidebarOpen && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              bottom: '16px',
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(12px)',
              borderRadius: '18px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              {/* Sidebar Header: Search & Close Button */}
              <div style={{ padding: '14px 14px 10px 14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>
                    🗺️ {t('map_badge', 'BẢN ĐỒ ĐIỂM ĐẾN & DI SẢN')} ({filteredLocations.length})
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    title="Ẩn thanh bên"
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    ◀ Ẩn danh sách
                  </button>
                </div>

                {/* Search Box */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Tìm kiếm địa điểm, bãi tắm, resort..."
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#94a3b8' }}>
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Pills inside Sidebar */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '10px', scrollbarWidth: 'none' }}>
                  {Object.keys(CATEGORY_META).map((cat) => {
                    const isSelected = mapCategory === cat;
                    const meta = CATEGORY_META[cat];

                    return (
                      <button
                        key={`side_${cat}`}
                        onClick={() => setMapCategory(cat)}
                        style={{
                          backgroundColor: isSelected ? meta.color : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: 'none',
                          borderRadius: '14px',
                          padding: '5px 11px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {meta.icon} {t(`map_filter_${cat}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Scrollable Vertical Places List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc, index) => {
                    const meta = CATEGORY_META[loc.category] || CATEGORY_META.all;
                    const isSelected = selectedLocId === loc.id;
                    const googleMapsDirUrl = getGoogleMapsDirUrl(loc);

                    return (
                      <div
                        key={`side_card_${loc.id}`}
                        onClick={() => handleSelectCard(loc)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isSelected ? `2px solid ${meta.color}` : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          boxShadow: isSelected ? `0 4px 14px ${meta.color}25` : '0 2px 4px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: meta.color }}>
                            #{String(index + 1).padStart(2, '0')} • {meta.icon} {meta.label}
                          </span>
                          <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#d97706' }}>
                            ★ {loc.rating}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0c2340', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                          {loc.name}
                        </h4>

                        <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {loc.desc}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            📍 {loc.address.split(',')[0]}
                          </span>
                          <a
                            href={googleMapsDirUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: '10.5px',
                              color: '#ffffff',
                              backgroundColor: '#0284c7',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              textDecoration: 'none',
                              fontWeight: '700'
                            }}
                          >
                            Chỉ đường
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '13px' }}>
                    Không tìm thấy địa điểm nào.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
