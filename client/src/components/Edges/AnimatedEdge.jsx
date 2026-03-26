import React from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';
import useStore from '../../store/useStore';

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { simulationResults, nodes } = useStore();
  const sourceNodeStats = simulationResults?.summary?.nodeStats?.find(n => n.id === source);
  const throughput = sourceNodeStats ? sourceNodeStats.processedRequests : 0;
  
  const sourceNode = nodes.find(n => n.id === source);
  const nodeType = sourceNode?.type;
  const engine = sourceNode?.data?.engine;

  // Calculate speed inversely proportional to throughput
  let duration = 3;
  if (throughput > 0) {
    if (throughput > 800) duration = 0.4;
    else if (throughput > 400) duration = 0.8;
    else if (throughput > 100) duration = 1.2;
    else duration = 2;
  }
  
  const isTransmitting = throughput > 0;

  // Determine dynamic stroke color based on source node
  let strokeColor = '#6366f1'; 
  let glowColor = 'rgba(165,180,252,0.8)'; 

  if (nodeType === 'database') {
    if (engine === 'postgres') { strokeColor = '#3b82f6'; glowColor = 'rgba(147,197,253,0.8)'; }
    else if (engine === 'mysql') { strokeColor = '#0ea5e9'; glowColor = 'rgba(125,211,252,0.8)'; }
    else if (engine === 'mongo') { strokeColor = '#22c55e'; glowColor = 'rgba(134,239,172,0.8)'; }
    else { strokeColor = '#eab308'; glowColor = 'rgba(253,224,71,0.8)'; }
  } else if (nodeType === 'cache') {
    if (engine === 'redis') { strokeColor = '#ef4444'; glowColor = 'rgba(252,165,165,0.8)'; }
    else if (engine === 'memcached') { strokeColor = '#f472b6'; glowColor = 'rgba(249,168,212,0.8)'; }
    else { strokeColor = '#a855f7'; glowColor = 'rgba(216,180,254,0.8)'; }
  } else if (nodeType === 'client') {
    strokeColor = '#3b82f6'; glowColor = 'rgba(147,197,253,0.8)';
  } else if (nodeType === 'api') {
    strokeColor = '#22c55e'; glowColor = 'rgba(134,239,172,0.8)';
  } else if (nodeType === 'loadbalancer') {
    strokeColor = '#f97316'; glowColor = 'rgba(253,186,116,0.8)';
  } else if (nodeType === 'queue') {
    strokeColor = '#ec4899'; glowColor = 'rgba(249,168,212,0.8)';
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: isTransmitting ? strokeColor : '#475569', strokeWidth: 2, transition: 'stroke 0.3s' }} />
      {isTransmitting && (
        <circle r="4" fill={strokeColor} style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>
          <animateMotion 
            dur={`${duration}s`} 
            repeatCount="indefinite" 
            path={edgePath} 
          />
        </circle>
      )}
    </>
  );
};

export default AnimatedEdge;
