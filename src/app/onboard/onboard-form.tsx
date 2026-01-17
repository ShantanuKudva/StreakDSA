"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, Loader2, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function OnboardForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [pledgeDays, setPledgeDays] = useState("75");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [timezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  // Push Notification State
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && pledgeDays && startDate) {
      setStep(2);
    }
  };

  const enablePushNotifications = async () => {
    setIsSubscribing(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Push notifications are not supported on this device");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        // Should hopefully be set
        console.warn("VAPID Key missing");
      }

      // Convert VAPID key
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      if (vapidPublicKey) {
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Send to server
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });

        setPushEnabled(true);
        toast.success("Notifications enabled!");
      }

    } catch (error) {
      console.error("Push setup failed:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Call the correct onboarding endpoint
      const res = await fetch("/api/user/onboard", {
        method: "POST", // POST for onboarding
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pledgeDays: parseInt(pledgeDays),
          startDate: startDate.toISOString(),
          timezone,
          reminderTime: "22:00", // Default regular schedule
          pushNotifications: pushEnabled,
          emailNotifications: true, // Default enable
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      toast.success("Welcome aboard! 🚀");
      router.push("/dashboard"); // Go to dashboard
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? "Welcome to StreakDSA" : "Stay Consistent"}
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            {step === 1
              ? "Set up your profile and commit to the grind."
              : "Enable notifications to never miss a day."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="How should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label>Pledge Duration</Label>
                <Select value={pledgeDays} onValueChange={setPledgeDays}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectItem value="30">30 Days (Warmup)</SelectItem>
                    <SelectItem value="75">75 Days (Hard Mode)</SelectItem>
                    <SelectItem value="100">100 Days (Expert)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(d) => d && setStartDate(d)}
                      initialFocus
                      className="text-zinc-100 bg-zinc-900"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Timezone</Label>
                <div className="p-2 rounded border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
                  {timezone} (Auto-detected)
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Next Step
              </Button>
            </form>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-pulse"></div>
                    <Bell className={cn("h-10 w-10", pushEnabled ? "text-emerald-500" : "text-zinc-400")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Never Miss a Streak</h3>
                  <p className="text-sm text-zinc-400 max-w-[260px] mx-auto">
                    We&apos;ll send you reminders at 12 PM, 6 PM, 9 PM, and 11 PM if you haven&apos;t checked in.
                  </p>
                </div>

                {!pushEnabled ? (
                  <Button
                    onClick={enablePushNotifications}
                    disabled={isSubscribing}
                    variant="outline"
                    className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    {isSubscribing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="mr-2 h-4 w-4" />
                    )}
                    Enable Notifications
                  </Button>
                ) : (
                  <div className="text-emerald-500 flex items-center bg-emerald-500/10 px-4 py-2 rounded-full text-sm font-medium">
                    <Loader2 className="w-0 h-0" /> {/* Hack to keep import used if needed, or remove */}
                    ✨ Notifications Enabled
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Complete Setup
                </Button>
                {!pushEnabled && (
                  <p className="text-center text-xs text-zinc-500">
                    You can always enable this later in settings.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
