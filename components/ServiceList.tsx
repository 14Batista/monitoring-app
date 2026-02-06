'use client';

import { Service, ServiceStats } from '@/types';
import { Server, Circle, RefreshCw, Signal, Zap } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  stats: ServiceStats[];
  selectedService: string | null;
  onSelectService: (serviceId: string | null) => void;
  onRefresh: () => void;
}

export default function ServiceList({
  services,
  stats,
  selectedService,
  onSelectService,
  onRefresh,
}: ServiceListProps) {
  const getServiceStatus = (serviceId: string) => {
    const stat = stats.find((s) => s.serviceId === serviceId);
    return stat?.lastStatus || 'unknown';
  };

  const getServiceUptime = (serviceId: string) => {
    const stat = stats.find((s) => s.serviceId === serviceId);
    return stat?.uptime.toFixed(1) || '0.0';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'from-emerald-500 to-green-500';
      case 'offline':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-slate-500 to-gray-500';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'online':
        return 'shadow-emerald-500/50';
      case 'offline':
        return 'shadow-red-500/50';
      default:
        return 'shadow-slate-500/50';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-blue-200">Servicios</h2>
          <p className="text-xs text-blue-300/60 mt-1">{services.length} servicios configurados</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2.5 hover:bg-blue-500/30 rounded-lg transition-all duration-200 text-blue-300 hover:text-blue-100 group"
          title="Actualizar servicios"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* All Services Option */}
      <button
        onClick={() => onSelectService(null)}
        className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 p-4 ${
          selectedService === null
            ? 'bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/50'
            : 'bg-linear-to-br from-blue-500/10 to-cyan-500/5 border border-blue-400/20 hover:border-blue-400/40'
        }`}
      >
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/5 group-hover:to-cyan-600/5 transition-all duration-300"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              selectedService === null 
                ? 'bg-blue-500/30 text-blue-200' 
                : 'bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-blue-100">Todos los Servicios</p>
              <p className="text-xs text-blue-300/60">Ver estadísticas generales</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-sm font-medium rounded-lg">
              {services.length}
            </span>
          </div>
        </div>
      </button>

      {/* Services List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {services.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-blue-400/20 bg-blue-500/5">
            <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-3">
              <Server className="w-6 h-6 text-blue-300" />
            </div>
            <p className="text-blue-200 font-medium">No hay servicios configurados</p>
            <p className="text-xs text-blue-300/60 mt-2">Agrega un servicio para comenzar el monitoreo</p>
          </div>
        ) : (
          services.map((service) => {
            const status = getServiceStatus(service.id);
            const uptime = getServiceUptime(service.id);
            const isSelected = selectedService === service.id;
            const statusColor = getStatusColor(status);
            const statusGlow = getStatusGlow(status);

            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 p-4 text-left ${
                  isSelected
                    ? 'bg-linear-to-br from-blue-500/25 to-cyan-500/25 border border-blue-400/50'
                    : 'bg-linear-to-br from-blue-500/10 to-cyan-500/5 border border-blue-400/20 hover:border-blue-400/40'
                }`}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/5 group-hover:to-cyan-600/5 transition-all duration-300"></div>

                {/* Status glow */}
                <div className={`absolute top-2 right-2 w-12 h-12 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 bg-linear-to-r ${statusColor} ${statusGlow}`}></div>

                <div className="relative space-y-3">
                  {/* Header with Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status Indicator */}
                      <div className="flex shrink-0">
                        <div className={`relative w-4 h-4 rounded-full bg-linear-to-r ${statusColor} ${statusGlow} shadow-lg`}>
                          <div className={`absolute inset-1 rounded-full ${
                            status === 'online' ? 'bg-emerald-400' : 
                            status === 'offline' ? 'bg-red-400' : 
                            'bg-slate-400'
                          }`}></div>
                          {status === 'online' && (
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-75"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-100 truncate">
                          {service.name}
                        </h3>
                        <p className="text-xs text-blue-300/60 truncate font-mono">{service.url}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      status === 'online'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : status === 'offline'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}>
                      {status === 'online' ? 'En Línea' : status === 'offline' ? 'Desconectado' : 'Desconocido'}
                    </div>
                  </div>

                  {/* Stats Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-blue-400/10">
                    <div className="flex items-center gap-4">
                      {/* Uptime */}
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-blue-300/60">Uptime</p>
                          <p className="text-sm font-bold text-cyan-300">{uptime}%</p>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <p className="text-xs text-blue-300/60">Tipo</p>
                          <p className="text-sm font-bold text-blue-300">
                            {service.type === 'http' ? 'HTTP' : 'Ping'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disabled Badge */}
                    {!service.enabled && (
                      <div className="px-2.5 py-1 bg-slate-500/30 text-slate-300 text-xs font-medium rounded-lg border border-slate-400/20">
                        Deshabilitado
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 197, 253, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 197, 253, 0.5);
        }
      `}</style>
    </div>
  );
}