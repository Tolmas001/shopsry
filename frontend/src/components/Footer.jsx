import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Globe,
  Globe2,
  Play,
  Heart,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';

const Footer = () => {
  const { t } = useApp();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col-main">
            <Link to="/" className="nav-logo footer-logo">
              <ShoppingBag size={32} strokeWidth={2.5} />
              <span>ShopSRY</span>
            </Link>
            <p className="footer-desc">
              {t('footer_desc')}
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
              <a href="#" className="nav-btn"><Globe size={20} /></a>
              <a href="#" className="nav-btn"><Globe2 size={20} /></a>
              <a href="#" className="nav-btn"><Heart size={20} /></a>
              <a href="#" className="nav-btn"><Play size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">{t('comp_title')}</h4>
            <ul className="footer-links">
              <li><Link to="/#about">{t('nav_about')}</Link></li>
              <li><Link to="/#contact">{t('nav_contact')}</Link></li>
              <li><Link to="/#careers">Bo'sh ish o'rinlari</Link></li>
              <li><Link to="/#news">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">{t('help_title')}</h4>
            <ul className="footer-links">
              <li><Link to="/#faq">Ko'p beriladigan savollar</Link></li>
              <li><Link to="/#shipping">Yetkazib berish</Link></li>
              <li><Link to="/#returns">Qaytarish va almashtirish</Link></li>
              <li><Link to="/#privacy">Maxfiylik siyosati</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">{t('contact_title')}</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', gap: '8px', color: '#6B7280' }}>
                <MapPin size={18} />
                <span>{t('location')}</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', color: '#6B7280' }}>
                <Phone size={18} />
                <span>+998 90 123 45 67</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', color: '#6B7280' }}>
                <Mail size={18} />
                <span>info@shopsry.uz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('rights')}</p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>{t('payment_systems')}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CreditCard size={20} />
              <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{width: '24px'}} />
              <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" style={{width: '24px'}} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
