import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, categories } from '../../api';

const AdminProducts = () => {
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    brand: '', 
    category: '', 
    description: '', 
    price: '', 
    image: '', 
    colors: '', 
    sizes: '', 
    stock_count: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    products.getAll().then(res => setProductsList(res.data));
    categories.getAll().then(res => setCategoriesList(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: parseFloat(form.price),
        image: form.image,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()) : [],
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()) : [],
        stock_count: parseInt(form.stock_count) || 0
      };
      
      if (editItem) {
        await products.update(editItem.id, data);
      } else {
        await products.create(data);
      }
      
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', brand: '', category: '', description: '', price: '', image: '', colors: '', sizes: '', stock_count: '' });
      loadData();
    } catch (err) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleEdit = (product) => {
    setEditItem(product);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      stock_count: product.stock_count?.toString() || '0'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      await products.delete(id);
      loadData();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Mahsulotlar</h2>
        <motion.button 
          className="btn"
          onClick={() => { 
            setShowModal(true); 
            setEditItem(null); 
            setForm({ name: '', brand: '', category: '', description: '', price: '', image: '', colors: '', sizes: '', stock_count: '' }); 
          }}
          whileTap={{ scale: 0.95 }}
        >
          + Yangi mahsulot
        </motion.button>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Rasm</th>
              <th>Nom</th>
              <th>Brend</th>
              <th>Kategoriya</th>
              <th>Narx</th>
              <th>Ombor</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <img 
                    src={p.image || 'https://via.placeholder.com/50'} 
                    alt="" 
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.category}</td>
                <td>{p.price?.toLocaleString()} so'm</td>
                <td>{p.stock_count}</td>
                <td className="table-actions">
                  <motion.button 
                    className="btn btn-secondary" 
                    onClick={() => handleEdit(p)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tahrirlash
                  </motion.button>
                  <motion.button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(p.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    O'chirish
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editItem ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Mahsulot nomi *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Brend *</label>
                    <input 
                      type="text" 
                      value={form.brand} 
                      onChange={e => setForm({...form, brand: e.target.value})} 
                      placeholder="Nike, Apple, Samsung..."
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kategoriya *</label>
                    <input 
                      type="text" 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})} 
                      placeholder="Elektronika, Kiyim..."
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tavsif</label>
                  <input 
                    type="text" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Narx (so'm) *</label>
                    <input 
                      type="number" 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ombor (dona) *</label>
                    <input 
                      type="number" 
                      value={form.stock_count} 
                      onChange={e => setForm({...form, stock_count: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Mahsulot rasmi (SVG, JPG, PNG)</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {form.image && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img 
                          src={form.image.startsWith('data:') ? form.image : (form.image.startsWith('/') ? `http://localhost:5001${form.image}` : form.image)} 
                          alt="Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm({ ...form, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ width: '100%' }}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Tavsiya etiladi: 800x800px, 5MB gacha
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Ranglar (vergul bilan)</label>
                    <input 
                      type="text" 
                      value={form.colors} 
                      onChange={e => setForm({...form, colors: e.target.value})} 
                      placeholder="Qizil, Ko'k, Yashil"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>O'lchamlar (vergul bilan)</label>
                    <input 
                      type="text" 
                      value={form.sizes} 
                      onChange={e => setForm({...form, sizes: e.target.value})} 
                      placeholder="S, M, L, XL"
                    />
                  </div>
                </div>
                
                <motion.button 
                  type="submit" 
                  className="btn"
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Saqlash
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;