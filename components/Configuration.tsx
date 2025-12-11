import React, { useState } from 'react';
import { Settings, Thermometer, FlaskConical, AlertTriangle, Database, Bell, Save, Cable } from 'lucide-react';
import { DriverMetadata } from '../types';

interface Props {
  currentDriverMetadata: DriverMetadata;
  onDriverChange: (type: 'Chemistry' | 'Immunoassay' | 'Lifotronic') => void;
}

const Configuration: React.FC<Props> = ({ currentDriverMetadata, onDriverChange }) => {
  const [tempThreshold, setTempThreshold] = useState(0.3);
  const [reagentWarning, setReagentWarning] = useState(15);
  const [autoClean, setAutoClean] = useState(true);
  const [labName, setLabName] = useState("Central Lab - Unit 01");
  const [errorSimRate, setErrorSimRate] = useState(0.5);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">System Configuration</h2>
        <p className="text-sm text-gray-500">Manage instrument parameters, alert thresholds, and lab settings.</p>
      </div>

      <div className="space-y-6">

        {/* Driver Selection (New Feature) */}
        <div className="bg-white rounded-xl border border-ivd-200 shadow-sm overflow-hidden ring-2 ring-ivd-50">
          <div className="px-6 py-4 border-b border-gray-100 bg-ivd-50 flex items-center gap-2">
            <Cable size={18} className="text-ivd-600"/>
            <h3 className="font-semibold text-gray-700">Instrument Interface Driver</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">Select the active vendor driver to communicate with the target instrument.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => onDriverChange('Chemistry')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  currentDriverMetadata.type === 'Chemistry' 
                  ? 'bg-ivd-600 text-white border-ivd-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ivd-300'
                }`}
              >
                <div className="font-bold">Mindray BS-2000M</div>
                <div className={`text-xs mt-1 ${currentDriverMetadata.type === 'Chemistry' ? 'text-ivd-100' : 'text-gray-400'}`}>High-Volume Chemistry</div>
              </button>
              
              <button 
                onClick={() => onDriverChange('Immunoassay')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  currentDriverMetadata.type === 'Immunoassay' && currentDriverMetadata.manufacturer === 'Beckman'
                  ? 'bg-ivd-600 text-white border-ivd-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ivd-300'
                }`}
              >
                <div className="font-bold">Beckman Access 2</div>
                <div className={`text-xs mt-1 ${currentDriverMetadata.type === 'Immunoassay' && currentDriverMetadata.manufacturer === 'Beckman' ? 'text-ivd-100' : 'text-gray-400'}`}>Chemiluminescence IA</div>
              </button>

              <button 
                onClick={() => onDriverChange('Lifotronic')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  currentDriverMetadata.manufacturer === 'Lifotronic'
                  ? 'bg-ivd-600 text-white border-ivd-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ivd-300'
                }`}
              >
                <div className="font-bold">Lifotronic ECL9000</div>
                <div className={`text-xs mt-1 ${currentDriverMetadata.manufacturer === 'Lifotronic' ? 'text-ivd-100' : 'text-gray-400'}`}>Electro-Chemiluminescence</div>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
               <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Driver Active: {currentDriverMetadata.manufacturer} {currentDriverMetadata.model} (v{currentDriverMetadata.version})
            </div>
          </div>
        </div>
        
        {/* Lab Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Database size={18} className="text-ivd-600"/>
            <h3 className="font-semibold text-gray-700">Laboratory Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Identifier / Name</label>
              <input 
                type="text" 
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivd-500 focus:border-ivd-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator ID</label>
              <input 
                type="text" 
                defaultValue="OP-8821 (Dr. Chen)"
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Operational Limits */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <AlertTriangle size={18} className="text-ivd-600"/>
            <h3 className="font-semibold text-gray-700">Alert Thresholds</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Thermometer size={20}/></div>
                <div>
                   <div className="text-sm font-medium text-gray-800">Temperature Deviation Limit</div>
                   <div className="text-xs text-gray-500">Trigger alarm if reaction disk deviates by ±X °C</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <input 
                   type="range" min="0.1" max="1.0" step="0.1" 
                   value={tempThreshold}
                   onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                   className="w-32 accent-ivd-600"
                 />
                 <span className="text-sm font-mono font-bold w-12 text-right">±{tempThreshold}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FlaskConical size={20}/></div>
                <div>
                   <div className="text-sm font-medium text-gray-800">Reagent Low Level Warning</div>
                   <div className="text-xs text-gray-500">Notify when reagent volume drops below %</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <input 
                   type="range" min="5" max="30" step="5" 
                   value={reagentWarning}
                   onChange={(e) => setReagentWarning(parseInt(e.target.value))}
                   className="w-32 accent-ivd-600"
                 />
                 <span className="text-sm font-mono font-bold w-12 text-right">{reagentWarning}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Settings size={18} className="text-ivd-600"/>
            <h3 className="font-semibold text-gray-700">Automation & Maintenance</h3>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-sm font-medium text-gray-800">Auto-Wash Cycle</div>
                   <div className="text-xs text-gray-500">Perform needle wash after every 100 samples</div>
                </div>
                <button 
                  onClick={() => setAutoClean(!autoClean)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoClean ? 'bg-ivd-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoClean ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg shadow-slate-200 transition-all">
              <Save size={18} />
              Save Configuration
           </button>
        </div>

      </div>
    </div>
  );
};

export default Configuration;