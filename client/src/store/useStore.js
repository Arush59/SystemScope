import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

// Default initial nodes
const initialNodes = [];
const initialEdges = [];

const token = localStorage.getItem('token') || null;
const user = JSON.parse(localStorage.getItem('user') || 'null');

const useStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  simulationResults: null,
  isSimulating: false,
  selectedNodeId: null,
  
  // Auth state
  token,
  user,
  isTourOpen: false,
  setIsTourOpen: (isOpen) => set({ isTourOpen: isOpen }),
  setAuth: (token, user) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  // React Flow handlers
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, type: 'customAnimated' }, get().edges),
    });
  },

  // Custom node management
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId
    });
  },
  updateNodeData: (id, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // Simulation state
  setSimulationResults: (results) => set({ simulationResults: results }),
  setIsSimulating: (isSimulating) => set({ isSimulating }),
}));

export default useStore;
