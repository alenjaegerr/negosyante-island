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

async function sendWithSendGrid(input: { to: string; subject: string; text: string; html: string }) {
  const key = process.env.SENDGRID_API_KEY?.trim();
  const from = process.env.SENDGRID_FROM?.trim() || process.env.SMTP_FROM?.trim();
  if (!key || !from) return null;

  const body = {
    personalizations: [{ to: [{ email: input.to }] }],
    from: { email: from },
    subject: input.subject,
    content: [
      { type: "text/plain", value: input.text },
      { type: "text/html", value: input.html },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("SendGrid send failed:", res.status, txt);
    return { sent: false as const };
  }

  return { sent: true as const };
}

export async function sendTransactionalEmail(input: { to: string; subject: string; text: string; html: string }) {
  // Priority: SendGrid API if configured (recommended for serverless/Netlify)
  try {
    const sg = await sendWithSendGrid(input);
    if (sg) return sg;
  } catch (err) {
    console.error("SendGrid error:", err);
  }

  // Fallback to SMTP via nodemailer
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
