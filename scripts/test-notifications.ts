/**
 * Test ALL Push Notification Types
 * 
 * Usage: npx tsx scripts/test-notifications.ts
 */

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// All push notification types the system sends
const NOTIFICATION_TYPES = [
    {
        name: "Gentle Reminder (12 PM)",
        payload: {
            title: "☀️ Streak Reminder",
            body: "Good afternoon! Don't forget to solve your DSA problems today.",
            url: "/dashboard"
        }
    },
    {
        name: "Standard Reminder (6 PM)",
        payload: {
            title: "🔥 Streak Reminder",
            body: "Don't break your 42-day streak! Check in now.",
            url: "/dashboard"
        }
    },
    {
        name: "Urgent Reminder (9 PM)",
        payload: {
            title: "⏰ Streak Reminder",
            body: "Only 3 hours left! Keep your streak alive.",
            url: "/dashboard"
        }
    },
    {
        name: "Final Warning (11 PM)",
        payload: {
            title: "🚨 Final Call!",
            body: "Last chance to save your streak! 1 hour remaining.",
            url: "/dashboard"
        }
    },
    {
        name: "Milestone Achieved",
        payload: {
            title: "🎉 Milestone Unlocked!",
            body: "You've hit a 30-day streak! +50 gems earned.",
            url: "/profile"
        }
    },
    {
        name: "Streak Freeze Used",
        payload: {
            title: "❄️ Freeze Activated",
            body: "We saved your streak using 1 freeze. 2 remaining.",
            url: "/dashboard"
        }
    },
    {
        name: "Pledge Completed",
        payload: {
            title: "🏁 Mission Accomplished!",
            body: "You completed your 75-day pledge. Incredible!",
            url: "/profile"
        }
    },
    {
        name: "Streak Lost",
        payload: {
            title: "💨 Streak Reset",
            body: "Your 12-day streak has ended. Start fresh today!",
            url: "/dashboard"
        }
    }
];

async function runTests() {
    console.log("🚀 Push Notification Test - ALL TYPES");
    console.log("==========================================\n");

    const { db } = await import("../src/lib/db");
    const webpush = (await import("web-push")).default;

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.log("❌ VAPID keys missing. Cannot send push.\n");
        process.exit(1);
    }

    webpush.setVapidDetails(
        "mailto:support@streakdsa.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    const subscriptions = await db.pushSubscription.findMany({
        include: { user: { select: { email: true } } }
    });

    if (subscriptions.length === 0) {
        console.log("⚠️  No push subscriptions found. Enable push in Profile first.");
        process.exit(0);
    }

    console.log(`📡 Found ${subscriptions.length} subscription(s)`);
    console.log(`📤 Sending ${NOTIFICATION_TYPES.length} notification types...\n`);

    // Use first valid subscription
    const sub = subscriptions[0];
    const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
    };

    for (let i = 0; i < NOTIFICATION_TYPES.length; i++) {
        const notif = NOTIFICATION_TYPES[i];
        console.log(`[${i + 1}/${NOTIFICATION_TYPES.length}] ${notif.name}`);
        console.log(`    Title: ${notif.payload.title}`);
        console.log(`    Body:  ${notif.payload.body}`);

        try {
            await webpush.sendNotification(subscription, JSON.stringify(notif.payload));
            console.log(`    ✅ Sent!\n`);
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                console.log(`    ❌ Subscription expired\n`);
                break;
            }
            console.log(`    ❌ Failed: ${error.message}\n`);
        }

        // Wait 2 seconds between notifications so they don't stack
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("==========================================");
    console.log("✅ All notification types sent!");
    console.log("   Check your browser/device for the notifications.");

    await db.$disconnect();
}

runTests().catch(console.error);
