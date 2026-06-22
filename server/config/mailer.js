const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,        // STARTTLS on port 587
  requireTLS: true,     // force TLS upgrade — never fall back to plain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('\n❌ MAILER ERROR — emails will NOT be sent.');
    console.error('   Reason :', err.message);
    console.error('   Account:', process.env.EMAIL_USER);
    console.error('   Fix    : generate a fresh Gmail App Password at myaccount.google.com/apppasswords');
    console.error('            then set EMAIL_PASS=<16-char-password-no-spaces> in server/.env\n');
  } else {
    console.log(`✅ Mailer ready — sending as ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
  }
});

module.exports = transporter;
