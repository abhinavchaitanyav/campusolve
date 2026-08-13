"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowBigUp } from "lucide-react";

interface UpvoteButtonProps {
  complaintId: string;
  initialCount: number;
  initialUpvoted: boolean;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

export default function UpvoteButton({
  complaintId,
  initialCount,
  initialUpvoted,
}: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);

    // Optimistic update
    const nextUpvoted = !upvoted;
    setUpvoted(nextUpvoted);
    setCount((c) => c + (nextUpvoted ? 1 : -1));

    if (nextUpvoted) {
      const burst = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 46,
        y: -Math.random() * 40 - 10,
      }));
      setSparkles(burst);
      window.setTimeout(() => setSparkles([]), 700);
    }

    try {
      const res = await fetch(`/api/complaints/${complaintId}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (typeof data.count === "number") setCount(data.count);
      if (typeof data.upvoted === "boolean") setUpvoted(data.upvoted);
    } catch {
      // revert on failure
      setUpvoted(upvoted);
      setCount((c) => c + (nextUpvoted ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      animate={upvoted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        upvoted
          ? "bg-indigo-500/20 text-indigo-300"
          : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
      aria-pressed={upvoted}
      aria-label="Upvote duplicate issue"
    >
      <ArrowBigUp
        className={`h-5 w-5 transition-transform ${upvoted ? "fill-indigo-400" : ""}`}
      />
      <span>{count}</span>

      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: s.x, y: s.y, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-indigo-300"
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
