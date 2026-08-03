import { getTicketById } from "@/lib/api";
import { PriorityPill, StatusPill, TeamPill } from "@/components/StatusBadge";
import StatusUpdater from "./StatusUpdater";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await getTicketById(params.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-gray-400">{ticket.ticketNumber}</p>
          <h1 className="text-2xl font-semibold text-black">{ticket.title}</h1>
        </div>
        <div className="flex gap-2">
          <TeamPill team={ticket.assignedTeam} />
          <PriorityPill priority={ticket.priority} />
          <StatusPill status={ticket.status} />
        </div>
      </div>

      <section className="rounded-md border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-black">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
          {ticket.description}
        </p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-gray-200 p-5 text-sm">
        <div>
          <p className="text-gray-400">Requester</p>
          <p className="text-black">{ticket.requesterName}</p>
        </div>
        <div>
          <p className="text-gray-400">Email</p>
          <p className="text-black">{ticket.requesterEmail}</p>
        </div>
        <div>
          <p className="text-gray-400">Category</p>
          <p className="text-black">
            {ticket.category}
            {ticket.subCategory ? ` / ${ticket.subCategory}` : ""}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Submitted via</p>
          <p className="text-black">
            {ticket.channel === "WEB_PORTAL" ? "Web portal" : "Email"}
          </p>
        </div>
        {ticket.attachmentUrl && (
          <div className="col-span-2">
            <p className="text-gray-400">Attachment</p>
            <a
              href={ticket.attachmentUrl}
              className="text-blue-700 underline"
              target="_blank"
            >
              {ticket.attachmentUrl}
            </a>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-md border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-black">Update status</h2>
        <p className="mt-1 text-xs text-gray-400">
          Agents move the ticket through its lifecycle here.
        </p>
        <div className="mt-3">
          <StatusUpdater
            ticketId={ticket.id}
            currentStatus={ticket.status}
            currentTeam={ticket.assignedTeam}
          />
        </div>
      </section>
    </main>
  );
}
