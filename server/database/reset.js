// server/database/reset.js
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'foundly.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('[Database] Removed old foundly.db database file.');
}

// Re-initialize and seed fresh database
require('./db');
console.log('[Database] Reset completed with fresh demo dataset!');
