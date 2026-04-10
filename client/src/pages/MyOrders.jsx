import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

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

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusColors = {
    pending: 'badge-pending', confirmed: 'badge-confirmed', preparing: 'badge-preparing',
    ready: 'badge-ready', completed: 'badge-completed', cancelled: 'badge-cancelled'
  };

  if (loading) {
    return <div className="page"><div className="container"><div className="loading-screen"><div className="spinner"></div></div></div></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header">
          <h1>My <span className="text-gradient-2">Orders</span></h1>
          <p>Track and review your past orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders yet. Browse our menu to get started!</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {orders.map((order, i) => {
              const isActive = ['confirmed', 'preparing', 'ready'].includes(order.status);
              return (
                <div
                  key={order.id}
                  className="glass-card"
                  style={{
                    padding: 'var(--space-lg)',
                    borderColor: isActive ? 'rgba(249,115,22,0.3)' : undefined,
                    animation: `slideUp 0.3s ease ${i * 0.05}s both`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${statusColors[order.status] || 'badge-pending'}`}>
                        {order.status}
                      </span>
                      {order.payment_status === 'paid' && (
                        <span className="badge badge-paid">Paid</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                    {order.order_items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--surface)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                        {item.menu_items?.image_url && (
                          <img src={item.menu_items.image_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        {item.menu_items?.name} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </div>
                    {isActive ? (
                      <Link to={`/orders/${order.id}/track`} className="btn btn-primary btn-sm">
                        📡 Track Order
                      </Link>
                    ) : order.status === 'completed' ? (
                      <Link to={`/orders/${order.id}/track`} className="btn btn-ghost btn-sm">
                        View Details
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
