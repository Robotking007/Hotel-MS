import express from 'express';
import supabase from '../supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ──────────────────────────────────────
// GET /api/dashboard/stats — Admin analytics
// ──────────────────────────────────────
router.get('/stats', authenticate, requireRole('admin', 'staff'), async (req, res) => {
  try {
    // Get all orders
    const { data: allOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, total_amount, status, payment_status, created_at');

    if (ordersErr) throw ordersErr;

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = allOrders || [];
    const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const todayPaid = todayOrders.filter(o => o.payment_status === 'paid');

    // Revenue calculations
    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const todayRevenue = todayPaid.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Status breakdown
    const statusBreakdown = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Top ordered items
    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('menu_item_id, quantity, menu_items(name)');

    if (itemsErr) throw itemsErr;

    const itemCounts = {};
    (orderItems || []).forEach(oi => {
      const name = oi.menu_items?.name || 'Unknown';
      itemCounts[name] = (itemCounts[name] || 0) + oi.quantity;
    });

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Customer count
    const { count: customerCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer');

    res.json({
      overview: {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalCustomers: customerCount || 0,
        activeOrders: orders.filter(o =>
          ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
        ).length
      },
      statusBreakdown,
      topItems
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
