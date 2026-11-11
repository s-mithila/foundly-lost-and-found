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
  console.log(`[Database] Connected to SQLite database at: ${dbPath}`);
} catch (error) {
  console.error('[Database] Initialization error:', error.message);
}

module.exports = db;
