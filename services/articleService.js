const { getClient } = require('../config/db');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const tagModel = require('../models/tagModel');
const { AppError } = require('../utils/errors');
const { serializeArticle, serializeArticles, serializeComment, serializeComments } = require('../utils/serializer');
const { generateUniqueSlug } = require('../utils/slug');

function normalizePagination(query = {}) {
  return {
    limit: Number(query.limit || 20),
    offset: Number(query.offset || 0)
  };
}

async function listArticles(filters, viewer) {
  const pagination = normalizePagination(filters);
  const whereFilters = {
    tag: filters.tag,
    author: filters.author,
    favorited: filters.favorited
  };

  const [articles, totalCount] = await Promise.all([
    articleModel.listArticles(whereFilters, {
      viewerId: viewer ? viewer.id : 0,
      ...pagination
    }),
    articleModel.countArticles(whereFilters)
  ]);

  return {
    articles: serializeArticles(articles).articles,
    articlesCount: totalCount
  };
}

async function feedArticles(viewer, query) {
  const pagination = normalizePagination(query);
  const filters = { feedUserId: viewer.id };

  const [articles, totalCount] = await Promise.all([
    articleModel.listArticles(filters, {
      viewerId: viewer.id,
      ...pagination
    }),
    articleModel.countArticles(filters)
  ]);

  return {
    articles: serializeArticles(articles).articles,
    articlesCount: totalCount
  };
}

async function getArticle(slug, viewer) {
  const article = await articleModel.getArticleBySlugDetailed(slug, viewer ? viewer.id : 0);

  if (!article) {
    throw new AppError(404, 'article not found');
  }

  return serializeArticle(article);
}

async function createArticle(currentUser, articlePayload = {}) {
  if (!articlePayload.title || !articlePayload.description || !articlePayload.body) {
    throw new AppError(422, 'missing required article fields', [
      'title is required',
      'description is required',
      'body is required'
    ].filter((message) => {
      if (message.startsWith('title') && articlePayload.title) return false;
      if (message.startsWith('description') && articlePayload.description) return false;
      if (message.startsWith('body') && articlePayload.body) return false;
      return true;
    }));
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const slug = await generateUniqueSlug(articlePayload.title, (candidate) => articleModel.slugExists(candidate, client));
    const article = await articleModel.createArticle(
      {
        slug,
        title: articlePayload.title,
        description: articlePayload.description,
        body: articlePayload.body,
        authorId: currentUser.id
      },
      client
    );

    await tagModel.replaceArticleTags(article.id, articlePayload.tagList || [], client);

    await client.query('COMMIT');

    const detailedArticle = await articleModel.getArticleByIdDetailed(article.id, currentUser.id);
    return serializeArticle(detailedArticle);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateArticle(slug, currentUser, articlePayload = {}) {
  const existingArticle = await articleModel.findArticleBySlug(slug);

  if (!existingArticle) {
    throw new AppError(404, 'article not found');
  }

  if (existingArticle.author_id !== currentUser.id) {
    throw new AppError(403, 'forbidden');
  }

  const updates = {};

  if (articlePayload.title !== undefined) {
    updates.title = articlePayload.title;
    if (articlePayload.title !== existingArticle.title) {
      updates.slug = await generateUniqueSlug(articlePayload.title, async (candidate) => {
        if (candidate === existingArticle.slug) {
          return false;
        }
        return articleModel.slugExists(candidate);
      });
    }
  }

  if (articlePayload.description !== undefined) {
    updates.description = articlePayload.description;
  }

  if (articlePayload.body !== undefined) {
    updates.body = articlePayload.body;
  }

  await articleModel.updateArticle(existingArticle.id, updates);
  const detailedArticle = await articleModel.getArticleByIdDetailed(existingArticle.id, currentUser.id);
  return serializeArticle(detailedArticle);
}

async function deleteArticle(slug, currentUser) {
  const article = await articleModel.findArticleBySlug(slug);

  if (!article) {
    throw new AppError(404, 'article not found');
  }

  if (article.author_id !== currentUser.id) {
    throw new AppError(403, 'forbidden');
  }

  await articleModel.deleteArticle(article.id);
}

async function addComment(slug, currentUser, commentPayload = {}) {
  if (!commentPayload.body) {
    throw new AppError(422, 'comment body is required');
  }

  const article = await articleModel.findArticleBySlug(slug);
  if (!article) {
    throw new AppError(404, 'article not found');
  }

  const comment = await commentModel.createComment({
    body: commentPayload.body,
    authorId: currentUser.id,
    articleId: article.id
  });

  const detailedComment = await commentModel.getCommentDetailedById(comment.id, currentUser.id);
  return serializeComment(detailedComment);
}

async function listComments(slug, viewer) {
  const article = await articleModel.findArticleBySlug(slug);
  if (!article) {
    throw new AppError(404, 'article not found');
  }

  const comments = await commentModel.listCommentsByArticle(article.id, viewer ? viewer.id : 0);
  return serializeComments(comments);
}

async function deleteComment(slug, commentId, currentUser) {
  const article = await articleModel.findArticleBySlug(slug);
  if (!article) {
    throw new AppError(404, 'article not found');
  }

  const comment = await commentModel.findCommentById(commentId);
  if (!comment || comment.article_id !== article.id) {
    throw new AppError(404, 'comment not found');
  }

  if (comment.author_id !== currentUser.id) {
    throw new AppError(403, 'forbidden');
  }

  await commentModel.deleteComment(comment.id);
}

async function favoriteArticle(slug, currentUser) {
  const article = await articleModel.findArticleBySlug(slug);
  if (!article) {
    throw new AppError(404, 'article not found');
  }

  await articleModel.addFavorite(currentUser.id, article.id);
  const detailedArticle = await articleModel.getArticleByIdDetailed(article.id, currentUser.id);
  return serializeArticle(detailedArticle);
}

async function unfavoriteArticle(slug, currentUser) {
  const article = await articleModel.findArticleBySlug(slug);
  if (!article) {
    throw new AppError(404, 'article not found');
  }

  await articleModel.removeFavorite(currentUser.id, article.id);
  const detailedArticle = await articleModel.getArticleByIdDetailed(article.id, currentUser.id);
  return serializeArticle(detailedArticle);
}

module.exports = {
  listArticles,
  feedArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  addComment,
  listComments,
  deleteComment,
  favoriteArticle,
  unfavoriteArticle
};