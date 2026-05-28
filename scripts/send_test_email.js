/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');

async function main(){
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if(!user || !pass){
    console.error('SMTP_USER or SMTP_PASS missing in .env.local');
    process.exit(2);
  }

  const transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass }
  });

  try{
    const info = await transporter.sendMail({
      from: `${user}`,
      to: user,
      subject: 'Negosyante Island — SMTP Test',
      text: 'This is a test message sent from the local test script.',
      html: '<p>This is a <strong>test</strong> message sent from the local test script.</p>'
    });
    console.log('Message sent:', info.messageId);
    console.log('Response:', info.response || '(no response)');
    process.exit(0);
  }catch(err){
    console.error('Send failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
