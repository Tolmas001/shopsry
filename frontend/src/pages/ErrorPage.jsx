import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';

const ErrorPage = ({ status: propStatus }) => {
  const { status: paramStatus } = useParams();
  const navigate = useNavigate();
  const status = propStatus || paramStatus || '404';

  const getErrorContent = (code) => {
    switch(code) {
      case '404':
        return {
          title: 'Sahifa topilmadi',
          message: 'Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko\'chirilgan.',
          icon: <AlertCircle size={80} color="#EF4444" />,
          action: 'Bosh sahifaga qaytish'
        };
      case '401':
        return {
          title: 'Ruxsat berilmagan',
          message: 'Ushbu sahifani ko\'rish uchun siz tizimga kirishingiz kerak.',
          icon: <ShieldAlert size={80} color="#F59E0B" />,
          action: 'Kirish'
        };
      case '403':
        return {
          title: 'Kirish taqiqlangan',
          message: 'Sizda ushbu sahifaga kirish uchun yetarli huquqlar yo\'q.',
          icon: <ShieldAlert size={80} color="#EF4444" />,
          action: 'Bosh sahifaga qaytish'
        };
      case '500':
        return {
          title: 'Serverda xatolik',
          message: 'Kechirasiz, tizimda kutilmagan xatolik yuz berdi. Tez orada hammasi tiklanadi.',
          icon: <RefreshCw size={80} color="#3B82F6" />,
          action: 'Qayta urinish'
        };
      case 'offline':
        return {
          title: 'Internet aloqasi yo\'q',
          message: 'Iltimos, internet aloqasini tekshiring va qaytadan urinib ko\'ring.',
          icon: <WifiOff size={80} color="#6B7280" />,
          action: 'Qayta yuklash'
        };
      default:
        return {
          title: 'Xatolik yuz berdi',
          message: 'Kutilmagan xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.',
          icon: <AlertCircle size={80} color="#6B7280" />,
          action: 'Bosh sahifaga qaytish'
        };
    }
  };

  const content = getErrorContent(status.toString());

  const handleAction = () => {
    if (status === '401') {
      navigate('/login');
    } else if (status === '500' || status === 'offline') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ 
          textAlign: 'center', 
          maxWidth: '500px',
          background: 'var(--surface)',
          padding: '60px 40px',
          borderRadius: '32px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)'
        }}
      >
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
          style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}
        >
          {content.icon}
        </motion.div>

        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          marginBottom: '16px',
          color: 'var(--text-main)' 
        }}>
          {status} - {content.title}
        </h1>

        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: 'var(--text-muted)',
          marginBottom: '40px' 
        }}>
          {content.message}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={handleAction}
            className="btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '16px'
            }}
          >
            {status === '500' || status === 'offline' ? <RefreshCw size={20} /> : <Home size={20} />}
            {content.action}
          </button>
        </div>

        {status !== '404' && (
          <Link to="/" style={{ 
            marginTop: '24px', 
            display: 'inline-block',
            color: 'var(--primary)',
            fontSize: '14px',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Bosh sahifaga qaytish
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default ErrorPage;
