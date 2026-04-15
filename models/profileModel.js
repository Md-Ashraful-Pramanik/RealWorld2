const { query } = require('../config/db');

async function getProfileByUsername(username, viewerId = 0, executor) {
  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.bio,
        u.image,
        CASE WHEN f.follower_id IS NULL THEN FALSE ELSE TRUE END AS following
      FROM users u
      LEFT JOIN follows f
        ON f.following_id = u.id
       AND f.follower_id = $2
      WHERE u.username = $1
    `,
    [username, viewerId],
    executor
  );

  return result.rows[0] || null;
}

async function followUser(followerId, followingId, executor) {
  await query(
    `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `,
    [followerId, followingId],
    executor
  );
}

async function unfollowUser(followerId, followingId, executor) {
  await query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId],
    executor
  );
}

module.exports = {
  getProfileByUsername,
  followUser,
  unfollowUser
};