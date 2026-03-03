export type ServiceStatus = "connected" | "offline" | "warning";

export interface ServiceCardProps {
  name: string;
  url: string;
  icon: string;
  status: ServiceStatus;
  uptime: string;
  latency: string;
  lastCheck: string;
}

const statusConfig: Record<
  ServiceStatus,
  { label: string; color: string; iconColor: string; pulse: boolean }
> = {
  connected: {
    label: "Connected",
    color: "text-emerald-400 bg-emerald-400/10",
    iconColor: "bg-primary/10 border-primary/20 text-primary",
    pulse: true,
  },
  offline: {
    label: "Offline",
    color: "text-rose-400 bg-rose-400/10",
    iconColor: "bg-rose-400/10 border-rose-400/20 text-rose-400",
    pulse: false,
  },
  warning: {
    label: "Warning",
    color: "text-amber-400 bg-amber-400/10",
    iconColor: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    pulse: true,
  },
};

const dotColor: Record<ServiceStatus, string> = {
  connected: "bg-emerald-400",
  offline: "bg-rose-400",
  warning: "bg-amber-400",
};

export default function ServiceCard({
  name,
  url,
  icon,
  status,
  uptime,
  latency,
  lastCheck,
}: ServiceCardProps) {
  const cfg = statusConfig[status];

  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center ${cfg.iconColor}`}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-xs text-slate-500 font-medium">{url}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase ${cfg.color}`}
        >
          <span
            className={`size-1.5 rounded-full ${dotColor[status]} ${cfg.pulse ? "animate-pulse" : ""}`}
          />
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            Uptime
          </span>
          <span className="text-sm font-semibold">{uptime}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            Latency
          </span>
          <span className="text-sm font-semibold">{latency}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            Last Check
          </span>
          <span className="text-sm font-semibold">{lastCheck}</span>
        </div>
      </div>
    </div>
  );
}