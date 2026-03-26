import React, { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, Code2, Loader2, AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';

const LoadModal = ({ isOpen, onClose }) => {
  const { token, setNodes, setEdges } = useStore();
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchDesigns();
    }
  }, [isOpen, token]);

  const fetchDesigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/designs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch designs');
      const data = await res.json();
      setDesigns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = (design) => {
    // Map existing structure into Zustand
    setNodes(design.nodes || []);
    setEdges(design.edges || []);
    onClose();
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      // Update local state without refetching immediately
      setDesigns(prev => prev.filter(d => d._id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <FolderOpen size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">Saved Architectures</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors rounded-lg p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {!token ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4 opacity-80" />
              <p className="text-slate-300 font-medium">Authentication Required</p>
              <p className="text-sm text-slate-500 mt-2">Please sign in to access your cloud-saved designs.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-4" />
              <p className="text-slate-400 text-sm animate-pulse">Retrieving from cluster...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-rose-400 text-sm">
              <AlertTriangle className="mr-2" size={16}/> {error}
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-16">
              <Code2 className="mx-auto h-16 w-16 text-slate-700 mb-4" />
              <p className="text-slate-300 font-medium text-lg">No Saved Designs Yet</p>
              <p className="text-sm text-slate-500 mt-2">Architectures you save to the cloud will safely appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {designs.map((design) => (
                <div 
                  key={design._id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800 transition-all"
                >
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-slate-200 font-medium">{design.name || 'Untitled Architecture'}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>{design.nodes?.length || 0} Nodes</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>Saved: {new Date(design.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Delete Sequence */}
                    {deleteConfirmId === design._id ? (
                      <div className="flex items-center gap-2 mr-2 animate-in slide-in-from-right-4">
                        <span className="text-xs text-rose-400 font-medium pr-1">Sure?</span>
                        <button
                          onClick={() => handleDelete(design._id)}
                          className="px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors font-medium shadow-sm shadow-rose-900/20"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        title="Delete Design"
                        onClick={() => setDeleteConfirmId(design._id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {/* Load Button */}
                    <button
                      onClick={() => handleLoad(design)}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 border border-indigo-500/20 rounded-lg transition-all text-sm font-medium shadow-sm flex items-center gap-2"
                    >
                      <Code2 size={16} className={deleteConfirmId === design._id ? 'opacity-50' : ''}/> 
                      Load Schema
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadModal;
