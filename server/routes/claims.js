// server/routes/claims.js
const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/claims - retrieve user's claims or claims on user's reported items
router.get('/', requireAuth, (req, res) => {
  try {
    // 1. Claims submitted by this user
    const mySubmittedClaims = db
      .prepare(`
        SELECT 
          claims.*,
          items.title AS item_title,
          items.type AS item_type,
          items.category AS item_category,
          items.location_zone AS item_zone,
          items.image_url AS item_image,
          items.custody_type AS item_custody,
          items.custody_location AS item_custody_location,
          reporter.name AS reporter_name,
          reporter.email AS reporter_email
        FROM claims
        JOIN items ON claims.item_id = items.id
        JOIN users AS reporter ON items.user_id = reporter.id
        WHERE claims.claimant_id = ?
        ORDER BY claims.created_at DESC
      `)
      .all(req.user.id);

    // 2. Claims received on items reported by this user (or all if security/admin)
    let incomingClaims = [];
    if (['security', 'admin'].includes(req.user.role)) {
      incomingClaims = db
        .prepare(`
          SELECT 
            claims.*,
            items.title AS item_title,
            items.type AS item_type,
            items.category AS item_category,
            items.location_zone AS item_zone,
            items.image_url AS item_image,
            claimant.name AS claimant_name,
            claimant.email AS claimant_email,
            claimant.student_id AS claimant_student_id,
            claimant.phone AS claimant_phone,
            claimant.department AS claimant_department
          FROM claims
          JOIN items ON claims.item_id = items.id
          JOIN users AS claimant ON claims.claimant_id = claimant.id
          ORDER BY claims.created_at DESC
        `)
        .all();
    } else {
      incomingClaims = db
        .prepare(`
          SELECT 
            claims.*,
            items.title AS item_title,
            items.type AS item_type,
            items.category AS item_category,
            items.location_zone AS item_zone,
            items.image_url AS item_image,
            claimant.name AS claimant_name,
            claimant.email AS claimant_email,
            claimant.student_id AS claimant_student_id,
            claimant.phone AS claimant_phone,
            claimant.department AS claimant_department
          FROM claims
          JOIN items ON claims.item_id = items.id
          JOIN users AS claimant ON claims.claimant_id = claimant.id
          WHERE items.user_id = ?
          ORDER BY claims.created_at DESC
        `)
        .all(req.user.id);
    }

    res.json({
      submitted: mySubmittedClaims,
      incoming: incomingClaims,
    });
  } catch (err) {
    console.error('Fetch claims error:', err);
    res.status(500).json({ error: 'Failed to retrieve claims.' });
  }
});

// POST /api/items/:itemId/claims - Submit a claim on an item
router.post('/items/:itemId', requireAuth, (req, res) => {
  const itemId = req.params.itemId;
  const { verification_answer, proof_description } = req.body;

  if (!verification_answer || verification_answer.trim() === '') {
    return res.status(400).json({ error: 'Please answer the verification question or provide proof.' });
  }

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (item.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot submit a claim on an item you reported.' });
  }

  // Check if user already submitted a pending claim
  const existing = db
    .prepare("SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status = 'PENDING'")
    .get(itemId, req.user.id);

  if (existing) {
    return res.status(400).json({ error: 'You already have an active pending claim for this item.' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO claims (item_id, claimant_id, verification_answer, proof_description, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `);

    const result = insert.run(
      itemId,
      req.user.id,
      verification_answer.trim(),
      proof_description ? proof_description.trim() : ''
    );

    // Update item status to CLAIM_PENDING if currently REPORTED or MATCH_SUGGESTED
    if (['REPORTED', 'MATCH_SUGGESTED'].includes(item.status)) {
      db.prepare("UPDATE items SET status = 'CLAIM_PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(itemId);
    }

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      'SUBMIT_CLAIM',
      `${req.user.name} submitted a claim verification for item #${itemId} ("${item.title}")`
    );

    const newClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Claim submitted successfully!', claim: newClaim });
  } catch (err) {
    console.error('Submit claim error:', err);
    res.status(500).json({ error: 'Failed to record claim.' });
  }
});

// PATCH /api/claims/:id/status - Approve or reject claim
router.patch('/:id/status', requireAuth, (req, res) => {
  const claimId = req.params.id;
  const { status, review_notes } = req.body;

  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'HANDOVER_COMPLETED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const claim = db
    .prepare(`
      SELECT claims.*, items.user_id AS item_reporter_id, items.title AS item_title
      FROM claims
      JOIN items ON claims.item_id = items.id
      WHERE claims.id = ?
    `)
    .get(claimId);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  // Authorization: Must be the item reporter OR campus security/admin
  if (claim.item_reporter_id !== req.user.id && !['security', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Not authorized to evaluate this claim.' });
  }

  try {
    db.prepare(`
      UPDATE claims 
      SET 
        status = ?,
        review_notes = COALESCE(?, review_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, review_notes ? review_notes.trim() : null, claimId);

    // If approved, update item status
    if (status === 'APPROVED') {
      db.prepare("UPDATE items SET status = 'CLAIM_APPROVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        claim.item_id
      );
    } else if (status === 'HANDOVER_COMPLETED') {
      db.prepare("UPDATE items SET status = 'RETURNED', custody_type = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        claim.item_id
      );
    }

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      `CLAIM_${status}`,
      `${req.user.name} marked claim #${claimId} on "${claim.item_title}" as ${status}`
    );

    const updated = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId);
    res.json({ message: `Claim marked as ${status}`, claim: updated });
  } catch (err) {
    console.error('Update claim status error:', err);
    res.status(500).json({ error: 'Failed to update claim status.' });
  }
});

module.exports = router;
