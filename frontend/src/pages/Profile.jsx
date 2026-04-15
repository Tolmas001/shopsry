import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { auth as authApi, orders as ordersApi } from '../api';
import { 
  User, 
  Settings, 
  Globe, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  CreditCard, 
  Banknote, 
  ChevronRight,
  Sun,
  Moon,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  MapPin,
  Star,
  Plus,
  Trash2,
  Trash,
  Bell,
  Fingerprint,
  Zap,
  Award,
  Smartphone
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, language, changeLanguage, t, theme, toggleTheme, logout } = useApp();
  const [activeTab, setActiveTab] = useState('account');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: '', details: '' });
  const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '' });
  
  const [form, setForm] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    image: user?.image || '',
    phone: user?.phone || '',
    notifications_enabled: user?.notifications_enabled ?? true,
    privacy_private: user?.privacy_private ?? false,
    address_list: user?.address_list || [],
    saved_cards: user?.saved_cards || [],
    password: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
        image: user.image || '',
        phone: user.phone || '',
        notifications_enabled: user.notifications_enabled ?? true,
        privacy_private: user.privacy_private ?? false,
        address_list: user.address_list || [],
        saved_cards: user.saved_cards || [],
      }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getAll();
      const sortedOrders = res.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await authApi.getMyReviews();
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const calculateCompleteness = () => {
    const fields = ['full_name', 'email', 'phone', 'image'];
    const filled = fields.filter(f => !!form[f]).length;
    return (filled / fields.length) * 100;
  };

  const getLoyaltyInfo = () => {
    const points = user?.points || 0;
    if (points > 1000) return { tier: t('gold_member'), color: '#F59E0B', next: null };
    if (points > 500) return { tier: t('silver_member'), color: '#94A3B8', next: 1000 - points };
    return { tier: t('bronze_member'), color: '#B45309', next: 500 - points };
  };

  const addAddress = () => {
    if (!newAddress.title || !newAddress.details) return;
    const updated = [...form.address_list, { ...newAddress, id: Date.now() }];
    setForm({ ...form, address_list: updated });
    setNewAddress({ title: '', details: '' });
    setShowAddressModal(false);
  };

  const removeAddress = (id) => {
    const updated = form.address_list.filter(a => a.id !== id);
    setForm({ ...form, address_list: updated });
  };

  const addCard = () => {
    if (!newCard.number || !newCard.expiry) return;
    const updated = [...form.saved_cards, { ...newCard, id: Date.now() }];
    setForm({ ...form, saved_cards: updated });
    setNewCard({ number: '', expiry: '', holder: '' });
    setShowCardModal(false);
  };

  const removeCard = (id) => {
    const updated = form.saved_cards.filter(c => c.id !== id);
    setForm({ ...form, saved_cards: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      await updateProfile(data);
      setMessage({ type: 'success', text: t('success_profile') });
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || t('error_auth') });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status) => {
    return t(`status_${status}`) || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#D97706';
      case 'completed': return '#059669';
      case 'cancelled': return '#DC2626';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pending': return 'rgba(217, 119, 6, 0.1)';
      case 'completed': return 'rgba(5, 150, 105, 0.1)';
      case 'cancelled': return 'rgba(220, 38, 38, 0.1)';
      default: return '#f3f4f6';
    }
  };

  const tabs = [
    { id: 'account', label: t('profile_info'), icon: User },
    { id: 'orders', label: t('my_orders'), icon: Package },
    { id: 'addresses', label: t('saved_addresses'), icon: MapPin },
    { id: 'payments', label: t('payment_methods'), icon: CreditCard },
    { id: 'reviews', label: t('my_reviews'), icon: Star },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const loyalty = getLoyaltyInfo();
  const completeness = calculateCompleteness();

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>{t('profile_title')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Xush kelibsiz, {user?.full_name || user?.username}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: loyalty.color, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              <Award size={18} /> {loyalty.tier}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{user?.points || 0} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>BALL</span></div>
          </div>
        </div>
        
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div 
              style={{ 
                background: 'var(--bg-card)', 
                borderRadius: '24px', 
                padding: '12px', 
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 18px', borderRadius: '16px',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                    fontWeight: 600, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: '4px', border: 'none', cursor: 'pointer'
                  }}
                >
                  <tab.icon size={20} /> 
                  <span style={{ flex: 1, textAlign: 'left' }}>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={16} />}
                </button>
              ))}
              
              <div style={{ margin: '12px 0', height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
              
              <button 
                onClick={logout}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 18px', borderRadius: '16px',
                  background: 'transparent', color: '#EF4444',
                  fontWeight: 600, transition: '0.2s', border: 'none', cursor: 'pointer'
                }}
              >
                <LogOut size={20} /> {t('logout')}
              </button>
            </div>

            {/* Completeness Meter */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                <span>{t('profile_completeness')}</span>
                <span style={{ color: 'var(--primary)' }}>{completeness}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  style={{ height: '100%', background: 'var(--primary)' }}
                />
              </div>
            </div>

            {/* Member Card */}
            <div style={{ 
              background: `linear-gradient(135deg, ${loyalty.color} 0%, #1e293b 100%)`, 
              borderRadius: '24px', 
              padding: '24px', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Zap size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>{t('member_tier')}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>{loyalty.tier}</div>
              {loyalty.next && (
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  Kelingi darajagacha <b>{loyalty.next} ball</b> qoldi
                </div>
              )}
            </div>
          </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)', 
                  borderRadius: '24px', padding: '24px', color: 'white'
                }}
              >
                <h4 style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>ShopSRY Member</h4>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>Premium Plus</div>
                <div style={{ marginTop: '16px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                  <div style={{ width: '70%', height: '100%', background: 'white', borderRadius: '2px' }}></div>
                </div>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Next reward at 500 points</p>
              </motion.div>
            )}
          </div>

          {/* Content Area */}
          <div style={{ minHeight: '500px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: '32px', 
                    padding: '40px', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                      <div style={{ width: '56px', height: '56px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{t('profile_info')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{t('edit_profile_desc')}</p>
                      </div>
                    </div>

                    {message.text && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`message ${message.type}`} 
                        style={{ marginBottom: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                      </motion.div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '48px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          width: '120px', height: '120px', borderRadius: '40px', background: '#f3f4f6', 
                          overflow: 'hidden', border: '4px solid var(--bg-card)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                          <img 
                            src={form.image ? (form.image.startsWith('data') || form.image.startsWith('http') ? form.image : `http://localhost:5001${form.image}`) : 'https://img.icons8.com/ios-filled/120/eeeeee/user-male-circle.png'} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <label 
                          htmlFor="avatar-upload"
                          style={{ 
                            position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', 
                            color: 'white', padding: '10px', borderRadius: '16px', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)', border: '3px solid var(--bg-card)',
                            transition: '0.2s'
                          }}
                        >
                          <Globe size={20} />
                        </label>
                        <input 
                          id="avatar-upload"
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setForm({ ...form, image: reader.result });
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{t('profile_picture')}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>{t('upload_picture_desc')}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('username')}</label>
                          <input 
                            type="text" 
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                            required
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('full_name')}</label>
                          <input 
                            type="text" 
                            value={form.full_name}
                            onChange={e => setForm({...form, full_name: e.target.value})}
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('email')}</label>
                          <input 
                            type="email" 
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            required
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('phone_number')}</label>
                          <div style={{ position: 'relative' }}>
                            <Smartphone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input 
                              type="text" 
                              value={form.phone}
                              placeholder="+998 00 000 00 00"
                              onChange={e => setForm({...form, phone: e.target.value})}
                              style={{ width: '100%', padding: '14px 18px 14px 48px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('password')}</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="********"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            style={{ width: '100%', padding: '14px 18px', paddingRight: '45px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                              padding: '4px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                            }}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={submitting}
                        style={{ padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, marginTop: '16px' }}
                      >
                        {submitting ? '...' : t('save')}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                      <div style={{ width: '56px', height: '56px', background: 'rgba(52, 211, 153, 0.1)', color: '#059669', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{t('my_orders')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Barcha xaridingiz tarixi va holati</p>
                      </div>
                    </div>

                    {loadingOrders ? (
                      <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loader" style={{ margin: '0 auto' }}></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(0,0,0,0.01)', borderRadius: '24px' }}>
                        <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t('no_orders')}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '24px' }}>
                        {orders.map(order => (
                          <div 
                            key={order.id} 
                            style={{ 
                              padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', 
                              background: 'var(--bg-card)', transition: '0.3s', cursor: 'default'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                              <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t('order_id')}: #{order.id}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleString(language)}</div>
                              </div>
                              <span style={{ 
                                padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                                background: getStatusBg(order.status), color: getStatusColor(order.status)
                              }}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                              {order.items_list?.slice(0, 4).map((item, i) => (
                                <img 
                                  key={i}
                                  src={item.image ? (item.image.startsWith('/') ? `http://localhost:5001${item.image}` : item.image) : 'https://via.placeholder.com/50'} 
                                  alt={item.name}
                                  style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                  title={item.name}
                                />
                              ))}
                              {order.items_list?.length > 4 && (
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
                                  +{order.items_list.length - 4}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                              <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                  {order.payment_method === 'card' ? <CreditCard size={14} /> : <Banknote size={14} />}
                                  {t(order.payment_method)}
                                </div>
                                <div style={{ fontSize: '13px', color: order.payment_status === 'paid' ? '#059669' : '#DC2626', fontWeight: 600 }}>
                                  {t(order.payment_status)}
                                </div>
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>
                                {order.total_amount.toLocaleString()} <span style={{ fontSize: '14px' }}>UZS</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div 
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={28} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{t('saved_addresses')}</h3>
                          <p style={{ color: 'var(--text-muted)' }}>Yetkazib berish manzillari</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowAddressModal(true)}
                        className="btn btn-primary"
                        style={{ padding: '12px 20px', borderRadius: '14px' }}
                      >
                        <Plus size={18} /> {t('add_address')}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {form.address_list.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                          <MapPin size={40} style={{ marginBottom: '12px' }} />
                          <p>Hali manzillar qo'shilmagan</p>
                        </div>
                      ) : (
                        form.address_list.map(addr => (
                          <div key={addr.id} style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border-color)', position: 'relative' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={16} color="var(--primary)" /> {addr.title}
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{addr.details}</p>
                            <button 
                              onClick={() => removeAddress(addr.id)}
                              style={{ position: 'absolute', top: '20px', right: '20px', color: '#EF4444', opacity: 0.5, cursor: 'pointer' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div 
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={28} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{t('payment_methods')}</h3>
                          <p style={{ color: 'var(--text-muted)' }}>Tezkor to'lov uchun saqlangan kartalar</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowCardModal(true)}
                        className="btn btn-primary"
                        style={{ padding: '12px 20px', borderRadius: '14px' }}
                      >
                        <Plus size={18} /> {t('add_card')}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      {form.saved_cards.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                          <CreditCard size={40} style={{ marginBottom: '12px' }} />
                          <p>Hali kartalar qo'shilmagan</p>
                        </div>
                      ) : (
                        form.saved_cards.map(card => (
                          <div key={card.id} style={{ 
                            padding: '24px', borderRadius: '24px', 
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            color: 'white', position: 'relative', overflow: 'hidden'
                          }}>
                            <Fingerprint size={80} style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                              <CreditCard size={32} />
                              <button 
                                onClick={() => removeCard(card.id)}
                                style={{ color: '#EF4444', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px' }}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                            <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 600, marginBottom: '24px' }}>
                              {card.number.replace(/\d(?=\d{4})/g, '*')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div>
                                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>{t('card_holder')}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{card.holder}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Exp</div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{card.expiry}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div 
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                      <div style={{ width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={28} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{t('my_reviews')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Mahsulotlarga qoldirgan fikrlaringiz</p>
                      </div>
                    </div>

                    {loadingReviews ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                        <Star size={40} style={{ marginBottom: '12px' }} />
                        <p>Hali sharhlar qoldirilmagan</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {reviews.map((rev, i) => (
                          <div key={i} style={{ display: 'flex', gap: '20px', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                            <img 
                              src={rev.productImage?.startsWith('/') ? `http://localhost:5001${rev.productImage}` : rev.productImage} 
                              alt={rev.productName} 
                              style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{rev.productName}</h4>
                              <p style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '12px' }}>"{rev.text}"</p>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(rev.timestamp).toLocaleDateString(language)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'grid', gap: '24px' }}
                >
                  {/* Theme Selection */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sun size={24} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{t('theme_settings')}</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <button 
                        onClick={() => theme !== 'light' && toggleTheme()}
                        style={{ 
                          padding: '24px', borderRadius: '24px', border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: theme === 'light' ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.3s'
                        }}
                      >
                        <Sun size={32} color={theme === 'light' ? 'var(--primary)' : '#9CA3AF'} />
                        <span style={{ fontWeight: 700, color: theme === 'light' ? 'var(--primary)' : 'var(--text-muted)' }}>{t('light_mode')}</span>
                      </button>
                      <button 
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        style={{ 
                          padding: '24px', borderRadius: '24px', border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: theme === 'dark' ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.3s'
                        }}
                      >
                        <Moon size={32} color={theme === 'dark' ? 'var(--primary)' : '#9CA3AF'} />
                        <span style={{ fontWeight: 700, color: theme === 'dark' ? 'var(--primary)' : 'var(--text-muted)' }}>{t('dark_mode')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Advanced Prefs */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={24} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{t('notifications')} & {t('private_profile')}</h3>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.02)' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{t('email_notifications')}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Buyurtmalar haqida xabar olish</div>
                        </div>
                        <button 
                          onClick={() => setForm({...form, notifications_enabled: !form.notifications_enabled})}
                          style={{ width: '50px', height: '26px', borderRadius: '13px', background: form.notifications_enabled ? 'var(--primary)' : '#cbd5e1', position: 'relative', transition: '0.3s' }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form.notifications_enabled ? '27px' : '3px', transition: '0.3s' }} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.02)' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{t('private_profile')}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Profilingizni faqat siz ko'ra olasiz</div>
                        </div>
                        <button 
                          onClick={() => setForm({...form, privacy_private: !form.privacy_private})}
                          style={{ width: '50px', height: '26px', borderRadius: '13px', background: form.privacy_private ? 'var(--primary)' : '#cbd5e1', position: 'relative', transition: '0.3s' }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form.privacy_private ? '27px' : '3px', transition: '0.3s' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={24} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{t('select_system_lang')}</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {['uz', 'ru', 'en'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => changeLanguage(lang)}
                          style={{
                            padding: '16px', borderRadius: '16px', border: '1.5px solid',
                            borderColor: language === lang ? 'var(--primary)' : 'var(--border-color)',
                            background: language === lang ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                            fontWeight: 700, color: language === lang ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer', transition: '0.2s'
                          }}
                        >
                          {t(`lang_${lang}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Security Placeholder */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={24} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{t('account_security')}</h3>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="#059669" /> Hisobingiz xavfsiz holatda. Oxirgi kirish: Bugun, 03:00.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>
      <Modals 
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        newAddress={newAddress}
        setNewAddress={setNewAddress}
        addAddress={addAddress}
        showCardModal={showCardModal}
        setShowCardModal={setShowCardModal}
        newCard={newCard}
        setNewCard={setNewCard}
        addCard={addCard}
        t={t}
      />
    </div>
  );
};

// Add Modal components inside the same file for simplicity or as children of Profile
const Modals = ({ 
  showAddressModal, setShowAddressModal, newAddress, setNewAddress, addAddress, 
  showCardModal, setShowCardModal, newCard, setNewCard, addCard, t 
}) => {
  return (
    <AnimatePresence>
      {showAddressModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ 
              background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--border-color)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>{t('add_address')}</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('address_title')}</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Uy, Ish"
                  value={newAddress.title}
                  onChange={e => setNewAddress({...newAddress, title: e.target.value})}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('address_details')}</label>
                <textarea 
                  placeholder="Shahar, tuman, ko'cha, uy..."
                  value={newAddress.details}
                  onChange={e => setNewAddress({...newAddress, details: e.target.value})}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none', minHeight: '100px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <button 
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border-color)', fontWeight: 600 }}
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={addAddress}
                  className="btn btn-primary"
                  style={{ padding: '14px', borderRadius: '14px', fontWeight: 700 }}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showCardModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setShowCardModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ 
              background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--border-color)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>{t('add_card')}</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('card_number')}</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  value={newCard.number}
                  onChange={e => setNewCard({...newCard, number: e.target.value})}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('card_expiry')}</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>CVV</label>
                  <input 
                    type="password" 
                    placeholder="***"
                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>{t('card_holder')}</label>
                <input 
                  type="text" 
                  placeholder="JOHN DOE"
                  value={newCard.holder}
                  onChange={e => setNewCard({...newCard, holder: e.target.value})}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--border-color)', outline: 'none', textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <button 
                  onClick={() => setShowCardModal(false)}
                  style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border-color)', fontWeight: 600 }}
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={addCard}
                  className="btn btn-primary"
                  style={{ padding: '14px', borderRadius: '14px', fontWeight: 700 }}
                >
                  Bog'lash
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
