import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LanguageToggle from './LanguageToggle/LanguageToggle';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Heart, 
  Menu,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  X,
  Home,
  Store,
  Settings,
  CircleUser
} from 'lucide-react';

const Navbar = () => {
  const { user, cartCount, logout, t, theme, toggleTheme, favorites } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?name=${searchQuery.trim()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const scrollToSection = (e, id) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            <ShoppingBag size={28} strokeWidth={2.5} />
            <span>ShopSRY</span>
          </Link>

          <div className="nav-menu show-desktop">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>{t('nav_home')}</Link>
            <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>{t('nav_shop')}</Link>
            <Link to="/#categories" className="nav-link" onClick={(e) => scrollToSection(e, 'categories')}>{t('nav_categories')}</Link>
            <Link to="/#about" className="nav-link" onClick={(e) => scrollToSection(e, 'about')}>{t('nav_about')}</Link>
            <Link to="/#contact" className="nav-link" onClick={(e) => scrollToSection(e, 'contact')}>{t('nav_contact')}</Link>
          </div>

          <div className="nav-actions">
            <div className={`nav-search-container ${isSearchOpen ? 'open' : ''}`}>
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder={t('search')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={isSearchOpen}
                />
              </form>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="nav-btn">
                {isSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>
            </div>

            <div className="show-desktop" style={{ gap: '20px', alignItems: 'center' }}>
              <LanguageToggle />
              <button onClick={toggleTheme} className="nav-btn theme-toggle">
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              </button>
              <Link to="/favorites" className="nav-btn" title={t('my_favorites')}>
                <Heart size={22} />
                {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
              </Link>
            </div>

            <Link to="/cart" className="nav-btn">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            <div className="show-desktop">
              {user ? (
                <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Link to="/profile" className="nav-btn-profile" title={t('profile')}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', 
                      border: '2px solid rgba(0,0,0,0.05)', background: '#eee', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <img 
                        src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:5001${user.image}`) : 'https://img.icons8.com/ios-filled/50/2563eb/user-male-circle.png'} 
                        alt="User" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="nav-btn" title={t('admin')}>
                      <LayoutDashboard size={22} color="#2563EB" />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="nav-btn logout-desktop" title={t('logout')}>
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-btn">
                  <User size={22} />
                </Link>
              )}
            </div>

            <button 
              className="nav-btn show-mobile" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <ShoppingBag size={26} />
            <span>ShopSRY</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>
        
        <div className="drawer-body">
          {user ? (
            <div className="drawer-user-card">
              <img 
                src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:5001${user.image}`) : 'https://img.icons8.com/ios-filled/100/2563eb/user-male-circle.png'} 
                alt="Profile" 
                className="drawer-user-img"
              />
              <div className="drawer-user-info">
                <h4>{user.username}</h4>
                <p>{user.email}</p>
              </div>
            </div>
          ) : (
            <Link to="/login" className="drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
              <CircleUser className="drawer-link-icon" size={20} />
              {t('login')}
            </Link>
          )}

          <h5 className="drawer-section-title">{t('menu')}</h5>
          <Link to="/" className={`drawer-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            <Home className="drawer-link-icon" size={20} /> {t('nav_home')}
          </Link>
          <Link to="/products" className={`drawer-link ${location.pathname === '/products' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            <Store className="drawer-link-icon" size={20} /> {t('nav_shop')}
          </Link>
          <Link to="/favorites" className={`drawer-link ${location.pathname === '/favorites' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            <Heart className="drawer-link-icon" size={20} /> {t('my_favorites')}
            {favorites.length > 0 && <span className="badge" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }}>{favorites.length}</span>}
          </Link>

          <h5 className="drawer-section-title">{t('settings')}</h5>
          <div className="drawer-link" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Settings className="drawer-link-icon" size={20} /> {t('language')}
            </div>
            <LanguageToggle />
          </div>
          <button className="drawer-link" onClick={toggleTheme} style={{ width: '100%', textAlign: 'left' }}>
            {theme === 'light' ? (
              <><Moon className="drawer-link-icon" size={20} /> {t('dark_mode')}</>
            ) : (
              <><Sun className="drawer-link-icon" size={20} /> {t('light_mode')}</>
            )}
          </button>

          {user && (
            <>
              <h5 className="drawer-section-title">{t('account')}</h5>
              <Link to="/profile" className="drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="drawer-link-icon" size={20} /> {t('profile')}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard className="drawer-link-icon" size={20} /> {t('admin')}
                </Link>
              )}
              <button className="drawer-link" style={{ color: 'var(--error)' }} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                <LogOut className="drawer-link-icon" size={20} style={{ color: 'var(--error)' }} /> {t('logout')}
              </button>
            </>
          )}
        </div>
      </div>
      {isMobileMenuOpen && <div className="drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
    </>
  );
};

export default Navbar;