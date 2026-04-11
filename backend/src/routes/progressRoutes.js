const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getProgress);
router.post('/update', requireAuth, updateProgress);

module.exports = router;
