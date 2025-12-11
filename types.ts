export enum InstrumentStatus {
  IDLE = 'Idle',
  RUNNING = 'Running',
  MAINTENANCE = 'Maintenance',
  ERROR = 'Error'
}

export interface InstrumentState {
  status: InstrumentStatus;
  reactionTemp: number; // Celsius
  reagentVol: number; // Percentage
  sampleCount: number;
  lastError: string | null;
  throughput: number; // Tests per hour
}

export interface QCDataPoint {
  batch: number;
  value: number;
  mean: number;
  sd: number;
}

export interface ReactionCurveData {
  time: number;
  od: number; // Optical Density
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  code?: string;
}

// --- New Generic Interface Definitions ---

export interface DriverMetadata {
  id: string;
  manufacturer: string;
  model: string;
  version: string;
  type: 'Chemistry' | 'Immunoassay' | 'Hematology' | 'Molecular';
}

/**
 * The standard contract for any IVD Instrument Driver.
 * Manufacturers must implement this interface to integrate with IVD-Copilot.
 */
export interface IVDInstrumentDriver {
  metadata: DriverMetadata;
  
  /** Initialize connection to the physical or simulated instrument */
  connect(): Promise<boolean>;
  
  /** Close connection */
  disconnect(): Promise<void>;
  
  /** Fetch the real-time telemetry state */
  getTelemetry(): Promise<InstrumentState>;
  
  /** Fetch QC history for visualization */
  getQCData(testId?: string): Promise<QCDataPoint[]>;
  
  /** Fetch reaction kinetics or raw data for a sample */
  getReactionCurve(sampleId?: string): Promise<ReactionCurveData[]>;
  
  /** Send a command to the instrument (e.g., 'PAUSE', 'RESET') */
  executeCommand(command: string, params?: any): Promise<{success: boolean, message: string}>;
}