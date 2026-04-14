import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Login = () => {
  const { t, login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(form.username, form.email, form.password);
      } else {
        await login(form.username, form.password);
      }
      
      const redirectPath = searchParams.get('redirect') || '/';
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || t('error_occurred'));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '480px', margin: 0 }}
      >
        <div className="tabs">
          <div 
            className={`tab ${!isRegister ? 'active' : ''}`} 
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            {t('login')}
          </div>
          <div 
            className={`tab ${isRegister ? 'active' : ''}`} 
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            {t('register')}
          </div>
        </div>
        
        {error && (
          <motion.div 
            className="message error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}
        
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
          
          {isRegister && (
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label>{t('email')}</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
            </motion.div>
          )}
          
          <div className="form-group">
            <label>{t('password_label')}</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>
          
          {!isRegister && (
            <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-10px' }}>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}
              >
                {t('forgot_password_link')}
              </button>
            </div>
          )}

          
          <motion.button 
            type="submit" 
            className="btn"
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%' }}
          >
            {isRegister ? t('register') : t('login')}
          </motion.button>
        </form>

        <div className="divider" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
          <span style={{ margin: '0 1rem' }}>yoki</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            type="button"
            className="btn btn-outline"
            onClick={handleGoogleLogin}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '50px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google orqali davom ettirish
          </button>
        </div>
      </motion.div>

      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};

export default Login;