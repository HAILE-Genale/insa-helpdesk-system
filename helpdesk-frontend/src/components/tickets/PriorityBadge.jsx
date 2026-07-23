export function PriorityBadge({ priority }) {
  return <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">{priority || 'MEDIUM'}</span>;
}
