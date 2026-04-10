import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/dashboard');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8, fontSize: '2.5rem' }}>🍽️</div>
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your QuickServe account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email" type="email" className="input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password" type="password" className="input" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="login-submit" style={{ width: '100%', marginTop: 8 }}>
            {loading ? '⏳ Signing in...' : '🔑 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div className="demo-accounts">
          <h4>Quick Demo Access</h4>
          <button className="demo-btn" onClick={() => handleDemo('admin@quickserve.com')}>
            <span className="role">👨‍🍳 Admin</span>
            <span>admin@quickserve.com</span>
          </button>
          <button className="demo-btn" onClick={() => handleDemo('staff@quickserve.com')}>
            <span className="role">👤 Staff</span>
            <span>staff@quickserve.com</span>
          </button>
          <button className="demo-btn" onClick={() => handleDemo('customer@quickserve.com')}>
            <span className="role">🛒 Customer</span>
            <span>customer@quickserve.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}
