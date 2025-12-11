import React from 'react';
import { InstrumentState, InstrumentStatus } from '../types';
import { Thermometer, Beaker, Activity, AlertTriangle, Cpu, Droplet } from 'lucide-react';

interface Props {
  state: InstrumentState;
}

const StatusMonitor: React.FC<Props> = ({ state }) => {
  const isError = state.status === InstrumentStatus.ERROR;
  const tempStatus = Math.abs(state.reactionTemp - 37.0) > 0.3 ? 'text-alert-error' : 'text-ivd-600';

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-lg z-10">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} />
          System Telemetry
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Status Indicator */}
        <div className={`p-4 rounded-lg border ${isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="text-xs text-gray-500 mb-1">Operational Status</div>
          <div className={`text-xl font-bold flex items-center gap-2 ${isError ? 'text-red-700' : 'text-green-700'}`}>
            {isError ? <AlertTriangle size={24} /> : <Cpu size={24} />}
            {state.status}
          </div>
          {state.lastError && (
            <div className="mt-2 text-xs font-mono text-red-600 bg-red-100 p-2 rounded">
              {state.lastError}
            </div>
          )}
        </div>

        {/* Temperature Module */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Thermal Control</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Thermometer size={16} /> Reaction Disk
              </span>
              <span className={`text-lg font-mono font-bold ${tempStatus}`}>
                {state.reactionTemp.toFixed(2)}°C
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-ivd-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '60%', marginLeft: `${(state.reactionTemp - 30) * 5}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>30°C</span>
              <span>Target: 37.0°C</span>
              <span>45°C</span>
            </div>
          </div>
        </div>

        {/* Reagents */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Fluidics & Reagents</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Beaker size={16} /> Reagent A
              </span>
              <span className="text-sm font-bold text-gray-700">{state.reagentVol}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${state.reagentVol < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${state.reagentVol}%` }} 
              />
            </div>
          </div>
           <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Droplet size={16} /> Wash Buffer
              </span>
              <span className="text-sm font-bold text-gray-700">82%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `82%` }} 
              />
            </div>
          </div>
        </div>

        {/* Throughput */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Performance</h3>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-gray-600">Throughput</span>
            <span className="text-xl font-mono font-bold text-slate-700">
              {state.throughput} <span className="text-xs text-gray-400 font-sans">T/H</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusMonitor;