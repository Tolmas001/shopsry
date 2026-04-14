import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orders } from '../api';
import { CheckCircle, Printer, ShoppingBag, ArrowLeft, Phone, MapPin, User, Calendar, CreditCard, Banknote } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orders.getOne(id)
      .then(res => setOrder(res.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="container section">Yuklanmoqda...</div>;
  if (!order) return <div className="container section">Buyurtma topilmadi.</div>;

  return (
    <div className="container section" style={{ padding: '40px 20px' }}>
      <div className="receipt-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Success Header */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
          className="no-print"
        >
          <div style={{ display: 'inline-flex', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
            <CheckCircle size={48} />
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Rahmat! Buyurtmangiz qabul qilindi</h1>
          <p style={{ color: 'var(--text-muted)' }}>Buyurtma raqami: #{order.id}</p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            background: 'white', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #f1f1f1',
            position: 'relative'
          }}
          className="receipt-card"
        >
          {/* Header Info */}
          <div style={{ padding: '40px', borderBottom: '1px dashed #e5e7eb', background: '#fafbfc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>ShopSRY</h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Sifatli va zamonaviy xaridlar</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                  <Calendar size={14} />
                  {new Date(order.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>#{order.id}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            {/* Customer & Payment Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px', letterSpacing: '0.05em' }}>Mijoz Ma'lumotlari</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                    <User size={16} color="#6b7280" /> {order.customer_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                    <Phone size={16} color="#6b7280" /> {order.customer_phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                    <MapPin size={16} color="#6b7280" /> {order.customer_address}
                  </div>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px', letterSpacing: '0.05em' }}>To'lov Usuli</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '10px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                  }}>
                    {order.payment_method === 'card' ? <CreditCard size={20} /> : <Banknote size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                      {order.payment_method === 'card' ? 'Plastik karta' : 'Naqd pul'}
                    </div>
                    <div style={{ fontSize: '13px', color: order.payment_status === 'paid' ? '#22c55e' : '#f59e0b' }}>
                      {order.payment_status === 'paid' ? 'To\'langan' : 'To\'lov kutilmoqda'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', letterSpacing: '0.05em' }}>Mahsulotlar</h4>
              <div style={{ border: '1px solid #f1f1f1', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#fafbfc', borderBottom: '1px solid #f1f1f1' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '13px', color: '#6b7280' }}>Nomi</th>
                      <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '13px', color: '#6b7280' }}>Soni</th>
                      <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '13px', color: '#6b7280' }}>Narxi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items_list.map((item, index) => (
                      <tr key={index} style={{ borderBottom: index === order.items_list.length - 1 ? 'none' : '1px solid #f1f1f1' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500 }}>{item.name}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px' }}>x{item.quantity}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{parseFloat(item.price).toLocaleString()} so'm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '2px solid #f1f1f1', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#6b7280' }}>
                <span>Mahsulotlar jami:</span>
                <span>{parseFloat(order.total_amount).toLocaleString()} so'm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#6b7280' }}>
                <span>Yetkazib berish:</span>
                <span style={{ color: '#22c55e' }}>Bepul</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f1f1' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Umumiy summa:</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{parseFloat(order.total_amount).toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* Footer Receipt Decoration */}
          <div style={{ height: '8px', background: 'var(--primary)', opacity: 0.1 }}></div>
        </motion.div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px', justifyContent: 'center' }} className="no-print">
          <button 
            onClick={handlePrint}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Printer size={20} /> Chop etish
          </button>
          <Link to="/" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
            <ShoppingBag size={20} /> Xaridni davom ettirish
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }} className="no-print">
          <Link to="/orders" style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <ArrowLeft size={14} /> Buyurtmalar tarixiga o'tish
          </Link>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .receipt-card { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
