"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroCanvas from "@/components/three/HeroCanvas";
import MagneticButton from "@/components/ui/MagneticButton";
import { CATEGORY_META } from "@/types";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <HeroCanvas />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-200"
        >
          Built for students, staff & campus admins
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
        >
          Report it once.{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Watch it get solved.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="mt-5 max-w-xl text-slate-300"
        >
          CampuSolve routes WiFi outages, hostel repairs, lab equipment and
          cleanliness issues straight to the department that fixes them —
          with live status tracking your whole campus can see.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="mt-9 flex flex-wrap justify-center gap-4"
        >
          <Link href="/complaints/new">
            <MagneticButton>File a Complaint</MagneticButton>
          </Link>
          <Link href="/complaints">
            <MagneticButton variant="ghost">Browse the Feed</MagneticButton>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-3"
        >
          {Object.values(CATEGORY_META).map((c) => (
            <span
              key={c.label}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {c.label}
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
