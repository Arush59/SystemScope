import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../../store/useStore';
import BaseNode from '../Nodes/BaseNode';

import AnimatedEdge from '../Edges/AnimatedEdge';

const nodeTypes = {
  client: (props) => <BaseNode {...props} type="client" />,
  api: (props) => <BaseNode {...props} type="api" />,
  database: (props) => <BaseNode {...props} type="database" />,
  cache: (props) => <BaseNode {...props} type="cache" />,
  loadbalancer: (props) => <BaseNode {...props} type="loadbalancer" />,
  queue: (props) => <BaseNode {...props} type="queue" />,
};

const edgeTypes = {
  customAnimated: AnimatedEdge,
};

const Canvas = () => {
  const reactFlowWrapper = useRef(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId
  } = useStore();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // If dropping something we don't recognize
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Check if we already have a reactFlow instance globally to project coordinates,
      // otherwise fallback to rough pixel coordinates.
      let position = {
        x: event.clientX - reactFlowBounds.left - 80,
        y: event.clientY - reactFlowBounds.top - 20,
      };
      
      if (window.rfInstance) {
        position = window.rfInstance.project(position);
      }

      const labels = {
        client: 'Client',
        api: 'API Server',
        database: 'Database',
        cache: 'Redis Cache',
        loadbalancer: 'Load Balancer',
        queue: 'Message Queue'
      };

      const defaultData = {
        label: labels[type],
        capacity: type === 'client' ? null : 1000,
        baseLatency: type === 'client' ? 0 : 20,
        failureThreshold: type === 'client' ? null : 90
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div id="tour-canvas" className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { window.rfInstance = instance; }} 
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-slate-900"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls 
          className="bg-slate-800 border-none rounded-lg shadow-xl" 
          showInteractive={false} 
        />
        <MiniMap 
          className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl" 
          nodeColor="#6366f1"
          maskColor="rgba(15, 23, 42, 0.7)"
          style={{ backgroundColor: '#1e293b' }}
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
