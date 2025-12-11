import React, { useState } from 'react';
import { InstrumentState, QCDataPoint } from '../types';
import { generateInstrumentReport } from '../services/geminiService';
import { FileText, Download, RefreshCw, Printer, Loader2, ShieldCheck, Activity, FileCheck, Wrench, AlertTriangle, Droplet } from 'lucide-react';

interface Props {
  instrumentState: InstrumentState;
  qcData: QCDataPoint[];
}

const REPORT_TEMPLATES = [
  { name: 'Daily Status Report', icon: ShieldCheck, desc: 'General system health and telemetry' },
  { name: 'Monthly QC Summary', icon: Activity, desc: 'Westgard rules and Levey-Jennings analysis' },
  { name: 'Calibration Certificate', icon: FileCheck, desc: 'Slope, intercept, and curve validation' },
  { name: 'Maintenance Log', icon: Wrench, desc: 'Cleaning cycles and part replacement history' },
  { name: 'Error History Audit', icon: AlertTriangle, desc: 'Detailed log of recent alarms and warnings' },
  { name: 'Reagent Usage Report', icon: Droplet, desc: 'Consumption rates and lot tracking' },
];

const Reports: React.FC<Props> = ({ instrumentState, qcData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(REPORT_TEMPLATES[0]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Prepare a brief summary of QC data to save tokens
    const lastQC = qcData[qcData.length - 1];
    const qcSummary = `Latest Batch: ${lastQC.batch}, Value: ${lastQC.value.toFixed(2)} (Mean: ${lastQC.mean}, SD: ${lastQC.sd})`;

    try {
      const content = await generateInstrumentReport(instrumentState, qcSummary, selectedTemplate.name);
      setReportContent(content);
      setLastGenerated(new Date());
    } catch (e) {
      setReportContent("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Reports</h2>
          <p className="text-sm text-gray-500">Generate and export technical documentation</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-ivd-600 hover:bg-ivd-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
            {isGenerating ? "Analyzing..." : `Generate ${selectedTemplate.name.split(' ')[0]} Report`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Sidebar / List */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Available Templates</h3>
            <div className="space-y-2">
              {REPORT_TEMPLATES.map((t) => (
                <button 
                  key={t.name}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left px-3 py-3 rounded-md text-sm font-medium border flex items-center justify-between transition-all ${
                    selectedTemplate.name === t.name 
                    ? 'bg-ivd-50 text-ivd-700 border-ivd-200 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <t.icon size={16} className={selectedTemplate.name === t.name ? 'text-ivd-600' : 'text-gray-400'} />
                    <div>
                        <div className="leading-none">{t.name}</div>
                        <div className="text-[10px] font-normal text-gray-400 mt-1">{t.desc}</div>
                    </div>
                  </div>
                  {selectedTemplate.name === t.name && <div className="w-1.5 h-1.5 rounded-full bg-ivd-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
               <FileText className="text-blue-600 mt-1" size={20} />
               <div>
                 <h4 className="text-sm font-bold text-blue-800">AI Reporting</h4>
                 <p className="text-xs text-blue-600 mt-1">
                   IVD-Copilot analyzes real-time telemetry and QC databases to construct ISO-compliant technical reports automatically.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Report Preview Area */}
        <div className="col-span-12 md:col-span-9 flex flex-col">
          <div className="bg-white flex-1 rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
             {/* Toolbar */}
             <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50">
                <span className="text-xs font-mono text-gray-500">
                  {lastGenerated ? `Generated: ${lastGenerated.toLocaleString()}` : 'No report generated'}
                </span>
                <div className="flex gap-2">
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Print">
                    <Printer size={16} />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Export PDF">
                    <Download size={16} />
                  </button>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
               {reportContent ? (
                 <div className="max-w-3xl mx-auto bg-white min-h-[600px] p-10 shadow-lg text-slate-800">
                    {/* Header Logo */}
                    <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-8">
                       <div className="flex items-center gap-2 text-slate-900">
                          <ShieldCheck size={32} />
                          <div>
                            <h1 className="text-xl font-bold leading-none">IVD-Copilot</h1>
                            <span className="text-xs tracking-widest uppercase">Intelligent Diagnostics</span>
                          </div>
                       </div>
                       <div className="text-right">
                         <div className="text-sm font-bold">CONFIDENTIAL</div>
                         <div className="text-xs text-gray-500">Auto-Generated Document</div>
                         <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{selectedTemplate.name}</div>
                       </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="prose prose-sm max-w-none font-mono whitespace-pre-wrap">
                      {reportContent}
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-[10px] text-gray-400">
                       <span>Device ID: IVD-CHEM-001</span>
                       <span>Page 1 of 1</span>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400">
                   <div className="bg-gray-50 p-6 rounded-full mb-4">
                     <selectedTemplate.icon size={48} className="opacity-20 text-gray-600" />
                   </div>
                   <p className="text-sm font-medium text-gray-600">Select "{selectedTemplate.name}" and click Generate</p>
                   <p className="text-xs text-gray-400 mt-2 max-w-xs text-center">AI will analyze system logs to create this report.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;