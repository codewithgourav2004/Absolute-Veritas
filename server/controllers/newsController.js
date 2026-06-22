const News = require('../models/News');
const slugify = require('slugify');

exports.getNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const page = parseInt(req.query.page) || 1;
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isTrending === 'true') filter.isTrending = true;

    if (limit === 100) {
      const news = await News.find(filter)
        .sort({ publishedAt: -1 })
        .select('-content');
      return res.json({ news, total: news.length, pages: 1, page: 1 });
    }

    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content');
    res.json({ news, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug, isPublished: true });
    if (!news) return res.status(404).json({ message: 'News article not found' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const news = await News.create({ ...req.body, slug });
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!news) return res.status(404).json({ message: 'News article not found' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: 'News article not found' });
    res.json({ message: 'News article deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ publishedAt: -1 })
      .select('-content');
    res.json({ news, total: news.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
