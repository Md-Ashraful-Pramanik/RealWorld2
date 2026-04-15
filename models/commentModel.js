const { query } = require('../config/db');

async function createComment({ body, authorId, articleId }, executor) {
  const result = await query(
    `
      INSERT INTO comments (body, author_id, article_id)
      VALUES ($1, $2, $3)
      RETURNING id, body, author_id, article_id, created_at, updated_at
    `,
    [body, authorId, articleId],
    executor
  );

  return result.rows[0];
}

async function findCommentById(id, executor) {
  const result = await query(
    `
      SELECT id, body, author_id, article_id, created_at, updated_at
      FROM comments
      WHERE id = $1
    `,
    [id],
    executor
  );

  return result.rows[0] || null;
}

async function deleteComment(id, executor) {
  await query('DELETE FROM comments WHERE id = $1', [id], executor);
}

async function getCommentDetailedById(id, viewerId = 0, executor) {
  const result = await query(
    `
      SELECT
        c.id,
        c.body,
        c.created_at,
        c.updated_at,
        u.username AS author_username,
        u.bio AS author_bio,
        u.image AS author_image,
        CASE WHEN f.follower_id IS NULL THEN FALSE ELSE TRUE END AS following
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $2
      WHERE c.id = $1
    `,
    [id, viewerId],
    executor
  );

  return result.rows[0] || null;
}

async function listCommentsByArticle(articleId, viewerId = 0, executor) {
  const result = await query(
    `
      SELECT
        c.id,
        c.body,
        c.created_at,
        c.updated_at,
        u.username AS author_username,
        u.bio AS author_bio,
        u.image AS author_image,
        CASE WHEN f.follower_id IS NULL THEN FALSE ELSE TRUE END AS following
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $2
      WHERE c.article_id = $1
      ORDER BY c.created_at ASC
    `,
    [articleId, viewerId],
    executor
  );

  return result.rows;
}

module.exports = {
  createComment,
  findCommentById,
  deleteComment,
  getCommentDetailedById,
  listCommentsByArticle
};