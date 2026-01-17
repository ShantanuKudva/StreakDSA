import { useState, useEffect } from "react";
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

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
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

            // Wait for service worker to actually be active
            if (reg.installing) {
                await new Promise<void>((resolve) => {
                    const worker = reg.installing;
                    if (worker) {
                        worker.addEventListener('statechange', () => {
                            if (worker.state === 'activated') resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            }

            const subscription = await reg.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error("Service worker registration failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function subscribe() {
        if (!isSupported) return false;

        setIsLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error("Notification permission denied");
                setIsLoading(false);
                return false;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                toast.error("Push notifications not configured");
                setIsLoading(false);
                return false;
            }

            // use safe ready registration
            const reg = await navigator.serviceWorker.ready;

            // Always unsubscribe existing first to force fresh key if needed
            const existingSub = await reg.pushManager.getSubscription();
            if (existingSub) {
                await existingSub.unsubscribe();
            }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
            });

            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription.toJSON()),
            });

            if (response.ok) {
                setIsSubscribed(true);
                toast.success("Push notifications enabled!");
                return true;
            } else {
                throw new Error("Failed to save subscription");
            }
        } catch (error: unknown) {
            console.error("Subscribe error:", error);

            // Handle key rotation/mismatch specifically
            if (error instanceof Error && error.name === 'InvalidStateError') {
                toast.error("Key mismatch. Please refreshing the page.");
                // Attempt one more proactive cleanup
                try {
                    const reg = await navigator.serviceWorker.ready;
                    const sub = await reg.pushManager.getSubscription();
                    if (sub) await sub.unsubscribe();
                } catch (e) { console.error("Cleanup failed", e); }
            } else {
                toast.error("Failed to enable notifications");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function unsubscribe() {
        if (!isSupported) return false;

        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setIsSubscribed(false);
            toast.success("Push notifications disabled");
            return true;
        } catch (error) {
            console.error("Unsubscribe error:", error);
            toast.error("Failed to disable notifications");
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isSupported,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe
    };
}
