import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { orders } from '../api';

const Orders = () => {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orders.getAll()
      .then(res => setOrdersList(res.data))
      .catch(() => setOrdersList([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'Kutilmoqda';
      case 'completed': return 'Tugallangan';
      case 'cancelled': return 'Bekor qilingan';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container cart-page">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px' }}
        >
          <p>Yuklanmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <motion.h1 
        className="section-title"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        Buyurtmalarim
      </motion.h1>
      
      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {ordersList.length === 0 ? (
          <motion.div 
            className="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '100px 0', background: '#f9f9fb', borderRadius: '24px' }}
          >
            <p style={{ color: '#86868b', fontSize: '18px' }}>Sizda hali buyurtmalar mavjud emas</p>
          </motion.div>
        ) : ordersList.map((order, index) => (
          <motion.div 
            key={order.id} 
            className="order-card-enhanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '32px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid #f1f1f1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f8f8f8', paddingBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Buyurtma #{order.id}</h3>
                <p style={{ color: '#86868b', fontSize: '13px', marginTop: '4px' }}>📅 {new Date(order.created_at).toLocaleString('uz-UZ')}</p>
              </div>
              <span className={`status-badge ${getStatusClass(order.status)}`} style={{ 
                padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 600,
                background: order.status === 'pending' ? '#FEF3C7' : (order.status === 'completed' ? '#D1FAE5' : '#FEE2E2'),
                color: order.status === 'pending' ? '#D97706' : (order.status === 'completed' ? '#059669' : '#DC2626')
              }}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 12px', borderRadius: '8px',
                background: '#f3f4f6', color: '#4b5563', fontWeight: 500
              }}>
                {order.payment_method === 'card' ? <CreditCard size={14} /> : <Banknote size={14} />}
                {order.payment_method === 'card' ? 'Karta' : 'Naqd'}
              </span>
              <span style={{ 
                fontSize: '12px', padding: '4px 12px', borderRadius: '8px',
                background: order.payment_status === 'paid' ? '#D1FAE5' : '#FEE2E2',
                color: order.payment_status === 'paid' ? '#059669' : '#DC2626',
                fontWeight: 600
              }}>
                {order.payment_status === 'paid' ? 'To\'langan' : 'To\'lanmagan'}
              </span>
            </div>

            <div className="order-items-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {order.items_list && order.items_list.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img 
                    src={item.image?.startsWith('/') ? `http://localhost:5001${item.image}` : (item.image || 'https://via.placeholder.com/60')} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', background: '#f3f4f6' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', margin: 0 }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#86868b' }}>{item.quantity} dona x {item.price.toLocaleString()} so'm</p>
                  </div>
                  <div style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} so'm</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px dotted #e5e7eb' }}>
              <span style={{ color: '#86868b' }}>Umumiy so'mma:</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{order.total_amount.toLocaleString()} so'm</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;