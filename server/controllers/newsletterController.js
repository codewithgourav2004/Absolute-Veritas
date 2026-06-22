const Newsletter = require('../models/Newsletter');
const slugify    = require('slugify');
const { broadcastNewsletter } = require('./subscriberController');

const MONTH_ORDER = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const toSlug = (title) =>
  slugify(title, { lower: true, strict: true, trim: true });

exports.getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({ isPublished: true })
      .select('-content')
      .sort({ year: -1, createdAt: -1 });
    newsletters.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return MONTH_ORDER.indexOf(b.month) - MONTH_ORDER.indexOf(a.month);
    });
    res.json(newsletters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewsletterById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findOne({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { slug: req.params.id },
      ],
      isPublished: true,
    });
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNewsletter = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.title) {
      data.slug = toSlug(`${data.title}-${data.month || ''}-${data.year || ''}`);
    }
    const newsletter = await Newsletter.create(data);

    // Auto-send to subscribers on first publish
    if (newsletter.isPublished) {
      newsletter.emailedAt = new Date();
      await newsletter.save();
      broadcastNewsletter(newsletter).catch((e) =>
        console.error('Auto-broadcast failed:', e.message)
      );
    }

    res.status(201).json(newsletter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    const existing = await Newsletter.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Newsletter not found' });

    const wasUnpublished = !existing.isPublished;
    const willPublish    = req.body.isPublished === true || req.body.isPublished === 'true';
    const neverEmailed   = !existing.emailedAt;

    const newsletter = await Newsletter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Auto-send only on first publish
    if (wasUnpublished && willPublish && neverEmailed) {
      newsletter.emailedAt = new Date();
      await newsletter.save();
      broadcastNewsletter(newsletter).catch((e) =>
        console.error('Auto-broadcast failed:', e.message)
      );
    }

    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.json({ message: 'Newsletter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
