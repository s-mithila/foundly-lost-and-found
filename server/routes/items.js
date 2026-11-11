// server/routes/items.js
const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/items - list and filter items
router.get('/', (req, res) => {
  const { type, category, zone, status, search, my_items } = req.query;

  let query = `
    SELECT 
      items.*,
      users.name AS reporter_name,
      users.avatar_url AS reporter_avatar,
      users.department AS reporter_department,
      (SELECT COUNT(*) FROM claims WHERE claims.item_id = items.id) AS total_claims
    FROM items
    JOIN users ON items.user_id = users.id
    WHERE 1=1
  `;
  const params = [];

  if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
    query += ' AND items.type = ?';
    params.push(type.toUpperCase());
  }

  if (category && category !== 'All') {
    query += ' AND items.category = ?';
    params.push(category);
  }

  if (zone && zone !== 'All') {
    query += ' AND items.location_zone = ?';
    params.push(zone);
  }

  if (status && status !== 'All') {
    query += ' AND items.status = ?';
    params.push(status);
  }

  if (search && search.trim() !== '') {
    query += ' AND (items.title LIKE ? OR items.description LIKE ? OR items.location_details LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (my_items === 'true' && req.user) {
    query += ' AND items.user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY items.created_at DESC';

  try {
    const items = db.prepare(query).all(...params);
    res.json({ items });
  } catch (err) {
    console.error('Fetch items error:', err);
    res.status(500).json({ error: 'Failed to retrieve items.' });
  }
});

// GET /api/items/:id - single item details
router.get('/:id', (req, res) => {
  const itemId = req.params.id;

  const item = db
    .prepare(`
      SELECT 
        items.*,
        users.name AS reporter_name,
        users.avatar_url AS reporter_avatar,
        users.department AS reporter_department,
        users.email AS reporter_email,
        users.phone AS reporter_phone,
        (SELECT COUNT(*) FROM claims WHERE claims.item_id = items.id) AS total_claims
      FROM items
      JOIN users ON items.user_id = users.id
      WHERE items.id = ?
    `)
    .get(itemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  // Fetch claims if user is reporter, or security/admin, or claimant
  let claims = [];
  if (req.user) {
    if (req.user.id === item.user_id || ['security', 'admin'].includes(req.user.role)) {
      claims = db
        .prepare(`
          SELECT 
            claims.*,
            users.name AS claimant_name,
            users.avatar_url AS claimant_avatar,
            users.email AS claimant_email,
            users.student_id AS claimant_student_id,
            users.department AS claimant_department
          FROM claims
          JOIN users ON claims.claimant_id = users.id
          WHERE claims.item_id = ?
          ORDER BY claims.created_at DESC
        `)
        .all(itemId);
    } else {
      // User can see only their own claim if submitted
      claims = db
        .prepare(`
          SELECT 
            claims.*,
            users.name AS claimant_name,
            users.avatar_url AS claimant_avatar,
            users.email AS claimant_email
          FROM claims
          JOIN users ON claims.claimant_id = users.id
          WHERE claims.item_id = ? AND claims.claimant_id = ?
        `)
        .all(itemId, req.user.id);
    }
  }

  res.json({ item, claims });
});

// POST /api/items - report a new lost or found item
router.post('/', requireAuth, (req, res) => {
  const {
    type,
    title,
    category,
    description,
    location_zone,
    location_details,
    date_event,
    safe_question,
    custody_type = 'WITH_FINDER',
    custody_location,
    image_url,
    contact_email,
    contact_phone,
    reward_amount = 0,
  } = req.body;

  if (!type || !title || !category || !description || !location_zone || !date_event) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const validTypes = ['LOST', 'FOUND'];
  if (!validTypes.includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Type must be LOST or FOUND.' });
  }

  // Default image placeholder based on category if empty
  const defaultImages = {
    Electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    'IDs & Cards': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    'Keys & Wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    'Bags & Luggage': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    'Books & Stationery': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    'Clothing & Accessories': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    'Personal Essentials': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    Others: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80',
  };

  const finalImage = image_url && image_url.trim() !== '' ? image_url.trim() : (defaultImages[category] || defaultImages.Others);

  try {
    const insert = db.prepare(`
      INSERT INTO items (
        user_id, type, title, category, description,
        location_zone, location_details, date_event, status,
        safe_question, custody_type, custody_location,
        image_url, contact_email, contact_phone, reward_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'REPORTED', ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      req.user.id,
      type.toUpperCase(),
      title.trim(),
      category,
      description.trim(),
      location_zone,
      location_details ? location_details.trim() : '',
      date_event,
      safe_question ? safe_question.trim() : null,
      custody_type,
      custody_location ? custody_location.trim() : 'With reporter',
      finalImage,
      contact_email || req.user.email,
      contact_phone || req.user.phone,
      parseInt(reward_amount, 10) || 0
    );

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      type.toUpperCase() === 'LOST' ? 'REPORT_LOST' : 'REPORT_FOUND',
      `${req.user.name} reported ${type.toUpperCase()} item: "${title.trim()}" at ${location_zone}`
    );

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Item reported successfully!', item: newItem });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Failed to record item report.' });
  }
});

// PATCH /api/items/:id/status - update status
router.patch('/:id/status', requireAuth, (req, res) => {
  const itemId = req.params.id;
  const { status, custody_type, custody_location } = req.body;

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  // Authorization: must be reporter or security/admin
  if (item.user_id !== req.user.id && !['security', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'You are not authorized to update this item.' });
  }

  const validStatuses = ['REPORTED', 'MATCH_SUGGESTED', 'CLAIM_PENDING', 'CLAIM_APPROVED', 'RETURNED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const nextStatus = status || item.status;
    const nextCustody = custody_type || item.custody_type;

    db.prepare(`
      UPDATE items 
      SET 
        status = COALESCE(?, status),
        custody_type = COALESCE(?, custody_type),
        custody_location = COALESCE(?, custody_location),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status || null, custody_type || null, custody_location || null, itemId);

    // If item is returned or handed over, synchronize all associated claims
    if (nextStatus === 'RETURNED' || nextCustody === 'RETURNED') {
      // 1. Mark any APPROVED claim as HANDOVER_COMPLETED
      db.prepare(`
        UPDATE claims 
        SET 
          status = 'HANDOVER_COMPLETED',
          updated_at = CURRENT_TIMESTAMP
        WHERE item_id = ? AND status = 'APPROVED'
      `).run(itemId);

      // 2. Reject any remaining PENDING claims since the item is now officially returned
      db.prepare(`
        UPDATE claims 
        SET 
          status = 'REJECTED',
          review_notes = COALESCE(review_notes, 'Item has officially been returned to verified owner.'),
          updated_at = CURRENT_TIMESTAMP
        WHERE item_id = ? AND status = 'PENDING'
      `).run(itemId);
    }

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      nextStatus === 'RETURNED' ? 'ITEM_RETURNED' : 'STATUS_UPDATE',
      `${req.user.name} updated item #${itemId} ("${item.title}") status to ${nextStatus}`
    );

    const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    res.json({ message: 'Item status updated', item: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update item status.' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', requireAuth, (req, res) => {
  const itemId = req.params.id;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (item.user_id !== req.user.id && !['security', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Not authorized to delete this item.' });
  }

  try {
    db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
