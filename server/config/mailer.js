const nodemailer = require('nodemailer');

const useBrevo  = !!process.env.BREVO_SMTP_KEY;
const useResend = !useBrevo &&
                  process.env.RESEND_API_KEY &&
                  !process.env.RESEND_API_KEY.startsWith('re_your');

let transporter;

if (useBrevo) {
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  transporter.verify((err) => {
    if (err) {
      console.error('\n❌ MAILER ERROR — emails will NOT be sent.');
      console.error('   Reason:', err.message);
      console.error('   Fix   : check BREVO_EMAIL / BREVO_SMTP_KEY in .env');
    } else {
      console.log('✅ Mailer ready — provider: Brevo');
    }
  });

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
