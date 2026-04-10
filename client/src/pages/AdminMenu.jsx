import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000';

export default function AdminMenu() {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', is_available: true });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch(`${API}/api/menu?available=all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/categories`)
      ]);
      setItems(await menuRes.json());
      setCategories(await catRes.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', description: '', price: '', category_id: categories[0]?.id || '', image_url: '', is_available: true });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '', price: item.price,
      category_id: item.category_id || '', image_url: item.image_url || '', is_available: item.is_available
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editItem ? `${API}/api/menu/${editItem.id}` : `${API}/api/menu`;
      const method = editItem ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success(editItem ? 'Item updated!' : 'Item created!');
      setShowModal(false);
      fetchAll();
    } catch (err) { toast.error(err.message); }
  };

  const toggleAvailability = async (item) => {
    try {
      await fetch(`${API}/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_available: !item.is_available })
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
      toast.success(`${item.name} ${!item.is_available ? 'enabled' : 'disabled'}`);
    } catch (err) { toast.error(err.message); }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Deactivate "${item.name}"?`)) return;
    try {
      await fetch(`${API}/api/menu/${item.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deactivated');
      fetchAll();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-screen"><div className="spinner"></div></div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1>📋 <span className="text-gradient-2">Menu Management</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>{items.length} items across {categories.length} categories</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-menu-item">+ Add Item</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {items.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-base)', opacity: item.is_available ? 1 : 0.6 }}>
              <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'} alt={item.name} style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.name}
                  {!item.is_available && <span className="badge badge-cancelled" style={{ fontSize: '0.65rem' }}>Unavailable</span>}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {item.categories?.name || 'Uncategorized'} • ₹{parseFloat(item.price).toFixed(0)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <label className="toggle">
                  <input type="checkbox" checked={item.is_available} onChange={() => toggleAvailability(item)} />
                  <span className="toggle-slider"></span>
                </label>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => openEdit(item)}>✏️</button>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => deleteItem(item)} style={{ color: 'var(--error)' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h3>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Name</label>
                  <input className="input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label>Price (₹)</label>
                    <input className="input" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input" name="category_id" value={form.category_id} onChange={handleChange}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Image URL</label>
                  <input className="input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label className="toggle">
                    <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Available for ordering</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editItem ? '💾 Save Changes' : '✅ Create Item'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
