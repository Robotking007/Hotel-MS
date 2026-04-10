import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API = 'http://localhost:5000';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: '✓', desc: 'Order confirmed & payment received' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Kitchen is working on your order' },
  { key: 'ready', label: 'Ready', icon: '🔔', desc: 'Ready for pickup at counter' },
  { key: 'completed', label: 'Picked Up', icon: '🎉', desc: 'Order collected. Enjoy!' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join:order', id);

    const handler = (data) => {
      if (data.orderId === id) {
        setOrder(prev => prev ? { ...prev, status: data.status, updated_at: data.updatedAt } : prev);
      }
    };

    socket.on('order:status-update', handler);
    return () => {
      socket.off('order:status-update', handler);
      socket.emit('leave:order', id);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      const created = new Date(order.created_at).getTime();
      setElapsed(Math.floor((Date.now() - created) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getStepState = (stepKey) => {
    const order_idx = STATUS_STEPS.findIndex(s => s.key === order?.status);
    const step_idx = STATUS_STEPS.findIndex(s => s.key === stepKey);
    if (step_idx < order_idx) return 'done';
    if (step_idx === order_idx) return 'active';
    return 'pending';
  };

  if (loading) {
    return <div className="page"><div className="container"><div className="loading-screen"><div className="spinner"></div></div></div></div>;
  }

  if (!order) {
    return <div className="page"><div className="container"><div className="empty-state"><div className="icon">🔍</div><h3>Order not found</h3></div></div></div>;
  }

  const isCancelled = order.status === 'cancelled';
  const isPending = order.status === 'pending';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>ORDER TRACKING</div>
          <h1 style={{ marginBottom: 4 }}>#{order.id.slice(0, 8).toUpperCase()}</h1>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                {formatTime(elapsed)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Elapsed</div>
            </div>
            <div style={{ width: 1, background: 'var(--glass-border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)' }}>
                ~{order.estimated_time || 20}m
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated</div>
            </div>
          </div>
        </div>

        {/* Status */}
        {isCancelled ? (
          <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center', borderColor: 'var(--error)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>❌</div>
            <h3 style={{ color: 'var(--error)' }}>Order Cancelled</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>This order has been cancelled.</p>
          </div>
        ) : isPending ? (
          <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto var(--space-lg)' }}></div>
            <h3>Awaiting Payment Confirmation</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>Your payment is being verified...</p>
          </div>
        ) : (
          /* Stepper */
          <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
            <div className="status-stepper">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} style={{ display: 'contents' }}>
                  <div className={`stepper-step ${getStepState(step.key)}`}>
                    <div className="stepper-circle">{getStepState(step.key) === 'done' ? '✓' : step.icon}</div>
                    <div className="stepper-label">{step.label}</div>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`stepper-line ${getStepState(STATUS_STEPS[i + 1].key) !== 'pending' ? 'done' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Active status message */}
            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>
                {STATUS_STEPS.find(s => s.key === order.status)?.icon || '⏳'}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {STATUS_STEPS.find(s => s.key === order.status)?.desc || 'Processing your order...'}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>Order Items</h3>
          {order.order_items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {item.menu_items?.image_url && (
                  <img src={item.menu_items.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.menu_items?.name || 'Item'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>x{item.quantity}</div>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>₹{parseFloat(item.subtotal).toFixed(0)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-md)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          📡 This page updates in real-time. Status changes will appear automatically.
        </div>
      </div>
    </div>
  );
}
