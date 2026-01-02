"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Snowflake, ShieldAlert, ThermometerSnowflake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreezeModal({ isOpen, onClose }: FreezeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none overflow-visible">
        <VisuallyHidden>
          <DialogTitle>Streak Frozen</DialogTitle>
          <DialogDescription>
            Your streak has been frozen for today.
          </DialogDescription>
        </VisuallyHidden>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative p-8 bg-[#0a0f18] border border-cyan-500/30 rounded-3xl overflow-hidden"
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />

              <div className="relative z-10 space-y-6 text-center">
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="p-5 bg-cyan-500/20 rounded-2xl border border-cyan-500/30"
                  >
                    <ThermometerSnowflake className="h-12 w-12 text-cyan-400" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    STREAK FROZEN
                  </h2>
                  <p className="text-cyan-400/80 font-medium uppercase tracking-widest text-xs">
                    You're safe for today!
                  </p>
                </div>

                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <ShieldAlert className="h-5 w-5 text-cyan-400 shrink-0" />
                    <p className="text-sm text-gray-300">
                      Your streak won't reset tomorrow, even if you don't log a
                      problem.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Snowflake className="h-5 w-5 text-cyan-400 shrink-0" />
                    <p className="text-sm text-gray-300">
                      The streak will stay at its current value until you resume
                      logging.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl border border-cyan-400/30 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  Stay Chill ❄️
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
