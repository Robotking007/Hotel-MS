import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { isAuth, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API}/api/menu`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = (item) => {
    if (!isAuth) {
      toast.info('Please sign in to add items to cart');
      return;
    }
    if (user?.role !== 'customer') {
      toast.info('Only customers can add items to cart');
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const filtered = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-screen"><div className="spinner"></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Our <span className="text-gradient-2">Menu</span></h1>
          <p>Fresh, delicious food prepared with love. Choose your favourites and order for pickup.</p>
        </div>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="input" placeholder="Search dishes..."
            value={search} onChange={e => setSearch(e.target.value)} id="menu-search"
          />
        </div>

        {/* Category Tabs */}
        <div className="category-filter">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            🍽️ All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name === 'Starters' ? '🥟' : cat.name === 'Mains' ? '🥩' : cat.name === 'Burgers' ? '🍔' : cat.name === 'Pizza' ? '🍕' : cat.name === 'Beverages' ? '🥤' : cat.name === 'Desserts' ? '🍰' : '📦'} {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🍽️</div>
            <h3>No items found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                className={`menu-card ${!item.is_available ? 'menu-card-unavailable' : ''}`}
                style={{ animationDelay: `${index * 0.05}s`, animation: `slideUp 0.4s ease ${index * 0.05}s both` }}
                id={`menu-item-${item.id}`}
              >
                <div className="menu-card-img-wrapper">
                  <img
                    className="menu-card-img"
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'}
                    alt={item.name}
                    loading="lazy"
                  />
                  {item.categories && (
                    <span className="menu-card-category">{item.categories.name}</span>
                  )}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-desc">{item.description}</div>
                  <div className="menu-card-footer">
                    <div className="menu-card-price">
                      ₹{parseFloat(item.price).toFixed(0)}
                    </div>
                    <button className="btn-add" onClick={() => handleAdd(item)}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign-in prompt */}
        {!isAuth && items.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)', padding: 'var(--space-2xl)', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Ready to order?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Sign in or create an account to start adding items to your cart.</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
