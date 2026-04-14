import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { stats } from '../../api';
import AdminProducts from './Products';
import AdminCategories from './Categories';
import AdminOrders from './Orders';

import { 
  ShoppingBag, 
  Package, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Users,
  LayoutDashboard,
  Box,
  Layers,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading, t } = useApp();
  const location = useLocation();
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      stats.get()
        .then(res => setStatsData(res.data))
        .catch(() => {});
    }
  }, [user]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <div className="sidebar" style={{ background: '#111827' }}>
        <h2 style={{ color: 'white', padding: '0 20px', marginBottom: '40px', fontSize: '24px' }}>Admin Panel</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/admin" className={isActive('/admin') ? 'sidebar-item active' : 'sidebar-item'}>
            <LayoutDashboard size={20} /> Bosh sahifa
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products') ? 'sidebar-item active' : 'sidebar-item'}>
            <Box size={20} /> Mahsulotlar
          </Link>
          <Link to="/admin/categories" className={isActive('/admin/categories') ? 'sidebar-item active' : 'sidebar-item'}>
            <Layers size={20} /> Kategoriyalar
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders') ? 'sidebar-item active' : 'sidebar-item'}>
            <ClipboardList size={20} /> Buyurtmalar
          </Link>
          <Link to="/" className="sidebar-item" style={{ marginTop: '40px', color: '#9CA3AF' }}>
            <ArrowLeft size={20} /> Saytga qaytish
          </Link>
        </div>
      </div>
      
      <div className="admin-content" style={{ background: '#F9FAFB', overflowY: 'auto' }}>
        <div className="container" style={{ padding: '40px 0' }}>
          <div className="admin-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Xush kelibsiz, {user?.username}</h1>
              <p style={{ color: '#6B7280', marginTop: '4px' }}>Bugungi holat va statistikani kuzatib boring.</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={async () => {
                try {
                  const { demo } = await import('../../api');
                  await demo.seed();
                  alert('Demo ma`lumotlar muvaffaqiyatli yaratildi!');
                  window.location.reload();
                } catch (e) {
                  alert('Xatolik: ' + e.message);
                }
              }}
            >
              Demo Ma'lumot Qushish
            </button>
          </div>
          
          <Routes>
            <Route path="/" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {statsData && (
                  <>
                    <div className="stats-grid" style={{ 
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' 
                    }}>
                      <div className="stat-card-premium" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f1f1' }}>
                        <div style={{ color: '#2563EB', marginBottom: '16px', opacity: 0.8 }}><TrendingUp size={24} /></div>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Umumiy Daromad</p>
                        <h3 style={{ fontSize: '28px', margin: '8px 0 0 0' }}>{statsData.totalRevenue?.toLocaleString()} <span style={{fontSize: '14px'}}>so'm</span></h3>
                      </div>
                      <div className="stat-card-premium" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f1f1' }}>
                        <div style={{ color: '#D97706', marginBottom: '16px', opacity: 0.8 }}><ShoppingBag size={24} /></div>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Buyurtmalar</p>
                        <h3 style={{ fontSize: '28px', margin: '8px 0 0 0' }}>{statsData.totalOrders}</h3>
                      </div>
                      <div className="stat-card-premium" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f1f1' }}>
                        <div style={{ color: '#DC2626', marginBottom: '16px', opacity: 0.8 }}><AlertCircle size={24} /></div>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Kutilayotgan</p>
                        <h3 style={{ fontSize: '28px', margin: '8px 0 0 0' }}>{statsData.pendingOrders}</h3>
                      </div>
                      <div className="stat-card-premium" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f1f1' }}>
                        <div style={{ color: '#059669', marginBottom: '16px', opacity: 0.8 }}><Package size={24} /></div>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Mahsulotlar</p>
                        <h3 style={{ fontSize: '28px', margin: '8px 0 0 0' }}>{statsData.totalProducts}</h3>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                      <div className="charts-section" style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f1f1', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                          <h3 style={{ margin: 0 }}>Sotuvlar Trendi (Oxirgi 6 oy)</h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <span style={{ fontSize: '12px', color: '#86868b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                               <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></div> Daromad
                             </span>
                          </div>
                        </div>
                        <div className="css-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '240px', paddingBottom: '40px', position: 'relative' }}>
                          {statsData.revenueTrend?.length > 0 ? (
                            statsData.revenueTrend.map((bar, i) => (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${(bar.val / Math.max(...statsData.revenueTrend.map(t => t.val), 1)) * 100}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  style={{ 
                                    width: '100%', 
                                    background: i === statsData.revenueTrend.length - 1 ? 'var(--primary)' : '#E0E7FF', 
                                    borderRadius: '8px', 
                                    minHeight: '4px',
                                    position: 'relative'
                                  }}
                                >
                                  <div className="chart-tooltip">{bar.val.toLocaleString()}</div>
                                </motion.div>
                                <span style={{ fontSize: '12px', color: '#86868b', fontWeight: 600 }}>{bar.label}</span>
                              </div>
                            ))
                          ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Hali ma'lumotlar yo'q</div>
                          )}
                          <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, borderBottom: '1px solid #f1f1f1' }}></div>
                        </div>
                      </div>

                      <div className="status-section" style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f1f1', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: 'fit-content' }}>
                         <h3 style={{ margin: '0 0 32px 0' }}>Buyurtmalar Holati</h3>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {statsData.statusDistribution?.map((stat, i) => (
                              <div key={i}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{stat.label}</span>
                                    <span style={{ color: '#6B7280' }}>{stat.count}ta</span>
                                 </div>
                                 <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(stat.count / (statsData.totalOrders || 1)) * 100}%` }}
                                      style={{ 
                                        height: '100%', 
                                        background: stat.label === 'delivered' ? 'var(--secondary)' : (stat.label === 'pending' ? '#F59E0B' : '#6366F1'),
                                        borderRadius: '4px'
                                      }}
                                    />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            } />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/orders" element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;