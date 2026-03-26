import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import useStore from '../../store/useStore';

const MetricsDashboard = () => {
  const { simulationResults } = useStore();

  if (!simulationResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full p-6 text-sm">
        <div className="mb-2 text-slate-600">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        Run a simulation to view performance metrics and bottleneck analysis.
      </div>
    );
  }

  const { timeline, summary } = simulationResults;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 px-6">
      {/* Top summary stats */}
      <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 shadow-inner">
         <div className="flex-1 flex justify-center text-center px-6 border-r border-slate-700/50">
           <div>
             <div className="text-2xl font-bold text-emerald-400">{summary.totalProcessed.toLocaleString()}</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Total Processed</div>
           </div>
         </div>
         <div className="flex-1 flex justify-center text-center px-6 border-r border-slate-700/50">
           <div>
             <div className="text-2xl font-bold text-rose-400">{summary.totalFailed.toLocaleString()}</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Total Failed</div>
           </div>
         </div>
         <div className="flex-1 flex justify-center text-center px-6">
           <div>
             <div className="text-2xl font-bold text-amber-400">{summary.avgLatency} ms</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Avg Latency</div>
           </div>
         </div>
      </div>

      {/* Charts side by side */}
      <div className="flex-1 flex gap-5 h-40">
        <div className="flex-1 bg-slate-900/40 rounded-xl border border-slate-700/30 p-3 pt-2 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={5}/>
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconType="circle" />
              <Line yAxisId="left" type="monotone" dataKey="throughput" name="Processed/s" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line yAxisId="right" type="monotone" dataKey="errors" name="Errors/s" stroke="#fb7185" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 bg-slate-900/40 rounded-xl border border-slate-700/30 p-3 pt-2 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={5}/>
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconType="circle" />
              <Area type="monotone" dataKey="latency" name="Max Latency (ms)" stroke="#fbbf24" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLatency)" activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default MetricsDashboard;
