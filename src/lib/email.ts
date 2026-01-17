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
 * Clean, Minimalist Email Template
 */
// Theme Colors (Dark Mode)
const THEME = {
  bg: "#020617", // Slate 950
  card: "#0f172a", // Slate 900
  border: "#1e293b", // Slate 800
  text: "#f8fafc", // Slate 50
  textMuted: "#94a3b8", // Slate 400
  primary: "#f97316", // Orange 500
  primaryDark: "#ea580c", // Orange 600
  successBg: "rgba(16, 185, 129, 0.1)", // Green 500/10
  successBorder: "#059669", // Green 600
  successText: "#34d399", // Green 400
};

/**
 * Premium Dark Mode Email Template
 */
function emailTemplate(content: string, previewText: string = ""): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreakDSA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      background-color: ${THEME.bg};
      color: ${THEME.text};
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
    }
    .card {
      background: ${THEME.card};
      padding: 40px;
      border-radius: 16px;
      border: 1px solid ${THEME.border};
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: ${THEME.text};
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo span { color: ${THEME.primary}; }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark});
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
    }
    .button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .footer {
      text-align: center;
      color: ${THEME.textMuted};
      font-size: 13px;
      margin-top: 32px;
    }
    .footer a {
      color: ${THEME.textMuted};
      text-decoration: underline;
    }
    h1, h2, h3 { color: ${THEME.text}; margin-top: 0; }
    p { color: ${THEME.textMuted}; font-size: 16px; margin-bottom: 16px; }
    .link-fallback { color: ${THEME.primary}; word-break: break-all; font-size: 14px; }
    
    /* Utility for streak box */
    .streak-box {
        background: rgba(249, 115, 22, 0.1);
        border: 1px solid rgba(249, 115, 22, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 24px 0;
        text-align: center;
    }
    .streak-label {
        margin: 0;
        font-size: 12px;
        text-transform: uppercase;
        color: ${THEME.primary};
        font-weight: 600;
        letter-spacing: 1px;
    }
    .streak-value {
        margin: 8px 0 0 0;
        font-size: 42px;
        font-weight: 800;
        color: ${THEME.text};
    }
    
    @media (max-width: 600px) {
      .container { margin: 0; width: 100%; max-width: 100%; padding: 0; }
      .card { border-radius: 0; box-shadow: none; padding: 24px; border: none; }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span>🔥</span> StreakDSA
      </div>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} StreakDSA. Keep the streak alive.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const subject = "Verify your email";

  const content = `
    <h2 style="text-align: center; margin-bottom: 24px;">Welcome to StreakDSA!</h2>
    <p>Thanks for signing up. Please verify your email address to secure your account and access all features.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p style="text-align: center; font-size: 14px; margin-top: 24px;">
      Or paste this link in your browser:<br>
      <a href="${verificationUrl}" class="link-fallback">${verificationUrl}</a>
    </p>
  `;

  return sendEmail({
    to: email,
    subject,
    html: emailTemplate(content, "Please verify your email address.")
  });
}

/**
 * Send a streak reminder email
 */
export type ReminderType = 'gentle' | 'reminder' | 'urgent' | 'final';

const REMINDER_SUBJECTS: Record<ReminderType, string> = {
  gentle: "☀️ Just checking in",
  reminder: "🔥 Don't break your streak!",
  urgent: "⏰ Deadline approaching!",
  final: "🚨 Last chance to keep your streak!",
};

const REMINDER_HEADERS: Record<ReminderType, string> = {
  gentle: "Good afternoon!",
  reminder: "Don't let it break!",
  urgent: "Hours left!",
  final: "Final Call!",
};

/**
 * Send a streak reminder email
 */
