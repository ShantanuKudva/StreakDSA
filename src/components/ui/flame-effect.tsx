"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useMemo } from "react";

export function FlameEffect() {
  // Generate flame particles spread across the bottom
  const flameParticles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: (i / 40) * 100 + Math.random() * 2.5 - 1.25,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1,
        size: 28 + Math.random() * 24,
        offsetY: Math.random() * 30,
      })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 1, 0] }}
      transition={{ duration: 4, times: [0, 0.6, 0.85, 1], ease: "easeOut" }}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      {/* Bottom glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-orange-600/30 via-orange-500/15 to-transparent"
      />

      {/* Flame particles rising from bottom */}
      {flameParticles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            bottom: -50,
            left: `${particle.x}%`,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            bottom: [
              -50,
              100 + particle.offsetY,
              150 + particle.offsetY,
              200 + particle.offsetY,
            ],
            opacity: [0, 1, 0.8, 0],
            scale: [0.5, 1.2, 1, 0.7],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
            repeat: 2,
            repeatDelay: 0.2,
          }}
          className="absolute"
          style={{ width: particle.size, height: particle.size }}
        >
          <Flame
            size={particle.size}
            className="text-orange-500 fill-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
