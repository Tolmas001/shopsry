import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../../api';

const AdminCategories = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    categories.getAll().then(res => setCategoriesList(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await categories.update(editItem.id, form);
      } else {
        await categories.create(form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', description: '' });
      categories.getAll().then(res => setCategoriesList(res.data));
    } catch (err) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleEdit = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      await categories.delete(id);
      categories.getAll().then(res => setCategoriesList(res.data));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Kategoriyalar</h2>
        <motion.button 
          className="btn"
          onClick={() => { setShowModal(true); setEditItem(null); setForm({ name: '', description: '' }); }}
          whileTap={{ scale: 0.95 }}
        >
          + Yangi kategoriya
        </motion.button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Tavsif</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {categoriesList.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.description || '-'}</td>
              <td className="table-actions">
                <motion.button 
                  className="btn btn-secondary" 
                  onClick={() => handleEdit(c)}
                  whileTap={{ scale: 0.95 }}
                >
                  Tahrirlash
                </motion.button>
                <motion.button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(c.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  O'chirish
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                <h3>{editItem ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Tavsif</label>
                  <input 
                    type="text" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                  />
                </div>
                
                <motion.button 
                  type="submit" 
                  className="btn"
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%' }}
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

export default AdminCategories;