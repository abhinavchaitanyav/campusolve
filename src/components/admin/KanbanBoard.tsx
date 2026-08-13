"use client";

import { useEffect, useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { ComplaintDTO, Status } from "@/types";
import { STATUS_META } from "@/types";
import { PRIORITY_META, CATEGORY_META } from "@/types";

const COLUMNS: Status[] = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Record<Status, ComplaintDTO[]>>({
    PENDING: [],
    IN_PROGRESS: [],
    RESOLVED: [],
    REJECTED: [],
  });
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data: ComplaintDTO[]) => {
        const grouped: Record<Status, ComplaintDTO[]> = {
          PENDING: [],
          IN_PROGRESS: [],
          RESOLVED: [],
          REJECTED: [],
        };
        data.forEach((c) => grouped[c.status].push(c));
        setColumns(grouped);
      });
  }, []);

  async function moveCard(id: string, from: Status, to: Status) {
    if (from === to) return;
    setColumns((prev) => {
      const card = prev[from].find((c) => c.id === id);
      if (!card) return prev;
      const updated = { ...prev };
      updated[from] = prev[from].filter((c) => c.id !== id);
      updated[to] = [{ ...card, status: to }, ...prev[to]];
      return updated;
    });

    if (to === "RESOLVED") {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }

    await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {COLUMNS.map((status) => {
        const meta = STATUS_META[status];
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(status);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData("application/json");
              if (!data) return;
              const { id, from } = JSON.parse(data) as { id: string; from: Status };
              moveCard(id, from, status);
              setDragOverCol(null);
            }}
            className={`rounded-2xl border p-3 transition-colors ${
              dragOverCol === status
                ? "border-indigo-400/60 bg-indigo-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                {columns[status].length}
              </span>
            </div>

            <Reorder.Group
              axis="y"
              values={columns[status]}
              onReorder={(newOrder) =>
                setColumns((prev) => ({ ...prev, [status]: newOrder }))
              }
              className="flex min-h-[120px] flex-col gap-2"
            >
              <AnimatePresence>
                {columns[status].map((card) => (
                  <Reorder.Item
                    key={card.id}
                    value={card}
                    draggable
                    onDragStart={(e: React.DragEvent) =>
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ id: card.id, from: status })
                      )
                    }
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileDrag={{ scale: 1.04, boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}
                    className="cursor-grab rounded-xl border border-white/10 bg-slate-900/70 p-3 active:cursor-grabbing"
                  >
                    <p className="text-xs font-medium" style={{ color: CATEGORY_META[card.category].color }}>
                      {CATEGORY_META[card.category].label}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-white">
                      {card.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span style={{ color: PRIORITY_META[card.priority].color }}>
                        {PRIORITY_META[card.priority].label}
                      </span>
                      <span className="text-slate-400">▲ {card.upvoteCount}</span>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        );
      })}
    </div>
  );
}
