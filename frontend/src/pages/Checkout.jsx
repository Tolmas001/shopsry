import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orders } from '../api';
import { useApp } from '../context/AppContext';

import { Banknote, CreditCard, Lock } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart, user } = useApp();
  const [form, setForm] = useState({ 
    customer_name: user?.username || '', 
    customer_phone: '', 
    customer_address: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await orders.create({
        ...form,
        payment_method: paymentMethod,
        items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
      });
      clearCart();
      setMessage('✅ Buyurtma muvaffaqiyatli qabul qilindi!');
      setTimeout(() => navigate(`/order-success/${res.data.order_id}`), 1500);
    } catch (err) {
      setMessage('❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container checkout-page">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty"
        >
          Savat bo'sh
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container checkout-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <motion.h1 
        className="section-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        Buyurtmani Rasmiylashtirish
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {message && (
          <motion.div 
            className={`message ${message.includes('muvaffaqiyatli') ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gap: '32px' }}
        >
          {/* Customer Info */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Ma'lumotlar
            </h3>
            <div className="form-group">
              <label>Ism</label>
              <input 
                type="text" 
                value={form.customer_name} 
                onChange={e => setForm({...form, customer_name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input 
                type="tel" 
                placeholder="+998"
                value={form.customer_phone} 
                onChange={e => setForm({...form, customer_phone: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Manzil</label>
              <input 
                type="text" 
                value={form.customer_address} 
                onChange={e => setForm({...form, customer_address: e.target.value})} 
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1' }}>
            <h3 style={{ marginBottom: '24px' }}>To'lov Usuli</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: paymentMethod === 'card' ? '32px' : '0' }}>
              <div 
                onClick={() => setPaymentMethod('cash')}
                style={{ 
                  padding: '20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${paymentMethod === 'cash' ? 'var(--primary)' : '#f1f1f1'}`,
                  background: paymentMethod === 'cash' ? 'rgba(37, 99, 235, 0.05)' : 'white',
                  transition: '0.3s'
                }}
              >
                <Banknote size={24} color={paymentMethod === 'cash' ? 'var(--primary)' : '#6B7280'} style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>Naqd pul</div>
              </div>

              <div 
                onClick={() => setPaymentMethod('card')}
                style={{ 
                  padding: '20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : '#f1f1f1'}`,
                  background: paymentMethod === 'card' ? 'rgba(37, 99, 235, 0.05)' : 'white',
                  transition: '0.3s'
                }}
              >
                <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--primary)' : '#6B7280'} style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>Karta orqali</div>
              </div>
            </div>

            <AnimatePresence>
              {paymentMethod === 'card' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ background: '#f9f9fb', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Karta raqami</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        value={cardInfo.number} 
                        onChange={e => setCardInfo({...cardInfo, number: e.target.value})}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Muddati</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardInfo.expiry} 
                          onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})}
                          required
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>CVV</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          value={cardInfo.cvv} 
                          onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})}
                          required
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '11px', color: '#86868b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Ma'lumotlaringiz xavfsiz holatda saqlanadi
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px' }}>
              <span>Jami:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '24px' }}>{cartTotal.toLocaleString()} so'm</strong>
            </div>
            
            <motion.button 
              type="submit" 
              className="btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '18px', fontSize: '18px' }}
            >
              {loading ? 'Yuborilmoqda...' : (paymentMethod === 'card' ? 'To\'lash va Buyurtma berish' : 'Buyurtmani Tasdiqlash')}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Checkout;