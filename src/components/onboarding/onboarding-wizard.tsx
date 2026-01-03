"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
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
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PLEDGE_OPTIONS = [
  { value: "30", label: "30 Days (Warmup)", desc: "Build the habit." },
  { value: "60", label: "60 Days (Solid)", desc: "See real progress." },
  { value: "90", label: "90 Days (Expert)", desc: "Transform your skills." },
  { value: "180", label: "180 Days (Master)", desc: "Career changing." },
];

const REMINDER_OPTIONS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM (Default)" },
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

      // Replace GMT with UTC for clearer display if preferred, or keep as is.
      // Format: (UTC-08:00) America/Los_Angeles
      const formattedOffset = offset ? `(${offset.replace("GMT", "UTC")})` : "";

      return {
        value: tz,
        label: `${formattedOffset} ${tz.replace(/_/g, " ")}`,
        offset: offset || "", // For sorting if needed
      };
    });
    // Optional: Sort by offset could be nice, but default alphabetical might be easier to search
  } catch (e) {
    console.error(e);
    return [];
  }
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [pledgeDays, setPledgeDays] = useState("90");
  const [timezone, setTimezone] = useState("");
  const [reminderTime, setReminderTime] = useState("22:00");
  const [smsPhone, setSmsPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [sameAsSms, setSameAsSms] = useState(false);

  // Notification Preferences
  const [emailNotif, setEmailNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // FIX logic: Ensure 12:00 PM is sent as 12:00, etc.
      // The dropdown values are already in 24h format (e.g. "22:00"), so no conversion needed if selecting from list.

      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pledgeDays: parseInt(pledgeDays),
          timezone,
          reminderTime,
          smsPhone: smsPhone || undefined,
          whatsappPhone: whatsappPhone || undefined,
          emailNotifications: emailNotif,
          whatsappNotifications: whatsappNotif,
          smsNotifications: smsNotif,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Welcome to the Streak!");
        // Redirect to user dashboard using the ID from response
        router.push(`/${data.data.id}/dashboard`);
        router.refresh();
      } else {
        toast.error(data.error?.message || "Failed to start pledge");
      }
    } catch (error) {
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span
              className={`text-xs ${
                step >= s ? "text-orange-400" : "text-slate-600"
              }`}
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
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            pledgeDays === opt.value
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-slate-800 bg-slate-950 hover:border-slate-700"
                          }`}
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
                    <Label>Daily Deadline</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="bg-slate-950 border-slate-800 h-12 text-center text-lg tracking-widest [&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      We&apos;ll verify your streak status at this time every
                      day.
                    </p>
                  </div>

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
                      Auto-detected. Change if incorrect.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: PREFERENCES */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base">Notification Channels</Label>
                    <p className="text-xs text-slate-500 -mt-3 mb-4">
                      Contact info is used purely for sending notifications.
                    </p>

                    {/* Coming Soon Banner */}
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                      <span className="text-amber-400 text-xs font-medium">
                        🚧 Push notifications coming in next update
                      </span>
                    </div>

                    {/* Email Toggle - Disabled */}
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 opacity-50">
                      <div className="space-y-0.5">
                        <Label>Email</Label>
                        <p className="text-xs text-slate-500">
                          Weekly summaries & major milestones
                        </p>
                      </div>
                      <Switch checked={false} disabled={true} />
                    </div>

                    {/* SMS Toggle - Disabled */}
                    <div className="space-y-3 p-4 bg-slate-950 rounded-lg border border-slate-800 opacity-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS</Label>
                          <p className="text-xs text-slate-500">
                            Urgent fallback alerts
                          </p>
                        </div>
                        <Switch checked={false} disabled={true} />
                      </div>
                    </div>

                    {/* WhatsApp Toggle - Disabled */}
                    <div className="space-y-3 p-4 bg-slate-950 rounded-lg border border-slate-800 opacity-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>WhatsApp</Label>
                          <p className="text-xs text-slate-500">
                            Daily reminders & frozen alerts
                          </p>
                        </div>
                        <Switch checked={false} disabled={true} />
                      </div>
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
    </div>
  );
}
