const express  = require('express');
const https    = require('https');
const http     = require('http');
const router   = express.Router();

// GET /api/download?url=<encoded-pdf-url>
// Proxies an external PDF through the server so the browser treats it as a
// same-origin download and the `Content-Disposition: attachment` header is respected.
router.get('/', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: 'url param required' });

  let parsed;
  try { parsed = new URL(url); } catch {
    return res.status(400).json({ message: 'Invalid URL' });
  }

  const protocol = parsed.protocol === 'https:' ? https : http;
  const filename = (parsed.pathname.split('/').pop() || 'newsletter.pdf')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  // inline=1  → serve for viewing (no attachment header, allows react-pdf to load it)
  // default   → force download
  const isInline = req.query.inline === '1';

  const proxyReq = protocol.get(url, (proxyRes) => {
    // Follow one redirect
    if ((proxyRes.statusCode === 301 || proxyRes.statusCode === 302) && proxyRes.headers.location) {
      const loc = proxyRes.headers.location;
      const suffix = isInline ? '&inline=1' : '';
      res.redirect(`/api/download?url=${encodeURIComponent(loc)}${suffix}`);
      return;
    }
    if (proxyRes.statusCode !== 200) {
      res.status(502).json({ message: `Remote returned ${proxyRes.statusCode}` });
      return;
    }
    const ct = proxyRes.headers['content-type'] || 'application/pdf';
    if (!isInline) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (proxyRes.headers['content-length']) {
      res.setHeader('Content-Length', proxyRes.headers['content-length']);
    }
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Download proxy error:', err.message);
    if (!res.headersSent) res.status(500).json({ message: 'Download failed' });
  });
});

module.exports = router;
