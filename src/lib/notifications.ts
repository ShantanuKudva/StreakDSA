import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Skipping email sending.");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: "StreakDSA <noreply@streakdsa.com>", // Update with verified domain
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendStreakReminder(email: string, name: string) {
  const subject = "Keep your streak alive! 🔥";
  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Hey ${name || "there"},</h1>
      <p>You haven't checked in today yet. Don't let your streak break!</p>
      <p>
        <a href="https://streakdsa.com/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Check In Now
        </a>
      </p>
      <p>Keep grinding,</p>
      <p>The StreakDSA Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}
