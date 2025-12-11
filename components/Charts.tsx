import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ReactionCurveData, QCDataPoint } from '../types';

interface ReactionCurveProps {
  data: ReactionCurveData[];
}

export const ReactionCurveChart: React.FC<ReactionCurveProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tick={{fontSize: 12}}
            label={{ value: 'Time (cycles)', position: 'insideBottomRight', offset: -5, fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{fontSize: 12}}
            domain={[0, 2.0]}
            label={{ value: 'OD', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="od" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface QCChartProps {
  data: QCDataPoint[];
}

export const QCChart: React.FC<QCChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  const { mean, sd } = data[0];

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="batch" stroke="#64748b" tick={{fontSize: 12}} />
          <YAxis domain={[mean - 4*sd, mean + 4*sd]} stroke="#64748b" tick={{fontSize: 12}} />
          <Tooltip />
          
          {/* Mean Line */}
          <ReferenceLine y={mean} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Mean', fill: '#10b981', fontSize: 10 }} />
          
          {/* SD Lines */}
          <ReferenceLine y={mean + 2*sd} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '+2SD', fill: '#f59e0b', fontSize: 10 }} />
          <ReferenceLine y={mean - 2*sd} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '-2SD', fill: '#f59e0b', fontSize: 10 }} />
          
          <ReferenceLine y={mean + 3*sd} stroke="#ef4444" label={{ value: '+3SD', fill: '#ef4444', fontSize: 10 }} />
          <ReferenceLine y={mean - 3*sd} stroke="#ef4444" label={{ value: '-3SD', fill: '#ef4444', fontSize: 10 }} />

          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ r: 4, strokeWidth: 1 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};