"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import TiltCard from "@/components/ui/TiltCard";
import StatusBadge from "./StatusBadge";
import UpvoteButton from "./UpvoteButton";
import { CATEGORY_META, PRIORITY_META } from "@/types";
import type { ComplaintDTO } from "@/types";
import { MapPin, Wifi, Presentation, Building2, FlaskConical, Wrench, Sparkles } from "lucide-react";

const ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi,
  "presentation": Presentation,
  "building-2": Building2,
  "flask-conical": FlaskConical,
  wrench: Wrench,
  sparkles: Sparkles,
};

interface ComplaintCardProps {
  complaint: ComplaintDTO;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, type: "spring", stiffness: 260, damping: 24 },
  }),
};

export default function ComplaintCard({ complaint, index = 0 }: ComplaintCardProps) {
  const catMeta = CATEGORY_META[complaint.category];
  const prioMeta = PRIORITY_META[complaint.priority];
  const Icon = ICONS[catMeta.icon] ?? Sparkles;

  const wasResolved = useRef(complaint.status === "RESOLVED");

  // Fire confetti the moment a card transitions into RESOLVED status.
  useEffect(() => {
    if (complaint.status === "RESOLVED" && !wasResolved.current) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#4ade80", "#38bdf8", "#a78bfa"],
      });
      wasResolved.current = true;
    }
    if (complaint.status !== "RESOLVED") wasResolved.current = false;
  }, [complaint.status]);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <TiltCard className="p-5" glowColor={`${catMeta.color}33`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${catMeta.color}22`, color: catMeta.color }}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {catMeta.label}
              </p>
              <h3 className="font-semibold text-white leading-tight">
                {complaint.title}
              </h3>
            </div>
          </div>
          <UpvoteButton
            complaintId={complaint.id}
            initialCount={complaint.upvoteCount}
            initialUpvoted={!!complaint.hasUpvoted}
          />
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-slate-300">
          {complaint.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: prioMeta.color, backgroundColor: `${prioMeta.color}1a` }}
          >
            {prioMeta.label} priority
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {complaint.location}
            {complaint.roomTag ? ` · ${complaint.roomTag}` : ""}
          </span>
        </div>

        {complaint.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={complaint.imageUrl}
            alt=""
            className="mt-3 h-32 w-full rounded-xl object-cover"
          />
        )}
      </TiltCard>
    </motion.div>
  );
}
