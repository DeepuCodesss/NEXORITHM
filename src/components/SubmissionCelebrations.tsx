"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flame, Medal, Sparkles, Trophy, X } from "lucide-react";

export type SubmissionToastTone = "success" | "error";

export interface SubmissionToastData {
  title: string;
  message: string;
  tone: SubmissionToastTone;
}

export interface SubmissionCelebrationData {
  problemTitle: string;
  rewardLine: string;
  xpGained: number;
  coinsGained: number;
  moneyGainedInr?: number;
  streak: number;
  levelBefore?: number;
  levelAfter?: number;
  unlockedTitle?: string;
}

interface SubmissionCelebrationsProps {
  toast: SubmissionToastData | null;
  onToastDismiss: () => void;
  celebration: SubmissionCelebrationData | null;
  onCelebrationClose: () => void;
}

const toastVariants = {
  hidden: { opacity: 0, y: -24, x: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, x: 0, scale: 1 },
  exit: { opacity: 0, y: -16, x: 24, scale: 0.96 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 18 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 14 },
};

export default function SubmissionCelebrations({
  toast,
  onToastDismiss,
  celebration,
  onCelebrationClose,
}: SubmissionCelebrationsProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onToastDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [onToastDismiss, toast]);

  useEffect(() => {
    if (!celebration) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCelebrationClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [celebration, onCelebrationClose]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        top: `${(index * 13) % 70}%`,
        delay: `${(index % 6) * 0.08}s`,
        duration: `${1.8 + (index % 4) * 0.15}s`,
        color: ["#8B5CF6", "#22C55E", "#F59E0B", "#38BDF8"][index % 4],
      })),
    [],
  );

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-20"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={`${toast.title}-${toast.message}`}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.24, ease: "easeOut" }}
              className={`overflow-hidden rounded-2xl border bg-[#0f141b]/95 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
                toast.tone === "success" ? "border-success/40" : "border-destructive/40"
              }`}
            >
              <div className={`flex items-start gap-3 border-b px-4 py-4 ${toast.tone === "success" ? "border-success/15" : "border-destructive/15"}`}>
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                  toast.tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}>
                  {toast.tone === "success" ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{toast.title}</div>
                  <div className="mt-1 text-sm leading-6 text-secondary-text">{toast.message}</div>
                </div>
                <button
                  type="button"
                  onClick={onToastDismiss}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {celebration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) onCelebrationClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Problem solved celebration"
          >
            {!prefersReducedMotion && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {confetti.map((piece) => (
                  <span
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                      left: piece.left,
                      top: piece.top,
                      backgroundColor: piece.color,
                      animationDelay: piece.delay,
                      animationDuration: piece.duration,
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#10151d] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-reward to-success" />
              <div className="flex items-start justify-between gap-4 px-5 pb-0 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-reward/30 bg-reward/10 text-reward shadow-[0_0_30px_rgba(245,158,11,0.16)]">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold tracking-tight text-white">Problem Solved!</div>
                    <div className="text-sm text-secondary-text">{celebration.problemTitle}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCelebrationClose}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close celebration modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 pb-5 pt-5">
                <div className="flex flex-wrap gap-2">
                  <div className="chip chip-primary">
                    <Sparkles className="h-3.5 w-3.5" />+{celebration.xpGained} XP
                  </div>
                  <div className="chip chip-reward">
                    <Medal className="h-3.5 w-3.5" />+{celebration.coinsGained} Coins
                  </div>
                  <div className="chip chip-success">
                    <Flame className="h-3.5 w-3.5" />{celebration.streak} Day Streak
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-white/[0.02] p-4">
                  <div className="text-sm font-semibold text-white">What you earned</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-secondary-text">
                    <div className="flex items-center justify-between">
                      <span>XP</span>
                      <span className="font-semibold text-white">+{celebration.xpGained}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Coins</span>
                      <span className="font-semibold text-white">+{celebration.coinsGained}</span>
                    </div>
                    {typeof celebration.moneyGainedInr === "number" && celebration.moneyGainedInr > 0 ? (
                      <div className="flex items-center justify-between">
                        <span>Cash</span>
                        <span className="font-semibold text-white">₹{celebration.moneyGainedInr}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span>Streak</span>
                      <span className="font-semibold text-white">{celebration.streak} day{celebration.streak === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  {celebration.levelBefore && celebration.levelAfter && celebration.levelAfter > celebration.levelBefore && (
                    <div className="mt-4 rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
                      ⭐ Level {celebration.levelBefore} → Level {celebration.levelAfter}
                      {celebration.unlockedTitle ? <span className="block text-secondary-text">Unlocked: {celebration.unlockedTitle}</span> : null}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onCelebrationClose}
                  className="btn-primary mt-5 h-11 w-full rounded-xl"
                >
                  Continue Coding
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
