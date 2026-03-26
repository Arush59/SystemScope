import React from 'react';
import { Server, Database, Laptop, Layers, Split, Box } from 'lucide-react';
import useStore from '../../store/useStore';

const NODE_TYPES = [
  { type: 'client', label: 'Client', icon: Laptop, color: 'text-blue-400' },
  { type: 'api', label: 'API Server', icon: Server, color: 'text-green-400' },
  { type: 'loadbalancer', label: 'Load Balancer', icon: Split, color: 'text-orange-400' },
  { type: 'database', label: 'Database', icon: Database, color: 'text-yellow-400' },
  { type: 'cache', label: 'Redis Cache', icon: Layers, color: 'text-purple-400' },
  { type: 'queue', label: 'Message Queue', icon: Box, color: 'text-pink-400' },
];

const Sidebar = () => {
  const { setNodes, setEdges } = useStore();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadBasicWebApp = () => {
    setNodes([
      { id: 't1-1', type: 'api', position: { x: 250, y: 150 }, data: { label: 'API Server', capacity: 1000, baseLatency: 20, failureThreshold: 90 } },
      { id: 't1-2', type: 'database', position: { x: 250, y: 300 }, data: { label: 'Primary DB', capacity: 300, baseLatency: 50, failureThreshold: 85 } },
    ]);
    setEdges([
      { id: 'e-t1-1', source: 't1-1', target: 't1-2', type: 'customAnimated', style: { strokeWidth: 2 } },
    ]);
  };

  const loadScalableCore = () => {
    setNodes([
      { id: 'sc-1', type: 'loadbalancer', position: { x: 250, y: 100 }, data: { label: 'Load Balancer', capacity: 5000, baseLatency: 5, failureThreshold: 95 } },
      { id: 'sc-2', type: 'api', position: { x: 100, y: 250 }, data: { label: 'API Replica A', capacity: 1000, baseLatency: 20, failureThreshold: 90 } },
      { id: 'sc-3', type: 'api', position: { x: 400, y: 250 }, data: { label: 'API Replica B', capacity: 1000, baseLatency: 20, failureThreshold: 90 } },
      { id: 'sc-4', type: 'database', position: { x: 100, y: 400 }, data: { label: 'Primary DB', capacity: 1500, baseLatency: 50, failureThreshold: 85 } },
      { id: 'sc-5', type: 'cache', position: { x: 400, y: 400 }, data: { label: 'Redis Cache', capacity: 10000, baseLatency: 2, failureThreshold: 99 } }
    ]);
    setEdges([
      { id: 'e-sc-1-2', source: 'sc-1', target: 'sc-2', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-sc-1-3', source: 'sc-1', target: 'sc-3', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-sc-2-4', source: 'sc-2', target: 'sc-4', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-sc-3-4', source: 'sc-3', target: 'sc-4', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-sc-2-5', source: 'sc-2', target: 'sc-5', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-sc-3-5', source: 'sc-3', target: 'sc-5', type: 'customAnimated', style: { strokeWidth: 2 } }
    ]);
  };

  const loadMicroservices = () => {
    setNodes([
      { id: 'qm-1', type: 'api', position: { x: 250, y: 100 }, data: { label: 'API Gateway', capacity: 3000, baseLatency: 15, failureThreshold: 90 } },
      { id: 'qm-2', type: 'queue', position: { x: 250, y: 250 }, data: { label: 'Message Queue', capacity: 5000, baseLatency: 10, failureThreshold: 95 } },
      { id: 'qm-3', type: 'api', position: { x: 250, y: 400 }, data: { label: 'Worker Node', capacity: 500, baseLatency: 30, failureThreshold: 85 } },
      { id: 'qm-4', type: 'database', position: { x: 250, y: 550 }, data: { label: 'Database', capacity: 1000, baseLatency: 50, failureThreshold: 80 } }
    ]);
    setEdges([
      { id: 'e-qm-1-2', source: 'qm-1', target: 'qm-2', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-qm-2-3', source: 'qm-2', target: 'qm-3', type: 'customAnimated', style: { strokeWidth: 2 } },
      { id: 'e-qm-3-4', source: 'qm-3', target: 'qm-4', type: 'customAnimated', style: { strokeWidth: 2 } }
    ]);
  };

  return (
    <div id="tour-sidebar" className="w-64 bg-slate-800 border-r border-slate-700/60 flex flex-col pt-6 z-10 shadow-lg relative">
      <div className="px-5 mb-4 font-semibold text-slate-400 uppercase tracking-widest text-xs">
        Components
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-8">
        <p className="text-xs text-slate-500 mb-4 px-1">Drag components to the canvas</p>
        
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-700/80 rounded-lg cursor-grab active:cursor-grabbing border border-slate-700/50 hover:border-indigo-500/50 transition-all shadow-sm"
              onDragStart={(event) => onDragStart(event, node.type)}
              draggable
            >
              <Icon className={node.color} size={20} />
              <span className="text-sm font-medium text-slate-200">{node.label}</span>
            </div>
          );
        })}

        <div className="pt-6 mt-6 border-t border-slate-700/50">
          <div className="px-1 mb-4 font-semibold text-slate-400 uppercase tracking-widest text-xs">
            Templates
          </div>
          <div className="space-y-2">
            <button onClick={loadBasicWebApp} className="w-full text-left p-3 rounded-lg text-sm bg-slate-700/30 hover:bg-slate-700 text-slate-300 transition-colors border border-transparent hover:border-slate-600">
              Basic Web App
            </button>
            <button onClick={loadScalableCore} className="w-full text-left p-3 rounded-lg text-sm bg-slate-700/30 hover:bg-slate-700 text-slate-300 transition-colors border border-transparent hover:border-slate-600">
              Scalable Core
            </button>
            <button onClick={loadMicroservices} className="w-full text-left p-3 rounded-lg text-sm bg-slate-700/30 hover:bg-slate-700 text-slate-300 transition-colors border border-transparent hover:border-slate-600">
              Microservices (Queue)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
