const Subscriber  = require('../models/Subscriber');
const Newsletter  = require('../models/Newsletter');
const EmailLog    = require('../models/EmailLog');
const transporter = require('../config/mailer');

// ── Email templates ───────────────────────────────────────────────────────────

const base = (innerHtml) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;color:#333}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10)}
  .hdr{background:#1A1F3C;padding:28px 32px;text-align:center}
  .hdr-logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:6px}
  .hdr-dot{width:10px;height:10px;background:#E63946;border-radius:50%;display:inline-block}
  .hdr h1{color:#fff;font-size:22px;font-weight:800;letter-spacing:.5px}
  .hdr p{color:rgba(255,255,255,.6);font-size:13px;margin-top:4px}
  .body{padding:32px}
  .nl-cover{width:100%;max-height:260px;object-fit:cover;display:block}
  .nl-meta{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D4AF37;margin-bottom:8px}
  .nl-title{font-size:22px;font-weight:800;color:#1A1F3C;margin-bottom:12px;line-height:1.3}
  .nl-excerpt{font-size:15px;color:#555;line-height:1.7;margin-bottom:24px}
  .btn{display:inline-block;background:#E63946;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px}
  .btn-outline{display:inline-block;color:#1A1F3C;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:13px;border:2px solid #1A1F3C;margin-left:10px}
  .divider{border:none;border-top:1px solid #f0f0f0;margin:28px 0}
  .ftr{background:#f8f7f4;padding:20px 32px;text-align:center;font-size:12px;color:#888}
  .ftr a{color:#1A1F3C;text-decoration:none;font-weight:600}
  .unsub{font-size:11px;color:#aaa;margin-top:10px}
  .unsub a{color:#aaa;text-decoration:underline}
</style>
</head>
<body><div class="wrap">${innerHtml}</div></body>
</html>`;

const welcomeEmail = (nameOrEmail) => base(`
  <div class="hdr">
    <div class="hdr-logo"><span class="hdr-dot"></span><h1>Absolute Veritas</h1><span class="hdr-dot"></span></div>
    <p>TIC &amp; IT Compliance Consultancy</p>
  </div>
  <div class="body">
    <p style="font-size:16px;font-weight:700;color:#1A1F3C;margin-bottom:12px">Welcome to our newsletter, ${nameOrEmail}!</p>
    <p style="font-size:15px;line-height:1.75;color:#555;margin-bottom:20px">
      You're now subscribed to <strong>Absolute Veritas Compliance Bulletins</strong> — monthly insights on BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, VAPT, ISO 27001, and more.
    </p>
    <p style="font-size:15px;line-height:1.75;color:#555;margin-bottom:24px">
      Every month, we distill the latest regulatory updates into clear, actionable guidance so you never miss a compliance deadline.
    </p>
    <a href="${process.env.CLIENT_URL || 'https://absoluteveritas.com'}/newsletter" class="btn">Browse Past Issues</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#888">If you didn't subscribe, you can safely ignore this email.</p>
  </div>
  <div class="ftr">
    &copy; ${new Date().getFullYear()} Absolute Veritas &nbsp;|&nbsp;
    <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
  </div>`);

const customEmail = (subject, bodyHtml, unsubUrl) => base(`
  <div class="hdr">
    <div class="hdr-logo"><span class="hdr-dot"></span><h1>Absolute Veritas</h1><span class="hdr-dot"></span></div>
    <p>TIC &amp; IT Compliance Consultancy</p>
  </div>
  <div class="body">
    <h2 class="nl-title">${subject}</h2>
    <div style="font-size:15px;line-height:1.75;color:#444">${bodyHtml}</div>
  </div>
  <div class="ftr">
    &copy; ${new Date().getFullYear()} Absolute Veritas &nbsp;|&nbsp;
    <a href="mailto:${process.env.EMAIL_FROM || process.env.EMAIL_USER}">${process.env.EMAIL_FROM || process.env.EMAIL_USER}</a>
    <div class="unsub">You're receiving this because you subscribed to Absolute Veritas updates. &nbsp;
      <a href="${unsubUrl}">Unsubscribe</a>
    </div>
  </div>`);

const newsletterEmail = (nl, token, siteUrl) => {
  const readUrl   = `${siteUrl}/newsletter/${nl._id}`;
  const apiUrl    = (process.env.SERVER_URL || 'https://absolute-veritas.onrender.com').replace(/\/$/, '');
  const unsubUrl  = `${apiUrl}/api/subscribers/unsubscribe/${token}`;
  const coverHtml = nl.coverImage
    ? `<img src="${nl.coverImage.startsWith('/') ? apiUrl + nl.coverImage : nl.coverImage}" alt="${nl.title}" class="nl-cover"/>`
    : '';
  // Route PDF through the download proxy so it always triggers Save-As in the email client
  const pdfBtn = (() => {
    if (!nl.pdfLink) return '';
    const fullUrl = nl.pdfLink.startsWith('/') ? `${apiUrl}${nl.pdfLink}` : nl.pdfLink;
    const dlHref  = `${apiUrl}/api/download?url=${encodeURIComponent(fullUrl)}`;
    return `<a href="${dlHref}" class="btn-outline">Download PDF</a>`;
  })();

  return base(`
  <div class="hdr">
    <div class="hdr-logo"><span class="hdr-dot"></span><h1>Absolute Veritas</h1><span class="hdr-dot"></span></div>
    <p>Compliance Bulletin &nbsp;·&nbsp; ${nl.edition}</p>
  </div>
  ${coverHtml}
  <div class="body">
    <p class="nl-meta">${nl.month} ${nl.year} &nbsp;·&nbsp; ${nl.edition}</p>
    <h2 class="nl-title">${nl.title}</h2>
    ${nl.excerpt ? `<p class="nl-excerpt">${nl.excerpt}</p>` : ''}
    <a href="${readUrl}" class="btn">Read Full Edition</a>${pdfBtn}
    <hr class="divider"/>
    <p style="font-size:13px;color:#888;line-height:1.6">
      Stay ahead of India's fast-changing regulatory landscape. This edition covers key updates you need to know.
    </p>
  </div>
  <div class="ftr">
    &copy; ${new Date().getFullYear()} Absolute Veritas &nbsp;|&nbsp;
    <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
    <div class="unsub">You're receiving this because you subscribed to Absolute Veritas updates. &nbsp;
      <a href="${unsubUrl}">Unsubscribe</a>
    </div>
  </div>`);
};

// ── Controllers ───────────────────────────────────────────────────────────────

exports.subscribe = async (req, res) => {
  try {
    const email  = (req.body.email  || '').trim().toLowerCase();
    const name   = (req.body.name   || '').trim();
    const mobile = (req.body.mobile || '').trim();
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address.' });

    let sub = await Subscriber.findOne({ email });
    if (sub) {
      if (sub.isActive) return res.status(409).json({ message: 'This email is already subscribed.' });
      sub.isActive = true;
      if (name)   sub.name   = name;
      if (mobile) sub.mobile = mobile;
      await sub.save();
    } else {
      sub = await Subscriber.create({ email, name, mobile });
    }

    // Welcome email — fire and forget
    transporter.sendMail({
      from:    `"Absolute Veritas" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:      sub.email,
      subject: 'Welcome to Absolute Veritas Newsletter',
      html:    welcomeEmail(name || email),
    }).catch((e) => console.error('Welcome email failed:', e.message));

    res.status(201).json({ message: 'Successfully subscribed! Check your inbox for a welcome email.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This email is already subscribed.' });
    res.status(500).json({ message: err.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const sub = await Subscriber.findOne({ unsubscribeToken: req.params.token });
    if (!sub) return res.status(404).json({ message: 'Invalid or expired unsubscribe link.' });
    sub.isActive = false;
    await sub.save();
    // Return a simple HTML page so clicking the link from email shows a nice message
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Unsubscribed</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f4f4;margin:0}
      .card{background:#fff;border-radius:12px;padding:40px 48px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.1);max-width:420px}
      h2{color:#1A1F3C;margin-bottom:8px}p{color:#666;margin-bottom:24px}
      a{color:#E63946;font-weight:700;text-decoration:none}</style></head>
      <body><div class="card"><h2>You've been unsubscribed</h2>
      <p>You will no longer receive newsletter emails from Absolute Veritas.</p>
      <a href="${process.env.CLIENT_URL || '/'}">Visit our website</a></div></body></html>`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubscriber = async (req, res) => {
  try {
    const { name, mobile, isActive } = req.body;
    const sub = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { ...(name   !== undefined && { name }),
        ...(mobile !== undefined && { mobile }),
        ...(isActive !== undefined && { isActive }) },
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Shared broadcast helper (used by newsletterController on auto-send) ───────
exports.broadcastNewsletter = async (nl) => {
  const subscribers = await Subscriber.find({ isActive: true });
  if (!subscribers.length) return { sent: 0, failed: 0 };
  const siteUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
  let sent = 0, failed = 0;
  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from:    `"Absolute Veritas Newsletter" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to:      sub.email,
        subject: `${nl.title} — Absolute Veritas ${nl.edition}`,
        html:    newsletterEmail(nl, sub.unsubscribeToken, siteUrl),
      });
      sent++;
    } catch (e) {
      console.error(`Failed to send to ${sub.email}:`, e.message);
      failed++;
    }
  }
  return { sent, failed };
};

exports.sendCustomEmail = async (req, res) => {
  try {
    const { subject, body, recipientIds, extraEmails: extraRaw, addToList } = req.body;
    if (!subject || !subject.trim()) return res.status(400).json({ message: 'Subject is required.' });
    if (!body    || !body.trim())    return res.status(400).json({ message: 'Body is required.' });

    // Parse subscriber IDs
    let ids;
    try { ids = recipientIds ? JSON.parse(recipientIds) : []; } catch { ids = []; }

    // Parse extra emails (manual/excel imports)
    let extras = [];
    try { extras = extraRaw ? JSON.parse(extraRaw) : []; } catch { extras = []; }

    const subscribers = ids.length
      ? await Subscriber.find({ _id: { $in: ids }, isActive: true })
      : [];

    if (!subscribers.length && !extras.length)
      return res.status(400).json({ message: 'No recipients selected.' });

    const apiUrl  = (process.env.SERVER_URL || 'https://absolute-veritas.onrender.com').replace(/\/$/, '');
    const attachments = (req.files || []).map((f) => ({
      filename:    f.originalname,
      content:     f.buffer,
      contentType: f.mimetype,
    }));

    const hasHtml  = /<[a-z][\s\S]*>/i.test(body);
    const bodyHtml = hasHtml
      ? body
      : body.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');

    let sent = 0, failed = 0;

    const subjectTrimmed = subject.trim();
    const logs = [];

    // Send to existing subscribers (with personal unsubscribe link)
    for (const sub of subscribers) {
      const unsubUrl = `${apiUrl}/api/subscribers/unsubscribe/${sub.unsubscribeToken}`;
      try {
        await transporter.sendMail({
          from:        `"Absolute Veritas" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to:          sub.email,
          subject:     subjectTrimmed,
          html:        customEmail(subjectTrimmed, bodyHtml, unsubUrl),
          attachments,
        });
        sent++;
        logs.push({ subject: subjectTrimmed, recipient: sub.email, status: 'delivered', source: 'custom' });
      } catch (e) {
        console.error(`Custom email failed for ${sub.email}:`, e.message);
        failed++;
        logs.push({ subject: subjectTrimmed, recipient: sub.email, status: 'failed', error: e.message, source: 'custom' });
      }
    }

    // Send to extra/imported emails
    for (const extra of extras) {
      const email = (extra.email || '').trim().toLowerCase();
      if (!email) continue;

      let token = null;
      const existing = await Subscriber.findOne({ email });
      if (existing) {
        token = existing.unsubscribeToken;
      } else if (addToList === 'true') {
        try {
          const newSub = await Subscriber.create({ email, name: (extra.name || '').trim() });
          token = newSub.unsubscribeToken;
        } catch {
          const found = await Subscriber.findOne({ email });
          token = found?.unsubscribeToken;
        }
      }

      const unsubUrl = token
        ? `${apiUrl}/api/subscribers/unsubscribe/${token}`
        : `${apiUrl.replace('/api', '')}/#unsubscribe`;

      try {
        await transporter.sendMail({
          from:        `"Absolute Veritas" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to:          email,
          subject:     subjectTrimmed,
          html:        customEmail(subjectTrimmed, bodyHtml, unsubUrl),
          attachments,
        });
        sent++;
        logs.push({ subject: subjectTrimmed, recipient: email, status: 'delivered', source: 'custom' });
      } catch (e) {
        console.error(`Custom email failed for ${email}:`, e.message);
        failed++;
        logs.push({ subject: subjectTrimmed, recipient: email, status: 'failed', error: e.message, source: 'custom' });
      }
    }

    // Persist all logs in one batch (fire-and-forget — don't block the response)
    if (logs.length) EmailLog.insertMany(logs).catch((e) => console.error('EmailLog save error:', e.message));

    res.json({
      message: `Sent to ${sent} recipient${sent !== 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}.`,
      sent,
      failed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEmailLog = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      const filter = req.query.status ? { status: req.query.status } : {};
      const { deletedCount } = await EmailLog.deleteMany(filter);
      return res.json({ message: `Deleted ${deletedCount} log${deletedCount !== 1 ? 's' : ''}.` });
    }
    await EmailLog.findByIdAndDelete(id);
    res.json({ message: 'Log deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || 100, 10), 500);
    const page   = Math.max(parseInt(req.query.page   || 1,   10), 1);
    const status = req.query.status; // 'delivered' | 'failed' | undefined = all
    const filter = status ? { status } : {};

    const [logs, total] = await Promise.all([
      EmailLog.find(filter).sort({ sentAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      EmailLog.countDocuments(filter),
    ]);
    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendNewsletter = async (req, res) => {
  try {
    const nl = await Newsletter.findById(req.params.newsletterId);
    if (!nl) return res.status(404).json({ message: 'Newsletter not found.' });

    const subscribers = await Subscriber.find({ isActive: true });
    if (subscribers.length === 0)
      return res.status(400).json({ message: 'No active subscribers to send to.' });

    const siteUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

    let sent = 0, failed = 0;
    const nlLogs = [];
    const nlSubject = `${nl.title} — Absolute Veritas ${nl.edition}`;

    for (const sub of subscribers) {
      try {
        await transporter.sendMail({
          from:    `"Absolute Veritas Newsletter" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to:      sub.email,
          subject: nlSubject,
          html:    newsletterEmail(nl, sub.unsubscribeToken, siteUrl),
        });
        sent++;
        nlLogs.push({ subject: nlSubject, recipient: sub.email, status: 'delivered', source: 'newsletter' });
      } catch (e) {
        console.error(`Failed to send to ${sub.email}:`, e.message);
        failed++;
        nlLogs.push({ subject: nlSubject, recipient: sub.email, status: 'failed', error: e.message, source: 'newsletter' });
      }
    }

    if (nlLogs.length) EmailLog.insertMany(nlLogs).catch((e) => console.error('EmailLog save error:', e.message));

    res.json({
      message: `Sent to ${sent} subscriber${sent !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`,
      sent,
      failed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
