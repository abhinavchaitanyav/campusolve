import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import KanbanBoard from "@/components/admin/KanbanBoard";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-white">Admin Dashboard</h1>

      <section className="mb-12">
        <AnalyticsCharts />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Complaint Pipeline
        </h2>
        <KanbanBoard />
      </section>
    </main>
  );
}
