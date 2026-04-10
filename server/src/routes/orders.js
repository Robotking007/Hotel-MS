import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { emitNewOrder, emitOrderUpdate } from '../socket.js';

const router = express.Router();

// ──────────────────────────────────────
// POST /api/orders — Create new order
// ──────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // Validate all menu items exist and are available
    const itemIds = items.map(i => i.menu_item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', itemIds)
      .eq('is_available', true);

    if (menuError) throw menuError;

    if (!menuItems || menuItems.length !== itemIds.length) {
      return res.status(400).json({ error: 'Some items are unavailable or do not exist' });
    }

    // Build order items with validated prices
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menu_item_id);
      return {
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: parseFloat(menuItem.price),
        subtotal: parseFloat(menuItem.price) * item.quantity,
        name: menuItem.name,
        image_url: menuItem.image_url
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const estimatedTime = Math.max(15, items.reduce((sum, i) => sum + i.quantity, 0) * 5);

    // Create the order
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id: req.user.id,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        estimated_time: estimatedTime
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Return order with mock payment session
    res.status(201).json({
      order: {
        ...order,
        items: orderItems
      },
      payment: {
        session_id: `pay_${uuidv4().slice(0, 12)}`,
        amount: totalAmount,
        currency: 'INR'
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// POST /api/orders/webhook — Payment confirmation (sandbox mock)
// ──────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const { order_id, payment_reference, status } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const newStatus = status === 'success' ? 'confirmed' : 'cancelled';
    const newPaymentStatus = status === 'success' ? 'paid' : 'failed';

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        payment_reference: payment_reference || `ref_${uuidv4().slice(0, 8)}`,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single();

    if (error) throw error;

    // Fetch full order with items for the event
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name, image_url)), users(name, email, phone)')
      .eq('id', order_id)
      .single();

    // Emit to dashboard
    if (status === 'success') {
      const io = req.app.get('io');
      emitNewOrder(io, fullOrder);
    }

    res.json({ success: true, order: fullOrder });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// GET /api/orders — List orders (role-filtered)
// ──────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name, image_url)), users(name, email, phone)')
      .order('created_at', { ascending: false });

    // Customers see only their own orders
    if (req.user.role === 'customer') {
      query = query.eq('customer_id', req.user.id);
    }

    // Optional status filter
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    // Optional payment status filter
    if (req.query.payment_status) {
      query = query.eq('payment_status', req.query.payment_status);
    }

    // Limit
    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit));
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// GET /api/orders/:id — Single order detail
// ──────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name, image_url, description, price)), users(name, email, phone)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Customers can only see their own orders
    if (req.user.role === 'customer' && data.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// PATCH /api/orders/:id/status — Update order status (staff/admin)
// ──────────────────────────────────────
router.patch('/:id/status', authenticate, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, order_items(*, menu_items(name, image_url)), users(name, email, phone)')
      .single();

    if (error) throw error;

    // Emit real-time status update
    const io = req.app.get('io');
    emitOrderUpdate(io, order.id, {
      orderId: order.id,
      status: order.status,
      order,
      updatedAt: order.updated_at
    });

    // Create notification record
    let notifMessage = '';
    switch (status) {
      case 'confirmed': notifMessage = 'Your order has been confirmed!'; break;
      case 'preparing': notifMessage = 'Your order is being prepared!'; break;
      case 'ready': notifMessage = 'Your order is ready for pickup!'; break;
      case 'completed': notifMessage = 'Order completed. Thank you!'; break;
      case 'cancelled': notifMessage = 'Your order has been cancelled.'; break;
    }

    await supabase.from('notifications').insert({
      order_id: order.id,
      channel: 'push',
      message: notifMessage
    });

    res.json(order);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
