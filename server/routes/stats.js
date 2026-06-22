const express = require('express');
const router = express.Router();
const { getStats, updateStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/', getStats);
router.put('/', protect, updateStats);

module.exports = router;
