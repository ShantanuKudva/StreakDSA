"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2, Check } from "lucide-react";
import { ShareCard } from "./share-card";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { format } from "date-fns";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string | null;
    image: string | null;
  };
  stats: {
    currentStreak: number;
    maxStreak: number;
    totalProblems: number;
    gems: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
}

export function ShareModal({ isOpen, onClose, user, stats }: ShareModalProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLImageElement && node.src.startsWith("http")) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `streakdsa-${user.name || "profile"}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Profile card downloaded!");
    } catch (err) {
      console.error("Failed to generate image:", err);
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareCardRef.current) return;

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLImageElement && node.src.startsWith("http")) {
            return false;
          }
          return true;
        },
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 border-0 bg-transparent shadow-none overflow-visible">
        <VisuallyHidden>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>
            Share your StreakDSA progress with friends
          </DialogDescription>
        </VisuallyHidden>

        <div className="bg-[#0d0d12] border border-purple-500/30 rounded-2xl p-4 shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="text-center mb-3">
            <h2 className="text-xl font-bold text-white mb-1">
              Share Your Progress
            </h2>
            <p className="text-xs text-gray-400">
              Show off your StreakDSA journey!
            </p>
          </div>

          {/* Card Preview */}
          <div className="flex justify-center mb-4">
            <div
              ref={shareCardRef}
              className="transform scale-[0.75] origin-center"
            >
              <ShareCard user={user} stats={stats} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl border border-purple-400/30"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Generating..." : "Download PNG"}
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex-1 h-12 border-white/20 hover:bg-white/10 text-white font-bold rounded-xl"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Image
                </>
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center mb-3">Share via</p>
            <div className="flex gap-2 justify-center">
              {/* X (Twitter) */}
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white"
                onClick={() => {
                  const text = `🔥 ${stats.currentStreak} day streak on StreakDSA!\n\n📊 ${stats.totalProblems} problems solved\n🏆 Best streak: ${stats.maxStreak} days\n\nConsistency is key! #DSA #LeetCode #CodingStreak`;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      text
                    )}`,
                    "_blank"
                  );
                }}
              >
                <svg
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </Button>

              {/* Instagram */}
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🔥 ${stats.currentStreak} day streak on StreakDSA!\n\n📊 ${stats.totalProblems} problems solved\n🏆 Best streak: ${stats.maxStreak} days\n\nConsistency is key! #DSA #LeetCode #CodingStreak`
                  );
                  toast.success("Caption copied! Open Instagram to share.");
                }}
              >
                <svg
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </Button>

              {/* Email */}
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white"
                onClick={() => {
                  const subject = `Check out my StreakDSA progress! 🔥`;
                  const body = `Hey!\n\nI'm on a ${stats.currentStreak} day streak on StreakDSA!\n\n📊 Problems solved: ${stats.totalProblems}\n🏆 Best streak: ${stats.maxStreak} days\n� Gems earned: ${stats.gems}\n\nConsistency is key!`;
                  window.open(
                    `mailto:?subject=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(body)}`,
                    "_blank"
                  );
                }}
              >
                <svg
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
