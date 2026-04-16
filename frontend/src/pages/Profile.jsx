import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { auth as authApi, orders as ordersApi } from '../api';
import {
  User, Settings, Globe, ShieldCheck, CheckCircle, AlertCircle,
  Package, CreditCard, Banknote, ChevronRight, Sun, Moon, Lock,
  LogOut, Eye, EyeOff, MapPin, Star, Plus, Trash2, Bell,
  Fingerprint, Zap, Award, Smartphone, X
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, language, changeLanguage, t, theme, toggleTheme, logout, backendUrl } = useApp();
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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    image: '',
    phone: '',
    notifications_enabled: true,
    privacy_private: false,
    address_list: [],
    saved_cards: [],
    password: ''
  });

  // Sync form with user data
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
        address_list: Array.isArray(user.address_list) ? user.address_list : [],
        saved_cards: Array.isArray(user.saved_cards) ? user.saved_cards : [],
      }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getAll();
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error('Orders error:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await authApi.getMyReviews();
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Reviews error:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('confirm_cancel_order') || 'Buyurtmani bekor qilmoqchimisiz?')) return;
    try {
      await ordersApi.cancel(orderId);
      await fetchOrders();
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const saveToBackend = async (updatedForm) => {
    try {
      const data = { ...updatedForm };
      if (!data.password) delete data.password;
      await updateProfile(data);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const addAddress = async () => {
    if (!newAddress.title.trim() || !newAddress.details.trim()) return;
    const updated = [...form.address_list, { ...newAddress, id: Date.now() }];
    const updatedForm = { ...form, address_list: updated };
    setForm(updatedForm);
    setNewAddress({ title: '', details: '' });
    setShowAddressModal(false);
    await saveToBackend(updatedForm);
  };

  const removeAddress = async (id) => {
    const updated = form.address_list.filter(a => a.id !== id);
    const updatedForm = { ...form, address_list: updated };
    setForm(updatedForm);
    await saveToBackend(updatedForm);
  };

  const addCard = async () => {
    if (!newCard.number.trim() || !newCard.expiry.trim()) return;
    const updated = [...form.saved_cards, { ...newCard, id: Date.now() }];
    const updatedForm = { ...form, saved_cards: updated };
    setForm(updatedForm);
    setNewCard({ number: '', expiry: '', holder: '' });
    setShowCardModal(false);
    await saveToBackend(updatedForm);
  };

  const removeCard = async (id) => {
    const updated = form.saved_cards.filter(c => c.id !== id);
    const updatedForm = { ...form, saved_cards: updated };
    setForm(updatedForm);
    await saveToBackend(updatedForm);
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

  const getStatusLabel = (status) => t(`status_${status}`) || status;
  const getStatusColor = (status) => ({ pending: '#D97706', completed: '#059669', cancelled: '#DC2626' }[status] || 'var(--text-muted)');
  const getStatusBg = (status) => ({ pending: 'rgba(217,119,6,0.1)', completed: 'rgba(5,150,105,0.1)', cancelled: 'rgba(220,38,38,0.1)' }[status] || '#f3f4f6');

  const calculateCompleteness = () => {
    const fields = ['full_name', 'email', 'phone', 'image'];
    return Math.round((fields.filter(f => !!form[f]).length / fields.length) * 100);
  };

  const getLoyaltyInfo = () => {
    const pts = user?.points || 0;
    if (pts >= 1000) return { tier: t('gold_member'), color: '#F59E0B', next: null, progress: 100 };
    if (pts >= 500) return { tier: t('silver_member'), color: '#94A3B8', next: 1000 - pts, progress: ((pts - 500) / 500) * 100 };
    return { tier: t('bronze_member'), color: '#CD7F32', next: 500 - pts, progress: (pts / 500) * 100 };
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

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: '1.5px solid var(--border-color)', outline: 'none',
    background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '15px'
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ padding: '32px 20px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{t('profile_title')}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Xush kelibsiz, {user?.full_name || user?.username} 👋</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: loyalty.color, fontWeight: 700, fontSize: '13px' }}>
                <Award size={16} /> {loyalty.tier}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900 }}>{user?.points || 0} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>BALL</span></div>
            </div>
          </div>
        </div>

        {/* Grid: Sidebar + Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>

          {/* ─── SIDEBAR ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

            {/* Nav */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '10px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '12px 16px', borderRadius: '14px', marginBottom: '3px',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                    fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <tab.icon size={18} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={15} />}
                </button>
              ))}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0', opacity: 0.5 }} />
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px 16px', borderRadius: '14px', background: 'transparent',
                  color: '#EF4444', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <LogOut size={18} /> {t('logout')}
              </button>
            </div>

            {/* Completeness */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>
                <span>{t('profile_completeness')}</span>
                <span style={{ color: 'var(--primary)' }}>{completeness}%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #60a5fa)', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Member Card */}
            <div style={{
              background: `linear-gradient(135deg, ${loyalty.color}cc 0%, #0f172a 100%)`,
              borderRadius: '20px', padding: '20px', color: 'white', position: 'relative', overflow: 'hidden'
            }}>
              <Zap size={70} style={{ position: 'absolute', right: '-12px', bottom: '-12px', opacity: 0.08 }} />
              <div style={{ fontSize: '11px', opacity: 0.75, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{t('member_tier')}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>{loyalty.tier}</div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '10px' }}>
                <div style={{ width: `${loyalty.progress}%`, height: '100%', background: 'white', borderRadius: '2px', transition: '0.8s' }} />
              </div>
              {loyalty.next ? (
                <div style={{ fontSize: '11px', opacity: 0.85 }}>Keyingi darajaga <b>{loyalty.next} ball</b> qoldi</div>
              ) : (
                <div style={{ fontSize: '11px', opacity: 0.85 }}>🎉 Siz eng yuqori darajadasiz!</div>
              )}
            </div>
          </div>

          {/* ─── CONTENT ─── */}
          <div>
            <AnimatePresence mode="wait">

              {/* ── ACCOUNT TAB ── */}
              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                      <div style={{ width: '52px', height: '52px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={26} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('profile_info')}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>{t('edit_profile_desc')}</p>
                      </div>
                    </div>

                    {message.text && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`message ${message.type}`}
                        style={{ marginBottom: '24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                      </motion.div>
                    )}

                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '36px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '30px', overflow: 'hidden', border: '3px solid var(--border-color)', background: '#f3f4f6' }}>
                          <img
                            src={form.image
                              ? (form.image.startsWith('data') || form.image.startsWith('http') ? form.image : `${backendUrl}${form.image}`)
                              : 'https://img.icons8.com/ios-filled/100/eeeeee/user-male-circle.png'}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <label htmlFor="avatar-upload" style={{
                          position: 'absolute', bottom: '-8px', right: '-8px',
                          background: 'var(--primary)', color: 'white',
                          padding: '8px', borderRadius: '12px', cursor: 'pointer',
                          border: '2px solid var(--bg-card)', display: 'flex'
                        }}>
                          <Globe size={16} />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setForm({ ...form, image: reader.result });
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t('profile_picture')}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('upload_picture_desc')}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('username')}</label>
                          <input style={inputStyle} type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('full_name')}</label>
                          <input style={inputStyle} type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('email')}</label>
                          <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('phone_number')}</label>
                          <div style={{ position: 'relative' }}>
                            <Smartphone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input style={{ ...inputStyle, paddingLeft: '40px' }} type="text" value={form.phone} placeholder="+998 90 000 00 00" onChange={e => setForm({ ...form, phone: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('password')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(ixtiyoriy)</span></label>
                        <div style={{ position: 'relative' }}>
                          <input style={{ ...inputStyle, paddingRight: '44px' }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '15px' }}>
                        {submitting ? 'Saqlanmoqda...' : t('save')}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                      <div style={{ width: '52px', height: '52px', background: 'rgba(5,150,105,0.1)', color: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={26} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('my_orders')}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>ID bo'yicha (yangi birinchi)</p>
                      </div>
                    </div>

                    {loadingOrders ? (
                      <div style={{ textAlign: 'center', padding: '60px' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
                    ) : orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.4 }}>
                        <Package size={48} style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px' }}>{t('no_orders')}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {orders.map(order => (
                          <div key={order.id} style={{ padding: '22px', borderRadius: '20px', border: '1.5px solid var(--border-color)', transition: '0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                              <div>
                                <div style={{ fontSize: '17px', fontWeight: 800 }}>{t('order_id')}: #{order.id}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(order.created_at).toLocaleString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US')}</div>
                              </div>
                              <span style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: getStatusBg(order.status), color: getStatusColor(order.status) }}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>

                            {order.items_list?.length > 0 && (
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                {order.items_list.slice(0, 5).map((item, i) => (
                                  <img key={i} src={item.image?.startsWith('/') ? `${backendUrl}${item.image}` : (item.image || 'https://via.placeholder.com/48')} alt={item.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} title={item.name} />
                                ))}
                                {order.items_list.length > 5 && (
                                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                                    +{order.items_list.length - 5}
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                  {order.payment_method === 'card' ? <CreditCard size={13} /> : <Banknote size={13} />}
                                  {order.payment_method === 'card' ? 'Karta' : 'Naqd'}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: order.payment_status === 'paid' ? '#059669' : '#D97706' }}>
                                  {order.payment_status === 'paid' ? "To'langan" : "To'lanmagan"}
                                </span>
                              </div>
                              <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--primary)' }}>
                                {Number(order.total_amount).toLocaleString()} <span style={{ fontSize: '13px' }}>UZS</span>
                              </div>
                            </div>
                            
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                style={{ 
                                  width: '100%', marginTop: '14px', padding: '10px', 
                                  borderRadius: '12px', background: 'transparent', 
                                  border: '1px solid #EF4444', color: '#EF4444', 
                                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                  transition: '0.2s'
                                }}
                                onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.05)' }}
                                onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
                              >
                                {t('cancel_order') || 'Buyurtmani bekor qilish'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── ADDRESSES TAB ── */}
              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '52px', height: '52px', background: 'rgba(56,189,248,0.1)', color: '#0284c7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={26} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('saved_addresses')}</h3>
                          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Yetkazib berish manzillari</p>
                        </div>
                      </div>
                      <button onClick={() => setShowAddressModal(true)} className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <Plus size={16} /> {t('add_address')}
                      </button>
                    </div>

                    {form.address_list.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>
                        <MapPin size={44} style={{ marginBottom: '12px' }} />
                        <p>Hali manzillar qo'shilmagan</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>"{t('add_address')}" tugmasini bosib qo'shing</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                        {form.address_list.map(addr => (
                          <div key={addr.id} style={{ padding: '22px', borderRadius: '20px', border: '1.5px solid var(--border-color)', position: 'relative', background: 'var(--bg-main)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 700, fontSize: '16px' }}>
                              <MapPin size={16} color="var(--primary)" /> {addr.title}
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{addr.details}</p>
                            <button onClick={() => removeAddress(addr.id)}
                              style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444', cursor: 'pointer', opacity: 0.7, display: 'flex' }}>
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── PAYMENTS TAB ── */}
              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '52px', height: '52px', background: 'rgba(139,92,246,0.1)', color: '#7c3aed', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={26} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('payment_methods')}</h3>
                          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Tezkor to'lovlar uchun</p>
                        </div>
                      </div>
                      <button onClick={() => setShowCardModal(true)} className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <Plus size={16} /> {t('add_card')}
                      </button>
                    </div>

                    {form.saved_cards.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>
                        <CreditCard size={44} style={{ marginBottom: '12px' }} />
                        <p>Hali kartalar qo'shilmagan</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>"{t('add_card')}" tugmasini bosib qo'shing</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                        {form.saved_cards.map(card => (
                          <div key={card.id} style={{
                            padding: '24px', borderRadius: '20px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            color: 'white', position: 'relative', overflow: 'hidden'
                          }}>
                            <Fingerprint size={80} style={{ position: 'absolute', right: '-12px', top: '-12px', opacity: 0.08 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', alignItems: 'center' }}>
                              <CreditCard size={28} />
                              <button onClick={() => removeCard(card.id)} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', color: '#F87171', cursor: 'pointer', display: 'flex' }}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div style={{ fontSize: '18px', letterSpacing: '3px', fontWeight: 600, marginBottom: '24px', fontFamily: 'monospace' }}>
                              {card.number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().replace(/\d(?=.{4})/g, '•')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13px' }}>
                              <div>
                                <div style={{ opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>{t('card_holder')}</div>
                                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{card.holder || '—'}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>Muddat</div>
                                <div style={{ fontWeight: 700 }}>{card.expiry}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── REVIEWS TAB ── */}
              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
                      <div style={{ width: '52px', height: '52px', background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={26} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('my_reviews')}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Mahsulotlarga qoldirgan izohlaringiz</p>
                      </div>
                    </div>

                    {loadingReviews ? (
                      <div style={{ textAlign: 'center', padding: '60px' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
                    ) : reviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>
                        <Star size={44} style={{ marginBottom: '12px' }} />
                        <p>Hali sharhlar qoldirilmagan</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Mahsulot sahifasidan fikr bildiring</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {reviews.map((rev, i) => (
                          <div key={i} style={{ display: 'flex', gap: '18px', padding: '20px', borderRadius: '18px', border: '1.5px solid var(--border-color)', background: 'var(--bg-main)' }}>
                            <img
                              src={rev.productImage
                                ? (rev.productImage.startsWith('/') ? `${backendUrl}${rev.productImage}` : rev.productImage)
                                : 'https://via.placeholder.com/72'}
                              alt={rev.productName}
                              style={{ width: '72px', height: '72px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{rev.productName}</div>
                              <p style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic', margin: '0 0 10px', lineHeight: 1.5 }}>"{rev.text}"</p>
                              {rev.image && (
                                <img src={rev.image.startsWith('/') ? `${backendUrl}${rev.image}` : rev.image}
                                  alt="review-img" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', marginBottom: '10px' }} />
                              )}
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {rev.timestamp ? new Date(rev.timestamp).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US') : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── SETTINGS TAB ── */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}
                  style={{ display: 'grid', gap: '20px' }}>

                  {/* Theme */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '32px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sun size={22} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{t('theme_settings')}</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {[{ key: 'light', label: t('light_mode'), Icon: Sun }, { key: 'dark', label: t('dark_mode'), Icon: Moon }].map(({ key, label, Icon }) => (
                        <button key={key} onClick={() => theme !== key && toggleTheme()}
                          style={{
                            padding: '22px', borderRadius: '18px', cursor: 'pointer', transition: '0.25s',
                            border: theme === key ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                            background: theme === key ? 'rgba(37,99,235,0.06)' : 'transparent',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                          }}>
                          <Icon size={28} color={theme === key ? 'var(--primary)' : '#9CA3AF'} />
                          <span style={{ fontWeight: 700, color: theme === key ? 'var(--primary)' : 'var(--text-muted)', fontSize: '14px' }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications & Privacy */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '32px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', color: '#059669', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={22} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{t('notifications')} & {t('private_profile')}</h3>
                    </div>
                    {[
                      { key: 'notifications_enabled', label: t('email_notifications'), desc: "Buyurtmalar va yangiliklar haqida xabar olish" },
                      { key: 'privacy_private', label: t('private_profile'), desc: "Profilingizni faqat siz ko'ra olasiz" }
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.02)', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.label}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        <button
                          onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
                          style={{ width: '48px', height: '26px', borderRadius: '13px', background: form[item.key] ? 'var(--primary)' : '#cbd5e1', position: 'relative', transition: '0.3s', flexShrink: 0, cursor: 'pointer', border: 'none' }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form[item.key] ? '25px' : '3px', transition: '0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>
                    ))}
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', padding: '13px', borderRadius: '14px', fontWeight: 700, marginTop: '8px' }}>
                      {t('save')}
                    </button>
                  </div>

                  {/* Language */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '32px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={22} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{t('select_system_lang')}</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {['uz', 'ru', 'en'].map(lang => (
                        <button key={lang} onClick={() => changeLanguage(lang)}
                          style={{
                            padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', transition: '0.2s',
                            border: language === lang ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                            background: language === lang ? 'rgba(37,99,235,0.07)' : 'transparent',
                            color: language === lang ? 'var(--primary)' : 'var(--text-muted)'
                          }}>
                          {t(`lang_${lang}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Security */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '32px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={22} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{t('account_security')}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '14px', fontWeight: 500 }}>
                      <CheckCircle size={16} /> Hisobingiz xavfsiz. Parolni o'zgartirish uchun "Profil ma'lumotlari" tabiga o'ting.
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
            onClick={() => setShowAddressModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('add_address')}</h3>
                <button onClick={() => setShowAddressModal(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={22} /></button>
              </div>
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('address_title')}</label>
                  <input style={inputStyle} type="text" placeholder="Masalan: Uy, Ish, Do'kon" value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('address_details')}</label>
                  <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'none' }} placeholder="Toshkent sh., Chilonzor t., 12-uy..."
                    value={newAddress.details} onChange={e => setNewAddress({ ...newAddress, details: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <button onClick={() => setShowAddressModal(false)} style={{ ...inputStyle, width: 'auto', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>Bekor qilish</button>
                  <button onClick={addAddress} className="btn btn-primary" style={{ padding: '13px', borderRadius: '12px', fontWeight: 700 }}>Saqlash</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCardModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
            onClick={() => setShowCardModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--bg-card)', borderRadius: '28px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('add_card')}</h3>
                <button onClick={() => setShowCardModal(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={22} /></button>
              </div>
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('card_number')}</label>
                  <input style={inputStyle} type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                    value={newCard.number}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                      setNewCard({ ...newCard, number: formatted });
                    }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('card_expiry')}</label>
                    <input style={inputStyle} type="text" placeholder="MM/YY" maxLength={5}
                      value={newCard.expiry}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                        setNewCard({ ...newCard, expiry: val });
                      }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>CVV</label>
                    <input style={inputStyle} type="password" placeholder="•••" maxLength={3} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{t('card_holder')}</label>
                  <input style={inputStyle} type="text" placeholder="JOHN DOE"
                    value={newCard.holder}
                    onChange={e => setNewCard({ ...newCard, holder: e.target.value.toUpperCase() })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <button onClick={() => setShowCardModal(false)} style={{ ...inputStyle, width: 'auto', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>Bekor qilish</button>
                  <button onClick={addCard} className="btn btn-primary" style={{ padding: '13px', borderRadius: '12px', fontWeight: 700 }}>Bog'lash</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
