'use client';

import { LogEntry, ServiceStats } from '@/types';
import { format } from 'date-fns';
import { Filter, CheckCircle, XCircle, Clock, Zap, TrendingUp } from 'lucide-react';

interface LogsTableProps {
  logs: LogEntry[];
  filter: 'all' | 'online' | 'offline';
  onFilterChange: (filter: 'all' | 'online' | 'offline') => void;
  selectedService: string | null;
  currentStats: ServiceStats | null;
}

export default function LogsTable({
  logs,
  filter,
  onFilterChange,
  selectedService,
  currentStats,
}: LogsTableProps) {
  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-blue-200">
            {selectedService ? 'Registros del Servicio' : 'Todos los Registros'}
          </h2>
          <p className="text-xs text-blue-300/60 mt-1">Historial completo de monitoreo</p>
        </div>
        
        <div className="relative w-64">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className="appearance-none w-full pl-10 pr-4 py-2.5 bg-linear-to-r from-blue-500/20 to-cyan-500/20 text-blue-100 text-sm font-medium border border-blue-400/40 rounded-lg hover:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer transition-all duration-200"
          >
            <option value="all">Todos los Estados</option>
            <option value="online">Solo En Línea</option>
            <option value="offline">Solo Desconectados</option>
          </select>
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 10l5 5m0 0l5-5m-5 5V3"
            />
          </svg>
          
        </div>
      </div>

      {/* Stats Summary for Selected Service */}
      {currentStats && (
        <div className="grid grid-cols-4 gap-4 p-4 bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl">
          {/* Total Checks */}
          <div className="group relative overflow-hidden rounded-lg p-4 bg-blue-950/30 hover:bg-blue-950/50 transition-all duration-200 border border-blue-400/10 hover:border-blue-400/30">
            <div className="absolute top-2 right-2 p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-200">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="relative">
              <p className="text-xs font-medium text-blue-300/70 uppercase tracking-wider">Total de Verificaciones</p>
              <p className="text-2xl font-bold text-blue-200 mt-2">{currentStats.totalChecks}</p>
            </div>
          </div>

          {/* Successful */}
          <div className="group relative overflow-hidden rounded-lg p-4 bg-emerald-950/30 hover:bg-emerald-950/50 transition-all duration-200 border border-emerald-400/10 hover:border-emerald-400/30">
            <div className="absolute top-2 right-2 p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="relative">
              <p className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider">Exitosas</p>
              <p className="text-2xl font-bold text-emerald-300 mt-2">{currentStats.successfulChecks}</p>
            </div>
          </div>

          {/* Failed */}
          <div className="group relative overflow-hidden rounded-lg p-4 bg-red-950/30 hover:bg-red-950/50 transition-all duration-200 border border-red-400/10 hover:border-red-400/30">
            <div className="absolute top-2 right-2 p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-all duration-200">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="relative">
              <p className="text-xs font-medium text-red-300/70 uppercase tracking-wider">Fallidas</p>
              <p className="text-2xl font-bold text-red-300 mt-2">{currentStats.failedChecks}</p>
            </div>
          </div>

          {/* Uptime */}
          <div className="group relative overflow-hidden rounded-lg p-4 bg-cyan-950/30 hover:bg-cyan-950/50 transition-all duration-200 border border-cyan-400/10 hover:border-cyan-400/30">
            <div className="absolute top-2 right-2 p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all duration-200">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="relative">
              <p className="text-xs font-medium text-cyan-300/70 uppercase tracking-wider">Disponibilidad</p>
              <p className="text-2xl font-bold text-cyan-300 mt-2">{currentStats.uptime.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table Container */}
      <div className="relative overflow-hidden rounded-xl border border-blue-400/20 bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl shadow-xl shadow-blue-500/10">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-full mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-blue-200 font-medium">No hay registros disponibles</p>
            <p className="text-sm text-blue-300/60 mt-2">Los registros aparecerán después de que se ejecuten las verificaciones</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-400/20 bg-blue-950/40">
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                      Marca de Tiempo
                    </th>
                    {!selectedService && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                        Servicio
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                      Tiempo de Respuesta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-400/10">
                  {logs.map((log, index) => (
                    <tr
                      key={`${log.serviceId}-${log.timestamp}-${index}`}
                      className="group hover:bg-blue-500/10 transition-colors duration-200 border-blue-400/5"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-300 group-hover:text-blue-200 transition-colors">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </td>

                      {/* Service Name */}
                      {!selectedService && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-200 group-hover:text-blue-100 transition-colors">
                          {log.serviceName}
                        </td>
                      )}

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {log.status === 'online' ? (
                            <>
                              <div className="relative flex items-center justify-center w-3 h-3">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse opacity-75"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
                              </div>
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                En Línea
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="relative flex items-center justify-center w-3 h-3">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/30">
                                Desconectado
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Response Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {log.responseTime ? (
                            <>
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-sm font-mono text-cyan-300 group-hover:text-cyan-200 transition-colors">
                                {log.responseTime}ms
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-blue-300/50 italic">-</span>
                          )}
                        </div>
                      </td>

                      {/* Error Message */}
                      <td className="px-6 py-4 text-sm">
                        {log.errorMessage ? (
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-400/20 rounded-lg">
                              <XCircle className="w-3.5 h-3.5 text-red-400 flex shrink-0 mt-0.5" />
                              <span className="text-xs text-red-300 font-medium wrap-break-words">{log.errorMessage}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-blue-300/50 italic">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-blue-400/20 bg-blue-950/40 text-sm text-blue-300/70 flex items-center justify-between">
              <span>Mostrando <span className="font-semibold text-blue-300">{logs.length}</span> registro{logs.length !== 1 ? 's' : ''}</span>
              <div className="text-xs">
                <span className="inline-block px-2 py-1 bg-blue-500/20 rounded text-blue-300 mr-2">
                  {logs.filter(l => l.status === 'online').length} exitosos
                </span>
                <span className="inline-block px-2 py-1 bg-red-500/20 rounded text-red-300">
                  {logs.filter(l => l.status === 'offline').length} fallidos
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        select {
          background-image: none !important;
        }
        
        select::-ms-expand {
          display: none;
        }
        
        select option {
          background-color: #0f172a;
          color: #e0e7ff;
          padding: 10px 8px;
        }
        
        select option:checked {
          background: linear-gradient(#1e3a8a, #1e3a8a);
          background-color: #1e3a8a;
        }
        
        select option:hover {
          background: linear-gradient(#1e3a8a, #1e3a8a);
          background-color: #1e3a8a;
        }
        
        table {
          --tw-ring-offset-shadow: none;
        }
        
        tbody tr {
          transition: background-color 0.2s ease;
        }
        
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(147, 197, 253, 0.3);
          border-radius: 3px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 197, 253, 0.5);
        }
      `}</style>
    </div>
  );
}