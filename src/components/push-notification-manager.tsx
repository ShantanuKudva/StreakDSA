"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Check if push notifications are supported
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        } else {
            setIsLoading(false);
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const reg = await navigator.serviceWorker.register("/sw.js");
            setRegistration(reg);

            // Check if already subscribed
            const subscription = await reg.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error("Service worker registration failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function subscribe() {
        if (!registration) return;

        setIsLoading(true);
        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error("Notification permission denied");
                setIsLoading(false);
                return;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                toast.error("Push notifications not configured");
                setIsLoading(false);
                return;
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
            });

            // Send subscription to server
            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription.toJSON()),
            });

            if (response.ok) {
                setIsSubscribed(true);
                toast.success("Push notifications enabled!");
            } else {
                throw new Error("Failed to save subscription");
            }
        } catch (error) {
            console.error("Subscribe error:", error);
            toast.error("Failed to enable notifications");
        } finally {
            setIsLoading(false);
        }
    }

    async function unsubscribe() {
        if (!registration) return;

        setIsLoading(true);
        try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                // Notify server
                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setIsSubscribed(false);
            toast.success("Push notifications disabled");
        } catch (error) {
            console.error("Unsubscribe error:", error);
            toast.error("Failed to disable notifications");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isSupported) {
        return null; // Don't show anything if not supported
    }

    return (
        <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
                <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                </>
            )}
        </Button>
    );
}
