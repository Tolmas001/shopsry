import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin } from '../../api';
import { Users as UsersIcon, Trash2, User, Mail, Calendar, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    admin.getUsers()
      .then(res => {
        setUsersList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Haqiqatan ham "${username}" foydalanuvchini o'chirmoqchimisiz?`)) {
      try {
        await admin.deleteUser(id);
        setUsersList(usersList.filter(u => u.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Xatolik yuz berdi');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-users-page"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Foydalanuvchilar</h2>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>Barcha ro'yxatdan o'tgan foydalanuvchilarni boshqarish.</p>
        </div>
        <div style={{ background: 'white', padding: '12px 24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UsersIcon size={20} color="#2563EB" />
          <span style={{ fontWeight: 600, fontSize: '18px' }}>{usersList.length}</span>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>Jami</span>
        </div>
      </div>

      <div className="table-responsive" style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f1f1' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Foydalanuvchi</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Sana</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {usersList.map((u, i) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td style={{ color: '#9CA3AF', fontSize: '13px' }}>#{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: 'full', background: '#F3F4F6', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                      }}>
                        {u.image ? (
                          <img src={u.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={20} color="#9CA3AF" />
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.username}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                      <Mail size={14} />
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: u.role === 'admin' ? '#EEF2FF' : '#F3F4F6',
                      color: u.role === 'admin' ? '#4F46E5' : '#4B5563',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      {u.role === 'admin' && <Shield size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <motion.button 
                      className="btn-icon btn-danger-lite"
                      whileHover={{ scale: 1.1, backgroundColor: '#FEE2E2' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(u.id, u.username)}
                      style={{ 
                        padding: '10px', borderRadius: '12px', border: 'none', background: 'transparent', 
                        color: '#EF4444', cursor: 'pointer', transition: 'all 0.2s' 
                      }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {usersList.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <UsersIcon size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Foydalanuvchilar topilmadi</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;
