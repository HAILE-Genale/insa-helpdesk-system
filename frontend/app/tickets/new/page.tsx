import TicketForm from "@/components/TicketForm";

export default function NewTicketPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-black">Submit a ticket</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tell us what's going on and we'll route it to the right team.
      </p>
      <div className="mt-8">
        <TicketForm />
      </div>
    </main>
  );
}
