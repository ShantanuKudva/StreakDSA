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
import { Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PLEDGE_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days (Recommended)" },
  { value: "180", label: "180 days" },
  { value: "365", label: "365 days" },
];

const REMINDER_OPTIONS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM (Default)" },
];

export default function OnboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pledgeDays, setPledgeDays] = useState("90");
  const [reminderTime, setReminderTime] = useState("22:00");
  const [phone, setPhone] = useState("");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pledgeDays: parseInt(pledgeDays),
          reminderTime,
          timezone,
          phone: phone || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Pledge started! Let's do this! 🔥");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to start pledge");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-8">
        <Flame className="h-8 w-8 text-orange-500" />
        StreakDSA
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Start Your Pledge</CardTitle>
          <CardDescription>Set your commitment. No going back.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pledge Duration */}
            <div className="space-y-2">
              <Label htmlFor="pledge">Pledge Duration</Label>
              <Select value={pledgeDays} onValueChange={setPledgeDays}>
                <SelectTrigger id="pledge">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLEDGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How many consecutive days will you commit to?
              </p>
            </div>

            {/* Reminder Time */}
            <div className="space-y-2">
              <Label htmlFor="reminder">Daily Deadline</Label>
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger id="reminder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You must check in before this time each day
              </p>
            </div>

            {/* Timezone display */}
            <div className="space-y-2">
              <Label>Your Timezone</Label>
              <Input value={timezone} disabled className="bg-muted" />
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For daily reminders via WhatsApp
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="streak"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>Start {pledgeDays}-Day Pledge 🔥</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-slate-400 text-center max-w-md">
        By starting this pledge, you commit to practicing DSA every day. Miss a
        day? Your streak resets. No excuses.
      </p>
    </div>
  );
}
