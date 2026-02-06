'use client';

import { useState } from 'react';
import { Plus, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddServiceFormProps {
  onServiceAdded: () => void;
}

export default function AddServiceForm({ onServiceAdded }: AddServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'http' as 'http' | 'ping',
    enabled: true,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add service');
      }

      // Reset form
      setFormData({
        name: '',
        url: '',
        type: 'http',
        enabled: true,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
      
      onServiceAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setSuccess(false);
    setFormData({
      name: '',
      url: '',
      type: 'http',
      enabled: true,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-full overflow-hidden rounded-xl px-4 py-3 font-semibold transition-all duration-300"
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        
        {/* Border glow */}
        <div className="absolute inset-0 rounded-xl border border-blue-400/0 group-hover:border-blue-300/50 transition-all duration-300 shadow-lg shadow-blue-500/0 group-hover:shadow-blue-500/30"></div>
        
        {/* Content */}
        <div className="relative flex items-center justify-center gap-2 text-white">
          <Plus className="w-5 h-5" />
          <span>Agregar Nuevo Servicio</span>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-md">
          {/* Glow background */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-50 -z-10"></div>
          
          {/* Card */}
          <div className="relative bg-linear-to-br from-blue-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-400/30 shadow-2xl shadow-blue-500/20 overflow-hidden">
            
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-blue-400/20 bg-linear-to-r from-blue-950/60 to-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold bg-linear-to-r from-blue-200 to-cyan-300 bg-clip-text text-transparent">
                    Nuevo Servicio
                  </h3>
                  <p className="text-xs text-blue-300/60 mt-1">Agrega un nuevo servicio para monitorear</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 text-blue-300 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-lg animate-pulse"></div>
                    <div className="relative p-3 bg-emerald-500/20 rounded-full">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-emerald-300">¡Servicio agregado!</p>
                    <p className="text-sm text-blue-300/60 mt-1">El servicio está siendo monitoreado</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-blue-950/50 border border-blue-400/20 rounded-lg text-blue-100 placeholder-blue-400/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                      placeholder="Mi servidor API"
                      required
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2.5 bg-blue-950/50 border border-blue-400/20 rounded-lg text-blue-100 placeholder-blue-400/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                      placeholder="https://ejemplo.com"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-2">
                      Tipo de Monitoreo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'http' | 'ping' })}
                      className="w-full px-4 py-2.5 bg-blue-950/50 border border-blue-400/20 rounded-lg text-blue-100 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                    >
                      <option value="http" className="bg-slate-900 text-blue-100">HTTP/HTTPS</option>
                      <option value="ping" className="bg-slate-900 text-blue-100">Ping (ICMP)</option>
                    </select>
                  </div>

                  {/* Enable Monitoring */}
                  <div className="flex items-center p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg hover:bg-blue-500/15 transition-all duration-200 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 rounded bg-blue-950/50 border border-blue-400/30 cursor-pointer accent-blue-500 transition-all duration-200"
                    />
                    <label htmlFor="enabled" className="ml-3 text-sm font-medium text-blue-200 cursor-pointer group-hover:text-blue-100">
                      Habilitar monitoreo
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-lg animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-red-400 flex shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-300">Error</p>
                        <p className="text-sm text-red-300/80 mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 relative overflow-hidden rounded-lg px-4 py-2.5 font-semibold transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 transition-transform duration-300"></div>
                      <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <div className="relative flex items-center justify-center gap-2 text-white">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Agregando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Agregar Servicio</span>
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-semibold transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}