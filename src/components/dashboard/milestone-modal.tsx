"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Gem, Gift, PartyPopper, Trophy } from "lucide-react";
import { toast } from "sonner";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

const MOTIVATION_QUOTES = [
  "Consistency is the key to mastery. You're killing it!",
  "Another 10 days of growth. The compound effect is real!",
  "Success is the sum of small efforts, repeated day in and day out.",
  "You're becoming the person who doesn't miss. Keep going!",
  "Great things take time. You've just invested 10 more days in your future.",
];

export function MilestoneModal({
  isOpen,
  onClose,
  streak,
}: MilestoneModalProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const quote =
    MOTIVATION_QUOTES[Math.floor((streak / 10) % MOTIVATION_QUOTES.length)];

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch("/api/gems/claim-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streak }),
      });

      if (res.ok) {
        setIsClaimed(true);
        toast.success(
          `${streak === 1 ? 100 : 15} gems added to your balance! 🎉`
        );
        // We might want to trigger a router.refresh() but the user sees the toast
      } else {
        toast.error("Failed to claim gift");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsClaiming(false);
    }
  };

  const rewardAmount = streak === 1 ? 100 : 15;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-[#0a0b0d] border-purple-500/20 p-0 overflow-hidden shadow-2xl shadow-purple-500/20">
        <DialogTitle className="sr-only">Milestone Reached</DialogTitle>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-6 sm:p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="absolute inset-0 z-0">
                <SparklesCore
                  id="milestoneSparkles"
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={70}
                  className="w-full h-full"
                  particleColor="#a855f7"
                />
              </div>

              <CardSpotlight
                className="absolute inset-0 z-0 p-0"
                color="rgba(168, 85, 247, 0.1)"
              >
                {null}
              </CardSpotlight>

              <div className="relative z-10 w-full space-y-6">
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 uppercase tracking-widest"
                  >
                    <PartyPopper className="h-3.5 w-3.5" />
                    Milestone Reached
                  </motion.div>
                  <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    {streak === 1 ? "Welcome Reward" : `${streak} Day Streak`}
                  </h2>
                </div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative p-6 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm italic text-lg text-purple-100/90 text-center leading-relaxed"
                >
                  &quot;{quote}&quot;
                  <div className="absolute -top-3 -left-3">
                    <div className="bg-purple-600 p-1.5 rounded-lg">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center py-4">
                  {!isClaimed ? (
                    <div className="relative group">
                      <motion.div
                        animate={{
                          rotate: [0, -5, 5, -5, 5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <button
                          onClick={handleClaim}
                          disabled={isClaiming}
                          className="relative z-10 p-8 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-3xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transform transition-transform group-hover:scale-110 active:scale-95 disabled:opacity-50"
                        >
                          <Gift className="h-16 w-16 text-white" />
                        </button>
                      </motion.div>
                      <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                      <p className="mt-6 text-xs text-purple-400 font-bold uppercase tracking-[0.2em] text-center animate-pulse">
                        Click to Claim Reward
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-6 w-full"
                    >
                      <div className="flex justify-center items-center gap-3 text-5xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                        <Gem className="h-10 w-10 animate-bounce" />+
                        {rewardAmount}
                      </div>
                      <Button
                        onClick={onClose}
                        className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Continue Journey
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
