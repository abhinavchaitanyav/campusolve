import Link from "next/link";
import ComplaintFeed from "@/components/complaints/ComplaintFeed";
import MagneticButton from "@/components/ui/MagneticButton";

export default function ComplaintsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Campus Feed</h1>
          <p className="text-sm text-slate-400">
            Upvote issues you're also facing to help admins prioritize.
          </p>
        </div>
        <Link href="/complaints/new">
          <MagneticButton className="px-5 py-2.5 text-sm">
            + New Complaint
          </MagneticButton>
        </Link>
      </div>

      <ComplaintFeed />
    </main>
  );
}
