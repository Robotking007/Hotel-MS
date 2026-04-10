import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function AdminAnalytics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-screen"><div className="spinner"></div></div></div></div>;
  if (!stats) return <div className="page"><div className="container"><p>Failed to load analytics</p></div></div>;

  const maxItemCount = Math.max(...stats.topItems.map(i => i.count), 1);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>📊 <span className="text-gradient-2">Analytics</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Business insights and performance metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon orange">📦</div>
            <div className="stat-card-value">{stats.overview.totalOrders}</div>
            <div className="stat-card-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">📈</div>
            <div className="stat-card-value">{stats.overview.todayOrders}</div>
            <div className="stat-card-label">Today's Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon purple">💰</div>
            <div className="stat-card-value">₹{stats.overview.totalRevenue.toLocaleString()}</div>
            <div className="stat-card-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon blue">🎯</div>
            <div className="stat-card-value">₹{stats.overview.avgOrderValue.toFixed(0)}</div>
            <div className="stat-card-label">Avg Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon orange">🔥</div>
            <div className="stat-card-value">{stats.overview.activeOrders}</div>
            <div className="stat-card-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">💵</div>
            <div className="stat-card-value">₹{stats.overview.todayRevenue.toLocaleString()}</div>
            <div className="stat-card-label">Today's Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon purple">👥</div>
            <div className="stat-card-value">{stats.overview.totalCustomers}</div>
            <div className="stat-card-label">Total Customers</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 'var(--space-xl)' }}>
          {/* Top Items Chart */}
          <div className="chart-container">
            <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>🏆 Most Ordered Items</h3>
            {stats.topItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>No order data yet</p>
            ) : (
              <div className="bar-chart">
                {stats.topItems.map((item, i) => (
                  <div key={i} className="bar-group">
                    <div className="bar-value">{item.count}</div>
                    <div className="bar" style={{ height: `${(item.count / maxItemCount) * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                    <div className="bar-label" title={item.name}>{item.name.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Breakdown */}
          <div className="chart-container">
            <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>📋 Order Status Breakdown</h3>
            <div className="status-grid">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="status-item">
                  <div className="status-count" style={{
                    color: status === 'completed' ? 'var(--success)' :
                      status === 'preparing' ? 'var(--secondary)' :
                        status === 'ready' ? 'var(--success)' :
                          status === 'cancelled' ? 'var(--error)' :
                            status === 'confirmed' ? 'var(--info)' : 'var(--warning)'
                  }}>
                    {count}
                  </div>
                  <div className="status-label">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
