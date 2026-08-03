"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/api";
import { CreateTicketPayload, ServiceTeam, TicketPriority } from "@/types/ticket";

const CATEGORIES = ["Hardware", "Software", "Network", "Electrical", "AV / Multimedia"];
const PRIORITIES: TicketPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const TEAM_OPTIONS: { value: ServiceTeam; label: string }[] = [
  { value: "NETWORKING", label: "Networking Team" },
  { value: "ELECTRICIAN", label: "Electrician Team" },
  { value: "SOFTWARE", label: "Software Team" },
  { value: "HARDWARE", label: "Hardware Team" },
  { value: "AV_SYSTEMS", label: "AV / Systems Support Team" },
];

const initialForm: CreateTicketPayload = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  subCategory: "",
  priority: "MEDIUM",
  requesterName: "",
  requesterEmail: "",
  requesterDepartment: "",
  attachmentUrl: "",
  team: undefined,
};

export default function TicketForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTicketPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CreateTicketPayload>(key: K, value: CreateTicketPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await createTicket(form);
      router.push(`/tickets/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-black">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Cannot connect to VPN"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Description</label>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe what happened, when it started, and any error messages"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black">Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Sub-category</label>
          <input
            type="text"
            value={form.subCategory}
            onChange={(e) => update("subCategory", e.target.value)}
            placeholder="e.g. Laptop, VPN, ERP"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Priority</label>
        <div className="mt-1 flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => update("priority", p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${
                form.priority === p
                  ? "bg-blue-600 text-white ring-blue-600"
                  : "bg-white text-black ring-gray-300 hover:bg-blue-50"
              }`}
            >
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black">
          Service team <span className="text-gray-400">(optional — auto-routed if left blank)</span>
        </label>
        <select
          value={form.team ?? ""}
          onChange={(e) =>
            update("team", (e.target.value || undefined) as ServiceTeam | undefined)
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          <option value="">Auto-route by category</option>
          {TEAM_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black">Your name</label>
          <input
            type="text"
            required
            value={form.requesterName}
            onChange={(e) => update("requesterName", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Your email</label>
          <input
            type="email"
            required
            value={form.requesterEmail}
            onChange={(e) => update("requesterEmail", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Department</label>
        <input
          type="text"
          value={form.requesterDepartment}
          onChange={(e) => update("requesterDepartment", e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">
          Attachment URL <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={form.attachmentUrl}
          onChange={(e) => update("attachmentUrl", e.target.value)}
          placeholder="Link to a screenshot or file"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >z
        {submitting ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}
