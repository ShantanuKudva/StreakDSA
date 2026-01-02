"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Flame, Snowflake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MeltModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundAmount: number;
}

export function MeltModal({ isOpen, onClose, refundAmount }: MeltModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none overflow-visible">
        <VisuallyHidden>
          <DialogTitle>Freeze Melted</DialogTitle>
          <DialogDescription>
            Your freeze has been melted and gems refunded.
          </DialogDescription>
        </VisuallyHidden>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative p-8 bg-[#0d0d12] border border-orange-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.15)]"
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-cyan-500/5 pointer-events-none" />

              <div className="relative z-10 space-y-6 text-center">
                <div className="flex justify-center items-center h-32 relative">
                  {/* Melting Snowflake */}
                  <motion.div
                    animate={{
                      scale: [1, 0.6, 0],
                      opacity: [0.5, 0.2, 0],
                      y: [0, 10, 20],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      times: [0, 0.6, 1],
                    }}
                    className="absolute"
                  >
                    <Snowflake className="h-12 w-12 text-cyan-300/40" />
                  </motion.div>

                  {/* Burning Flame */}
                  <motion.div
                    animate={{
                      scale: [0.8, 1.1, 1, 1.1, 0.9],
                      y: [-5, 0, -3, 0, -5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Flame className="h-24 w-24 text-orange-500 fill-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                    Freeze Melted!
                  </h2>
                  <p className="text-orange-400 font-medium uppercase tracking-widest text-xs">
                    You did it yourself!
                  </p>
                </div>

                <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    You logged a problem despite having a freeze active. Your
                    freeze has been
                    <span className="text-orange-400 font-bold">
                      {" "}
                      melted
                    </span>{" "}
                    and your gems returned.
                  </p>

                  <div className="flex items-center justify-center gap-2 bg-orange-500/20 py-2 rounded-xl border border-orange-500/30">
                    <span className="text-orange-400 font-bold text-lg">
                      +{refundAmount} Gems Refunded
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl border border-orange-400/30 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  Keep the Heat! 🔥
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
