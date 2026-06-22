const express = require('express');
const router = express.Router();
const { getNewsletters, getNewsletterById, createNewsletter, updateNewsletter, deleteNewsletter } = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

router.get('/', getNewsletters);
router.get('/:id', getNewsletterById);
router.post('/', protect, createNewsletter);
router.put('/:id', protect, updateNewsletter);
router.delete('/:id', protect, deleteNewsletter);

module.exports = router;
