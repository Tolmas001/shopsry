import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../api';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, showNotification, t } = useApp();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user data to update state immediately
      auth.me()
        .then(res => {
          setUser(res.data);
          showNotification(t('login_success') || 'Muvaffaqiyatli kirdingiz!');
          navigate('/');
        })
        .catch(err => {
          console.error('Error fetching user after Google login:', err);
          navigate('/login?error=auth_failed');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser, showNotification, t]);

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loader"></div>
      <p style={{ marginLeft: '1rem' }}>Sizni tizimga kiritmoqdamiz, biroz kuting...</p>
    </div>
  );
};

export default LoginSuccess;
