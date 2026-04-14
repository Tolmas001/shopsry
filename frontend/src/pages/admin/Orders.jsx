import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { orders } from '../../api';

const AdminOrders = () => {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    orders.getAdmin()
      .then(res => setOrdersList(res.data))
      .catch(() => setOrdersList([]))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id, status) => {
    try {
      await orders.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      alert('Xatolik yuz berdi');
    }
  };

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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Buyurtmalar</h2>
      
      <motion.div 
        className="table-responsive"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Manzil</th>
              <th>Mahsulotlar</th>
              <th>Jami</th>
              <th>Holat</th>
              <th>Sana</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_phone}</td>
                <td>{order.customer_address || '-'}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.items || '-'}
                </td>
                <td>{order.total_amount?.toLocaleString()} so'm</td>
                <td>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #d2d2d7',
                      background: 'white',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pending">Kutilmoqda</option>
                    <option value="completed">Tugallangan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {ordersList.length === 0 && (
        <motion.div 
          className="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Buyurtmalar yo'q
        </motion.div>
      )}
    </div>
  );
};

export default AdminOrders;