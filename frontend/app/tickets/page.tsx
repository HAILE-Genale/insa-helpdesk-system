import Link from "next/link";
import { getAllTickets } from "@/lib/api";
import TicketList from "@/components/TicketList";

export default async function TicketsPage() {
  const tickets = await getAllTickets();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Tickets</h1>
          <p className="text-sm text-gray-500">
            All submitted incidents and service requests.
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New ticket
        </Link>
      </div>

      <TicketList tickets={tickets} />
    </main>
  );
}
