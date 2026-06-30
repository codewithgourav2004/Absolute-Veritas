require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { runScheduler } = require('./scheduler');

const app = express();

app.set('trust proxy', 1);

connectDB().then(() => runScheduler());

// Gzip all responses
app.use(compression());

app.use(helmet());
const allowedOrigin = (process.env.CLIENT_URL || '').replace(/\/$/, '');
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api', limiter);

// Cache-Control helper — skips caching for admin (authenticated) requests
const cachePublic = (maxAge) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const isAdminReq = Boolean(req.headers.authorization);
    if (res.statusCode >= 200 && res.statusCode < 300 && req.method === 'GET' && !isAdminReq) {
      res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=60`);
    } else {
      res.set('Cache-Control', 'no-store');
    }
    return originalJson(body);
  };
  next();
};

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/services',     cachePublic(300), require('./routes/services'));
app.use('/api/blogs',        cachePublic(300), require('./routes/blogs'));
app.use('/api/enquiries',    require('./routes/enquiries'));
app.use('/api/testimonials', cachePublic(600), require('./routes/testimonials'));
app.use('/api/stats',        cachePublic(600), require('./routes/stats'));
app.use('/api/news',        cachePublic(300), require('./routes/news'));
app.use('/api/newsletters', cachePublic(600), require('./routes/newsletters'));
app.use('/api/subscribers', require('./routes/subscribers'));

// Uploaded files — long cache; override Helmet's CORP so cross-origin pages can load images/PDFs
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  immutable: true,
}));

app.use('/api/upload',    require('./routes/upload'));
// Download proxy must allow any origin — react-pdf fetches PDFs cross-origin from Netlify
app.use('/api/download', cors({ origin: '*' }), require('./routes/download'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this to free it:  taskkill /F /IM node.exe\n`);
    process.exit(1);
  }
  throw err;
});
