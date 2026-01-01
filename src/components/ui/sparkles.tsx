"use client";
import React from "react";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

type SparkleType = {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: { top: string; left: string; zIndex: number };
};

export const SparklesCore = ({
  id,
  background,
  minSize,
  maxSize,
  particleDensity,
  className,
  particleColor,
}: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const [sparkles, setSparkles] = useState<SparkleType[]>([]);

  useEffect(() => {
    const generateSparkle = (): SparkleType => {
      return {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        color: particleColor || "#FFF",
        size:
          Math.random() * ((maxSize || 2) - (minSize || 1)) + (minSize || 1),
        style: {
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          zIndex: 2,
        },
      };
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const sparkle = generateSparkle();
      setSparkles((prev) => {
        const filtered = prev.filter((s) => now - s.createdAt < 1000);
        if (filtered.length < (particleDensity || 100)) {
          return [...filtered, sparkle];
        }
        return filtered;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [particleColor, maxSize, minSize, particleDensity]);

  return (
    <div
      id={id}
      className={className}
      style={{
        position: "relative",
        background: background || "transparent",
      }}
    >
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      ))}
    </div>
  );
};

const Sparkle = ({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style: { top: string; left: string; zIndex: number };
}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: { duration: 0.8, ease: "easeInOut" },
    });
  }, [controls]);

  return (
    <motion.svg
      animate={controls}
      className="absolute pointer-events-none"
      style={style}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  );
};

export const Sparkles = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative inline-block ${className || ""}`}>
      <SparklesCore
        id="sparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={50}
        className="absolute inset-0 w-full h-full"
        particleColor="#f97316"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
