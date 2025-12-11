import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import StatusMonitor from './components/StatusMonitor';
import ChatAssistant from './components/ChatAssistant';
import Reports from './components/Reports';
import Configuration from './components/Configuration';
import { ReactionCurveChart, QCChart } from './components/Charts';
import { InstrumentState, InstrumentStatus, IVDInstrumentDriver, QCDataPoint, ReactionCurveData } from './types';
import { DriverRegistry } from './services/drivers';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // -- Driver Management --
  const [currentDriver, setCurrentDriver] = useState<IVDInstrumentDriver>(DriverRegistry.Chemistry);
  
  // -- App State --
  const [instrumentState, setInstrumentState] = useState<InstrumentState>({
    status: InstrumentStatus.IDLE,
    reactionTemp: 0,
    reagentVol: 0,
    sampleCount: 0,
    lastError: null,
    throughput: 0
  });

  const [reactionData, setReactionData] = useState<ReactionCurveData[]>([]);
  const [qcData, setQCData] = useState<QCDataPoint[]>([]);

  // Initialize Connection
  useEffect(() => {
    const initDriver = async () => {
      await currentDriver.connect();
      // Fetch initial static data
      const qc = await currentDriver.getQCData();
      setQCData(qc);
    };
    initDriver();
    return () => { currentDriver.disconnect(); }
  }, [currentDriver]);

  // Main Polling Loop using the Interface
  useEffect(() => {
    const pollInstrument = async () => {
      // 1. Get Telemetry
      const state = await currentDriver.getTelemetry();
      setInstrumentState(state);
      
      // 2. Get Real-time Charts
      const curve = await currentDriver.getReactionCurve();
      setReactionData(curve);
    };

    const interval = setInterval(pollInstrument, 2000);
    return () => clearInterval(interval);
  }, [currentDriver]);

  // Handler for clearing errors (Command Pattern)
  const handleClearError = async () => {
    await currentDriver.executeCommand('RESET_ERROR');
    // Force immediate refresh
    const state = await currentDriver.getTelemetry();
    setInstrumentState(state);
  };

  const switchDriver = (type: 'Chemistry' | 'Immunoassay' | 'Lifotronic') => {
    // In a real app, we would await disconnect() first
    setCurrentDriver(DriverRegistry[type]);
    setActiveTab('dashboard'); // Go back to dashboard to see changes
  };

  // Main Content Renderer
  const renderContent = () => {
    switch(activeTab) {
      case 'chat':
        return <ChatAssistant instrumentState={instrumentState} />;
      case 'reports':
        return <Reports instrumentState={instrumentState} qcData={qcData} />;
      case 'config':
        return (
          <Configuration 
            currentDriverMetadata={currentDriver.metadata} 
            onDriverChange={switchDriver}
          />
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">Operational Dashboard</h2>
                   <p className="text-xs text-gray-400 mt-1">
                     Connected to: {currentDriver.metadata.manufacturer} {currentDriver.metadata.model}
                   </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Connection
                </div>
             </div>

             <div className="grid grid-cols-12 gap-6">
               {/* Alert Banner if Error */}
               {instrumentState.status === InstrumentStatus.ERROR && (
                 <div className="col-span-12 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <AlertCircle className="text-red-600" />
                     <div>
                       <h3 className="font-bold text-red-800">Hardware Error Detected</h3>
                       <p className="text-red-600 text-sm">{instrumentState.lastError}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                    <button 
                       onClick={handleClearError}
                       className="px-4 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                     >
                       Attempt Reset
                     </button>
                     <button 
                       onClick={() => setActiveTab('chat')}
                       className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                     >
                       Diagnose with AI Copilot
                     </button>
                   </div>
                 </div>
               )}

               {/* Reaction Curve Panel */}
               <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="font-bold text-gray-800">
                       {currentDriver.metadata.type === 'Immunoassay' ? 'Signal Kinetics (RLU)' : 'Reaction Curve (OD)'}
                     </h3>
                     <p className="text-xs text-gray-400">Sample ID: #882910 | Test: {currentDriver.metadata.type === 'Immunoassay' ? 'TSH/ECL' : 'ALT'}</p>
                   </div>
                   <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">Real-time</span>
                 </div>
                 <div className="h-[300px]">
                    <ReactionCurveChart data={reactionData} />
                 </div>
               </div>

               {/* Quick Stats Panel */}
               <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Current Batch Info */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Current Batch</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">Completed</span>
                        <span className="font-mono font-medium">
                          {Math.floor(instrumentState.sampleCount % 100)}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">Est. Time Remaining</span>
                        <span className="font-mono font-medium">12m 30s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">ISE Status</span>
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <CheckCircle2 size={14}/> Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calibration Status */}
                   <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Calibration</h3>
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-full border-4 border-ivd-500 border-t-transparent animate-spin flex items-center justify-center">
                       </div>
                       <div>
                         <div className="text-sm font-medium">Auto-calibrating</div>
                         <div className="text-xs text-gray-400">ISE Module A</div>
                       </div>
                    </div>
                  </div>
               </div>

               {/* QC Chart Panel */}
               <div className="col-span-12 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="font-bold text-gray-800">Quality Control (Levey-Jennings)</h3>
                     <p className="text-xs text-gray-400">
                       Test: {currentDriver.metadata.type === 'Immunoassay' ? 'TSH' : 'ALT'} | Lot: 23901A
                     </p>
                   </div>
                   <div className="flex gap-2">
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors">Daily</button>
                      <button className="text-xs bg-ivd-50 text-ivd-700 px-3 py-1 rounded font-medium">Batch</button>
                   </div>
                 </div>
                 <div className="h-[250px]">
                    <QCChart data={qcData} />
                 </div>
               </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-slate-50">
      {/* Left Nav */}
      <Navigation currentTab={activeTab} setTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-gray-700">
              Lab Unit 01 / {currentDriver.metadata.manufacturer}
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">{currentDriver.metadata.id}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <div className="text-xs font-bold text-gray-800">Dr. Sarah Chen</div>
               <div className="text-[10px] text-gray-400">Senior Technician</div>
             </div>
             <div className="h-8 w-8 rounded-full bg-ivd-100 text-ivd-700 flex items-center justify-center font-bold text-xs border border-ivd-200">
               SC
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {renderContent()}
        </div>
      </main>

      {/* Right Status Panel */}
      <StatusMonitor state={instrumentState} />
    </div>
  );
};

export default App;