import express from 'express';
import supabase from '../supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ──────────────────────────────────────
// GET /api/categories — Public: List all active categories
// ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// POST /api/categories — Admin: Create category
// ──────────────────────────────────────
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, display_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// PATCH /api/categories/:id — Admin: Update
// ──────────────────────────────────────
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
