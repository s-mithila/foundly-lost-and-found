// server/routes/stats.js
const express = require('express');
const db = require('../database/db');

const router = express.Router();

// GET /api/stats/overview
router.get('/overview', (req, res) => {
  try {
    const totalItems = db.prepare('SELECT COUNT(*) AS count FROM items').get().count;
    const lostItems = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'LOST'").get().count;
    const foundItems = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'FOUND'").get().count;
    const returnedItems = db.prepare("SELECT COUNT(*) AS count FROM items WHERE status = 'RETURNED'").get().count;
    const inCustody = db
      .prepare("SELECT COUNT(*) AS count FROM items WHERE custody_type = 'CAMPUS_SECURITY_DESK' AND status != 'RETURNED'")
      .get().count;
    const pendingClaims = db.prepare("SELECT COUNT(*) AS count FROM claims WHERE status = 'PENDING'").get().count;

    const recoveryRate = totalItems > 0 ? Math.round((returnedItems / totalItems) * 100) : 0;

    // Items by category
    const categoryStats = db
      .prepare('SELECT category, COUNT(*) AS count FROM items GROUP BY category ORDER BY count DESC')
      .all();

    // Items by location zone
    const zoneStats = db
      .prepare('SELECT location_zone, COUNT(*) AS count FROM items GROUP BY location_zone ORDER BY count DESC LIMIT 6')
      .all();

    // Recent activity logs
    const recentActivity = db
      .prepare(`
        SELECT 
          activity_logs.*,
          users.name AS user_name,
          users.avatar_url AS user_avatar
        FROM activity_logs
        LEFT JOIN users ON activity_logs.user_id = users.id
        ORDER BY activity_logs.created_at DESC
        LIMIT 8
      `)
      .all();

    res.json({
      summary: {
        totalItems,
        lostItems,
        foundItems,
        returnedItems,
        inCustody,
        pendingClaims,
        recoveryRate,
      },
      categoryStats,
      zoneStats,
      recentActivity,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

module.exports = router;
