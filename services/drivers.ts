import { IVDInstrumentDriver, InstrumentState, InstrumentStatus, DriverMetadata, ReactionCurveData, QCDataPoint } from "../types";

// Base helper for simulation
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Driver A: High-Speed Clinical Chemistry Analyzer
 * Simulates: Mindray BS-Series or Roche Cobas c-series
 */
export class ChemistryAnalyzerDriver implements IVDInstrumentDriver {
  metadata: DriverMetadata = {
    id: 'chem-001',
    manufacturer: 'Mindray',
    model: 'BS-2000M',
    version: '3.1.2',
    type: 'Chemistry'
  };

  private currentState: InstrumentState = {
    status: InstrumentStatus.RUNNING,
    reactionTemp: 37.0,
    reagentVol: 100,
    sampleCount: 1240,
    lastError: null,
    throughput: 800
  };

  async connect(): Promise<boolean> {
    console.log(`[Driver] Connecting to ${this.metadata.model} via TCP/IP...`);
    await sleep(500);
    return true;
  }

  async disconnect(): Promise<void> {
    console.log(`[Driver] Disconnecting...`);
  }

  async getTelemetry(): Promise<InstrumentState> {
    // Simulate physics and state changes
    
    // 1. Temp fluctuation (Stable PID)
    const drift = (Math.random() - 0.5) * 0.15;
    let newTemp = this.currentState.reactionTemp + drift;
    newTemp = Math.max(36.7, Math.min(37.3, newTemp));

    // 2. Reagent consumption (High throughput = faster consumption)
    let newReagent = this.currentState.reagentVol;
    if (this.currentState.status === InstrumentStatus.RUNNING) {
      newReagent -= 0.08;
      if (newReagent < 0) newReagent = 0;
    }

    // 3. Random Errors
    let newStatus = this.currentState.status;
    let newError = this.currentState.lastError;
    
    // 0.5% chance of error
    if (Math.random() < 0.005 && newStatus === InstrumentStatus.RUNNING) {
      newStatus = InstrumentStatus.ERROR;
      newError = "E-304: Vertical Motor Step Loss";
    }

    this.currentState = {
      ...this.currentState,
      reactionTemp: Number(newTemp.toFixed(2)),
      reagentVol: Number(newReagent.toFixed(1)),
      status: newStatus,
      lastError: newError,
      throughput: newStatus === InstrumentStatus.RUNNING ? 780 + Math.floor(Math.random() * 40) : 0
    };

    return { ...this.currentState };
  }

  async getQCData(testId?: string): Promise<QCDataPoint[]> {
    // Return Chemistry QC (e.g., ALT/AST) - tight CV
    const points: QCDataPoint[] = [];
    const mean = 45;
    const sd = 1.5;
    for (let i = 1; i <= 20; i++) {
      const shift = i > 15 ? 1.0 * sd : 0; // Late shift
      const val = mean + (Math.random() - 0.5) * 2 * sd + shift;
      points.push({ batch: i, value: val, mean, sd });
    }
    return points;
  }

  async getReactionCurve(sampleId?: string): Promise<ReactionCurveData[]> {
    // Standard colorimetric curve (increasing absorbance)
    const points: ReactionCurveData[] = [];
    const maxTime = 60;
    const hasError = this.currentState.lastError !== null;

    for (let t = 1; t <= maxTime; t++) {
      let od = 0;
      if (hasError) {
        // Noisy/Hook effect
        od = (1 - Math.exp(-0.1 * t)) + (Math.random() * 0.2); 
      } else {
        // Smooth kinetics
        od = 1.8 * (1 - Math.exp(-0.08 * t)) + (Math.random() * 0.005);
      }
      points.push({ time: t, od: Number(od.toFixed(4)) });
    }
    return points;
  }

  async executeCommand(command: string): Promise<{success: boolean, message: string}> {
    if (command === 'RESET_ERROR') {
      this.currentState.status = InstrumentStatus.IDLE;
      this.currentState.lastError = null;
      return { success: true, message: 'Error cleared. System Idle.' };
    }
    return { success: true, message: `Command ${command} received.` };
  }
}

/**
 * Driver B: Immunoassay Analyzer (Chemiluminescence)
 * Simulates: Beckman Access 2 or Siemens Centaur
 * Characteristics: Lower throughput, higher sensitivity, different QC patterns.
 */
export class ImmunoassayDriver implements IVDInstrumentDriver {
  metadata: DriverMetadata = {
    id: 'ia-002',
    manufacturer: 'Beckman',
    model: 'Access 2 Pro',
    version: '1.0.4',
    type: 'Immunoassay'
  };

  private currentState: InstrumentState = {
    status: InstrumentStatus.RUNNING,
    reactionTemp: 37.0,
    reagentVol: 100,
    sampleCount: 450,
    lastError: null,
    throughput: 100
  };

  async connect(): Promise<boolean> {
    await sleep(800);
    return true;
  }
  
  async disconnect(): Promise<void> {}

  async getTelemetry(): Promise<InstrumentState> {
    // Immunoassays need very stable temp
    const drift = (Math.random() - 0.5) * 0.05; // Tighter temp control
    let newTemp = this.currentState.reactionTemp + drift;
    
    // Slower reagent consumption
    let newReagent = this.currentState.reagentVol;
    if (this.currentState.status === InstrumentStatus.RUNNING) {
      newReagent -= 0.02; 
    }

    // Occasional jamming error
    if (Math.random() < 0.002 && this.currentState.status === InstrumentStatus.RUNNING) {
      this.currentState.status = InstrumentStatus.ERROR;
      this.currentState.lastError = "E-501: Cuvette Transport Jam";
    }

    this.currentState = {
      ...this.currentState,
      reactionTemp: Number(newTemp.toFixed(2)),
      reagentVol: Number(newReagent.toFixed(1)),
      throughput: this.currentState.status === InstrumentStatus.RUNNING ? 100 : 0
    };

    return { ...this.currentState };
  }

