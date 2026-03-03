"use client";

// app/page.tsx
import LogsTable from "@/components/ui/LogsTable";
import { LogEntry, ServiceStats, Service } from "@/types";
import ServiceCard, { ServiceCardProps } from "@/components/ui/ServiceCard";
import StatCard from "@/components/ui/StatCard";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Cargar servicios
  const loadServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data.success) {
        setServices(data.services as Service[]);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  // Cargar logs
  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedService) params.append("serviceId", selectedService);
      if (filter !== "all") params.append("status", filter);
      params.append("limit", "100");

      const response = await fetch(`/api/get-logs?${params}`);
      const data = await response.json();
      if (data.success) {
        // convert legacy entries into the newer unified shape
        const normalized: LogEntry[] = data.logs.map(
          (raw: any, idx: number) => {
            const entry: LogEntry = {
              id:
                raw.id ??
                `${raw.timestamp}-${raw.serviceId ?? raw.serviceName}-${idx}`,
              timestamp: raw.timestamp,
              serviceId: raw.serviceId,
              serviceName: raw.serviceName,
              status: raw.status,
              response:
                raw.response ??
                (raw.responseTime != null
                  ? `${raw.responseTime}ms`
                  : undefined),
              details: raw.details ?? raw.errorMessage,
              responseTime: raw.responseTime,
              errorMessage: raw.errorMessage,
            };
            return entry;
          },
        );
        setLogs(normalized);
        calculateStats(normalized);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  // Calcular estadísticas
  const calculateStats = (logs: LogEntry[]) => {
    const serviceMap = new Map<string, ServiceStats>();

    logs.forEach((log) => {
      // choose a grouping key: use serviceId if available, otherwise fall back to the name
      const key = log.serviceId ?? log.serviceName;

      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          serviceId: log.serviceId,
          serviceName: log.serviceName,
          totalChecks: 0,
          successfulChecks: 0,
          failedChecks: 0,
          uptime: 0,
          lastCheck: log.timestamp,
          lastStatus: log.status,
        });
      }

      const stat = serviceMap.get(key)!;
      stat.totalChecks++;
      // treat any 2xx or literal 'online' as successful
      if (log.status.startsWith("2") || log.status === "online") {
        stat.successfulChecks++;
      } else {
        stat.failedChecks++;
      }

      // update last check if newer
      if (new Date(log.timestamp) > new Date(stat.lastCheck)) {
        stat.lastCheck = log.timestamp;
        stat.lastStatus = log.status;
      }
    });

    // compute uptime percentage
    serviceMap.forEach((stat) => {
      stat.uptime =
        stat.totalChecks > 0
          ? (stat.successfulChecks / stat.totalChecks) * 100
          : 0;
    });

    setStats(Array.from(serviceMap.values()));
  };

  // Función para disparar verificación manual
  const runManualCheck = async () => {
    setChecking(true);
    try {
      const cronSecret =
        process.env.NEXT_PUBLIC_CRON_SECRET ||
        prompt("Ingresa el CRON_SECRET:");
      if (!cronSecret) {
        alert("CRON_SECRET requerido");
        return;
      }

      const response = await fetch("/api/check-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ trigger: "manual-dashboard" }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `✅ Verificación completada!\n\nOnline: ${data.summary.onlineServices}\nOffline: ${data.summary.offlineServices}\nNotificaciones: ${data.notifications.length}`,
        );
        // Recargar logs después de la verificación
        await loadLogs();
      } else {
        alert(`❌ Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setChecking(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadServices(), loadLogs()]);
      setLoading(false);
    };
    loadData();
  }, [filter, selectedService]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [filter, selectedService]);

  const currentStats =
    stats.find((s) => s.serviceId === selectedService) || null;
  const onlineCount = stats.filter(
    (s) => s.lastStatus === "online" || s.lastStatus.startsWith("2"),
  ).length;
  const offlineCount = stats.filter(
    (s) => !(s.lastStatus === "online" || s.lastStatus.startsWith("2")),
  ).length;
  const avgUptime =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.uptime, 0) / stats.length
      : 0;

  const statCards: Array<{
    icon: string;
    badgeLabel: string;
    badgeVariant?: "primary" | "emerald" | "rose" | "amber";
    label: string;
    value: string | number;
  }> = [
    {
      icon: "database",
      badgeLabel: "Live",
      badgeVariant: "primary",
      label: "Total Services",
      value: services.length,
    },
    {
      icon: "check_circle",
      badgeLabel: "Stable",
      badgeVariant: "emerald",
      label: "Online",
      value: onlineCount,
    },
    {
      icon: "error",
      badgeLabel: "Alert",
      badgeVariant: "rose",
      label: "Offline",
      value: offlineCount,
    },
    {
      icon: "bolt",
      badgeLabel: "Stats",
      badgeVariant: "amber",
      label: "Avg Uptime",
      value: `${avgUptime.toFixed(1)}%`,
    },
  ];

  // derive card props for each service using available stats
  const serviceCards: ServiceCardProps[] = services.map((svc) => {
    const stat = stats.find(
      (s) => s.serviceId === svc.id || s.serviceName === svc.name,
    );
    const lastStatus = stat?.lastStatus ?? "offline";
    const status: ServiceCardProps["status"] =
      lastStatus.startsWith("2") || lastStatus === "online"
        ? "connected"
        : "offline";
    return {
      name: svc.name,
      url: svc.url,
      icon: "cloud",
      status,
      uptime: stat ? `${stat.uptime.toFixed(1)}%` : "--",
      latency: "--",
      lastCheck: stat?.lastCheck ?? "--",
    };
  });

  return (
    <>
      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        <button
          onClick={runManualCheck}
          className="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-50"
        >
          {/* <span className="material-symbols-outlined text-3xl">add</span> */}
          <span className="material-symbols-outlined">
            play_circle
          </span>
        </button>
      </section>

      {/* Services List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Monitored Services
          </h2>
          <button className="text-xs text-primary font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {serviceCards.map((svc) => (
            <ServiceCard key={svc.name} {...svc} />
          ))}
        </div>
      </section>

      {/* Logs */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent Logs
        </h2>
        <LogsTable entries={logs} />
      </section>
    </>
  );
}
