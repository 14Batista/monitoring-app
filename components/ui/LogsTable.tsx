import { LogEntry } from '@/types';

// we keep a small helper here because the original table had logic based on
// HTTP codes, but many of the legacy rows will still carry simple
// "online"/"offline" states.

interface LogsTableProps {
  entries: LogEntry[];
}

function StatusCell({ status }: { status: string }) {
  // treat anything beginning with '2' as success (HTTP 2xx) or the
  // literal string 'online' from the legacy model.
  const isOk = status.startsWith("2") || status === "online";
  return (
    <span className={`font-medium ${isOk ? "text-emerald-400" : "text-rose-400"}`}>
      {status}
    </span>
  );
}

export default function LogsTable({ entries }: LogsTableProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase text-slate-500 font-bold border-b border-white/5">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Response</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((entry, idx) => (
              <tr key={entry.id ?? idx}>
                <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                  {entry.timestamp}
                </td>
                <td className="px-4 py-3">
                  <StatusCell status={entry.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{entry.response}</td>
                <td className="px-4 py-3 text-slate-500">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}