  async getQCData(): Promise<QCDataPoint[]> {
    // Immunoassay QC often has higher CV than chemistry
    const points: QCDataPoint[] = [];
    const mean = 5.2; // e.g., TSH
    const sd = 0.4;
    for (let i = 1; i <= 20; i++) {
      const val = mean + (Math.random() - 0.5) * 2 * sd;
      points.push({ batch: i, value: val, mean, sd });
    }
    return points;
  }

  async getReactionCurve(): Promise<ReactionCurveData[]> {
    // Chemiluminescence "Flash" curve (Rapid rise and fall)
    const points: ReactionCurveData[] = [];
    for (let t = 1; t <= 60; t++) {
      // Gaussian shape for flash
      const peak = 30;
      const width = 5;
      const od = 200000 * Math.exp( -0.5 * Math.pow((t - peak)/width, 2) );
      // Normalize for the chart (0-2 range usually, but RLUs are high. We normalize to simulate OD for the unified chart)
      const normalizedOD = od / 100000; 
      points.push({ time: t, od: Number(normalizedOD.toFixed(4)) });
    }
    return points;
  }

  async executeCommand(command: string): Promise<any> {
    if (command === 'RESET_ERROR') {
      this.currentState.status = InstrumentStatus.IDLE;
      this.currentState.lastError = null;
      return { success: true, message: 'Transport cleared.' };
    }
    return { success: true };
  }
}

/**
 * Driver C: Lifotronic Technology ECL Analyzer (Electro-chemiluminescence)
 * Simulates: Lifotronic ECL9000
 * Characteristics: High throughput (300T/H), ECL sharp peaks, stable control.
 */
export class LifotronicECLDriver implements IVDInstrumentDriver {
  metadata: DriverMetadata = {
    id: 'ecl-9000-cn',
    manufacturer: 'Lifotronic',
    model: 'ECL9000',
    version: '2.0.1',
    type: 'Immunoassay'
  };

  private currentState: InstrumentState = {
    status: InstrumentStatus.RUNNING,
    reactionTemp: 37.0,
    reagentVol: 100,
    sampleCount: 2100,
    lastError: null,
    throughput: 300
  };

  async connect(): Promise<boolean> {
    console.log(`[Driver] Connecting to Lifotronic ECL9000 Serial Interface...`);
    await sleep(600);
    return true;
  }
  
  async disconnect(): Promise<void> {}

  async getTelemetry(): Promise<InstrumentState> {
    // ECL requires precise temp, but Lifotronic is robust.
    const drift = (Math.random() - 0.5) * 0.1; 
    let newTemp = this.currentState.reactionTemp + drift;
    
    // Moderate reagent consumption
    let newReagent = this.currentState.reagentVol;
    if (this.currentState.status === InstrumentStatus.RUNNING) {
      newReagent -= 0.04; 
    }

    // Occasional voltage error
    if (Math.random() < 0.001 && this.currentState.status === InstrumentStatus.RUNNING) {
      this.currentState.status = InstrumentStatus.ERROR;
      this.currentState.lastError = "E-808: High Voltage Output Abnormal";
    }

    this.currentState = {
      ...this.currentState,
      reactionTemp: Number(newTemp.toFixed(2)),
      reagentVol: Number(newReagent.toFixed(1)),
      throughput: this.currentState.status === InstrumentStatus.RUNNING ? 300 : 0
    };

    return { ...this.currentState };
  }

  async getQCData(): Promise<QCDataPoint[]> {
    // ECL often has excellent precision
    const points: QCDataPoint[] = [];
    const mean = 1200; // RLU-like or Concentration
    const sd = 25;
    for (let i = 1; i <= 20; i++) {
      const val = mean + (Math.random() - 0.5) * 2 * sd;
      points.push({ batch: i, value: val, mean, sd });
    }
    return points;
  }

  async getReactionCurve(): Promise<ReactionCurveData[]> {
    // ECL Signal: Very sharp voltage-induced spike
    const points: ReactionCurveData[] = [];
    for (let t = 1; t <= 60; t++) {
      // Very narrow gaussian
      const peak = 15;
      const width = 2.5; 
      const signal = 500000 * Math.exp( -0.5 * Math.pow((t - peak)/width, 2) );
      // Decay tail
      const tail = t > peak ? 10000 * Math.exp(-0.1 * (t - peak)) : 0;
      
      const normalizedSignal = (signal + tail) / 200000; 
      points.push({ time: t, od: Number(normalizedSignal.toFixed(4)) });
    }
    return points;
  }

  async executeCommand(command: string): Promise<any> {
    if (command === 'RESET_ERROR') {
      this.currentState.status = InstrumentStatus.IDLE;
      this.currentState.lastError = null;
      return { success: true, message: 'HV Module Reset.' };
    }
    return { success: true };
  }
}

// Registry to easily access drivers
export const DriverRegistry = {
  Chemistry: new ChemistryAnalyzerDriver(),
  Immunoassay: new ImmunoassayDriver(),
  Lifotronic: new LifotronicECLDriver()
};