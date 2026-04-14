import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Trash2, ChevronRight, Home } from 'lucide-react';

const Favorites = () => {
  const { favorites, clearFavorites, t } = useApp();

  return (
    <div className="favorites-page pt-20">
      {/* Hero Section */}
      <section className="favorites-hero">
        <div className="container mx-auto px-4">
          <div className="favorites-breadcrumb">
            <Link to="/"><Home size={16} /> {t('nav_home')}</Link>
            <ChevronRight size={14} />
            <span>{t('my_favorites')}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="favorites-title mb-2">{t('my_favorites')}</h1>
              <p className="text-gray-500 font-medium">
                {favorites.length} {t('items_selected') || 'mahsulot tanlandi'}
              </p>
            </div>
            
            {favorites.length > 0 && (
              <div className="favorites-actions">
                <button 
                  className="clear-all-btn"
                  onClick={clearFavorites}
                >
                  <Trash2 size={18} />
                  <span>{t('clear_all') || 'Hammasini tozalash'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        <AnimatePresence mode="popLayout">
          {favorites.length > 0 ? (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="favorites-grid"
            >
              {favorites.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="favorites-empty-state"
            >
              <div className="empty-icon-box">
                <Heart size={48} />
              </div>
              <h2 className="text-3xl font-extrabold mb-4 text-gray-900">{t('favorites_empty') || 'Sevimlilar bo\'sh'}</h2>
              <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                Sizga yoqqan mahsulotlarni bu yerda saqlab qo'yishingiz mumkin. Hali hech narsa yo'qmi? Do'konimizni ko'zdan kechiring!
              </p>
              <Link to="/products" className="btn-wow inline-flex items-center gap-3 px-10 py-4 text-lg">
                <ShoppingBag size={22} />
                {t('browse_products') || 'Mahsulotlarni ko\'rish'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Favorites;
