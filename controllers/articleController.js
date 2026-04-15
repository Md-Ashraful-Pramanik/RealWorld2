const articleService = require('../services/articleService');

async function listArticles(req, res) {
  const result = await articleService.listArticles(req.query, req.user);
  res.json(result);
}

async function feedArticles(req, res) {
  const result = await articleService.feedArticles(req.user, req.query);
  res.json(result);
}

async function getArticle(req, res) {
  const result = await articleService.getArticle(req.params.slug, req.user);
  res.json(result);
}

async function createArticle(req, res) {
  const result = await articleService.createArticle(req.user, req.body.article || {});
  res.status(201).json(result);
}

async function updateArticle(req, res) {
  const result = await articleService.updateArticle(req.params.slug, req.user, req.body.article || {});
  res.json(result);
}

async function deleteArticle(req, res) {
  await articleService.deleteArticle(req.params.slug, req.user);
  res.status(204).send();
}

async function addComment(req, res) {
  const result = await articleService.addComment(req.params.slug, req.user, req.body.comment || {});
  res.status(201).json(result);
}

async function listComments(req, res) {
  const result = await articleService.listComments(req.params.slug, req.user);
  res.json(result);
}

async function deleteComment(req, res) {
  await articleService.deleteComment(req.params.slug, Number(req.params.id), req.user);
  res.status(204).send();
}

async function favoriteArticle(req, res) {
  const result = await articleService.favoriteArticle(req.params.slug, req.user);
  res.json(result);
}

async function unfavoriteArticle(req, res) {
  const result = await articleService.unfavoriteArticle(req.params.slug, req.user);
  res.json(result);
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