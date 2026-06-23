const express = require('express');
const https   = require('https');
const http    = require('http');
const path    = require('path');
const router  = express.Router();

const BROWSER_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'application/pdf,application/octet-stream,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',   // no gzip — we pipe the raw stream
  'Cache-Control':   'no-cache',
};

// Fetch a URL server-side, following up to 8 redirects.
// Returns a Promise<{ response, finalUrl }>.
function fetchFollowRedirects(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 8) return reject(new Error('Too many redirects'));

    let parsed;
    try { parsed = new URL(url); } catch (e) { return reject(new Error('Invalid URL')); }

    const getter = parsed.protocol === 'https:' ? https : http;
    const req = getter.get(
      {
        hostname: parsed.hostname,
        port:     parsed.port || undefined,
        path:     parsed.pathname + parsed.search,
        headers:  BROWSER_HEADERS,
      },
      (res) => {
        const { statusCode, headers } = res;

        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          res.resume(); // drain so the socket is freed
          const next = headers.location.startsWith('/')
            ? `${parsed.protocol}//${parsed.host}${headers.location}`
            : headers.location;
          return resolve(fetchFollowRedirects(next, depth + 1));
        }

        resolve({ response: res, finalUrl: url });
      }
    );

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('Request timed out')); });
  });
}

// GET /api/download?url=<encoded>           → force download (Content-Disposition: attachment)
// GET /api/download?url=<encoded>&inline=1  → serve inline (for react-pdf viewer)
router.get('/', async (req, res) => {
  const { url, inline } = req.query;

  if (!url) return res.status(400).json({ message: 'url param required' });

  // For local /uploads/ paths, serve directly with explicit CORS headers (redirect
  // would loop back to the CORP-blocked static route when accessed cross-origin)
  if (url.startsWith('/uploads/')) {
    const filePath = path.resolve(__dirname, '..', url.replace(/^\//, ''));
    const filename = url.split('/').pop();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', 'application/pdf');
    if (inline !== '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    return res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) res.status(404).json({ message: 'File not found' });
    });
  }

  try {
    const { response, finalUrl } = await fetchFollowRedirects(url);

    const ct = (response.headers['content-type'] || 'application/pdf').toLowerCase();

    // If the remote returns HTML it's an error page — don't forward it
    if (ct.includes('text/html')) {
      response.resume();
      return res.status(502).json({
        message: 'The PDF host returned an HTML page instead of a PDF. The link may be expired or protected.',
      });
    }

    const filename = (new URL(finalUrl).pathname.split('/').pop() || 'newsletter.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_') || 'newsletter.pdf';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', ct.includes('pdf') ? 'application/pdf' : ct);

    if (inline !== '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.pipe(res);

    res.on('close', () => { if (!res.writableEnded) response.destroy(); });
  } catch (err) {
    console.error('Download proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: `Proxy error: ${err.message}` });
    }
  }
});

module.exports = router;
