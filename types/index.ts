export interface Service {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'ping';
  enabled: boolean;
  createdAt: string;
}

export interface LogEntry {
  /** unique identifier for the log entry; may be generated on the fly if absent */
  id?: string | number;
  timestamp: string;

  /** service metadata (some older code used `serviceId` as the grouping key) */
  serviceId?: string;
  serviceName: string;

  /**
   * the raw status string coming from the check. previous versions
   * used the limited union `'online' | 'offline'`; new designs allow
   * arbitrary HTTP-style codes such as "200 OK" or "503 ERR".
   */
  status: string;

  /**
   * human-readable response value (e.g. "24ms"). older records stored
   * a numeric `responseTime` which we keep around for compatibility.
   */
  response?: string;
  responseTime?: number;

  /**
   * optional details field (e.g. error message). previously called
   * `errorMessage`.
   */
  details?: string;
  errorMessage?: string;
}

export interface ServiceStats {
  /**
   * id of the service; may be missing for legacy logs that only provide a name
   */
  serviceId?: string;

  serviceName: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptime: number;
  lastCheck: string;
  /** generic status string ("online", "offline", "200 OK", etc.) */
  lastStatus: string;
}