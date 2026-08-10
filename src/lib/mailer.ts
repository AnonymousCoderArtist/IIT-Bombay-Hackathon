import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM ?? "noreply@smartcampus.dev";

const transport = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

export async function sendMail({ to, subject, text, html }: MailOptions) {
  if (!transport) {
    console.log(`[mail:${to}] ${subject}\n${text}`);
    return { delivered: false, preview: true };
  }

  await transport.sendMail({
    from: `"Smart Campus" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true, preview: false };
}
