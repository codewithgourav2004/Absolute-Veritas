const nodemailer = require('nodemailer');
const https = require('https');

const useBrevo  = !!process.env.BREVO_SMTP_KEY;
const useResend = !useBrevo &&
                  process.env.RESEND_API_KEY &&
                  !process.env.RESEND_API_KEY.startsWith('re_your');

// Brevo REST API call (port 443 — works on Render free tier)
const sendViaBrevo = (from, to, subject, html, attachments) => new Promise((resolve, reject) => {
  const fromEmail = from.match(/<(.+)>/)?.[1] || from;
  const fromName  = from.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() || 'Absolute Veritas';
  const toArr     = Array.isArray(to) ? to : [to];

  const payload = {
    sender:      { name: fromName, email: fromEmail },
    to:          toArr.map(e => ({ email: e })),
    subject,
    htmlContent: html,
  };

  if (attachments && attachments.length) {
    payload.attachment = attachments.map(a => ({
      name:    a.filename || a.name,
      content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
    }));
  }

  const body = JSON.stringify(payload);

  const req = https.request({
    hostname: 'api.brevo.com',
    path:     '/v3/smtp/email',
    method:   'POST',
    headers:  {
      'api-key':       process.env.BREVO_SMTP_KEY,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(data));
      else reject(new Error(`Brevo API ${res.statusCode}: ${data}`));
    });
  });

  req.on('error', reject);
  req.write(body);
  req.end();
});

let transporter;

if (useBrevo) {
  transporter = {
    sendMail: ({ from, to, subject, html, attachments }) => sendViaBrevo(from, to, subject, html, attachments),
    verify:   (cb) => cb(null),
  };
  console.log('✅ Mailer ready — provider: Brevo (HTTP API)');

} else if (useResend) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  transporter = {
    sendMail: async ({ from, to, subject, html }) => {
      const { data, error } = await resend.emails.send({ from, to, subject, html });
      if (error) throw new Error(error.message);
      return data;
    },
    verify: (cb) => cb(null),
  };
  console.log('✅ Mailer ready — provider: Resend (HTTP API)');

} else {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((err) => {
    if (err) {
      console.error('\n❌ MAILER ERROR — emails will NOT be sent.');
      console.error('   Reason:', err.message);
      console.error('   Fix   : check EMAIL_USER / EMAIL_PASS in .env');
    } else {
      console.log('✅ Mailer ready — provider: Gmail');
    }
  });
}

module.exports = transporter;
