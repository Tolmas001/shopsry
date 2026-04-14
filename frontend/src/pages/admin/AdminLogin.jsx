import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, t } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || t('error_auth'));
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <motion.div 
        className="admin-login-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="admin-login-header">
          <div className="admin-logo-badge">
            <ShieldAlert size={32} />
          </div>
          <h1>{t('admin')}</h1>
          <p>Tizimga kirish uchun login va parolni kiriting</p>
        </div>

        {error && (
          <div className="message error" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <User size={14} style={{ marginRight: '8px' }} />
              {t('username')}
            </label>
            <input 
              type="text" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>
              <Lock size={14} style={{ marginRight: '8px' }} />
              {t('password').replace('(ixtiyoriy)', '')}
            </label>
            <input 
              type="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary"
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', marginTop: '20px', height: '52px' }}
          >
            {t('login')}
          </motion.button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            &larr; Saytga qaytish
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
