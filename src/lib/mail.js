// lib/mail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAccountApprovedEmail({ to, name }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your account has been approved",
    html: `
      <p>Hi ${name || ""},</p>
      <p>Your account has been approved by the administrator.</p>
      <p>You can now log in to the platform:</p>
      <p><a href="${appUrl}/log-in" target="_blank" rel="noreferrer">Log in to your account</a></p>
      <p>If you did not request this account, you can ignore this email.</p>
    `,
  });
}

export async function sendAccountRejectedEmail({ to, name }) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your account request was rejected",
    html: `
      <p>Hi ${name || ""},</p>
      <p>We’re sorry, but your account request has been rejected by the administrator.</p>
      <p>You will not be able to use this email address to sign up or log in to the platform.</p>
      <p>If you believe this is a mistake, please contact the school administration.</p>
    `,
  });
}
