"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Gem,
  LogOut,
  History as HistoryIcon,
  Menu,
  Clock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  gems: number;
  currentStreak?: number;
  hasTodayLog?: boolean;
  isOnboarded?: boolean;
}

export function AppHeader({
  user,
  gems,
  currentStreak = 0,
  hasTodayLog = false,
  isOnboarded = true,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoTextVisible, setIsLogoTextVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Animation logic for Dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLogoTextVisible(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer logic - time until midnight
  useEffect(() => {
    if (hasTodayLog) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasTodayLog]);

  // Get urgency color based on time left - orange accent theme
  const getTimerColor = () => {
    if (!timeLeft) return "text-orange-400";
    const totalHours = timeLeft.hours + timeLeft.minutes / 60;
    if (totalHours <= 2) return "text-red-400"; // Less than 2 hours - red
    if (totalHours <= 6) return "text-orange-400"; // Less than 6 hours - orange
    return "text-amber-400"; // Normal - amber/gold
  };

  const getTimerBgColor = () => {
    if (!timeLeft) return "bg-orange-500/10 border border-orange-500/20";
    const totalHours = timeLeft.hours + timeLeft.minutes / 60;
    if (totalHours <= 2) return "bg-red-500/15 border border-red-500/30";
    if (totalHours <= 6) return "bg-orange-500/15 border border-orange-500/30";
    return "bg-amber-500/10 border border-amber-500/20";
  };

  const isDashboard = pathname?.endsWith("/dashboard");
  const isLogs = pathname?.endsWith("/logs");
  const isProfile = pathname?.endsWith("/profile");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side: Logo & Dynamic Title */}
        <div className="flex items-center gap-3">
          {/* Logo (Static Icon) */}
          <div
            onClick={() => router.push(`/${user.id}/dashboard`)}
            className="flex items-center justify-center cursor-pointer group"
          >
            {isDashboard ? (
              <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
            ) : (
              <div className="p-1.5 rounded-md bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          {isDashboard && (
            <motion.div
              className="text-lg font-bold cursor-pointer overflow-hidden whitespace-nowrap"
              initial="visible"
              whileHover="visible"
              animate={isLogoTextVisible ? "visible" : "hidden"}
              variants={{
                visible: { width: "auto", opacity: 1 },
                hidden: { width: 0, opacity: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={() => router.push(`/${user.id}/dashboard`)}
            >
              StreakDSA
            </motion.div>
          )}

          {isLogs && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <span
                onClick={() => router.push(`/${user.id}/dashboard`)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Dashboard
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-semibold text-foreground">Logs</span>
            </div>
          )}

          {isProfile && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <span
                onClick={() => router.push(`/${user.id}/dashboard`)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Dashboard
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-semibold text-foreground">Profile</span>
            </div>
          )}
        </div>

        {/* Right Side: Actions (Timer, Gems, Nav, Profile) */}
        <div className="flex items-center gap-2 md:gap-3">
          <TooltipProvider delayDuration={200}>
            {/* Countdown Timer - show when no log today */}
            {timeLeft && !hasTodayLog && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    {/* Desktop: Full timer */}
                    <div
                      className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getTimerBgColor()}`}
                    >
                      <Clock className={`h-4 w-4 ${getTimerColor()}`} />
                      <span
                        className={`text-sm font-mono font-semibold ${getTimerColor()}`}
                      >
                        {String(timeLeft.hours).padStart(2, "0")}:
                        {String(timeLeft.minutes).padStart(2, "0")}:
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Mobile: Hours only */}
                    <div
                      className={`md:hidden flex items-center gap-1 px-2 py-1 rounded-full ${getTimerBgColor()}`}
                    >
                      <Clock className={`h-3 w-3 ${getTimerColor()}`} />
                      <span
                        className={`text-xs font-mono font-semibold ${getTimerColor()}`}
                      >
                        {timeLeft.hours}h
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-zinc-900 text-zinc-100 border-zinc-800"
                >
                  <p>
                    Time left to log today&apos;s problem before your streak
                    resets at midnight
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Gems */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full cursor-default">
                  <Gem className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-semibold gems-display">
                    {gems}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-zinc-900 text-zinc-100 border-zinc-800"
              >
                <p>Gems earned from maintaining streaks and logging problems</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Desktop Navigation */}
          {isOnboarded && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${user.id}/logs`)}
                className={`hover:text-foreground ${isLogs ? "text-foreground bg-accent" : "text-muted-foreground"
                  }`}
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                Logs
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[350px] flex flex-col border-l border-white/10 bg-black/90 backdrop-blur-xl p-0"
              >
                <SheetHeader className="p-6 pb-2 text-left space-y-4">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation and user profile
                  </SheetDescription>

                  {/* User Profile Section */}
                  <div className="flex items-center gap-4">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || "Profile"}
                        className="h-12 w-12 rounded-full border-2 border-white/30 shadow-lg"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-white text-lg font-bold border-2 border-white/10 shadow-lg">
                        {(user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-lg truncate">
                        {user.name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-transparent p-3 rounded-xl border border-orange-500/20">
                      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium">
                          Streak
                        </span>
                        <span className="text-lg font-bold text-white leading-none">
                          {currentStreak}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-zinc-500/10 to-transparent p-3 rounded-xl border border-zinc-500/20">
                      <div className="h-8 w-8 rounded-full bg-zinc-500/20 flex items-center justify-center">
                        <Gem className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium">
                          Gems
                        </span>
                        <span className="text-lg font-bold text-white leading-none">
                          {gems}
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="h-px bg-white/5 mx-6" />

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col gap-3 p-6 pt-6 relative z-10">
                  {isOnboarded ? (
                    <>
                      <button
                        onClick={() => router.push(`/${user.id}/dashboard`)}
                        className={`flex items-center justify-start w-full h-12 px-4 text-base font-medium rounded-xl transition-all ${isDashboard
                            ? "bg-white/15 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <Flame
                          className={`mr-3 h-5 w-5 ${isDashboard ? "text-orange-500" : "text-zinc-500"
                            }`}
                        />
                        Dashboard
                      </button>

                      <button
                        onClick={() => router.push(`/${user.id}/logs`)}
                        className={`flex items-center justify-start w-full h-12 px-4 text-base font-medium rounded-xl transition-all ${isLogs
                            ? "bg-white/15 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <HistoryIcon
                          className={`mr-3 h-5 w-5 ${isLogs ? "text-white" : "text-zinc-500"
                            }`}
                        />
                        Activity Logs
                      </button>

                      <button
                        onClick={() => router.push(`/${user.id}/profile`)}
                        className={`flex items-center justify-start w-full h-12 px-4 text-base font-medium rounded-xl transition-all ${isProfile
                            ? "bg-white/15 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <div
                          className={`mr-3 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isProfile
                              ? "bg-white text-black"
                              : "bg-zinc-600 text-zinc-300"
                            }`}
                        >
                          {(user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        Profile
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-zinc-500 mt-10">
                      Complete setup to assess features
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                  <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full justify-start h-12 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Profile & SignOut */}
          <div className="hidden md:flex items-center gap-2">
            {isOnboarded && (
              <button
                onClick={() => router.push(`/${user.id}/profile`)}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-transform hover:scale-105 active:scale-95"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "Profile"}
                    className={`h-8 w-8 rounded-full border transition-colors ${isProfile
                        ? "border-white"
                        : "border-border hover:border-white/50"
                      }`}
                  />
                ) : (
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-colors ${isProfile ? "bg-zinc-600" : "bg-zinc-700 hover:bg-zinc-600"
                      }`}
                  >
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
