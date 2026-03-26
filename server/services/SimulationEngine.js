/**
 * Executes a traffic simulation mapped per second.
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {Number} rps - Requests Per Second originating from Client
 * @param {Number} duration - Simulation duration in seconds
 */
const simulateSystem = (nodes, edges, rps, duration) => {
  // 1. Identify "Client" nodes acting as load generators

  // Create adjacency list and in-degree map
  const adjList = {}; 
  const inDegree = {};
  nodes.forEach(n => {
    adjList[n.id] = [];
    inDegree[n.id] = 0;
  });
  edges.forEach(e => {
    if (adjList[e.source]) adjList[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  // Identify load generators (Clients or APIs with no incoming edges)
  let entryNodes = nodes.filter(n => n.type === 'client');
  if (entryNodes.length === 0) {
    entryNodes = nodes.filter(n => n.type === 'api' && inDegree[n.id] === 0);
    if (entryNodes.length === 0) {
      throw new Error('No Entry nodes found. Add a Client node or an API node with no incoming edges.');
    }
  }

  const timeline = [];
  let totalProcessedSum = 0;
  let totalFailedSum = 0;
  let totalLatencySum = 0;
  let latencyMeasurements = 0;
  
  const aggregatedNodeStats = {}; 
  nodes.forEach(n => {
    aggregatedNodeStats[n.id] = { processed: 0, failed: 0, latencySum: 0, checks: 0 };
  });

  for (let sec = 1; sec <= duration; sec++) {
    const frameNodeStats = {}; 
    nodes.forEach(n => {
      frameNodeStats[n.id] = { incomingRequests: 0, processedRequests: 0, failedRequests: 0, latency: 0 };
    });

    let currentLevel = []; 
    const rpsPerEntry = rps / entryNodes.length;
    
    // Seed the BFS with the initial load on entry nodes
    entryNodes.forEach(c => {
      const jitter = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
      const actualRps = Math.round(rpsPerEntry * jitter);
      currentLevel.push({ id: c.id, load: actualRps });
    });

    while (currentLevel.length > 0) {
      const nextLevel = [];
      const incomingLoadMap = {}; 
      
      currentLevel.forEach(item => {
        incomingLoadMap[item.id] = (incomingLoadMap[item.id] || 0) + item.load;
      });

      Object.keys(incomingLoadMap).forEach(nodeId => {
        const load = incomingLoadMap[nodeId];
        const nodeData = nodes.find(n => n.id === nodeId)?.data || {};
        const isClientType = nodes.find(n => n.id === nodeId)?.type === 'client';
        
        let processed = 0;
        let failed = 0;
        let currentLatency = 0;

        if (isClientType) {
          // Client nodes just generate load unaffected by capacity limits
          processed = load;
        } else {
          const capacity = nodeData.capacity || 1000;
          const baseLatency = nodeData.baseLatency || 20;
          const failureThreshold = (nodeData.failureThreshold || 100) / 100;

          if (load <= capacity * failureThreshold) {
            processed = load;
            const utilization = load / (capacity * failureThreshold);
            currentLatency = baseLatency * (1 + (utilization * utilization));
          } else {
            processed = capacity * failureThreshold;
            failed = load - processed;
            currentLatency = baseLatency * 5; 
          }
        }

        frameNodeStats[nodeId].incomingRequests += load;
        frameNodeStats[nodeId].processedRequests += processed;
        frameNodeStats[nodeId].failedRequests += failed;
        if (currentLatency > frameNodeStats[nodeId].latency) {
           frameNodeStats[nodeId].latency = currentLatency;
        }

        const targets = adjList[nodeId];
        if (targets && targets.length > 0 && processed > 0) {
           const loadPerTarget = processed / targets.length;
           targets.forEach(tId => nextLevel.push({ id: tId, load: loadPerTarget }));
        }
      });
      
      currentLevel = nextLevel;
    }

    let frameTotalFailed = 0;
    let frameMaxLatency = 0;
    let frameClientLoad = 0;
    
    // Total load starting out this frame
    entryNodes.forEach(c => frameClientLoad += frameNodeStats[c.id].incomingRequests);

    Object.keys(frameNodeStats).forEach(id => {
      frameTotalFailed += frameNodeStats[id].failedRequests;
      if (frameNodeStats[id].latency > frameMaxLatency) frameMaxLatency = frameNodeStats[id].latency;

      aggregatedNodeStats[id].processed += frameNodeStats[id].processedRequests;
      aggregatedNodeStats[id].failed += frameNodeStats[id].failedRequests;
      aggregatedNodeStats[id].latencySum += frameNodeStats[id].latency;
      if (frameNodeStats[id].processedRequests > 0 || frameNodeStats[id].failedRequests > 0) {
        aggregatedNodeStats[id].checks++;
      }
    });

    const frameThroughput = Math.max(0, frameClientLoad - frameTotalFailed);
    
    totalProcessedSum += frameThroughput;
    totalFailedSum += frameTotalFailed;
    if (frameMaxLatency > 0) {
      totalLatencySum += frameMaxLatency;
      latencyMeasurements++;
    }

    timeline.push({
      time: sec,
      latency: Math.round(frameMaxLatency),
      errors: Math.round(frameTotalFailed),
      throughput: Math.round(frameThroughput)
    });
  }

  let bottleneckNodeId = null;
  let maxFailures = -1;
  let maxAvgLatency = -1;

  const summaryNodeStats = [];

  Object.keys(aggregatedNodeStats).forEach(id => {
    const stats = aggregatedNodeStats[id];
    const avgLat = stats.checks > 0 ? stats.latencySum / stats.checks : 0;
    
    // Ignore client node for bottleneck
    const isClient = nodes.find(n => n.id === id)?.type === 'client';
    
    summaryNodeStats.push({
      id,
      processedRequests: stats.processed / duration,
      failedRequests: stats.failed / duration,       
      latency: avgLat
    });

    if (!isClient) {
      if (stats.failed > maxFailures && stats.failed > 0) {
        maxFailures = stats.failed;
        bottleneckNodeId = id;
      } else if (stats.failed === maxFailures && avgLat > maxAvgLatency && stats.failed > 0) {
        bottleneckNodeId = id;
      }
    }
  });

  if (!bottleneckNodeId) {
    Object.keys(aggregatedNodeStats).forEach(id => {
      const isClient = nodes.find(n => n.id === id)?.type === 'client';
      if (!isClient) {
        const stats = aggregatedNodeStats[id];
        const avgLat = stats.checks > 0 ? stats.latencySum / stats.checks : 0;
        if (avgLat > maxAvgLatency) {
          maxAvgLatency = avgLat;
          bottleneckNodeId = id;
        }
      }
    });
  }

  return {
    timeline,
    summary: {
      totalProcessed: totalProcessedSum,
      totalFailed: totalFailedSum,
      avgLatency: latencyMeasurements > 0 ? Math.round(totalLatencySum / latencyMeasurements) : 0,
      bottleneckNodeId,
      nodeStats: summaryNodeStats
    }
  };
};

module.exports = { simulateSystem };
