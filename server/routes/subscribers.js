const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  sendNewsletter,
  sendCustomEmail,
} = require('../controllers/subscriberController');
const { protect } = require('../middleware/auth');

// In-memory storage for email attachments (buffers sent directly to Brevo, never written to disk)
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024, files: 5 },
});

// Public
router.post('/subscribe',            subscribe);
router.get('/unsubscribe/:token',    unsubscribe);

// Protected
router.get('/',                      protect, getSubscribers);
router.put('/:id',                   protect, updateSubscriber);
router.delete('/:id',               protect, deleteSubscriber);
router.post('/send/:newsletterId',   protect, sendNewsletter);
router.post('/send-email',           protect, memUpload.array('attachments', 5), sendCustomEmail);

module.exports = router;
