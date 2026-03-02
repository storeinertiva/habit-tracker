const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Check .env values.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

async function sendPurchaseEmail({ toEmail, toName }) {
  const transporter = createTransporter();

  const fromName = process.env.FROM_NAME || 'Habit Tracker';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const supportEmail = process.env.SUPPORT_EMAIL || fromEmail;
  const subject = process.env.EMAIL_SUBJECT || 'Your Excel Habit Tracker is ready';

  const rawText = process.env.EMAIL_TEXT;
  const text = rawText
    ? rawText.replace(/\\n/g, '\n').replace(/{{name}}/g, toName || 'there')
    : (
      `Hi ${toName || 'there'},\n\n` +
      'Thank you for your purchase of the Excel Habit Tracker. Your file is attached.\n\n' +
      `If you have any questions, contact us at ${supportEmail}.\n\n` +
      'Best regards,\n' +
      `${fromName}\n`
    );

  const filePath = path.join(__dirname, 'uploads', 'habit-tracker.xlsx');
  const signatureLogoPath =
    process.env.SIGNATURE_LOGO_PATH ||
    path.join(__dirname, 'public', 'assets', 'signature-logo.png');

  const html = `
  <div style="font-family: Arial, sans-serif; color: #1e2a25; line-height: 1.6;">
    <p>Hi ${toName || 'there'},</p>
    <p>Thank you for purchasing the Excel Habit Tracker from Inertiva.</p>
    <p>Your file is attached to this email and ready to use.</p>

    <p style="font-weight: 700; margin: 18px 0 8px;">How to use the tracker</p>
    <ul style="margin: 0 0 18px 20px; padding: 0;">
      <li>Open the file in Microsoft Excel.</li>
      <li>Select the month from the dropdown at the top.</li>
      <li>For each day, simply mark or tick the habits you complete.</li>
      <li>All calculations, percentages, and visual progress indicators are automated.</li>
      <li>You can track your performance on a daily, weekly, and monthly basis without changing any formulas.</li>
    </ul>

    <p style="font-weight: 700; margin: 18px 0 8px;">Important usage notice</p>
    <ul style="margin: 0 0 18px 20px; padding: 0;">
      <li>This tracker is for personal use only.</li>
      <li>Redistribution, resale, sharing, or uploading this file (or any modified version of it) to any platform is not permitted.</li>
      <li>All formulas, layouts, and designs are the intellectual property of Inertiva and are protected under copyright.</li>
    </ul>

    <p>If you experience any issues, notice broken formulas, or have questions about usage, feel free to contact us at ${supportEmail}. We’re happy to help.</p>
    <p>We hope this tracker helps you stay consistent and make steady progress.</p>

    <div style="margin-top: 20px;">
      <p style="margin: 0;">Best regards,</p>
      <p style="margin: 0 0 6px; font-weight: 700;">Team Inertiva</p>
      <p style="margin: 0;"><a href="mailto:${supportEmail}" style="color: #1d73c5;">${supportEmail}</a></p>
      <img src="cid:signature-logo" alt="Inertiva logo" style="margin-top: 10px; width: 180px; height: auto;" />
    </div>
  </div>
  `;

  const attachments = [
    {
      filename: 'habit-tracker.xlsx',
      path: filePath
    }
  ];

  if (fs.existsSync(signatureLogoPath)) {
    attachments.push({
      filename: path.basename(signatureLogoPath),
      path: signatureLogoPath,
      cid: 'signature-logo'
    });
  }

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html,
    attachments
  });
}

module.exports = { sendPurchaseEmail };
