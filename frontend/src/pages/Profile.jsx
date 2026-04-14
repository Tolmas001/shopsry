import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { User, Settings, Globe, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, language, changeLanguage, t } = useApp();
  const [activeTab, setActiveTab] = useState('account');
  const [form, setForm] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    image: user?.image || '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="section-title">{t('profile_title')}</h1>
        
        <div className="admin-layout" style={{ minHeight: 'auto', gap: '32px', marginTop: '40px' }}>
          {/* Sidebar-like Tabs */}
          <div style={{ width: '240px', flexShrink: 0 }}>
            <div 
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '8px', 
                border: '1.5px solid #D1D5DB',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              <button 
                onClick={() => setActiveTab('account')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: activeTab === 'account' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'account' ? 'white' : 'var(--text-main)',
                  fontWeight: 600, transition: '0.2s'
                }}
              >
                <User size={20} /> {t('profile_info')}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'settings' ? 'white' : 'var(--text-main)',
                  fontWeight: 600, transition: '0.2s', marginTop: '4px'
                }}
              >
                <Settings size={20} /> {t('settings')}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1 }}>
            {activeTab === 'account' ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="form"
                style={{ margin: 0, maxWidth: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px' }}>{t('profile_info')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('edit_profile_desc')}</p>
                  </div>
                </div>

                {message.text && (
                  <div className={`message ${message.type}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '100px', height: '100px', borderRadius: '50%', background: '#f3f4f6', 
                      overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <img 
                        src={form.image ? (form.image.startsWith('data') || form.image.startsWith('http') ? form.image : `http://localhost:5001${form.image}`) : 'https://img.icons8.com/ios-filled/100/eeeeee/user-male-circle.png'} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <label 
                      htmlFor="avatar-upload"
                      style={{ 
                        position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', 
                        color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', border: '2px solid white'
                      }}
                    >
                      <Globe size={16} />
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
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{t('profile_picture')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('upload_picture_desc')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>{t('username')}</label>
                    <input 
                      type="text" 
                      value={form.username}
                      onChange={e => setForm({...form, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('full_name')}</label>
                    <input 
                      type="text" 
                      value={form.full_name}
                      onChange={e => setForm({...form, full_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('email')}</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('password')}</label>
                    <input 
                      type="password" 
                      placeholder="********"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting}
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    {submitting ? '...' : t('save')}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="form"
                style={{ margin: 0, maxWidth: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px' }}>{t('settings')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('select_system_lang')}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {['uz', 'ru', 'en'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1.5px solid',
                        borderColor: language === lang ? 'var(--primary)' : '#D1D5DB',
                        background: language === lang ? 'rgba(37, 99, 235, 0.05)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: '0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: language === lang ? 'var(--primary)' : 'var(--text-main)' }}>
                        {t(`lang_${lang}`)}
                      </span>
                      {language === lang && <CheckCircle size={20} color="var(--primary)" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
