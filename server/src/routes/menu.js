import express from 'express';
import supabase from '../supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ──────────────────────────────────────
// GET /api/menu — Public: List all menu items
// ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('menu_items')
      .select('*, categories(id, name)')
      .order('created_at', { ascending: true });

    // Filter by category
    if (req.query.category_id) {
      query = query.eq('category_id', req.query.category_id);
    }

    // Filter available only (default for customers)
    if (req.query.available !== 'all') {
      query = query.eq('is_available', true);
    }

    // Search by name
    if (req.query.search) {
      query = query.ilike('name', `%${req.query.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// GET /api/menu/:id — Public: Single item
// ──────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, categories(id, name)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// POST /api/menu — Admin: Create item
// ──────────────────────────────────────
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: name.trim(),
        description: description || null,
        price: parseFloat(price),
        category_id: category_id || null,
        image_url: image_url || null,
        is_available: is_available !== false
      })
      .select('*, categories(id, name)')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// PATCH /api/menu/:id — Admin: Update item
// ──────────────────────────────────────
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'description', 'price', 'category_id', 'image_url', 'is_available'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'price' ? parseFloat(req.body[field]) : req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, categories(id, name)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// DELETE /api/menu/:id — Admin: Soft delete
// ──────────────────────────────────────
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Item deactivated', item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
