import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Star, Heart, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const QuickView = ({ product, onClose }) => {
  const { addToCart, favorites, toggleFavorite, t } = useApp();

  const isFavorite = favorites?.some(f => f.id === product.id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const safeParse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      if (typeof data === 'string' && data.includes(',')) {
        return data.split(',').map(s => s.trim());
      }
      return [data];
    }
  };

  const colors = safeParse(product.colors);
  const sizes = safeParse(product.sizes);

  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 5000 }}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ maxWidth: '900px', width: '95%', padding: 0, overflow: 'hidden' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '20px', top: '20px', zIndex: 10, background: 'white', borderRadius: '50%', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', minHeight: '500px', maxHeight: '90vh' }}>
          {/* Image Section */}
          <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <img 
              src={product.image?.startsWith('http') ? product.image : (product.image ? `http://localhost:5001${product.image}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800')} 
              alt={product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))' }}
            />
          </div>

          {/* Info Section */}
          <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {product.brand}
              </span>
              <h2 style={{ fontSize: '32px', margin: '8px 0', fontWeight: 800 }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', color: '#F59E0B' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= 4 ? "#F59E0B" : "none"} />)}
                </div>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>(128 {t('reviews_count')})</span>
              </div>
            </div>

            <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
              {product.price?.toLocaleString()} <span style={{ fontSize: '16px' }}>{t('currency')}</span>
            </p>

            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.6 }}>
              {product.description || t('footer_desc')}
            </p>

            {/* Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {colors.length > 0 && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{t('select_color')}</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', background: color, 
                          border: selectedColor === color ? '3px solid var(--primary)' : '1px solid #ddd',
                          boxShadow: selectedColor === color ? '0 0 0 2px white inset' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{t('select_size')}</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{ 
                          padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                          background: selectedSize === size ? 'var(--primary)' : 'white',
                          color: selectedSize === size ? 'white' : '#1f2937',
                          border: '1.5px solid', borderColor: selectedSize === size ? 'var(--primary)' : '#eee'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '4px' 
              }}>
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  style={{ width: '40px', height: '40px', fontWeight: 800 }}
                >-</button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '40px', height: '40px', fontWeight: 800 }}
                >+</button>
              </div>
              <button 
                className="btn-wow"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                <ShoppingBag size={20} /> {t('add_to_cart')}
              </button>
              <button 
                className={`btn-wishlist ${isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                style={{ 
                  width: '52px', height: '52px', borderRadius: '12px', border: '1.5px solid #eee', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isFavorite ? '#FEF2F2' : 'white',
                  color: isFavorite ? '#EF4444' : '#1f2937',
                  transition: '0.3s'
                }}
              >
                <Heart size={20} fill={isFavorite ? "#EF4444" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickView;
