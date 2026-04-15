const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const auditController = require('../controllers/auditController');
const { requireAuth } = require('../utils/auth');

const router = express.Router();

router.get('/audits', requireAuth, asyncHandler(auditController.getAudits));

module.exports = router;