import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse our menu and add some delicious items!</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  const tax = total * 0.05;
  const grandTotal = total + tax;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Your <span className="text-gradient-2">Cart</span></h1>
          <p>{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {items.map(item => (
              <div key={item.menu_item_id} className="cart-item" id={`cart-item-${item.menu_item_id}`}>
                <img
                  className="cart-item-img"
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'}
                  alt={item.name}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price.toFixed(0)}</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}>−</button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => removeItem(item.menu_item_id)}>✕ Remove</button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Packaging</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="amount">₹{grandTotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="btn btn-primary btn-lg"
              id="checkout-btn"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
            >
              💳 Proceed to Checkout
            </Link>
            <Link
              to="/menu"
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: 'var(--space-sm)', textAlign: 'center', display: 'block' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
