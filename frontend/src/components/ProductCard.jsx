import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { products } from '../api';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MessageSquare, 
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ProductCard = ({ product, onLike, onComment }) => {
  const { user, addToCart, setQuickViewProduct, showNotification, favorites, toggleFavorite, t, backendUrl } = useApp();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(product.comments || []);
  
  const isFavorite = favorites?.some(f => f.id === product.id);
  const [likesCount, setLikesCount] = useState(product.likes?.length || 0);
  const [isAdding, setIsAdding] = useState(false);
  const [commentImage, setCommentImage] = useState('');

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle local favorites state for immediate UI feedback
    toggleFavorite(product);
    
    if (!user) {
      // If not logged in, we still toggle local favorites but don't call API
      return;
    }

    try {
      const res = await products.like(product.id);
      const updatedLikes = (res.data.likes || []).map(Number);
      setLikesCount(updatedLikes.length);
      if (onLike) onLike(product.id, updatedLikes.length);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock_count < 1) return;
    setIsAdding(true);
    addToCart(product, selectedColor, selectedSize);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      const res = await products.addComment(product.id, commentText, commentImage);
      setComments(res.data.comments);
      setCommentText('');
      setCommentImage('');
      setShowCommentModal(false);
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('uz-UZ', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <motion.div
        className="product-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="product-image-wrap">
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.image?.startsWith('/') ? `${backendUrl}${product.image}` : (product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400')} 
              alt={product.name} 
              className="product-img" 
            />
          </Link>
          
          <div className="product-badge">New</div>
          
          <div className="product-action-btns mobile-actions-visible">
            <motion.button 
              className={`product-card-btn ${isFavorite ? 'liked' : ''}`}
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={t('like')}
            >
              <Heart size={20} fill={isFavorite ? "#EF4444" : "none"} color={isFavorite ? "#EF4444" : "currentColor"} />
            </motion.button>
            <motion.button 
              className="product-card-btn"
              onClick={() => setShowCommentModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={t('comments')}
            >
              <MessageSquare size={20} />
            </motion.button>
            <button 
              className="product-card-btn show-desktop" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
              title={t('quick_view')}
            >
              <Eye size={20} />
            </button>
          </div>
        </div>

        <div className="product-info">
          <div className="product-cat">{product.brand || t('nav_categories')}</div>
          <Link to={`/product/${product.id}`}>
            <h3 className="product-title-text" title={product.name}>{product.name}</h3>
          </Link>
          
          <div className="product-rating">
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} fill={i <= 4 ? "#F59E0B" : "none"} color={i <= 4 ? "#F59E0B" : "#D1D5DB"} />
              ))}
            </div>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>({likesCount})</span>
          </div>

          <div className="product-footer">
            <div className="product-price">
              {product.price.toLocaleString()} <span>{t('currency')}</span>
            </div>
            
            <motion.button 
              className={`add-cart-mini ${isAdding ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock_count < 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                background: isAdding ? '#10B981' : '#2563EB',
                width: '36px',
                height: '36px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isAdding ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />}
            </motion.button>
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
             {product.stock_count > 0 ? (
               <><CheckCircle2 size={14} color="#10B981" /> <span style={{color: '#10B981'}}>{t('in_stock')}</span></>
             ) : (
               <><XCircle size={14} color="#EF4444" /> <span style={{color: '#EF4444'}}>{t('out_of_stock')}</span></>
             )}
          </div>
        </div>
      </motion.div>

      {/* Modal is kept similar but updated with modern styles if needed */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommentModal(false)}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 
            }}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Poppins' }}>{t('comments')}</h3>
                <button onClick={() => setShowCommentModal(false)} style={{ fontSize: '24px' }}>&times;</button>
              </div>

              <div className="comments-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>{t('no_comments')}</p>
                ) : (
                  comments.map((comment, index) => (
                    <div key={index} className="comment" style={{ padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{comment.username}</span>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{formatDate(comment.timestamp)}</span>
                      </div>
                      <p style={{ fontSize: '14px' }}>{comment.text}</p>
                      {comment.image && (
                        <div style={{ marginTop: '8px', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                          <img 
                            src={comment.image.startsWith('/') ? `${backendUrl}${comment.image}` : comment.image} 
                            alt="Comment" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('write_comment')}
                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setCommentImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '13px' }}
                    />
                    <button className="btn btn-primary" onClick={handleSubmitComment}>{t('send')}</button>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '20px' }}>{t('login_to_comment')}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;