"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicketStatus } from "@/lib/api";
import { ServiceTeam, TicketStatus } from "@/types/ticket";

const STATUS_OPTIONS: TicketStatus[] = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_USER_RESPONSE",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
];

const TEAM_OPTIONS: { value: ServiceTeam; label: string }[] = [
  { value: "NETWORKING", label: "Networking Team" },
  { value: "ELECTRICIAN", label: "Electrician Team" },
  { value: "SOFTWARE", label: "Software Team" },
  { value: "HARDWARE", label: "Hardware Team" },
  { value: "AV_SYSTEMS", label: "AV / Systems Support Team" },
];

export default function StatusUpdater({
  ticketId,
  currentStatus,
  currentTeam,
}: {
  ticketId: number;
  currentStatus: TicketStatus;
  currentTeam: ServiceTeam;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [team, setTeam] = useState<ServiceTeam>(currentTeam);
  const [agentName, setAgentName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateTicketStatus(ticketId, { status, agentName, team });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TicketStatus)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <select
        value={team}
        onChange={(e) => setTeam(e.target.value as ServiceTeam)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        {TEAM_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Agent name"
        value={agentName}
        onChange={(e) => setAgentName(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save status"}
      </button>

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
