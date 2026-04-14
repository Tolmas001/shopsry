import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { language, changeLanguage, t } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'uz', name: t('lang_uz'), label: 'UZ' },
    { code: 'ru', name: t('lang_ru'), label: 'RU' },
    { code: 'en', name: t('lang_en'), label: 'EN' }
  ];

  return (
    <div className="language-dropdown">
      <button 
        className="nav-btn lang-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title={languages.find(l => l.code === language)?.name}
      >
        <Globe size={20} />
        <span className="lang-code">{languages.find(l => l.code === language)?.label}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="dropdown-menu">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`dropdown-item ${language === lang.code ? 'active' : ''}`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;
