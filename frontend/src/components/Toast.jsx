import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { notifications, setNotifications } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="toast-icon-success" />;
      case 'error': return <XCircle size={20} className="toast-icon-error" />;
      case 'warning': return <AlertCircle size={20} className="toast-icon-warning" />;
      default: return <Info size={20} className="toast-icon-info" />;
    }
  };

  return (
    <div className="toast-container">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`toast-item toast-${notification.type}`}
          >
            <div className="toast-icon-wrap">
              {getIcon(notification.type)}
            </div>
            <div className="toast-content">
              <p className="toast-message">{notification.message}</p>
            </div>
            <button 
              className="toast-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
