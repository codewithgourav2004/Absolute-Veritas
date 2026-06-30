const News       = require('./models/News');
const Newsletter = require('./models/Newsletter');
const { broadcastNewsletter } = require('./controllers/subscriberController');

const runScheduler = () => {
  setInterval(async () => {
    const now = new Date();

    try {
      // Auto-publish scheduled news articles
      const dueNews = await News.find({ isPublished: false, scheduledAt: { $lte: now } });
      for (const article of dueNews) {
        article.isPublished = true;
        article.publishedAt = now;
        article.scheduledAt = null;
        await article.save();
        console.log(`[Scheduler] Published news: "${article.title}"`);
      }
    } catch (e) {
      console.error('[Scheduler] News publish error:', e.message);
    }

    try {
      // Auto-publish scheduled newsletters and email subscribers
      const dueNewsletters = await Newsletter.find({ isPublished: false, scheduledAt: { $lte: now } });
      for (const nl of dueNewsletters) {
        const shouldEmail = !nl.emailedAt;
        nl.isPublished = true;
        nl.scheduledAt = null;
        if (shouldEmail) nl.emailedAt = now;
        await nl.save();
        console.log(`[Scheduler] Published newsletter: "${nl.title}"`);
        if (shouldEmail) {
          broadcastNewsletter(nl).catch((e) =>
            console.error(`[Scheduler] Broadcast failed for "${nl.title}":`, e.message)
          );
        }
      }
    } catch (e) {
      console.error('[Scheduler] Newsletter publish error:', e.message);
    }
  }, 60 * 1000); // runs every minute
};

module.exports = { runScheduler };
