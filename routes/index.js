const express = require('express');

const helloController = require('../controllers/helloController');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const articleRoutes = require('./articleRoutes');
const tagRoutes = require('./tagRoutes');
const auditRoutes = require('./auditRoutes');

const router = express.Router();

router.get('/hello', helloController.sayHello);
router.use('/api', authRoutes);
router.use('/api', userRoutes);
router.use('/api', profileRoutes);
router.use('/api', articleRoutes);
router.use('/api', tagRoutes);
router.use('/api', auditRoutes);

module.exports = router;