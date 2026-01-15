import nodemailer from "nodemailer";

// Initialize nodemailer transporter
const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    : null;

export interface EmailPayload {
    to?: string;
    bcc?: string | string[];
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using Nodemailer (SMTP)
 * Uses BCC by default to protect recipient privacy
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!transporter) {
        console.warn("SMTP not configured. Skipping email.");
        return false;
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "StreakDSA <noreply@streakdsa.com>",
            to: payload.to,
            bcc: payload.bcc,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
        });
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        throw error;
    }
}

/**
 * Base email template with modern dark theme design
 */
function emailTemplate(content: string, previewText: string = ""): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>StreakDSA</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .fallback-font { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
  <style>
    :root {
      color-scheme: dark light;
      supported-color-schemes: dark light;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(180deg, #18181b 0%, #0f0f10 100%);
    }
    .header {
      padding: 32px 40px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px 0;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #a1a1aa;
      margin: 0 0 24px 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .streak-number {
      font-size: 48px;
      font-weight: 800;
      color: #10b981;
      text-align: center;
      margin: 0;
    }
    .streak-label {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff !important;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      margin: 16px 0;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .cta-button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      margin: 32px 0;
    }
    .footer {
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .footer-text {
      font-size: 12px;
      color: #52525b;
      margin: 0;
    }
    .footer-link {
      color: #71717a;
      text-decoration: none;
    }
    .emoji {
      font-size: 32px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #0a0a0b;">
  <!-- Preview text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0b;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #18181b 0%, #0f0f10 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05);">
          <!-- Header -->
          <tr>
            <td class="header" style="padding: 32px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <span class="logo" style="font-size: 24px; font-weight: 800; color: #10b981;">🔥 StreakDSA</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer" style="padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p class="footer-text" style="font-size: 12px; color: #52525b; margin: 0;">
                You're receiving this because you have notifications enabled on StreakDSA.
                <br><br>
                <a href="https://streakdsa.com/profile" class="footer-link" style="color: #71717a; text-decoration: none;">Manage preferences</a>
                &nbsp;•&nbsp;
                <a href="https://streakdsa.com" class="footer-link" style="color: #71717a; text-decoration: none;">Visit StreakDSA</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Send a streak reminder email (BCC for privacy)
 */
export async function sendStreakReminderEmail(
    email: string,
    name: string,
    currentStreak?: number
): Promise<boolean> {
    const subject = "Keep your streak alive! 🔥";
    const previewText = `Hey ${name || "there"}, you haven't checked in today. Don't break your streak!`;

    const content = `
    <div class="emoji" style="font-size: 32px; margin-bottom: 16px; text-align: center;">⚡</div>
    <h1 class="greeting" style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; text-align: center;">
      Hey ${name || "there"}!
    </h1>
    <p class="message" style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0; text-align: center;">
      You haven't checked in today yet. Don't let your streak break!
    </p>
    
    ${currentStreak
            ? `
    <div class="highlight-box" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p class="streak-label" style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Current Streak</p>
      <p class="streak-number" style="font-size: 48px; font-weight: 800; color: #10b981; margin: 0;">${currentStreak} days</p>
    </div>
    `
            : ""
        }
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://streakdsa.com/dashboard" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
        Check In Now →
      </a>
    </div>
    
    <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 32px 0;"></div>
    
    <p class="message" style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0; text-align: center;">
      Keep grinding! Every day counts. 💪
    </p>
  `;

    const html = emailTemplate(content, previewText);

    // Use BCC for privacy
    return sendEmail({ bcc: email, subject, html });
}

/**
 * Send a streak milestone celebration email (BCC for privacy)
 */
export async function sendMilestoneEmail(
    email: string,
    name: string,
    milestone: number
): Promise<boolean> {
    const subject = `🎉 Incredible! You've hit ${milestone} days!`;
    const previewText = `Congratulations ${name || "there"}! You've reached a ${milestone}-day streak!`;

    const content = `
    <div class="emoji" style="font-size: 48px; margin-bottom: 16px; text-align: center;">🎉</div>
    <h1 class="greeting" style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; text-align: center;">
      Congratulations, ${name || "Champion"}!
    </h1>
    <p class="message" style="font-size: 18px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0; text-align: center;">
      You've just hit an incredible milestone!
    </p>
    
    <div class="highlight-box" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
      <p class="streak-label" style="font-size: 14px; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">🏆 Achievement Unlocked</p>
      <p class="streak-number" style="font-size: 56px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">${milestone} Days!</p>
    </div>
    
    <p class="message" style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 24px 0; text-align: center;">
      Your dedication is truly inspiring. Keep pushing forward!
    </p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://streakdsa.com/profile" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);">
        View Your Profile →
      </a>
    </div>
  `;

    const html = emailTemplate(content, previewText);

    return sendEmail({ bcc: email, subject, html });
}
