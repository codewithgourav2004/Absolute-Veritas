const nodemailer = require('nodemailer');

// Use Resend in production (set RESEND_API_KEY in env), Gmail locally
const useResend = process.env.RESEND_API_KEY &&
                  !process.env.RESEND_API_KEY.startsWith('re_your');

const transporter = useResend
  ? nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    })
  : nodemailer.createTransport({
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
    if (useResend) {
      console.error('   Fix   : check RESEND_API_KEY in .env');
    } else {
      console.error('   Fix   : check EMAIL_USER / EMAIL_PASS (Gmail App Password) in .env');
    }
    console.error();
  } else {
    console.log(`✅ Mailer ready — provider: ${useResend ? 'Resend' : 'Gmail'}`);
  }
});

module.exports = transporter;
