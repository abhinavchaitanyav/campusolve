"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt rotation in degrees */
  maxTilt?: number;
  /** Shimmer glow color following the cursor */
  glowColor?: string;
}

/**
 * 3D perspective-tilt card. Tracks pointer position within the card bounds,
 * maps it to a rotateX/rotateY spring, and renders a radial "shimmer" light
 * that follows the cursor for a glass/glossy feel. Pure CSS transforms —
 * no WebGL — so it stays smooth even with many cards on screen.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
  glowColor = "rgba(99,102,241,0.35)",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springCfg = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), springCfg);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), springCfg);
  const scale = useSpring(1, springCfg);

  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleEnter() {
    scale.set(1.02);
    setHovered(true);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${className}`}
    >
      {/* Cursor-follow shimmer */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${glowX} ${glowY}, ${glowColor}, transparent 70%)`,
        }}
      />
      <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
