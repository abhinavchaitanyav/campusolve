"use client";

import { signIn } from "next-auth/react";
import MagneticButton from "@/components/ui/MagneticButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center">
      <h1 className="text-2xl font-bold text-white">Sign in to CampuSolve</h1>
      <p className="max-w-sm text-sm text-slate-400">
        Use your campus Google account to file and track complaints.
      </p>
      <MagneticButton onClick={() => signIn("google", { callbackUrl: "/complaints" })}>
        Continue with Google
      </MagneticButton>
    </main>
  );
}
