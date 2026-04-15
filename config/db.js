const { Pool } = require('pg');

const config = require('./env');
const schemaSql = require('./schema');

const pool = new Pool(config.db);

async function query(text, params = [], executor = pool) {
  return executor.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function initDb() {
  await pool.query(schemaSql);
}

async function closeDb() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  getClient,
  initDb,
  closeDb
};