export async function sendStreakReminderEmail(
  email: string,
  name: string,
  currentStreak: number = 0,
  type: ReminderType = 'reminder'
): Promise<boolean> {
  const subject = REMINDER_SUBJECTS[type];
  const header = REMINDER_HEADERS[type];
  const nameStr = name || "there";

  const content = `
    <h2 style="text-align: center;">${header}</h2>
    <p style="text-align: center;">Hey ${nameStr}! You haven't checked in today.</p>
    
    ${currentStreak > 0 ? `
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #059669; font-weight: 600;">Current Streak</p>
      <p style="margin: 4px 0 0 0; font-size: 36px; font-weight: 800; color: #10b981;">${currentStreak} Days</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="https://streakdsa.com/dashboard" class="button">Check In Now</a>
    </div>
  `;

  return sendEmail({
    to: email, // Changed from bcc to to for better deliverability/testing
    subject,
    html: emailTemplate(content, `Your ${currentStreak}-day streak is at risk!`)
  });
}

/**
 * Send a milestone email
 */
export async function sendMilestoneEmail(
  email: string,
  name: string,
  milestone: number
): Promise<boolean> {
  const subject = `🎉 You hit a ${milestone}-day streak!`;
  const nameStr = name || "Champion";

  const content = `
    <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🏆</div>
    <h2 style="text-align: center;">Incredible work, ${nameStr}!</h2>
    <p style="text-align: center;">You've just reached a massive milestone.</p>
    
    <div style="background: #faf5ff; border: 1px solid #8b5cf6; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #7c3aed; font-weight: 600;">Achievement Unlocked</p>
      <p style="margin: 4px 0 0 0; font-size: 48px; font-weight: 800; color: #8b5cf6;">${milestone} Days</p>
    </div>

    <div style="text-align: center;">
      <a href="https://streakdsa.com/profile" class="button" style="background-color: #8b5cf6;">View Profile</a>
    </div>
  `;

  return sendEmail({
    bcc: email,
    subject,
    html: emailTemplate(content, `Congratulations on reaching ${milestone} days!`)
  });
}
/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const subject = "Reset Your Password - StreakDSA";

  const html = emailTemplate(`
        <div style="text-align: center;">
            <h2>Reset Your Password 🔐</h2>
            <p>You requested a password reset. Click the button below to choose a new password.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p class="link-fallback">
                Or copy this link: <br>
                <a href="${resetUrl}">${resetUrl}</a>
            </p>
        </div>
    `, "Reset your StreakDSA password");

  return sendEmail({ to: email, subject, html });
}

/**
 * Send Streak Freeze Used Email
 */
export async function sendStreakFreezeUsedEmail(
  email: string,
  name: string,
  remainingFreezes: number
): Promise<boolean> {
  const subject = "❄️ Streak Freeze Used";
  const nameStr = name || "there";

  const content = `
    <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">❄️</div>
    <h2 style="text-align: center;">You're safe!</h2>
    <p style="text-align: center;">Hey ${nameStr}, we noticed you missed your check-in today, so we used a <b>Streak Freeze</b> to save your progress.</p>
    
    <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #0ea5e9; font-weight: 600;">Remaining Freezes</p>
      <p style="margin: 4px 0 0 0; font-size: 36px; font-weight: 800; color: #0ea5e9;">${remainingFreezes}</p>
    </div>

    <p style="text-align: center;">Don't forget to check in tomorrow to keep the flame alive!</p>

    <div style="text-align: center;">
      <a href="https://streakdsa.com/dashboard" class="button" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">Go to Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html: emailTemplate(content, "A streak freeze was used to save your progress!")
  });
}

/**
 * Send Pledge Completed Email
 */
export async function sendPledgeCompletedEmail(
  email: string,
  name: string,
  totalDays: number
): Promise<boolean> {
  const subject = "🏁 Mission Accomplished!";
  const nameStr = name || "Champion";

  const content = `
    <div style="text-align: center; font-size: 48px; margin-bottom: 24px;">🎉</div>
    <h2 style="text-align: center;">You did it, ${nameStr}!</h2>
    <p style="text-align: center;">You have officially completed your <b>${totalDays}-day</b> commitment. This is a massive achievement!</p>
    
    <div class="streak-box">
        <p class="streak-label">Final Streak</p>
        <p class="streak-value">${totalDays} Days</p>
    </div>

    <p style="text-align: center;">Your consistency is inspiring. What's next? You can set a new pledge or keep pushing your current streak even further.</p>

    <div style="text-align: center;">
      <a href="https://streakdsa.com/dashboard" class="button">Set a New Goal</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html: emailTemplate(content, `Congratulations! You've completed your ${totalDays}-day pledge.`)
  });
}

/**
 * Send Streak Lost Email
 */
export async function sendStreakLostEmail(
  email: string,
  name: string,
  lostStreak: number
): Promise<boolean> {
  const subject = "🧊 Your streak has melted...";
  const nameStr = name || "there";

  const content = `
    <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">💨</div>
    <h2 style="text-align: center;">It's okay, ${nameStr}.</h2>
    <p style="text-align: center;">Your <b>${lostStreak}-day</b> streak has come to an end. It happens to the best of us.</p>
    
    <div style="background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600;">Streak Lost</p>
      <p style="margin: 4px 0 0 0; font-size: 36px; font-weight: 800; color: #64748b;">0 Days</p>
    </div>

    <p style="text-align: center;">The best way to get over it? <b>Start a new one today.</b></p>

    <div style="text-align: center;">
      <a href="https://streakdsa.com/dashboard" class="button">Start New Streak</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html: emailTemplate(content, "Don't let one bad day stop your progress.")
  });
}
