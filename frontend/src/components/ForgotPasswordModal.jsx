import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { t, forgotPassword, resetPassword, showNotification } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      showNotification(t('success_forgot_password'));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, code, newPassword);
      showNotification(t('success_reset_password'));
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <motion.div 
        className="modal-content auth-container"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ maxWidth: '440px', padding: '40px' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(37, 99, 235, 0.1)', 
            color: 'var(--primary)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            {step === 1 && <Mail size={32} />}
            {step === 2 && <KeyRound size={32} />}
            {step === 3 && <Lock size={32} />}
            {step === 4 && <CheckCircle2 size={32} color="var(--success)" />}
          </div>
          
          <h2 style={{ marginBottom: '12px' }}>
            {step === 4 ? t('success_reset_password') : t('forgot_password_title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {step === 1 && t('forgot_password_desc')}
            {step === 2 && t('enter_code')}
            {step === 3 && t('new_password_label')}
            {step === 4 && "Endi tizimga yangi parolingiz orqali kirishingiz mumkin."}
          </p>
        </div>

        {error && (
          <div className="message error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              onSubmit={handleSendCode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="form-group">
                <label>{t('email')}</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="example@mail.com"
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? t('loading') : t('send_code_btn')}
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              onSubmit={handleVerifyCode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="form-group">
                <label>{t('enter_code')}</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={e => setCode(e.target.value)} 
                  placeholder="000000"
                  maxLength={6}
                  required 
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Davom etish
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={() => setStep(1)}
                style={{ width: '100%', marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}
              >
                Emailni o'zgartirish
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="form-group">
                <label>{t('new_password_label')}</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? t('loading') : t('reset_password_btn')}
              </button>
            </motion.form>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}
            >
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={onClose}
              >
                Kirish sahifasiga qaytish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;
