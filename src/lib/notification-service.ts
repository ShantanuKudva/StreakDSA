import { db } from "@/lib/db";
import { sendPushNotification, PushPayload } from "@/lib/web-push";
import { sendEmail, EmailPayload } from "@/lib/email";

export interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    html?: string;
}

interface PushSubscriptionData {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

/**
 * Send a notification to a user via all their enabled channels
 */
export async function sendNotification(
    userId: string,
    payload: NotificationPayload
): Promise<{ push: boolean; email: boolean }> {
    // Get user with email notifications check
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            emailNotifications: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const results = { push: false, email: false };

    // Note: Push subscriptions will be queried separately once DB migration runs
    // For now, focus on email notifications

    // Send email notification
    if (user.emailNotifications && user.email) {
        const emailPayload: EmailPayload = {
            bcc: user.email, // Use BCC for privacy
            subject: payload.title,
            html:
                payload.html ||
                `
        <div style="font-family: sans-serif; color: #333;">
          <h1>${payload.title}</h1>
          <p>${payload.body}</p>
          ${payload.url ? `<p><a href="${payload.url}">View in StreakDSA</a></p>` : ""}
        </div>
      `,
        };

        try {
            results.email = await sendEmail(emailPayload);
        } catch {
            console.error("Email notification failed for user:", userId);
        }
    }

    return results;
}

/**
 * Send streak reminder to a user
 */
export async function sendStreakReminder(userId: string): Promise<void> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            currentStreak: true,
            emailNotifications: true,
        },
    });

    if (!user) return;

    // Import the email function with premium template
    const { sendStreakReminderEmail } = await import("@/lib/email");

    // Send email with premium template (BCC for privacy)
    if (user.emailNotifications && user.email) {
        await sendStreakReminderEmail(user.email, user.name || "", user.currentStreak);
    }

    // Note: Push notifications will be added once DB migration runs
    // The pushSubscriptions table and pushNotifications field need to exist first
}

// Export types for use elsewhere
export type { PushSubscriptionData };
