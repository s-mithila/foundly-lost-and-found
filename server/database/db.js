// server/database/db.js
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { seedDatabase } = require('./seed');

const dbPath = path.join(__dirname, 'foundly.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Open SQLite database file
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  // Auto seed initial campus data
  seedDatabase(db);
  // Auto sync item & claim state consistency
  syncItemClaimStatuses(db);
  console.log(`[Database] Connected to SQLite database at: ${dbPath}`);
} catch (error) {
  console.error('[Database] Initialization error:', error.message);
}

// Ensure items and claims statuses remain 100% consistent
function syncItemClaimStatuses(database) {
  try {
    // 1. Any approved claim on a returned/handed over item should be marked HANDOVER_COMPLETED
    database.prepare(`
      UPDATE claims
      SET status = 'HANDOVER_COMPLETED', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'APPROVED'
        AND item_id IN (SELECT id FROM items WHERE status = 'RETURNED' OR custody_type = 'RETURNED')
    `).run();

    // 2. Any pending claim on a returned item should be marked REJECTED
    database.prepare(`
      UPDATE claims
      SET status = 'REJECTED',
          review_notes = COALESCE(review_notes, 'Item has officially been returned to verified owner.'),
          updated_at = CURRENT_TIMESTAMP
      WHERE status = 'PENDING'
        AND item_id IN (SELECT id FROM items WHERE status = 'RETURNED' OR custody_type = 'RETURNED')
    `).run();

    // 3. Any item with a HANDOVER_COMPLETED claim should be marked RETURNED
    database.prepare(`
      UPDATE items
      SET status = 'RETURNED', custody_type = 'RETURNED', updated_at = CURRENT_TIMESTAMP
      WHERE status != 'RETURNED'
        AND id IN (SELECT item_id FROM claims WHERE status = 'HANDOVER_COMPLETED')
    `).run();

    // 4. Any item with an APPROVED claim (and not RETURNED) should be CLAIM_APPROVED
    database.prepare(`
      UPDATE items
      SET status = 'CLAIM_APPROVED', updated_at = CURRENT_TIMESTAMP
      WHERE status NOT IN ('CLAIM_APPROVED', 'RETURNED')
        AND id IN (SELECT item_id FROM claims WHERE status = 'APPROVED')
    `).run();
  } catch (err) {
    console.error('[Database] Status sync error:', err.message);
  }
}

module.exports = db;
module.exports.syncItemClaimStatuses = syncItemClaimStatuses;
