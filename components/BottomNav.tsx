"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/services", icon: "dns", label: "Services" },
  { href: "/logs", icon: "receipt_long", label: "Logs" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/90 backdrop-blur-xl border-t border-white/10 px-6 py-2 pb-6 z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "fill-1" : ""}`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}