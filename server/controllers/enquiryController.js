const Enquiry    = require('../models/Enquiry');
const Subscriber = require('../models/Subscriber');
const transporter = require('../config/mailer');

const adminEmailHtml = (e) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
    .wrapper { max-width:600px; margin:30px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.1); }
    .header { background:#1A1F3C; color:#fff; padding:24px 32px; }
    .header h1 { margin:0; font-size:22px; }
    .header p { margin:4px 0 0; font-size:13px; opacity:.7; }
    .body { padding:28px 32px; }
    .row { display:flex; margin-bottom:14px; }
    .label { font-weight:600; color:#1A1F3C; width:110px; flex-shrink:0; font-size:14px; }
    .value { color:#444; font-size:14px; word-break:break-word; }
    .message-box { background:#f8f7f4; border-left:4px solid #E63946; padding:12px 16px; border-radius:4px; color:#333; font-size:14px; line-height:1.6; margin-top:6px; }
    .footer { background:#f8f7f4; text-align:center; padding:16px; font-size:12px; color:#888; }
    .badge { display:inline-block; background:#E63946; color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-left:8px; vertical-align:middle; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Enquiry Received <span class="badge">NEW</span></h1>
      <p>Absolute Veritas — Enquiry Management</p>
    </div>
    <div class="body">
      <div class="row"><span class="label">Name</span><span class="value">${e.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${e.email || '—'}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${e.phone || '—'}</span></div>
      <div class="row"><span class="label">Company</span><span class="value">${e.company || '—'}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${e.category || '—'}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${e.service || '—'}</span></div>
      <div class="row" style="flex-direction:column">
        <span class="label" style="margin-bottom:8px">Message</span>
        <div class="message-box">${e.message}</div>
      </div>
    </div>
    <div class="footer">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
  </div>
</body>
</html>`;

const userConfirmationHtml = (name, message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
    .wrapper { max-width:600px; margin:30px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.1); }
    .header { background:#1A1F3C; color:#fff; padding:28px 32px; text-align:center; }
    .header h1 { margin:0; font-size:24px; letter-spacing:.5px; }
    .header p { margin:6px 0 0; opacity:.7; font-size:14px; }
    .body { padding:32px; color:#333; font-size:15px; line-height:1.7; }
    .body h2 { color:#1A1F3C; font-size:18px; margin-bottom:8px; }
    .message-box { background:#f8f7f4; border-left:4px solid #1A1F3C; padding:12px 16px; border-radius:4px; color:#555; font-size:14px; margin:16px 0; font-style:italic; }
    .highlight { color:#E63946; font-weight:700; }
    .cta { text-align:center; margin:28px 0 8px; }
    .cta a { background:#E63946; color:#fff; text-decoration:none; padding:12px 32px; border-radius:6px; font-weight:700; font-size:14px; }
    .divider { border:none; border-top:1px solid #eee; margin:24px 0; }
    .footer { background:#f8f7f4; text-align:center; padding:16px; font-size:12px; color:#888; }
    .footer a { color:#1A1F3C; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Absolute Veritas</h1>
      <p>TIC &amp; IT Compliance Consultancy</p>
    </div>
    <div class="body">
      <h2>Dear ${name},</h2>
      <p>Thank you for reaching out to us! We have successfully received your enquiry and our team will review it shortly.</p>
      <p><strong>Your message:</strong></p>
      <div class="message-box">"${message}"</div>
      <p>We typically respond within <span class="highlight">24 business hours</span>. If your matter is urgent, you can also reach us directly at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#666;">Services we cover: BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE Marking, FCC, VAPT, ISO 27001 &amp; more.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Absolute Veritas &nbsp;|&nbsp;
      <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
    </div>
  </div>
</body>
</html>`;

exports.submitEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);

    const adminTo = process.env.EMAIL_TO || process.env.EMAIL_USER;

    // Admin notification — awaited so errors surface in logs
    try {
      await transporter.sendMail({
        from: `"Absolute Veritas Enquiry" <${process.env.EMAIL_FROM}>`,
        to: adminTo,
        replyTo: enquiry.email || process.env.EMAIL_FROM,
        subject: `New Enquiry from ${enquiry.name}${enquiry.category ? ' — ' + enquiry.category : ''}`,
        html: adminEmailHtml(enquiry),
      });
      console.log(`✅ Admin notification sent to ${adminTo}`);
    } catch (mailErr) {
      console.error('❌ Admin email failed:', mailErr.message);
    }

    // User confirmation — only if they provided an email
    if (enquiry.email) {
      try {
        await transporter.sendMail({
          from: `"Absolute Veritas" <${process.env.EMAIL_FROM}>`,
          to: enquiry.email,
          subject: 'We received your enquiry — Absolute Veritas',
          html: userConfirmationHtml(enquiry.name, enquiry.message),
        });
        console.log(`✅ Confirmation sent to ${enquiry.email}`);
      } catch (mailErr) {
        console.error('❌ User confirmation email failed:', mailErr.message);
      }
    }

    // Auto-subscribe the enquirer (silently — no welcome email, no errors surfaced)
    if (enquiry.email) {
      Subscriber.findOne({ email: enquiry.email.toLowerCase() })
        .then((existing) => {
          if (existing) {
            if (!existing.isActive) { existing.isActive = true; return existing.save(); }
            return; // already active — do nothing
          }
          return Subscriber.create({
            email:  enquiry.email.toLowerCase().trim(),
            name:   enquiry.name  || '',
            mobile: enquiry.phone || '',
          });
        })
        .catch((e) => console.error('Auto-subscribe failed:', e.message));
    }

    res.status(201).json({ message: 'Enquiry submitted successfully', id: enquiry._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const current = await Enquiry.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Enquiry not found' });

    // Once progressed beyond 'new', status cannot be set back to 'new'
    if (req.body.status === 'new' && current.status !== 'new') {
      return res.status(400).json({ message: 'Cannot revert a progressed enquiry back to New.' });
    }

    const allowed = {};
    if (req.body.status  !== undefined) allowed.status  = req.body.status;
    if (req.body.isRead  !== undefined) allowed.isRead  = req.body.isRead;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, allowed, { new: true });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
