"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Wifi,
  Presentation,
  Building2,
  FlaskConical,
  Wrench,
  Sparkles,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { CATEGORY_META } from "@/types";
import type { Category, Priority } from "@/types";

const ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi,
  "presentation": Presentation,
  "building-2": Building2,
  "flask-conical": FlaskConical,
  wrench: Wrench,
  sparkles: Sparkles,
};

const STEPS = ["Category", "Details", "Location & Priority", "Review"] as const;

interface FormState {
  category: Category | null;
  title: string;
  description: string;
  location: string;
  roomTag: string;
  priority: Priority;
  imageUrl: string | null;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function ComplaintForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    category: null,
    title: "",
    description: "",
    location: "",
    roomTag: "",
    priority: "LOW",
    imageUrl: null,
  });

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    // Demo: local object URL preview. Swap for real upload (S3/Cloudinary) in production.
    const url = URL.createObjectURL(file);
    update("imageUrl", url);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/complaints?filed=1");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canProceed = [
    !!form.category,
    form.title.trim().length > 3 && form.description.trim().length > 8,
    form.location.trim().length > 1,
    true,
  ][step];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: i === step ? 1.1 : 1,
                  backgroundColor:
                    i < step ? "#4ade80" : i === step ? "#6366f1" : "rgba(255,255,255,0.08)",
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </motion.div>
              <span className="text-[11px] text-slate-400">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-white/10">
                <motion.div
                  className="h-px bg-indigo-400"
                  animate={{ width: i < step ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {step === 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  What kind of issue is this?
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
                    const meta = CATEGORY_META[c];
                    const Icon = ICONS[meta.icon];
                    const selected = form.category === c;
                    return (
                      <motion.button
                        key={c}
                        type="button"
                        onClick={() => update("category", c)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                          selected
                            ? "border-indigo-400/70 bg-indigo-500/15"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <motion.span
                          animate={selected ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.span>
                        <span className="text-sm text-white">{meta.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Describe the problem
                </h2>
                <FocusField
                  label="Title"
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder="e.g. WiFi down in Block C 2nd floor"
                />
                <FocusTextarea
                  label="Description"
                  value={form.description}
                  onChange={(v) => update("description", v)}
                  placeholder="Give as much detail as possible — when it started, who's affected, etc."
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Where, and how urgent?
                </h2>
                <FocusField
                  label="Location"
                  value={form.location}
                  onChange={(v) => update("location", v)}
                  placeholder="e.g. Hostel Block B"
                />
                <FocusField
                  label="Room / Tag (optional)"
                  value={form.roomTag}
                  onChange={(v) => update("roomTag", v)}
                  placeholder="e.g. Room 214"
                />
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Priority</label>
                  <div className="flex gap-2">
                    {(["LOW", "MED", "HIGH", "URGENT"] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("priority", p)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          form.priority === p
                            ? "border-indigo-400/70 bg-indigo-500/20 text-indigo-200"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <DropZone
                  active={dragActive}
                  setActive={setDragActive}
                  onFiles={handleFiles}
                  fileInput={fileInput}
                  previewUrl={form.imageUrl}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white">Review & submit</h2>
                <ReviewRow label="Category" value={form.category ?? "—"} />
                <ReviewRow label="Title" value={form.title} />
                <ReviewRow label="Description" value={form.description} />
                <ReviewRow label="Location" value={`${form.location} ${form.roomTag}`} />
                <ReviewRow label="Priority" value={form.priority} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => go(step - 1)}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-slate-300 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <motion.button
            type="button"
            disabled={!canProceed}
            onClick={() => go(step + 1)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-br from-emerald-500 to-cyan-400 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Filing..." : "Submit Complaint"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function FocusField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white outline-none transition-shadow placeholder:text-slate-500 focus:border-indigo-400/60 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.25)]"
      />
    </label>
  );
}

function FocusTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white outline-none transition-shadow placeholder:text-slate-500 focus:border-indigo-400/60 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.25)]"
      />
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-white">{value || "—"}</span>
    </div>
  );
}

function DropZone({
  active,
  setActive,
  onFiles,
  fileInput,
  previewUrl,
}: {
  active: boolean;
  setActive: (v: boolean) => void;
  onFiles: (f: FileList | null) => void;
  fileInput: React.RefObject<HTMLInputElement>;
  previewUrl: string | null;
}) {
  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        onFiles(e.dataTransfer.files);
      }}
      onClick={() => fileInput.current?.click()}
      animate={
        active
          ? { boxShadow: "0 0 0 6px rgba(99,102,241,0.3)" }
          : { boxShadow: "0 0 0 0px rgba(99,102,241,0)" }
      }
      className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-slate-900/40 p-6 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <UploadCloud className="h-7 w-7 text-indigo-300" />
      </motion.div>
      <p className="text-sm text-slate-300">
        Drag & drop a photo, or <span className="text-indigo-300">browse</span>
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />
      )}
    </motion.div>
  );
}
