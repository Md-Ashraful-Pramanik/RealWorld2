const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const tagController = require('../controllers/tagController');

const router = express.Router();

router.get('/tags', asyncHandler(tagController.getTags));

module.exports = router;