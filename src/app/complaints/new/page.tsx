import ComplaintForm from "@/components/complaints/ComplaintForm";

export default function NewComplaintPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        File a Complaint
      </h1>
      <ComplaintForm />
    </main>
  );
}
