const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const articleController = require('../controllers/articleController');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/articles', asyncHandler(articleController.listArticles));
router.get('/articles/feed', requireAuth, asyncHandler(articleController.feedArticles));
router.get('/articles/:slug', asyncHandler(articleController.getArticle));
router.post('/articles', requireAuth, asyncHandler(articleController.createArticle));
router.put('/articles/:slug', requireAuth, asyncHandler(articleController.updateArticle));
router.delete('/articles/:slug', requireAuth, asyncHandler(articleController.deleteArticle));
router.post('/articles/:slug/comments', requireAuth, asyncHandler(articleController.addComment));
router.get('/articles/:slug/comments', asyncHandler(articleController.listComments));
router.delete('/articles/:slug/comments/:id', requireAuth, asyncHandler(articleController.deleteComment));
router.post('/articles/:slug/favorite', requireAuth, asyncHandler(articleController.favoriteArticle));
router.delete('/articles/:slug/favorite', requireAuth, asyncHandler(articleController.unfavoriteArticle));

module.exports = router;