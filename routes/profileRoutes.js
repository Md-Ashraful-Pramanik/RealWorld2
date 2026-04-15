const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/profiles/:username', asyncHandler(profileController.getProfile));
router.post('/profiles/:username/follow', requireAuth, asyncHandler(profileController.followProfile));
router.delete('/profiles/:username/follow', requireAuth, asyncHandler(profileController.unfollowProfile));

module.exports = router;