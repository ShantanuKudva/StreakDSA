"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Flame,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bell,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PLEDGE_OPTIONS = [
  { value: "30", label: "30 Days (Warmup)", desc: "Build the habit." },
  { value: "60", label: "60 Days (Solid)", desc: "See real progress." },
  { value: "90", label: "90 Days (Expert)", desc: "Transform your skills." },
  { value: "180", label: "180 Days (Master)", desc: "Career changing." },
];

const getTimezoneOptions = () => {
  try {
    return Intl.supportedValuesOf("timeZone").map((tz) => {
      const offset = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value;

      const formattedOffset = offset ? `(${offset.replace("GMT", "UTC")})` : "";

      return {
        value: tz,
        label: `${formattedOffset} ${tz.replace(/_/g, " ")}`,
        offset: offset || "",
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

export function OnboardingWizard() {
  const { update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [pledgeDays, setPledgeDays] = useState("90");
  const [timezone, setTimezone] = useState("");
  const [reminderTime] = useState("22:00"); // Default kept for backend compatibility

  // Notification Preferences
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Warning Dialog State
  const [showWarning, setShowWarning] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<"email" | "push" | null>(null);

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected || "UTC");
    } catch (e) {
      console.error("Timezone detection failed", e);
      setTimezone("UTC");
    }
  }, []);

  const handleNext = () => {
    if (step === 1 && !name) {
      toast.error("Please enter your name");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleToggle = async (type: "email" | "push", secureValue: boolean) => {
    // If turning ON
    if (secureValue) {
      if (type === "email") {
        setEmailEnabled(true);
      } else {
        // Push logic
        try {
          if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            toast.error("Push notifications not supported");
            return;
          }
          const reg = await navigator.serviceWorker.register("/sw.js");
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (vapidKey) {
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

              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
              });

              await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub.toJSON()),
              });

              setPushEnabled(true);
              toast.success("Push notifications enabled!");
            }
          } else {
            toast.error("Permission denied");
          }
        } catch (e) {
          console.error(e);
          toast.error("Failed to enable notifications");
        }
      }
      return;
    }

    // If turning OFF
    const otherEnabled = type === "email" ? pushEnabled : emailEnabled;
    if (!otherEnabled) {
      setPendingDisable(type);
      setShowWarning(true);
    } else {
      if (type === "email") setEmailEnabled(false);
      else setPushEnabled(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pledgeDays: parseInt(pledgeDays),
          timezone,
          reminderTime,
          emailNotifications: emailEnabled,
          pushNotifications: pushEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Welcome to the Streak!");
        // Update session immediately
        await update({ isOnboarded: true });
        router.push(`/${data.data.id}/dashboard`);
      } else {
        toast.error(data.error?.message || "Failed to start pledge");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= s
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-slate-800 text-slate-500"
              )}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span
              className={cn(
                "text-xs",
                step >= s ? "text-orange-400" : "text-slate-600"
              )}
            >
              {s === 1 ? "Commitment" : s === 2 ? "Logistics" : "Preferences"}
            </span>
          </div>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            {step === 1 && "Make the Pledge"}
            {step === 2 && "Set Your Schedule"}
            {step === 3 && "Stay Accountable"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 && "Define your commitment level."}
            {step === 2 && "When should we check on you?"}
            {step === 3 && "How should we remind you?"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* STEP 1: COMMITMENT */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-950 border-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Duration</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {PLEDGE_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => setPledgeDays(opt.value)}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all",
                            pledgeDays === opt.value
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-slate-800 bg-slate-950 hover:border-slate-700"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-white">
                              {opt.label}
                            </span>
                            {pledgeDays === opt.value && (
                              <Flame className="w-5 h-5 text-orange-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {opt.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOGISTICS */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 h-10 w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="h-[300px]">
                        {getTimezoneOptions().map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      We use this to track your daily streak deadline (Midnight).
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: PREFERENCES */}
              {step === 3 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg text-white">Stay Consistent</h3>
                      <p className="text-sm text-slate-400">
                        Choose how you want to be reminded.
                      </p>
                    </div>

                    {/* Push Toggle */}
                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      pushEnabled ? "bg-green-500/10 border-green-500/50" : "bg-slate-950 border-slate-800"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", pushEnabled ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400")}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-xs text-slate-500">Daily reminders before deadline</p>
                        </div>
                      </div>
                      <Switch
                        checked={pushEnabled}
                        onCheckedChange={(checked) => handleToggle("push", checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>

                    {/* Email Toggle */}
                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      emailEnabled ? "bg-green-500/10 border-green-500/50" : "bg-slate-950 border-slate-800"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", emailEnabled ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400")}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <Label className="text-base">Email Updates</Label>
                          <p className="text-xs text-slate-500">Weekly content & milestones</p>
                        </div>
                      </div>
                      <Switch
                        checked={emailEnabled}
                        onCheckedChange={(checked) => handleToggle("email", checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-orange-600 hover:bg-orange-500"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Start Pledge 🚀"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-slate-500">
        By continuing, you agree to the Terms of Service. Hard things are better
        when done daily.
      </p>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Disabling all notifications significantly increases the chance of losing your streak.
              We recommend keeping at least one active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDisable(null)} className="bg-slate-800 text-white hover:bg-slate-700 hover:text-white border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (pendingDisable === "email") setEmailEnabled(false);
                if (pendingDisable === "push") setPushEnabled(false);
                setPendingDisable(null);
              }}
            >
              Disable Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
