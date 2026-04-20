'use strict';

/**
 * Basit mail gönderim katmanı.
 * - Eğer SMTP env değişkenleri tanımlıysa nodemailer ile gerçek mail gönderir.
 * - Aksi halde development modunda mail içeriğini console'a basar.
 *
 * Frontend / business logic, mail gönderim katmanı detaylarını bilmemelidir;
 * sadece sendMail({ to, subject, text, html }) çağrılır.
 */

let transporter = null;

const getTransporter = () => {
  if (transporter !== null) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = false; // konfigüre değil
    return transporter;
  }
  try {
    // eslint-disable-next-line global-require
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    return transporter;
  } catch (err) {
    console.warn('[mailer] nodemailer kurulu değil, fallback (console) kullanılacak:', err.message);
    transporter = false;
    return transporter;
  }
};

const sendMail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log('\n[mail:dev] ───────────────────────────────────────────');
    console.log(`[mail:dev] Kime: ${to}`);
    console.log(`[mail:dev] Konu: ${subject}`);
    console.log(`[mail:dev] İçerik:\n${text || html}`);
    console.log('[mail:dev] ───────────────────────────────────────────\n');
    return { mocked: true };
  }
  return t.sendMail({
    from: process.env.SMTP_FROM || 'PDR Danışmanlık <noreply@pdr.local>',
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendMail };
