import webPush from "web-push";

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails(
        "mailto:admin@streakdsa.com", // Replace with your contact email
        vapidPublicKey,
        vapidPrivateKey
    );
}

export interface PushPayload {
    title: string;
    body: string;
    url?: string;
    actions?: { action: string; title: string }[];
}

export interface PushSubscriptionData {
    endpoint: string;
    p256dh: string;
    auth: string;
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<boolean> {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn("VAPID keys not configured. Skipping push notification.");
        return false;
    }

    try {
        await webPush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            },
            JSON.stringify(payload)
        );
        return true;
    } catch (error: unknown) {
        // If subscription is expired or invalid, return false to allow cleanup
        if (error && typeof error === "object" && "statusCode" in error) {
            const statusCode = (error as { statusCode: number }).statusCode;
            if (statusCode === 404 || statusCode === 410) {
                console.log("Push subscription expired or invalid:", subscription.endpoint);
                return false;
            }
        }
        console.error("Push notification error:", error);
        throw error;
    }
}
