export interface Service {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'ping';
  enabled: boolean;
  createdAt: string;
}

export interface LogEntry {
  timestamp: string;
  serviceId: string;
  serviceName: string;
  status: 'online' | 'offline';
  responseTime?: number;
  errorMessage?: string;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptime: number;
  lastCheck: string;
  lastStatus: 'online' | 'offline';
}