const { query } = require('../config/db');

async function createUser({ username, email, passwordHash }, executor) {
  const result = await query(
    `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, bio, image, password_hash, created_at, updated_at
    `,
    [username, email, passwordHash],
    executor
  );

  return result.rows[0];
}

async function findById(id, executor) {
  const result = await query(
    `
      SELECT id, username, email, bio, image, password_hash, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id],
    executor
  );

  return result.rows[0] || null;
}

async function findByEmail(email, executor) {
  const result = await query(
    `
      SELECT id, username, email, bio, image, password_hash, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `,
    [email],
    executor
  );

  return result.rows[0] || null;
}

async function findByUsername(username, executor) {
  const result = await query(
    `
      SELECT id, username, email, bio, image, password_hash, created_at, updated_at
      FROM users
      WHERE username = $1
    `,
    [username],
    executor
  );

  return result.rows[0] || null;
}

async function updateUser(id, fields, executor) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findById(id, executor);
  }

  const setClause = entries
    .map(([column], index) => `${column} = $${index + 2}`)
    .join(', ');
  const values = entries.map(([, value]) => value);

  const result = await query(
    `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, bio, image, password_hash, created_at, updated_at
    `,
    [id, ...values],
    executor
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findById,
  findByEmail,
  findByUsername,
  updateUser
};