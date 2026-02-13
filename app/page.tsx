"use client";

import { useState, useEffect } from "react";
import { Service, LogEntry, ServiceStats } from "@/types";
import ServiceList from "@/components/ServiceList";
import LogsTable from "@/components/LogsTable";
import AddServiceForm from "@/components/AddServiceForm";
import {
  Activity,
  Server,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Cargar servicios
  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error loading services:', error);
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
        setLogs(data.logs);
        calculateStats(data.logs);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  // Calcular estadísticas
  const calculateStats = (logs: LogEntry[]) => {
    const serviceMap = new Map<string, ServiceStats>();

    logs.forEach((log) => {
      if (!serviceMap.has(log.serviceId)) {
        serviceMap.set(log.serviceId, {
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

      const stat = serviceMap.get(log.serviceId)!;
      stat.totalChecks++;
      if (log.status === 'online') {
        stat.successfulChecks++;
      } else {
        stat.failedChecks++;
      }

      // Actualizar última verificación
      if (new Date(log.timestamp) > new Date(stat.lastCheck)) {
        stat.lastCheck = log.timestamp;
        stat.lastStatus = log.status;
      }
    });

    // Calcular uptime
    serviceMap.forEach((stat) => {
      stat.uptime = stat.totalChecks > 0
        ? (stat.successfulChecks / stat.totalChecks) * 100
        : 0;
    });

    setStats(Array.from(serviceMap.values()));
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
  const onlineCount = stats.filter((s) => s.lastStatus === "online").length;
  const offlineCount = stats.filter((s) => s.lastStatus === "offline").length;
  const avgUptime =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.uptime, 0) / stats.length
      : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header Mejorado */}
      <header className="relative overflow-hidden border-b border-blue-500/20 backdrop-blur-md bg-blue-950/40">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 to-cyan-600/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-200 to-cyan-300 bg-clip-text text-transparent">
                  Service Monitor
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Sistema de monitoreo en tiempo real
                </p>
              </div>
            </div>

            <button
              onClick={loadServices}
              disabled={loading}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-all duration-300 text-blue-300 hover:text-blue-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-6 h-6 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-cyan-400 animate-spin"></div>
            </div>
            <p className="text-blue-300 font-medium">Cargando servicios...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards - Mejorados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {/* Total Services Card */}
              <div className="group relative bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/5 group-hover:to-cyan-600/5 rounded-2xl transition-all duration-300"></div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-300/70 uppercase tracking-wider">
                      Total Services
                    </p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {services.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all duration-300">
                    <Server className="w-8 h-8 text-blue-300" />
                  </div>
                </div>
              </div>

              {/* Online Card */}
              <div className="group relative bg-linear-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/20 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-600/0 to-green-600/0 group-hover:from-emerald-600/5 group-hover:to-green-600/5 rounded-2xl transition-all duration-300"></div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-300/70 uppercase tracking-wider">
                      Online
                    </p>
                    <p className="text-4xl font-bold text-emerald-300 mt-2">
                      {onlineCount}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-all duration-300">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Offline Card */}
              <div className="group relative bg-linear-to-br from-red-500/10 to-rose-500/10 backdrop-blur-xl rounded-2xl p-6 border border-red-400/20 hover:border-red-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20">
                <div className="absolute inset-0 bg-linear-to-br from-red-600/0 to-rose-600/0 group-hover:from-red-600/5 group-hover:to-rose-600/5 rounded-2xl transition-all duration-300"></div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-300/70 uppercase tracking-wider">
                      Offline
                    </p>
                    <p className="text-4xl font-bold text-red-300 mt-2">
                      {offlineCount}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-all duration-300">
                    <AlertCircle className="w-8 h-8 text-red-300" />
                  </div>
                </div>
              </div>

              {/* Avg Uptime Card */}
              <div className="group relative bg-linear-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/5 group-hover:to-blue-600/5 rounded-2xl transition-all duration-300"></div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-300/70 uppercase tracking-wider">
                      Avg Uptime
                    </p>
                    <p className="text-4xl font-bold text-cyan-300 mt-2">
                      {avgUptime.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-all duration-300">
                    <Activity className="w-8 h-8 text-cyan-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Services List Section */}
              <div className="lg:col-span-1 space-y-6">
                {/* Services List Container */}
                <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-blue-400/20 overflow-hidden">
                  <div className="px-6 py-4 border-b border-blue-400/20 bg-blue-950/40">
                    <h2 className="text-lg font-bold text-blue-200">
                      Servicios
                    </h2>
                    <p className="text-sm text-blue-300/60 mt-1">
                      Lista de servicios monitoreados
                    </p>
                  </div>
                  <div className="p-6">
                    <ServiceList
                      services={services}
                      stats={stats}
                      selectedService={selectedService}
                      // onSelectService={onSelectService}
                      onSelectService={() => {}}
                      onRefresh={loadServices}
                    />
                  </div>
                </div>

                {/* Add Service Form */}
                <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/20">
                  <div className="px-6 py-4 border-b border-blue-400/20 bg-blue-950/40">
                    <h2 className="text-lg font-bold text-blue-200">
                      Agregar Servicio
                    </h2>
                  </div>
                  <div className="p-6">
                    <AddServiceForm onServiceAdded={loadServices} />
                  </div>
                </div>
              </div>

              {/* Logs Table Section */}
              <div className="lg:col-span-2">
                <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-blue-400/20 overflow-hidden shadow-xl shadow-blue-500/10">
                  <div className="px-6 py-4 border-b border-blue-400/20 bg-blue-950/40">
                    <h2 className="text-lg font-bold text-blue-200">
                      Registro de Eventos
                    </h2>
                    <p className="text-sm text-blue-300/60 mt-1">
                      Historial de monitoreo en tiempo real
                    </p>
                  </div>
                  <div className="p-6">
                    <LogsTable
                      logs={logs}
                      filter={filter}
                      onFilterChange={setFilter}
                      selectedService={selectedService}
                      currentStats={currentStats}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
}
