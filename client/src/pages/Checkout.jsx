import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('review'); // review, paying, confirming, done
  const [orderId, setOrderId] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  const tax = total * 0.05;
  const grandTotal = total + tax;

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      toast.error('Please fill in all card details');
      return;
    }

    setStep('paying');

    try {
      // Step 1: Create order
      const orderRes = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      setStep('confirming');

      // Step 2: Simulate payment processing (sandbox)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Confirm payment via webhook
      const webhookRes = await fetch(`${API}/api/orders/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData.order.id,
          payment_reference: orderData.payment.session_id,
          status: 'success'
        })
      });

      const webhookData = await webhookRes.json();
      if (!webhookRes.ok) throw new Error(webhookData.error);

      setOrderId(orderData.order.id);
      setStep('done');
      clearCart();
      toast.success('Payment successful! Order confirmed.');

    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
      setStep('review');
    }
  };

  if (items.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  if (step === 'done') {
    return (
      <div className="page">
        <div className="container">
          <div className="confirmation">
            <div className="confirmation-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              Your payment was successful. Your order is being processed.
            </p>
            <div className="order-id">#{orderId.slice(0, 8).toUpperCase()}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
              Full ID: {orderId}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/orders/${orderId}/track`)}>
                📡 Track Order
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/orders')}>
                📋 My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'paying' || step === 'confirming') {
    return (
      <div className="page">
        <div className="container">
          <div className="confirmation" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 56, height: 56, marginBottom: 'var(--space-xl)' }}></div>
            <h2>{step === 'paying' ? 'Processing Payment...' : 'Confirming Order...'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
              {step === 'paying'
                ? 'Connecting to payment gateway securely...'
                : 'Verifying payment and creating your order...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>💳 <span className="text-gradient-2">Checkout</span></h1>
          <p>Review your order and complete payment</p>
        </div>

        <div className="checkout-layout">
          {/* Order Review */}
          <div>
            <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>Order Items</h3>
              {items.map(item => (
                <div key={item.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'} alt={item.name} style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity} × ₹{item.price.toFixed(0)}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card-static" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>📍 Pickup Details</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Your order will be ready for pickup at the restaurant. You'll receive real-time updates on preparation status.
              </p>
              <div style={{ marginTop: 'var(--space-md)', padding: '12px 16px', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--success)' }}>
                ⏱️ Estimated pickup time: ~{Math.max(15, items.reduce((s, i) => s + i.quantity, 0) * 5)} mins after confirmation
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="payment-card">
            <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>💳 Payment Details</h3>
            <div style={{ padding: '10px 14px', background: 'var(--info-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--info)', marginBottom: 'var(--space-lg)' }}>
              🔒 Sandbox Mode — Use test card 4242 4242 4242 4242
            </div>

            <div className="auth-form">
              <div className="input-group">
                <label>Card Number</label>
                <input className="input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" id="card-number" />
              </div>
              <div className="card-input-row">
                <div className="input-group">
                  <label>Expiry</label>
                  <input className="input" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" id="card-expiry" />
                </div>
                <div className="input-group">
                  <label>CVV</label>
                  <input className="input" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" type="password" id="card-cvv" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-lg)' }}>
              <div className="summary-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
              <div className="summary-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span className="amount">₹{grandTotal.toFixed(2)}</span></div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handlePayment}
              id="pay-now-btn"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
            >
              🔒 Pay ₹{grandTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
