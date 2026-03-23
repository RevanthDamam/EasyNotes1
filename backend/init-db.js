const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initializeDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await db.query(sql);
    console.log('Database schema created successfully.');
  } catch (err) {
    console.error('Error creating database schema:', err);
  } finally {
    process.exit(0);
  }
}

initializeDB();
