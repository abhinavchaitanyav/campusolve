"use client";

import { motion } from "framer-motion";
import { STATUS_META } from "@/types";
import type { Status } from "@/types";

export default function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const pulsing = status === "IN_PROGRESS" || status === "PENDING";

  return (
    <span
      className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
    >
      <span className="relative flex h-2 w-2">
        {pulsing && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: meta.color }}
            animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.glow}` }}
        />
      </span>
      {meta.label}
    </span>
  );
}
