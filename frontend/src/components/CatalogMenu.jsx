import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Smartphone, 
  Shirt, 
  ShoppingBag, 
  Watch, 
  Home as HomeIcon,
  Book,
  Laptop,
  Headphones,
  Gamepad,
  Camera,
  Coffee,
  Heart,
  Baby,
  Dumbbell,
  Car,
  ChevronRight
} from 'lucide-react';

const CatalogMenu = ({ isVisible, onClose }) => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Electronics');

  const categories = [
    { id: 'Electronics', name: t('cat_electronics'), icon: <Smartphone size={20} />, color: '#3B82F6' },
    { id: 'Clothing', name: t('cat_clothing'), icon: <Shirt size={20} />, color: '#F59E0B' },
    { id: 'Books', name: 'Kitoblar', icon: <Book size={20} />, color: '#10B981' },
    { id: 'Home', name: t('cat_home'), icon: <HomeIcon size={20} />, color: '#EF4444' },
    { id: 'Accessories', name: t('cat_accessories'), icon: <Watch size={20} />, color: '#8B5CF6' },
    { id: 'Sport', name: 'Sport anjomlari', icon: <Dumbbell size={20} />, color: '#14B8A6' },
    { id: 'Beauty', name: 'Go\'zallik', icon: <Heart size={20} />, color: '#EC4899' },
    { id: 'Kids', name: 'Bolalar uchun', icon: <Baby size={20} />, color: '#F97316' },
    { id: 'Auto', name: 'Avto-tovar', icon: <Car size={20} />, color: '#64748B' },
  ];

  const subcategories = {
    Electronics: [
      { title: 'Smartfonlar', links: ['Apple iPhone', 'Samsung Galaxy', 'Xiaomi', 'Vivo', 'Oppo'] },
      { title: 'Noutbuklar', links: ['MacBook', 'Gaming laptops', 'Office laptops', 'Ultrabooks'] },
      { title: 'Audio', links: ['Quloqchinlar', 'AirPods', 'Bluetooth dinamiklar', 'Soundbarlar'] },
      { title: 'Geyming', links: ['PS5', 'Xbox', 'Nintendo Switch', 'Gaming chairs'] },
    ],
    Clothing: [
      { title: 'Erkaklar kiyimi', links: ['Futbolkalar', 'Jinsilar', 'Kostyum-shimlar', 'Kurtkalar'] },
      { title: 'Ayollar kiyimi', links: ['Ko\'ylaklar', 'Yubkalar', 'Bluzkalar', 'Pidjaklar'] },
      { title: 'Oyoq kiyimlar', links: ['Krossovkalar', 'Klassik poyabzallar', 'Sandallar', 'Etiklar'] },
    ],
    Books: [
      { title: 'Badiiy adabiyot', links: ['Jahon adabiyoti', 'O\'zbek adabiyoti', 'Detektiv', 'Fantastika'] },
      { title: 'O\'quv qo\'llanmalar', links: ['Ingliz tili', 'Matematika', 'Tarix', 'Lug\'atlar'] },
      { title: 'Psixologiya', links: ['Shaxsiy rivojlanish', 'Biznes xulq-atvori', 'Oila psixologiyasi'] },
    ],
    Home: [
        { title: 'Oshxona anjomlari', links: ['Idish-tovoqlar', 'Mixerlar', 'Kofe mashinalari', 'Tosterlar'] },
        { title: 'Yotoqxona', links: ['Choyshablar', 'Yostiqlar', 'Matraslar', 'Yoritgichlar'] },
        { title: 'Maishiy texnika', links: ['Muzlatgichlar', 'Kir yuvish mashinalari', 'Changyutgichlar'] },
    ],
    Accessories: [
        { title: 'Soatlar', links: ['Smart soatlar', 'Klassik soatlar', 'Sport soatlari'] },
        { title: 'Zargarlik', links: ['Uzuklar', 'Sirg\'alar', 'Zanjirlar', 'Bilaguzuklar'] },
        { title: 'Sumkalar', links: ['Ryukzaklar', 'Ayollar sumkalari', 'Hamyonlar'] },
    ],
    Sport: [
        { title: 'Fitnes', links: ['Gantellar', 'Trenajyorlar', 'Yoga matlari'] },
        { title: 'Ochiq havoda', links: ['Velosipedlar', 'Skaytlar', 'Samokatlar'] },
    ],
    Beauty: [
        { title: 'Parfyumeriya', links: ['Atirlar', 'Dezodorantlar'] },
        { title: 'Kosmetika', links: ['Lab bo\'yoqlari', 'Tush', 'Krem'] },
    ],
    Kids: [
        { title: 'O\'yinchoqlar', links: ['Konstruktorlar', 'Qo\'g\'irchoqlar', 'Mashinalar'] },
        { title: 'Kiyim-kechak', links: ['Chaqaloqlar uchun', 'Maktab formasi'] },
    ],
    Auto: [
        { title: 'Aksessuarlar', links: ['Audio tizimlar', 'GPS'] },
    ],
  };

  const currentSub = subcategories[activeCategory] || [];

  const handleCategoryClick = (catName) => {
    navigate(`/products?category=${catName}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      className="catalog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="catalog-container container" onClick={e => e.stopPropagation()}>
        <div className="catalog-sidebar">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`catalog-side-item ${activeCategory === cat.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveCategory(cat.id)}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="cat-icon-wrap" style={{ color: cat.color }}>
                {cat.icon}
              </div>
              <span>{cat.name}</span>
              <ChevronRight size={16} className="chevron" />
            </div>
          ))}
        </div>

        <div className="catalog-content">
          <div className="catalog-header">
            <h2>{categories.find(c => c.id === activeCategory)?.name}</h2>
            <button className="catalog-close-btn" onClick={onClose}>
               <X size={24} />
            </button>
          </div>
          
          <div className="catalog-subs-grid">
            {currentSub.map((group, idx) => (
              <div key={idx} className="catalog-sub-group">
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link, lIdx) => (
                    <li key={lIdx} onClick={() => handleCategoryClick(activeCategory)}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="catalog-backdrop" onClick={onClose}></div>
    </motion.div>
  );
};

export default CatalogMenu;
