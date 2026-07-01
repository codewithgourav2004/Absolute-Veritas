# API Route Template

## Route File (`server/routes/resource.js`)
```js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/resource');
const { protect }      = require('../middleware/auth');
const { cachePublic }  = require('../middleware/cache');

// Public
router.get('/',     cachePublic(5 * 60), ctrl.getAll);
router.get('/:id',  cachePublic(5 * 60), ctrl.getOne);

// Protected
router.post('/',        protect, ctrl.create);
router.put('/:id',      protect, ctrl.update);
router.delete('/:id',   protect, ctrl.remove);

module.exports = router;
```

## Controller File (`server/controllers/resource.js`)
```js
const Resource = require('../models/Resource');
const slugify  = require('slugify');

exports.getAll = async (req, res) => {
  try {
    const items = await Resource.find({ isActive: true })
      .select('-content')   // exclude heavy field from list
      .sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Resource.findOne({ slug: req.params.id })
                 || await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const item = await Resource.create({ ...req.body, slug });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const slug = req.body.name
      ? slugify(req.body.name, { lower: true, strict: true })
      : undefined;
    const item = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(slug && { slug }) },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

## Model File (`server/models/Resource.js`)
```js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, default: '' },
  content:     { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
```

## Mount in `server/index.js`
```js
const resourceRoutes = require('./routes/resource');
app.use('/api/resource', resourceRoutes);
```

## Frontend API Call
```js
// client/src/utils/api.js instance auto-attaches JWT
import api from '../utils/api';

// Get all
api.get('/resource').then(r => r.data)

// Create
api.post('/resource', formData)

// Update (partial — safe with findByIdAndUpdate $set)
api.put(`/resource/${id}`, { fieldToUpdate: value })

// Delete
api.delete(`/resource/${id}`)
```
