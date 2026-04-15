const { query } = require('../config/db');

async function ensureTag(name, executor) {
  const result = await query(
    `
      INSERT INTO tags (name)
      VALUES ($1)
      ON CONFLICT (name)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `,
    [name],
    executor
  );

  return result.rows[0];
}

async function replaceArticleTags(articleId, tagNames = [], executor) {
  await query('DELETE FROM article_tags WHERE article_id = $1', [articleId], executor);

  const uniqueTagNames = [...new Set(tagNames.filter(Boolean))];

  for (const tagName of uniqueTagNames) {
    const tag = await ensureTag(tagName, executor);
    await query(
      `
        INSERT INTO article_tags (article_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (article_id, tag_id) DO NOTHING
      `,
      [articleId, tag.id],
      executor
    );
  }
}

async function listTags(executor) {
  const result = await query('SELECT name FROM tags ORDER BY name ASC', [], executor);
  return result.rows.map((row) => row.name);
}

module.exports = {
  replaceArticleTags,
  listTags
};