const { query } = require('../config/db');

async function createAudit({ userId, method, path, statusCode, requestBody, queryParams }, executor) {
  await query(
    `
      INSERT INTO audits (user_id, method, path, status_code, request_body, query_params)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId || null, method, path, statusCode, requestBody || null, queryParams || null],
    executor
  );
}

async function listAuditsByUser(userId, executor) {
  const result = await query(
    `
      SELECT id, method, path, status_code, request_body, query_params, created_at
      FROM audits
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
    executor
  );

  return result.rows;
}

module.exports = {
  createAudit,
  listAuditsByUser
};