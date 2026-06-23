const Blog = require('../models/Blog');
const slugify = require('slugify');

exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const isAdmin = Boolean(req.headers.authorization);
    const filter = isAdmin ? {} : { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content');
    res.json({ blogs, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const isAdmin = Boolean(req.headers.authorization);
    const filter = isAdmin ? { slug: req.params.slug } : { slug: req.params.slug, isPublished: true };
    const blog = await Blog.findOne(filter);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.create({ ...req.body, slug });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
