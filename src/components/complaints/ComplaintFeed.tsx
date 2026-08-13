"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ComplaintCard from "./ComplaintCard";
import type { Category, ComplaintDTO } from "@/types";
import { CATEGORY_META } from "@/types";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export default function ComplaintFeed() {
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const qs = category !== "ALL" ? `?category=${category}` : "";
    fetch(`/api/complaints${qs}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setComplaints(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [category]);

  const sorted = useMemo(
    () =>
      [...complaints].sort((a, b) => b.upvoteCount - a.upvoteCount),
    [complaints]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={category === "ALL"} onClick={() => setCategory("ALL")}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_META[c].label}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No complaints yet in this category — be the first to report one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c, i) => (
            <ComplaintCard key={c.id} complaint={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {children}
    </motion.button>
  );
}
