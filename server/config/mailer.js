const nodemailer = require('nodemailer');

const useResend = process.env.RESEND_API_KEY &&
                  !process.env.RESEND_API_KEY.startsWith('re_your');

let transporter;

if (useResend) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Wrap Resend HTTP API in a nodemailer-compatible interface
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
      console.error('   Fix   : check EMAIL_USER / EMAIL_PASS (Gmail App Password) in .env');
      console.error();
    } else {
      console.log('✅ Mailer ready — provider: Gmail');
    }
  });
}

module.exports = transporter;
