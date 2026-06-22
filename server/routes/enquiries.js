const express = require('express');
const router = express.Router();
const { submitEnquiry, getEnquiries, updateEnquiry } = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

router.post('/', submitEnquiry);
router.get('/', protect, getEnquiries);
router.put('/:id', protect, updateEnquiry);

module.exports = router;
