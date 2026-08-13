"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import type { ComplaintDTO, Category, Status } from "@/types";
import { CATEGORY_META, STATUS_META } from "@/types";

const springEntry = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 14 },
  },
};

export default function AnalyticsCharts() {
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then(setComplaints);
  }, []);

  const byCategory = (Object.keys(CATEGORY_META) as Category[]).map((c) => ({
    name: CATEGORY_META[c].label,
    count: complaints.filter((x) => x.category === c).length,
    fill: CATEGORY_META[c].color,
  }));

  const byStatus = (Object.keys(STATUS_META) as Status[]).map((s) => ({
    name: STATUS_META[s].label,
    value: complaints.filter((x) => x.status === s).length,
    fill: STATUS_META[s].color,
  }));

  const avgResolutionDays = (() => {
    const resolved = complaints.filter((c) => c.resolvedAt);
    if (!resolved.length) return "—";
    const totalMs = resolved.reduce(
      (sum, c) =>
        sum + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()),
      0
    );
    return (totalMs / resolved.length / 86400000).toFixed(1);
  })();

  const stats = [
    { label: "Total Complaints", value: complaints.length },
    { label: "Resolved", value: complaints.filter((c) => c.status === "RESOLVED").length },
    { label: "Avg. Resolution (days)", value: avgResolutionDays },
    {
      label: "Urgent Open",
      value: complaints.filter((c) => c.priority === "URGENT" && c.status !== "RESOLVED")
        .length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={springEntry}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          variants={springEntry}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <h3 className="mb-3 text-sm font-semibold text-white">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {byCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={springEntry}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <h3 className="mb-3 text-sm font-semibold text-white">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                animationEasing="ease-out"
                animationDuration={700}
              >
                {byStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
