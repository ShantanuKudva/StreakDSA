import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const subscription = await request.json();

        // Validate subscription object
        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        // Upsert the subscription (update if endpoint exists, create if not)
        await db.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: user.id,
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: user.id,
            },
        });

        // Update user preference to enable push notifications
        await db.user.update({
            where: { id: user.id },
            data: { pushNotifications: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Push subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { endpoint } = await request.json();

        if (endpoint) {
            // Delete specific subscription
            await db.pushSubscription.deleteMany({
                where: { endpoint, userId: user.id },
            });
        } else {
            // Delete all subscriptions for the user
            await db.pushSubscription.deleteMany({
                where: { userId: user.id },
            });
        }

        // Check if user has any remaining subscriptions
        const remainingCount = await db.pushSubscription.count({
            where: { userId: user.id },
        });

        if (remainingCount === 0) {
            await db.user.update({
                where: { id: user.id },
                data: { pushNotifications: false },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Push unsubscribe error:", error);
        return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }
}
