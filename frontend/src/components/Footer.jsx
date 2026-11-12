import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { usePWA } from '../contexts/PWAContext';
import brandConfig from '../brand.config';
import { CATEGORIES_DATA, getCategoryLabel } from '../constants/categories';

export const Footer = () => {
  const { currentLang } = useTranslation();
  const { isInstalled, installApp } = usePWA();

  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const cached = localStorage.getItem('doanhnhanhole_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name) return parsed;
      }
    } catch (e) {}
    return CATEGORIES_DATA;
  });

  useEffect(() => {
    let isMounted = true;
    const syncCategories = async () => {
      try {
        const res = await fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            const sorted = [...json.data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setCategoriesList(sorted);
          }
        }
      } catch (e) {}
    };
    syncCategories();
    window.addEventListener('categories-updated', syncCategories);
    return () => {
      isMounted = false;
      window.removeEventListener('categories-updated', syncCategories);
    };
  }, []);

  return (
    <footer style={{
      backgroundColor: '#061020',
      backgroundImage: 'linear-gradient(180deg, #0B1D3A 0%, #040B16 100%)',
      color: '#B8C7DC',
      padding: '3.5rem 0 1.5rem',
      fontSize: '12.5px',
      borderTop: '1px solid rgba(212, 154, 42, 0.38)',
      lineHeight: '1.65'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Main 3-Column Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          marginBottom: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Cột 1: Giữ nguyên (Logo, Mô tả, PWA & Hướng dẫn sử dụng) */}
          <div>
            <Link to="/" className="notranslate" translate="no" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #0B1D3A 0%, #D49A2A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '16px',
                  border: '1px solid rgba(212, 154, 42, 0.5)',
                  flexShrink: 0
                }}>
                  <img 
                    src="/logo_icon.svg" 
                    alt="Doanhnhanhole.today Logo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { 
                      e.target.style.display = 'none';
                      e.target.parentNode.innerText = 'HL';
                    }}
                  />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', 'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#ffffff',
                    letterSpacing: '-0.3px',
                    lineHeight: '1.1'
                  }}>
                    DoanhnhanHoLe<span style={{ color: '#F5C257' }}>.today</span>
                  </div>
                  <div style={{
                    fontSize: '9.5px',
                    fontWeight: '700',
                    color: '#F5C257',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    marginTop: '2px'
                  }}>
                    {currentLang === 'en' ? 'Global Le Entrepreneurs & Friends' : 'Doanh nhân Họ Lê Toàn cầu & Những người bạn'}
                  </div>
                </div>
              </div>
            </Link>
            <div style={{
              fontSize: '12.5px',
              color: '#C8DAD0',
              lineHeight: '1.65',
              marginTop: '0.5rem',
              marginBottom: '1.1rem'
            }}>
              {brandConfig.description}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={installApp}
                title="Cài đặt ứng dụng Doanhnhanhole.today (PWA)"
                style={{
                  background: 'rgba(197, 147, 37, 0.16)',
                  border: '1px solid rgba(197, 147, 37, 0.45)',
                  color: '#FFE082',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(197, 147, 37, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(197, 147, 37, 0.16)'; }}
              >
                <i className="ti ti-device-mobile-down"></i>
                <span>{isInstalled ? (currentLang === 'en' ? '✓ PWA App Installed' : '✓ Ứng dụng PWA đã cài') : (currentLang === 'en' ? 'Install PWA App' : 'Cài đặt ứng dụng PWA')}</span>
              </button>

              <Link
                to="/guide"
                title={currentLang === 'en' ? 'System User Guide' : 'Hướng dẫn sử dụng hệ thống'}
                style={{
                  background: 'rgba(14, 56, 43, 0.45)',
                  border: '1px solid rgba(197, 147, 37, 0.35)',
                  color: '#A7E8BD',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14, 56, 43, 0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(14, 56, 43, 0.45)'; }}
              >
                <i className="ti ti-book"></i>
                <span>{currentLang === 'en' ? 'User Guide' : 'Hướng dẫn sử dụng'}</span>
              </Link>
            </div>
          </div>

          {/* Cột 2: Các Chuyên mục */}
          <div>
            <div style={{
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13.5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ width: '4px', height: '15px', borderRadius: '2px', background: '#D49A2A', display: 'inline-block' }}></span>
              <span>{currentLang === 'en' ? 'Categories & Ecosystem' : 'Chuyên Mục Hệ Sinh Thái'}</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px 16px'
            }}>
              {categoriesList.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catLabel = typeof cat === 'string'
                  ? getCategoryLabel(cat, currentLang)
                  : getCategoryLabel(cat.name, currentLang, cat.name_en);
                return (
                  <Link
                    key={cat.id || catName}
                    to={`/posts?category=${encodeURIComponent(catName)}`}
                    style={{
                      color: '#D5E2F2',
                      textDecoration: 'none',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 0',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FFE082';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D5E2F2';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="ti ti-chevron-right" style={{ fontSize: '13px', color: '#D49A2A', flexShrink: 0 }}></i>
                    <span>{catLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Cột 3: Các thông tin: địa chỉ, email, số điện thoại, các kênh, ... */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
            <div style={{
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13.5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ width: '4px', height: '15px', borderRadius: '2px', background: '#D49A2A', display: 'inline-block' }}></span>
              <span>{currentLang === 'en' ? 'Contact & Channels' : 'Thông Tin Liên Hệ & Kênh Kết Nối'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <i className="ti ti-map-pin" style={{ color: '#E5A93B', marginTop: '3px', flexShrink: 0 }}></i>
              <span>
                <span style={{ color: '#8FA6C4' }}>{currentLang === 'en' ? 'Address:' : 'Địa chỉ:'}</span>{' '}
                <span style={{ color: '#E2E8F0' }}>{brandConfig.contact.address}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <i className="ti ti-phone-call" style={{ color: '#E5A93B', flexShrink: 0 }}></i>
              <span style={{ color: '#8FA6C4' }}>{currentLang === 'en' ? 'Phone / Hotline:' : 'Điện thoại / Hotline:'}</span>
              <a
                href={`tel:${brandConfig.contact.hotline.replace(/\s+/g, '')}`}
                style={{ color: '#FFE082', textDecoration: 'none', fontWeight: '700' }}
              >
                {brandConfig.contact.hotline}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <i className="ti ti-mail" style={{ color: '#E5A93B', flexShrink: 0 }}></i>
              <span style={{ color: '#8FA6C4' }}>Email:</span>
              <a href={`mailto:${brandConfig.contact.email}`} style={{ color: '#FFE082', textDecoration: 'none', fontWeight: '600' }}>
                {brandConfig.contact.email}
              </a>
            </div>

            {/* Các kênh truyền thông & trợ lý số */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '11.5px', color: '#8FA6C4', marginBottom: '8px' }}>
                {currentLang === 'en' ? 'Official digital channels:' : 'Các kênh kết nối chính thức:'}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a 
                  href={brandConfig.socials.facebook} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', transition: 'transform 0.2s' }}
                  title={`Facebook ${brandConfig.brandShortName}`}
                >
                  <i className="ti ti-brand-facebook" style={{ fontSize: '17px' }}></i>
                </a>
                <a 
                  href={brandConfig.socials.youtube} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', transition: 'transform 0.2s' }}
                  title={`YouTube ${brandConfig.brandShortName}`}
                >
                  <i className="ti ti-brand-youtube" style={{ fontSize: '17px' }}></i>
                </a>
                <a 
                  href={brandConfig.socials.zalo || 'https://zalo.me'} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', fontWeight: '800', fontSize: '11px', transition: 'transform 0.2s' }}
                  title="Zalo Official"
                >
                  Zalo
                </a>
                <Link 
                  to="/ai-chat"
                  style={{ height: '34px', padding: '0 12px', borderRadius: '999px', backgroundColor: 'rgba(197, 147, 37, 0.2)', border: '1px solid #E5A93B', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFE082', textDecoration: 'none', fontSize: '12px', fontWeight: '700', transition: 'transform 0.2s' }}
                  title={brandConfig.aiAssistant.name}
                >
                  <i className="ti ti-sparkles" style={{ fontSize: '15px' }}></i>
                  <span>{brandConfig.aiAssistant.name}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
          color: '#7D9B8D'
        }}>
          <div>
            {brandConfig.contact.copyright}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <Link
              to="/guide"
              style={{
                color: '#FFE082',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'rgba(197, 147, 37, 0.14)',
                border: '1px solid rgba(197, 147, 37, 0.38)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(197, 147, 37, 0.28)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(197, 147, 37, 0.14)'; }}
            >
              <i className="ti ti-book" style={{ fontSize: '14px' }}></i>
              <span>{currentLang === 'en' ? 'User Guide' : 'Hướng dẫn sử dụng'}</span>
            </Link>
            <Link to="/posts" style={{ color: '#B5C9BD', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Articles & News' : 'Tin tức & Cơ hội'}
            </Link>
            <Link to="/members" style={{ color: '#B5C9BD', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Enterprises' : 'Doanh nghiệp'}
            </Link>
            <Link to="/events" style={{ color: '#B5C9BD', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Events' : 'Sự kiện'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
