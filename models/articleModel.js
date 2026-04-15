const { query } = require('../config/db');

function buildArticleFilters(filters = {}, params) {
  const conditions = [];

  if (filters.tag) {
    params.push(filters.tag);
    conditions.push(`EXISTS (
      SELECT 1
      FROM article_tags at2
      JOIN tags t2 ON t2.id = at2.tag_id
      WHERE at2.article_id = a.id AND t2.name = $${params.length}
    )`);
  }

  if (filters.author) {
    params.push(filters.author);
    conditions.push(`u.username = $${params.length}`);
  }

  if (filters.favorited) {
    params.push(filters.favorited);
    conditions.push(`EXISTS (
      SELECT 1
      FROM favorites f2
      JOIN users u2 ON u2.id = f2.user_id
      WHERE f2.article_id = a.id AND u2.username = $${params.length}
    )`);
  }

  if (filters.feedUserId) {
    params.push(filters.feedUserId);
    conditions.push(`EXISTS (
      SELECT 1
      FROM follows fl2
      WHERE fl2.following_id = a.author_id AND fl2.follower_id = $${params.length}
    )`);
  }

  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

function articleProjection(viewerParam = 1) {
  return `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.description,
      a.body,
      a.created_at,
      a.updated_at,
      u.id AS author_id,
      u.username AS author_username,
      u.bio AS author_bio,
      u.image AS author_image,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.name), NULL), '{}') AS tag_list,
      COUNT(DISTINCT fav.user_id)::int AS favorites_count,
      COALESCE(BOOL_OR(fav.user_id = $${viewerParam}), FALSE) AS favorited,
      COALESCE(BOOL_OR(fol.follower_id = $${viewerParam}), FALSE) AS following
    FROM articles a
    JOIN users u ON u.id = a.author_id
    LEFT JOIN article_tags at ON at.article_id = a.id
    LEFT JOIN tags t ON t.id = at.tag_id
    LEFT JOIN favorites fav ON fav.article_id = a.id
    LEFT JOIN follows fol ON fol.following_id = u.id AND fol.follower_id = $${viewerParam}
  `;
}

function articleGrouping() {
  return `
    GROUP BY
      a.id,
      a.slug,
      a.title,
      a.description,
      a.body,
      a.created_at,
      a.updated_at,
      u.id,
      u.username,
      u.bio,
      u.image
  `;
}

async function slugExists(slug, executor) {
  const result = await query('SELECT 1 FROM articles WHERE slug = $1', [slug], executor);
  return result.rowCount > 0;
}

async function createArticle({ slug, title, description, body, authorId }, executor) {
  const result = await query(
    `
      INSERT INTO articles (slug, title, description, body, author_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, slug, title, description, body, author_id, created_at, updated_at
    `,
    [slug, title, description, body, authorId],
    executor
  );

  return result.rows[0];
}

async function updateArticle(id, fields, executor) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findArticleById(id, executor);
  }

  const setClause = entries
    .map(([column], index) => `${column} = $${index + 2}`)
    .join(', ');
  const values = entries.map(([, value]) => value);

  const result = await query(
    `
      UPDATE articles
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, slug, title, description, body, author_id, created_at, updated_at
    `,
    [id, ...values],
    executor
  );

  return result.rows[0] || null;
}

async function deleteArticle(id, executor) {
  await query('DELETE FROM articles WHERE id = $1', [id], executor);
}

async function findArticleBySlug(slug, executor) {
  const result = await query(
    `
      SELECT id, slug, title, description, body, author_id, created_at, updated_at
      FROM articles
      WHERE slug = $1
    `,
    [slug],
    executor
  );

  return result.rows[0] || null;
}

async function findArticleById(id, executor) {
  const result = await query(
    `
      SELECT id, slug, title, description, body, author_id, created_at, updated_at
      FROM articles
      WHERE id = $1
    `,
    [id],
    executor
  );

  return result.rows[0] || null;
}

async function getArticleBySlugDetailed(slug, viewerId = 0, executor) {
  const result = await query(
    `
      ${articleProjection(1)}
      WHERE a.slug = $2
      ${articleGrouping()}
    `,
    [viewerId, slug],
    executor
  );

  return result.rows[0] || null;
}

async function getArticleByIdDetailed(id, viewerId = 0, executor) {
  const result = await query(
    `
      ${articleProjection(1)}
      WHERE a.id = $2
      ${articleGrouping()}
    `,
    [viewerId, id],
    executor
  );

  return result.rows[0] || null;
}

async function listArticles(filters = {}, options = {}, executor) {
  const viewerId = options.viewerId || 0;
  const limit = Number(options.limit || 20);
  const offset = Number(options.offset || 0);
  const params = [viewerId];
  const whereClause = buildArticleFilters(filters, params);

  params.push(limit, offset);

  const result = await query(
    `
      ${articleProjection(1)}
      ${whereClause}
      ${articleGrouping()}
      ORDER BY a.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `,
    params,
    executor
  );

  return result.rows;
}

async function countArticles(filters = {}, executor) {
  const params = [];
  const conditions = [];

  if (filters.tag) {
    params.push(filters.tag);
    conditions.push(`EXISTS (
      SELECT 1
      FROM article_tags at2
      JOIN tags t2 ON t2.id = at2.tag_id
      WHERE at2.article_id = a.id AND t2.name = $${params.length}
    )`);
  }

  if (filters.author) {
    params.push(filters.author);
    conditions.push(`u.username = $${params.length}`);
  }

  if (filters.favorited) {
    params.push(filters.favorited);
    conditions.push(`EXISTS (
      SELECT 1
      FROM favorites f2
      JOIN users u2 ON u2.id = f2.user_id
      WHERE f2.article_id = a.id AND u2.username = $${params.length}
    )`);
  }

  if (filters.feedUserId) {
    params.push(filters.feedUserId);
    conditions.push(`EXISTS (
      SELECT 1
      FROM follows fl2
      WHERE fl2.following_id = a.author_id AND fl2.follower_id = $${params.length}
    )`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `
      SELECT COUNT(DISTINCT a.id)::int AS count
      FROM articles a
      JOIN users u ON u.id = a.author_id
      ${whereClause}
    `,
    params,
    executor
  );

  return result.rows[0] ? result.rows[0].count : 0;
}

async function addFavorite(userId, articleId, executor) {
  await query(
    `
      INSERT INTO favorites (user_id, article_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, article_id) DO NOTHING
    `,
    [userId, articleId],
    executor
  );
}

async function removeFavorite(userId, articleId, executor) {
  await query(
    'DELETE FROM favorites WHERE user_id = $1 AND article_id = $2',
    [userId, articleId],
    executor
  );
}

module.exports = {
  slugExists,
  createArticle,
  updateArticle,
  deleteArticle,
  findArticleBySlug,
  findArticleById,
  getArticleBySlugDetailed,
  getArticleByIdDetailed,
  listArticles,
  countArticles,
  addFavorite,
  removeFavorite
};