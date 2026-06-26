const express = require('express');
const router = express.Router();
const { submitEnquiry, getEnquiries, updateEnquiry, deleteEnquiry } = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

router.post('/', submitEnquiry);
router.get('/', protect, getEnquiries);
router.put('/:id', protect, updateEnquiry);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;
