import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { products } from '../api';
import { useApp } from '../context/AppContext';

import { Filter, X, Search } from 'lucide-react';

const Products = () => {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('name') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Fetch categories once on mount
    import('../api').then(({ categories: catApi }) => {
      catApi.getAll().then(res => {
        const uniqueCategories = [...new Set(res.data.map(c => c.name))];
        setCategories(uniqueCategories);
      });
    });
  }, []);

  useEffect(() => {
    const brand = searchParams.get('brand');
    const name = searchParams.get('name');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    
    setSelectedBrand(brand || '');
    setSearchQuery(name || '');
    
    const params = {};
    if (brand) params.brand = brand;
    if (name) params.name = name;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    
    products.getAll(params).then(res => {
      setProductsList(res.data);
      if (brands.length === 0) {
        const uniqueBrands = [...new Set(res.data.map(p => p.brand))];
        setBrands(uniqueBrands);
      }
    });
  }, [searchParams, brands.length]);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      {/* Mobile Filter Toggle */}
      <div className="mobile-filter-bar" style={{ display: 'none', marginBottom: '24px', position: 'sticky', top: 'var(--nav-height)', zIndex: 100, background: 'var(--background)', padding: '12px 0' }}>
        <button 
          onClick={() => setShowMobileFilters(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            background: 'white', border: '1.5px solid #eee', borderRadius: '12px', fontWeight: 600, width: '100%', justifyContent: 'center'
          }}
        >
          <Filter size={18} /> {t('filters_and_search')}
        </button>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`filter-sidebar ${showMobileFilters ? 'open' : ''}`}>
          <div className="sidebar-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ margin: 0 }}>{t('filter_title')}</h3>
            <button onClick={() => setShowMobileFilters(false)}><X size={24} /></button>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{t('search')}</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateParams('name', e.target.value);
                }}
                placeholder={t('search')}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1.5px solid #eee' }}
              />
              <Search className="search-bar-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{t('nav_categories')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                className={`sidebar-item ${!searchParams.get('category') ? 'active' : ''}`}
                onClick={() => { updateParams('category', ''); setShowMobileFilters(false); }}
              >
                {t('all')}
              </div>
              {categories.map(cat => (
                <div 
                  key={cat}
                  className={`sidebar-item ${searchParams.get('category') === cat ? 'active' : ''}`}
                  onClick={() => { updateParams('category', cat); setShowMobileFilters(false); }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{t('price_range')}</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder={t('from')}
                value={searchParams.get('minPrice') || ''}
                onChange={(e) => updateParams('minPrice', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #eee', fontSize: '14px' }}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder={t('to')}
                value={searchParams.get('maxPrice') || ''}
                onChange={(e) => updateParams('maxPrice', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #eee', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{t('brand')}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {brands.map(brand => (
                 <button
                   key={brand}
                   className={`chip ${selectedBrand === brand ? 'active' : ''}`}
                   onClick={() => {
                     const val = selectedBrand === brand ? '' : brand;
                     setSelectedBrand(val);
                     updateParams('brand', val);
                     setShowMobileFilters(false);
                   }}
                   style={{ 
                     padding: '6px 14px', borderRadius: '20px', fontSize: '12px', border: '1px solid #eee',
                     background: selectedBrand === brand ? 'var(--primary)' : 'white',
                     color: selectedBrand === brand ? 'white' : 'inherit'
                   }}
                 >
                   {brand}
                 </button>
               ))}
            </div>
          </div>
        </aside>

        {/* Products List & Sort */}
        <main>
          <div className="category-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', margin: 0 }}>{t('products_count')} ({productsList.length})</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('sort_by')}:</span>
              <select 
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) => updateParams('sort', e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none', background: 'white' }}
              >
                <option value="newest">{t('newest')}</option>
                <option value="price_asc">{t('price_asc')}</option>
                <option value="price_desc">{t('price_desc')}</option>
              </select>
            </div>
          </div>

          {(() => {
            const groups = productsList.reduce((acc, p) => {
              const cat = p.category || 'Boshqa';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(p);
              return acc;
            }, {});

            return Object.entries(groups).map(([catName, products], idx) => (
              <div key={catName} style={{ marginBottom: '60px' }}>
                <div className="category-section-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, whiteSpace: 'nowrap' }}>{catName}</h3>
                  <div className="hide-mobile" style={{ height: '1px', background: '#eee', flex: 1 }}></div>
                  <span style={{ fontSize: '13px', color: '#86868b' }}>{products.length} {t('items')}</span>
                </div>
                
                <motion.div 
                   className="products-grid"
                   layout
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            ));
          })()}

          {productsList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <img src="https://img.icons8.com/ios/100/eeeeee/search-property.png" alt="Not found" />
              <p style={{ color: '#86868b', fontSize: '18px', marginTop: '20px' }}>{t('nothing_found')}</p>
              <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => setSearchParams({})}>
                {t('clear_filter')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;