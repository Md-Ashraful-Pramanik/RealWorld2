const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const userController = require('../controllers/userController');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/user', requireAuth, asyncHandler(userController.getCurrentUser));
router.put('/user', requireAuth, asyncHandler(userController.updateCurrentUser));

module.exports = router;