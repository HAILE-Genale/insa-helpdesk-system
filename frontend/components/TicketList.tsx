import Link from "next/link";
import { Ticket } from "@/types/ticket";
import { PriorityPill, StatusPill, TeamPill } from "./StatusBadge";

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No tickets yet. Submit one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-white">Ticket #</th>
            <th className="px-4 py-2 text-left font-medium text-white">Title</th>
            <th className="px-4 py-2 text-left font-medium text-white">Category</th>
            <th className="px-4 py-2 text-left font-medium text-white">Priority</th>
            <th className="px-4 py-2 text-left font-medium text-white">Status</th>
            <th className="px-4 py-2 text-left font-medium text-white">Team</th>
            <th className="px-4 py-2 text-left font-medium text-white">Requester</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-blue-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-600">
                <Link href={`/tickets/${t.id}`} className="text-blue-700 hover:underline">
                  {t.ticketNumber}
                </Link>
              </td>
              <td className="px-4 py-2 text-black">{t.title}</td>
              <td className="px-4 py-2 text-gray-600">
                {t.category}
                {t.subCategory ? ` / ${t.subCategory}` : ""}
              </td>
              <td className="px-4 py-2">
                <PriorityPill priority={t.priority} />
              </td>
              <td className="px-4 py-2">
                <StatusPill status={t.status} />
              </td>
              <td className="px-4 py-2">
                <TeamPill team={t.assignedTeam} />
              </td>
              <td className="px-4 py-2 text-gray-600">{t.requesterName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
