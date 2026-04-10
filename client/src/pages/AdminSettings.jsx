import { useState } from 'react';
import { useToast } from '../components/Toast';

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    name: 'QuickServe Restaurant',
    tagline: 'Fresh food, fast pickup',
    phone: '+91 98765 43210',
    email: 'hello@quickserve.com',
    address: '123 Food Street, Bengaluru, Karnataka 560001',
    openTime: '09:00',
    closeTime: '22:00',
    preparationBuffer: '15',
    taxRate: '5',
    currency: 'INR'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header">
          <h1>⚙️ <span className="text-gradient-2">Settings</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure your restaurant profile and platform settings</p>
        </div>

        {/* Restaurant Profile */}
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>🏪 Restaurant Profile</h3>
          <div className="auth-form">
            <div className="input-group">
              <label>Restaurant Name</label>
              <input className="input" name="name" value={settings.name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Tagline</label>
              <input className="input" name="tagline" value={settings.tagline} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="input-group">
                <label>Phone</label>
                <input className="input" name="phone" value={settings.phone} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input className="input" name="email" type="email" value={settings.email} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label>Pickup Address</label>
              <textarea className="input" name="address" value={settings.address} onChange={handleChange} rows={2} />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>🕐 Operating Hours</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Opening Time</label>
              <input className="input" name="openTime" type="time" value={settings.openTime} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Closing Time</label>
              <input className="input" name="closeTime" type="time" value={settings.closeTime} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Order Settings */}
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>📦 Order Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Prep Buffer (min)</label>
              <input className="input" name="preparationBuffer" type="number" value={settings.preparationBuffer} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Tax Rate (%)</label>
              <input className="input" name="taxRate" type="number" step="0.1" value={settings.taxRate} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Currency</label>
              <select className="input" name="currency" value={settings.currency} onChange={handleChange}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demo Accounts Info */}
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>👥 Demo Accounts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { role: 'Admin', email: 'admin@quickserve.com', icon: '👨‍🍳' },
              { role: 'Staff', email: 'staff@quickserve.com', icon: '👤' },
              { role: 'Customer', email: 'customer@quickserve.com', icon: '🛒' },
              { role: 'Customer', email: 'priya@example.com', icon: '🛒' },
              { role: 'Customer', email: 'amit@example.com', icon: '🛒' },
            ].map((acc, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{acc.icon}</span>
                  <span style={{ fontWeight: 600 }}>{acc.email}</span>
                </div>
                <span className="badge badge-category">{acc.role}</span>
              </div>
            ))}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 'var(--space-sm)' }}>
              All demo accounts use password: <code style={{ color: 'var(--primary)' }}>demo123</code>
            </p>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ width: '100%' }}>
          💾 Save All Settings
        </button>
      </div>
    </div>
  );
}
