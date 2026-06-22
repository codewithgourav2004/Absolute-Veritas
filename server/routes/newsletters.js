const express = require('express');
const router = express.Router();
const { getNewsletters, getNewsletterById, getNewslettersAdmin, getNewsletterByIdAdmin, createNewsletter, updateNewsletter, deleteNewsletter } = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

router.get('/', getNewsletters);
router.get('/admin-all', protect, getNewslettersAdmin);
router.get('/admin/:id', protect, getNewsletterByIdAdmin);
router.get('/:id', getNewsletterById);
router.post('/', protect, createNewsletter);
router.put('/:id', protect, updateNewsletter);
router.delete('/:id', protect, deleteNewsletter);

module.exports = router;
