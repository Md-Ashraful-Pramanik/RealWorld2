const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/users/login', asyncHandler(authController.login));
router.post('/users', asyncHandler(authController.register));

module.exports = router;