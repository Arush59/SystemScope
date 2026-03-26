import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Server, 
  Database, 
  Laptop, 
  Layers, 
  Split,
  Box
} from 'lucide-react';
import useStore from '../../store/useStore';

const ICONS = {
  client: Laptop,
  api: Server,
  database: Database,
  cache: Layers,
  loadbalancer: Split,
  queue: Box
};

const COLORS = {
  client: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  api: 'text-green-400 bg-green-500/10 border-green-500/30',
  database: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  cache: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  loadbalancer: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  queue: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

const BaseNode = ({ id, data, type, isConnectable }) => {
  const { selectedNodeId, simulationResults } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = ICONS[type] || Server;
  const colorClass = COLORS[type] || COLORS.api;
  
  const isSelected = selectedNodeId === id;
  const nodeStats = simulationResults?.summary?.nodeStats?.find(n => n.id === id);
  const isBottleneck = simulationResults?.summary?.bottleneckNodeId === id;

  const loadPercentage = nodeStats && data.capacity 
    ? (nodeStats.processedRequests / data.capacity) * 100 
    : 0;

  const getDynamicStyle = () => {
    if (isBottleneck) return ''; 
    if (isSelected) return 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]';
    
    if (loadPercentage > 85) return 'border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]';
    if (loadPercentage > 60) return 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.2)]';
    
    return 'border-slate-700/50 hover:border-slate-600';
  };
  const dynamicStyle = getDynamicStyle();

  return (
    <div 
      className={`relative px-4 py-3 min-w-[160px] rounded-xl bg-slate-800 border-2 transition-all duration-500 ease-in-out ${dynamicStyle} ${isBottleneck ? "node-bottleneck" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Tooltip */}
      {isHovered && type !== 'client' && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-800 text-slate-300 text-xs p-3 rounded-lg border border-slate-600 shadow-2xl z-[100] cursor-default pointer-events-none fade-in">
           <div className="font-semibold text-white mb-2 border-b border-slate-700 pb-1">{data.label} Profile</div>
           <div className="flex justify-between mt-1"><span>Target Cap:</span> <span className="text-indigo-400 font-medium">{data.capacity}/s</span></div>
           <div className="flex justify-between mt-1"><span>Base Latency:</span> <span className="text-amber-400 font-medium">{data.baseLatency}ms</span></div>
           <div className="flex justify-between mt-1"><span>Fail Thresh:</span> <span className="text-rose-400 font-medium">{data.failureThreshold}%</span></div>
        </div>
      )}

      {/* Input Handle (except Client) */}
      {type !== 'client' && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-indigo-500 border-2 border-slate-900"
        />
      )}

      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          data.engine === 'postgres' ? 'text-blue-300 bg-blue-500/10 border-blue-500/30' :
          data.engine === 'mysql' ? 'text-sky-300 bg-sky-500/10 border-sky-500/30' :
          data.engine === 'mongo' ? 'text-green-500 bg-green-500/10 border-green-500/30' :
          data.engine === 'redis' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
          data.engine === 'memcached' ? 'text-pink-300 bg-pink-500/10 border-pink-500/30' :
          colorClass
        }`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-200">
            {data.label}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            {data.engine && data.engine !== 'default' ? data.engine : type}
          </div>
        </div>
      </div>

      {/* Metrics Badge (only during simulation) */}
      {nodeStats && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-700/50 pt-2">
          <div className="text-slate-400">
            Load: <span className="text-slate-200">{Math.round(nodeStats.processedRequests)}/s</span>
          </div>
          {nodeStats.latency > 0 && (
            <div className="text-slate-400 text-right">
              Ping: <span className={nodeStats.latency > 200 ? 'text-orange-400' : 'text-slate-200'}>{Math.round(nodeStats.latency)}ms</span>
            </div>
          )}
          {nodeStats.failedRequests > 0 && (
            <div className="col-span-2 text-red-400 font-medium text-center bg-red-500/10 rounded py-0.5 mt-1">
              {Math.round(nodeStats.failedRequests)} Errors/s
            </div>
          )}
        </div>
      )}

      {/* Output Handle */}
      {type !== 'database' && ( // DB usually doesn't output forward
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-indigo-500 border-2 border-slate-900"
        />
      )}
    </div>
  );
};

export default BaseNode;
