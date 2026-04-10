import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Welcome to QuickServe, ${user.name}!`);
      navigate('/menu');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8, fontSize: '2.5rem' }}>🎉</div>
        <h2>Create Account</h2>
        <p className="subtitle">Join QuickServe and start ordering</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name" name="name" type="text" className="input" placeholder="John Doe"
              value={form.name} onChange={handleChange} required
            />
          </div>
          <div className="input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email" name="email" type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className="input-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone" name="phone" type="tel" className="input" placeholder="+91 98765 43210"
              value={form.phone} onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password" name="password" type="password" className="input" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit" style={{ width: '100%', marginTop: 8 }}>
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
