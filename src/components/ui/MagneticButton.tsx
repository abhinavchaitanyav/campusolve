"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

/** Radial glow that tracks the cursor position via motion values (GPU-cheap, no re-render). */
function GlowTrail({ glowX, glowY }: { glowX: MotionValue<number>; glowY: MotionValue<number> }) {
  const background = useTransform([glowX, glowY], ([gx, gy]) =>
    `radial-gradient(120px circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 70%)`
  );
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background }}
    />
  );
}

// framer-motion's motion.button redefines several native event props (onDrag,
// onDragStart/End, onAnimationStart/End, etc.) with its own gesture-based
// signatures, so they're omitted here to avoid conflicting with the native
// ButtonHTMLAttributes versions when spread onto <motion.button>.
type NativePropsSafeForMotion = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

interface MagneticButtonProps extends NativePropsSafeForMotion {
  children: ReactNode;
  strength?: number;
  variant?: "primary" | "ghost";
}

/**
 * Button that "magnetically" follows the cursor within a radius, with a
 * glowing radial trail underneath. Snaps back with a spring on mouse-leave.
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  variant = "primary",
  className = "",
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 15, mass: 0.4 };
  const sx = useSpring(x, springCfg);
  const sy = useSpring(y, springCfg);

  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    x.set((relX - rect.width / 2) * strength);
    y.set((relY - rect.height / 2) * strength);
    glowX.set((relX / rect.width) * 100);
    glowY.set((relY / rect.height) * 100);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const base =
    variant === "primary"
      ? "bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30"
      : "bg-white/5 text-white border border-white/15";

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.94 }}
      className={`relative isolate overflow-hidden rounded-full px-7 py-3.5 font-semibold tracking-tight ${base} ${className}`}
      {...rest}
    >
      <GlowTrail glowX={glowX} glowY={glowY} />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
