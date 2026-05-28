import nodemailer from "nodemailer";

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

function getSmtpTransportConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    from,
  };
}

let transportPromise: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  const config = getSmtpTransportConfig();
  if (!config) return null;

  if (!transportPromise) {
    transportPromise = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  return { transport: transportPromise, from: config.from };
}

export async function sendTransactionalEmail(input: { to: string; subject: string; text: string; html: string }) {
  const transportInfo = getTransport();
  if (!transportInfo) {
    console.info("[mail:dev]", { to: input.to, subject: input.subject, text: input.text, html: input.html, appUrl });
    return { sent: false as const };
  }

  const transport = transportInfo.transport;
  await transport.sendMail({
    from: transportInfo.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { sent: true as const };
}
