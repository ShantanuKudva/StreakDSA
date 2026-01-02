"use client";

import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";
import { useEffect, useState } from "react";

export function SnowflakeEffect() {
  const [flakes, setFlakes] = useState<
    { id: number; x: number; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      size: 10 + Math.random() * 20,
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 1, 0] }}
      transition={{ duration: 4, times: [0, 0.6, 0.85, 1], ease: "easeOut" }}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, x: `${flake.x}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            x: `${flake.x + (Math.random() * 10 - 5)}vw`,
            opacity: [0, 1, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            ease: "linear",
            repeat: Infinity,
          }}
          className="absolute text-cyan-200/40"
          style={{ width: flake.size, height: flake.size }}
        >
          <Snowflake size={flake.size} />
        </motion.div>
      ))}
    </motion.div>
  );
}
