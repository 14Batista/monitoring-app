type BadgeVariant = "primary" | "emerald" | "rose" | "amber";

interface StatCardProps {
  icon: string;
  badgeLabel: string;
  badgeVariant?: BadgeVariant;
  label: string;
  value: string | number;
}

const badgeStyles: Record<BadgeVariant, string> = {
  primary: "text-primary bg-primary/10",
  emerald: "text-emerald-400 bg-emerald-400/10",
  rose: "text-rose-400 bg-rose-400/10",
  amber: "text-amber-400 bg-amber-400/10",
};

const iconStyles: Record<BadgeVariant, string> = {
  primary: "text-slate-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
};

export default function StatCard({
  icon,
  badgeLabel,
  badgeVariant = "primary",
  label,
  value,
}: StatCardProps) {
  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={`material-symbols-outlined text-sm ${iconStyles[badgeVariant]}`}
        >
          {icon}
        </span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeStyles[badgeVariant]}`}
        >
          {badgeLabel}
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}