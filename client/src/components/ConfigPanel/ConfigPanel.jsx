import React from 'react';
import useStore from '../../store/useStore';
import { Settings, Server, Trash2 } from 'lucide-react';

const ConfigPanel = () => {
  const { selectedNodeId, nodes, updateNodeData, removeNode } = useStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div id="tour-config-panel" className="w-80 bg-slate-800 border-l border-slate-700/60 p-6 flex flex-col items-center justify-center text-center shadow-lg z-10 transition-all">
        <div className="p-4 bg-slate-900/50 rounded-full mb-4 ring-1 ring-slate-700 shadow-inner">
          <Settings className="text-slate-500" size={32} />
        </div>
        <h3 className="text-slate-300 font-medium mb-2 font-display">No Node Selected</h3>
        <p className="text-sm text-slate-500">
          Click on a node in the canvas to view and configure its capacity metrics.
        </p>
      </div>
    );
  }

  const { type, data } = selectedNode;

  const handleChange = (field, value) => {
    updateNodeData(selectedNodeId, { [field]: Number(value) || 0 });
  };

  const handleNameChange = (e) => {
    updateNodeData(selectedNodeId, { label: e.target.value });
  };

  return (
    <div id="tour-config-panel" className="w-80 bg-slate-800 border-l border-slate-700/60 flex flex-col shadow-lg z-10 relative transition-all">
      <div className="p-5 border-b border-slate-700/60 flex items-center gap-3 bg-slate-900/20">
        <Server className="text-indigo-400 drop-shadow-md" />
        <div>
          <h2 className="font-semibold text-slate-200">Configuration</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{type} Node</p>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Node Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={handleNameChange}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>

        {type !== 'client' && (
          <>
            {(type === 'database' || type === 'cache') && (
              <div className="space-y-1.5 pb-2 border-b border-slate-700/50 mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Engine Type
                </label>
                <select 
                  value={data.engine || 'default'}
                  onChange={(e) => {
                    const engine = e.target.value;
                    let defaults = {};
                    if (engine === 'postgres') defaults = { capacity: 2000, baseLatency: 15, failureThreshold: 85 };
                    if (engine === 'mysql') defaults = { capacity: 2500, baseLatency: 12, failureThreshold: 85 };
                    if (engine === 'mongo') defaults = { capacity: 5000, baseLatency: 8, failureThreshold: 80 };
                    if (engine === 'redis') defaults = { capacity: 50000, baseLatency: 1, failureThreshold: 95 };
                    if (engine === 'memcached') defaults = { capacity: 80000, baseLatency: 1, failureThreshold: 98 };
                    
                    updateNodeData(selectedNodeId, { engine, ...defaults });
                  }}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                >
                  <option value="default">Generic {type}</option>
                  {type === 'database' && (
                    <>
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongo">MongoDB</option>
                    </>
                  )}
                  {type === 'cache' && (
                    <>
                      <option value="redis">Redis</option>
                      <option value="memcached">Memcached</option>
                    </>
                  )}
                </select>
                {data.engine && data.engine !== 'default' && (
                  <p className="text-[10px] text-indigo-400 font-medium pl-1 mt-1">Metrics snapped to engine defaults.</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Capacity (req/s)
              </label>
              <input
                type="number"
                value={data.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
              />
              <p className="text-[10px] text-slate-500 pl-1">Maximum throughput per second.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Base Latency (ms)
              </label>
              <input
                type="number"
                value={data.baseLatency}
                onChange={(e) => handleChange('baseLatency', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Failure Threshold</span>
                <span className="text-indigo-400 font-bold">{data.failureThreshold}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={data.failureThreshold}
                onChange={(e) => handleChange('failureThreshold', e.target.value)}
                className="w-full accent-indigo-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                <span>50%</span>
                <span className="text-center opacity-70">Overload limit</span>
                <span>100%</span>
              </div>
            </div>
          </>
        )}

        <div className="pt-6 mt-4 border-t border-slate-700/50">
          <button 
            onClick={() => removeNode(selectedNodeId)} 
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Delete Component
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
