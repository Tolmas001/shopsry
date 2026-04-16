import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { products } from '../api';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Smartphone, 
  Shirt, 
  ShoppingBag, 
  Watch, 
  Home as HomeIcon,
  Star,
  Quote,
  Search
} from 'lucide-react';

const Home = () => {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('name') || '');
  const [timeLeft, setTimeLeft] = useState({ hours: 12, mins: 45, secs: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categoryTiles = [
    { name: t('cat_electronics'), icon: <Smartphone size={32} />, color: '#EFF6FF' },
    { name: t('cat_clothing'), icon: <Shirt size={32} />, color: '#FEF3C7' },
    { name: t('cat_shoes'), icon: <ShoppingBag size={32} />, color: '#ECFDF5' },
    { name: t('cat_accessories'), icon: <Watch size={32} />, color: '#F5F3FF' },
    { name: t('cat_home'), icon: <HomeIcon size={32} />, color: '#FFF1F2' },
  ];

  const reviews = [
    { name: 'Azizbek K.', role: 'Dizayner', text: 'Juda mazmunli va sifatli mahsulotlar. Xizmat ko‘rsatish ham a‘lo darajada!', rating: 5, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { name: 'Malika R.', role: 'Tadbirkor', text: 'Yetkazib berish juda tez. Har safar kutganimdan ham yaxshi natija olaman.', rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { name: 'Farhod T.', role: 'Talaba', text: 'Narxlari juda hamyonbop. Sifati esa juda yuqori!', rating: 4, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  ];

  useEffect(() => {
    const name = searchParams.get('name');
    setSearchQuery(name || '');
    
    products.getAll({ name }).then(res => {
      setProductsList(res.data);
    });
  }, [searchParams]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid-modern">
            <motion.div 
              className="hero-content-modern"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-badge">
                ✨ ShopSRY Premium 2026
              </div>
              <h1 className="hero-title-modern">
                {t('hero_title').split(' ').map((word, i) => i === 1 ? <span key={i} className="text-gradient">{word} </span> : word + ' ')}
              </h1>
              <p className="hero-desc-modern">
                {t('hero_desc')}
              </p>
              
              <form 
                className="hero-search-modern" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/products?name=${searchQuery.trim()}`);
                  }
                }}
              >
                <div className="search-input-wrapper">
                  <Search className="search-icon-hero" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('hero_search_placeholder')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="hero-search-btn">
                  {t('hero_search_btn')}
                </button>
              </form>

              <div className="hero-actions-modern">
                <Link to="/products" className="btn btn-primary hero-main-btn">
                  {t('hero_catalog_btn')} <ArrowRight size={20} />
                </Link>
                <div className="hero-stats show-desktop">
                  <div className="avatar-stack">
                     {[1,2,3].map(i => <div key={i} className="avatar-small"></div>)}
                  </div>
                  <span>{t('hero_customers')}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="hero-visual-modern"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="hero-blob-modern"></div>
              <img src="/hero-image.png" alt="Hero" className="hero-img-main" />
              
              <motion.div 
                 className="floating-card glass hide-mobile"
                 animate={{ y: [0, -15, 0] }}
                 transition={{ duration: 5, repeat: Infinity }}
              >
                <div className="card-icon-round"><Star size={18} fill="white" /></div>
                <div>
                   <p className="card-label">{t('hero_rating')}</p>
                   <p className="card-sublabel">{t('hero_quality')}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="container section">
        <div className="section-header-centered">
          <p className="section-tag">{t('cat_title')}</p>
          <h2 className="section-title">{t('cat_subtitle')}</h2>
        </div>
        
        <div className="category-scroll-wrapper">
          <div className="category-grid-modern">
            {categoryTiles.map((cat, i) => (
              <motion.div
                key={i}
                className="category-card-modern"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/products?category=${cat.name}`} className="category-card-inner">
                  <div className="category-icon-box" style={{ backgroundColor: cat.color }}>
                    {cat.icon}
                  </div>
                  <h4>{cat.name}</h4>
                  <span className="category-link-text">{t('view_more')} <ArrowRight size={14} /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products Sections */}
      {(() => {
        const categoriesMap = productsList.reduce((acc, product) => {
          const cat = product.category || 'Boshqa';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {});

        return Object.entries(categoriesMap).slice(0, 3).map(([categoryName, products], index) => (
          <section key={categoryName} className="container section">
            <div className="category-row-header">
              <div className="header-text">
                <p className="section-tag">{t('new_arrival')}</p>
                <h2 className="section-title-small">{categoryName}</h2>
              </div>
              <Link to={`/products?category=${categoryName}`} className="view-all-link">
                {t('view_all')} <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="products-grid-modern">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ));
      })()}

      {/* Special Offer Section */}
      <section className="container section">
        <div className="offer-banner-modern">
          <div className="offer-text-content">
            <p className="offer-badge">{t('offer_subtitle')}</p>
            <h2 className="offer-title-text">{t('offer_title')}</h2>
            <p className="offer-description">{t('offer_desc')}</p>
            
            <div className="offer-timer-modern">
              <div className="timer-unit"><span>{String(timeLeft.hours).padStart(2, '0')}</span><p>{t('hours')}</p></div>
              <div className="timer-separator">:</div>
              <div className="timer-unit"><span>{String(timeLeft.mins).padStart(2, '0')}</span><p>{t('mins')}</p></div>
              <div className="timer-separator">:</div>
              <div className="timer-unit"><span>{String(timeLeft.secs).padStart(2, '0')}</span><p>{t('secs')}</p></div>
            </div>
            
            <Link to="/products" className="btn btn-secondary offer-btn-modern">
              {t('offer_btn')} <ArrowRight size={18} />
            </Link>
          </div>
          <div className="offer-visual-content">
            <img src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800" alt="Special Offer" />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="about" className="container section">
        <div className="section-header-centered">
          <p className="section-tag">{t('reviews_title')}</p>
          <h2 className="section-title">{t('reviews_subtitle')}</h2>
        </div>
        
        <div className="reviews-slider-wrapper">
          <div className="reviews-slider-container">
            {reviews.map((review, i) => (
              <motion.div 
                key={i} 
                className="review-card-modern"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="review-quote-icon"><Quote size={32} /></div>
                <p className="review-message">"{review.text}"</p>
                <div className="reviewer-profile">
                  <img src={review.img} alt={review.name} className="reviewer-avatar" />
                  <div className="reviewer-meta">
                    <h4>{review.name}</h4>
                    <p>{review.role}</p>
                    <div className="reviewer-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={12} fill={star <= review.rating ? "#F59E0B" : "none"} color={star <= review.rating ? "#F59E0B" : "#D1D5DB"} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="container section newsletter-wrapper">
        <div className="newsletter-card-modern">
          <div className="newsletter-icon-floating"><ShoppingBag size={40} /></div>
          <h2>{t('newsletter_title')}</h2>
          <p>{t('newsletter_desc')}</p>
          <form className="newsletter-form-modern" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder={t('newsletter_placeholder')} required />
            <button type="submit" className="btn-modern-dark">{t('newsletter_btn')}</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;