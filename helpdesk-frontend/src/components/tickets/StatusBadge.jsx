export function StatusBadge({ status }) {
  return <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-200">{status || 'OPEN'}</span>;
}
