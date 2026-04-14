import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container cart-page">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <img 
            src="https://img.icons8.com/ios/200/2c3e50/shopping-bag.png" 
            alt="Empty cart" 
            style={{ opacity: 0.3, marginBottom: '20px' }}
          />
          <h1 style={{ marginBottom: '16px' }}>Savat bo'sh</h1>
          <p style={{ color: '#86868b', marginBottom: '24px' }}>Savatingizda hali mahsulotlar yo'q</p>
          <Link to="/products" className="btn">Mahsulotlarni ko'rish</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <motion.h1 
          className="section-title"
          style={{ margin: 0 }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Savat
        </motion.h1>
        <button 
          onClick={() => { if(window.confirm("Savatni bo'shatmoqchimisiz?")) clearCart(); }}
          style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          Savatni tozalash
        </button>
      </div>

      <div className="cart-items-container" style={{ display: 'grid', gap: '20px' }}>
        {cart.map((item, index) => (
          <motion.div 
            key={`${item.id}-${item.variant}`}
            className="cart-item-enhanced"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px', 
              padding: '24px', 
              background: 'white', 
              borderRadius: '24px',
              border: '1px solid #f1f1f1',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              flexWrap: 'wrap'
            }}
          >
            <img 
              src={item.image?.startsWith('/') ? `http://localhost:5001${item.image}` : (item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200')} 
              alt={item.name} 
              style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' }}
            />
            <div style={{ flex: '1 1 200px' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{item.name}</h3>
              <p style={{ color: '#86868b', fontSize: '14px', margin: 0 }}>{item.brand}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {item.selectedColor && <span style={{ fontSize: '12px', background: '#F3F4F6', padding: '4px 10px', borderRadius: '20px' }}>Rang: {item.selectedColor}</span>}
                {item.selectedSize && <span style={{ fontSize: '12px', background: '#F3F4F6', padding: '4px 10px', borderRadius: '20px' }}>O'lcham: {item.selectedSize}</span>}
              </div>
            </div>
            <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto', justifyContent: 'flex-end', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: '12px', padding: '4px' }}>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)} style={{ width: '32px', height: '32px' }}>-</button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)} style={{ width: '32px', height: '32px' }}>+</button>
              </div>
              <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 800 }}>
                {(item.price * item.quantity).toLocaleString()} so'm
              </div>
              <button 
                className="delete-btn" 
                onClick={() => removeFromCart(item.id, item.variant)}
                style={{ color: '#DC2626', background: '#FEE2E2', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="cart-total"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Jami: <strong>{cartTotal.toLocaleString()} so'm</strong>
      </motion.div>

      <motion.div 
        style={{ textAlign: 'right' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button className="btn" onClick={() => navigate('/checkout')}>
          Buyurtma berish
        </button>
      </motion.div>
    </div>
  );
};

export default Cart;