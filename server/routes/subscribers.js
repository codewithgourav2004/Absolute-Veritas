const express = require('express');
const router  = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  sendNewsletter,
} = require('../controllers/subscriberController');
const { protect } = require('../middleware/auth');

// Public
router.post('/subscribe',            subscribe);
router.get('/unsubscribe/:token',    unsubscribe);

// Protected
router.get('/',                      protect, getSubscribers);
router.put('/:id',                   protect, updateSubscriber);
router.delete('/:id',               protect, deleteSubscriber);
router.post('/send/:newsletterId',   protect, sendNewsletter);

module.exports = router;
