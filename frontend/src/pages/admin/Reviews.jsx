import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, admin } from '../../api';
import { MessageSquare, Trash2, Box, User, Calendar, Star } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    products.getAll()
      .then(res => {
        const allReviews = [];
        res.data.forEach(p => {
          if (p.comments && p.comments.length > 0) {
            p.comments.forEach((c, index) => {
              allReviews.push({
                ...c,
                productId: p.id,
                productName: p.name,
                productImage: p.image,
                index: index
              });
            });
          }
        });
        // Sort by timestamp if available, else latest first
        allReviews.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setReviews(allReviews);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (productId, index, productName) => {
    if (window.confirm(`Haqiqatan ham ushbu sharhni o'chirmoqchimisiz?`)) {
      try {
        await admin.deleteReview(productId, index);
        // Reload to update indexes correctly
        loadReviews();
      } catch (err) {
        alert('Xatolik yuz berdi');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-reviews-page"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Sharhlar Moderatsiyasi</h2>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>Mahsulotlarga qoldirilgan izohlarni boshqarish.</p>
        </div>
        <div style={{ background: 'white', padding: '12px 24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageSquare size={20} color="#059669" />
          <span style={{ fontWeight: 600, fontSize: '18px' }}>{reviews.length}</span>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>Jami</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <AnimatePresence>
          {reviews.map((rev, i) => (
            <motion.div 
              key={`${rev.productId}-${rev.index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{ 
                background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f1f1', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', gap: '24px'
              }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={rev.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{rev.productName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '13px', color: '#6B7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563', fontWeight: 600 }}>
                        <User size={14} /> {rev.username}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(rev.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, color: '#EF4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(rev.productId, rev.index, rev.productName)}
                    style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', padding: '8px' }}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>

                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '16px', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                  "{rev.text}"
                </div>
                {rev.image && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={rev.image} alt="User upload" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #f1f1f1' }} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {reviews.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '24px', border: '1px dashed #E5E7EB' }}>
            <MessageSquare size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#9CA3AF' }}>Hali hech qanday sharhlar yo'q</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminReviews;
