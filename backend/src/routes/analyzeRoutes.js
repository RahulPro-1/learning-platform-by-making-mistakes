const express = require('express');
const router = express.Router();
const { analyzeCode, checkCodeRealtime, runCodeHandler } = require('../controllers/analyzeController');

router.post('/analyze', analyzeCode);
router.post('/check',   checkCodeRealtime);
router.post('/run',     runCodeHandler);

module.exports = router;
