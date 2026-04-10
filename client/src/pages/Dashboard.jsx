import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000';

export default function Dashboard() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join:dashboard');

    socket.on('order:new', (order) => {
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
      toast.info(`🆕 New order from ${order.users?.name || 'Customer'}!`);
      try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczGjSHnLuziVk7WI2swqyFVT5ml7m5q4RVP2ORr7msi1VIc6e8uJ+EUD1ej6+3qI1eUHOqvbKZfFI=').play(); } catch (e) {}
    });

    socket.on('order:status-update', (data) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status, updated_at: data.updatedAt } : o));
    });

    return () => {
      socket.off('order:new');
      socket.off('order:status-update');
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getElapsed = (created) => {
    const diff = Math.floor((now - new Date(created).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filtered = orders.filter(o => {
    if (filter === 'active') return ['confirmed', 'preparing', 'ready'].includes(o.status);
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const activeCount = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length;

  if (loading) {
    return <div className="page"><div className="container"><div className="loading-screen"><div className="spinner"></div></div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1>🍽️ <span className="text-gradient-2">Kitchen Dashboard</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeCount} active order{activeCount !== 1 ? 's' : ''} • Live updates enabled
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>🔄 Refresh</button>
        </div>

        {/* Filters */}
        <div className="category-filter" style={{ marginBottom: 'var(--space-xl)' }}>
          {[
            { key: 'active', label: '🔥 Active', count: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length },
            { key: 'pending', label: '⏳ Pending', count: orders.filter(o => o.status === 'pending').length },
            { key: 'completed', label: '✅ Completed', count: orders.filter(o => o.status === 'completed').length },
            { key: 'all', label: '📋 All', count: orders.length },
          ].map(f => (
            <button
              key={f.key}
              className={`category-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Order Cards */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No orders in this view</h3>
            <p>Orders will appear here in real-time</p>
          </div>
        ) : (
          <div className="order-cards">
            {filtered.map((order, i) => (
              <div
                key={order.id}
                className="order-card"
                style={{
                  borderColor: order.status === 'ready' ? 'rgba(16,185,129,0.4)' : order.status === 'preparing' ? 'rgba(139,92,246,0.3)' : undefined,
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`
                }}
                id={`dashboard-order-${order.id}`}
              >
                <div className="order-card-header">
                  <div>
                    <div className="order-card-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="order-card-customer">👤 {order.users?.name || 'Customer'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <div className="order-card-time" style={{ marginTop: 6 }}>
                      ⏱️ {getElapsed(order.created_at)}
                    </div>
                  </div>
                </div>

                <div className="order-card-items">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="order-card-item">
                      <span>{item.menu_items?.name || 'Item'} × {item.quantity}</span>
                      <span>₹{parseFloat(item.subtotal).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-total">₹{parseFloat(order.total_amount).toFixed(2)}</div>

                <div className="order-card-actions">
                  {order.status === 'confirmed' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(order.id, 'preparing')}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-success btn-sm" onClick={() => updateStatus(order.id, 'ready')}>
                      🔔 Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'completed')}>
                      ✅ Complete
                    </button>
                  )}
                  {['confirmed', 'preparing'].includes(order.status) && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => updateStatus(order.id, 'cancelled')}>
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
