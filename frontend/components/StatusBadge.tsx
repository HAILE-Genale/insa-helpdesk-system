import { TicketPriority, Tic              ketStatus } from "@/types/ticket";

const STATUS_STYLES: Record<TicketStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-300",
  ASSIGNED: "bg-blue-100 text-blue-800 ring-blue-400",
  IN_PROGRESS: "bg-black text-white ring-black",
  PENDING_USER_RESPONSE: "bg-gray-100 text-gray-700 ring-gray-300",
  RESOLVED: "bg-blue-600 text-white ring-blue-600",
  CLOSED: "bg-gray-200 text-gray-500 ring-gray-300",
  REOPENED: "bg-black text-blue-300 ring-black",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  CRITICAL: "bg-black text-white",
  HIGH: "bg-blue-700 text-white",
  MEDIUM: "bg-blue-100 text-blue-800",
  LOW: "bg-gray-100 text-gray-600",
};

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusPill({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      {formatLabel(priority)}
    </span>
  );
}

const TEAM_LABELS: Record<string, string> = {
  NETWORKING: "Networking Team",
  ELECTRICIAN: "Electrician Team",
  SOFTWARE: "Software Team",
  HARDWARE: "Hardware Team",
  AV_SYSTEMS: "AV / Systems Support Team",
};

export function TeamPill({ team }: { team: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-300">
      {TEAM_LABELS[team] ?? formatLabel(team)}
    </span>
  );
}
