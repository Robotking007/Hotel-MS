import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuth, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-visual" />
        <div className="container">
          <div className="hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)', border: '1px solid rgba(249,115,22,0.2)', marginBottom: 24, fontSize: '0.85rem', color: 'var(--primary-light)' }}>
              ⚡ Zero commission. Full control.
            </div>
            <h1>
              <span className="text-gradient">Order.</span>{' '}
              <span className="text-gradient">Track.</span>{' '}
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Pick Up.</span>
            </h1>
            <p>
              QuickServe is the all-in-one takeaway platform that lets restaurants manage pickup orders digitally —
              from menu browsing to payment to real-time kitchen tracking.
              No third-party fees. No confusion. Just seamless ordering.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg" id="browse-menu-btn">
                🍕 Browse Menu
              </Link>
              {isAuth && (user?.role === 'staff' || user?.role === 'admin') ? (
                <Link to="/dashboard" className="btn btn-outline btn-lg">
                  📊 Open Dashboard
                </Link>
              ) : (
                <Link to="/register" className="btn btn-outline btn-lg" id="get-started-btn">
                  Get Started Free →
                </Link>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">24+</div>
                <div className="hero-stat-label">Menu Items</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">&lt;15m</div>
                <div className="hero-stat-label">Avg Prep Time</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Revenue Kept</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Why Restaurants Choose <span className="text-gradient-2">QuickServe</span></h2>
            <p>Everything you need to run a modern takeaway operation, in one platform.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Digital Menu & Ordering</h3>
              <p>Beautiful, browsable menu with category filters. Customers order and pay online — no phone calls, no confusion.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Online Payment</h3>
              <p>Integrated payment gateway with instant order confirmation. Accept cards, UPI, and wallets seamlessly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📡</div>
              <h3>Real-Time Order Tracking</h3>
              <p>Customers see live kitchen status updates. Preparation timer shows exactly when to arrive for pickup.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Kitchen Dashboard</h3>
              <p>Live order cards with one-tap status controls. Staff manage multiple orders without any confusion.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Business Analytics</h3>
              <p>Daily order count, revenue summary, most-ordered items. Data insights to grow your restaurant business.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Zero Platform Fees</h3>
              <p>Self-hosted SaaS model. No Swiggy or Zomato commission — restaurants keep 100% of their revenue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="features-header">
            <h2>How It <span className="text-gradient-2">Works</span></h2>
            <p>Four simple steps from hunger to happy.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Browse & Choose</h4>
              <p>Explore the full menu with categories, photos, and descriptions. Find exactly what you're craving.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Add to Cart & Pay</h4>
              <p>Build your perfect order, review your cart, and pay securely online. Zero hassle checkout.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Track in Real-Time</h4>
              <p>Watch your order move from confirmed to preparing to ready. Live updates, no guessing.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Pick Up & Enjoy</h4>
              <p>Get notified when your food is ready. Walk in, grab your order, and you're done. No waiting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'var(--space-4xl) 0', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-card-static" style={{ padding: 'var(--space-3xl) var(--space-2xl)', background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(139,92,246,0.08))', maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Ready to <span className="text-gradient">Order</span>?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: 400, margin: '0 auto var(--space-xl)' }}>
              Start browsing our menu and place your first order in under 2 minutes.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary btn-lg">View Full Menu →</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: 'var(--space-xl) 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div className="container">
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>🍽️ <span className="text-gradient-2">QuickServe</span></span>
          </div>
          <p>© 2025 QuickServe. Restaurant Takeaway Ordering Platform.</p>
          <p style={{ marginTop: 4 }}>Built with ❤️ for independent restaurants.</p>
        </div>
      </footer>
    </div>
  );
}
