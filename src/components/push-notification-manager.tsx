"use client";

import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PushNotificationManager() {
    const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    if (!isSupported) {
        return null;
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
