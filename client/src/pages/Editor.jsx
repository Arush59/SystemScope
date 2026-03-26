import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Canvas from '../components/Canvas/Canvas';
import Sidebar from '../components/Sidebar/Sidebar';
import ConfigPanel from '../components/ConfigPanel/ConfigPanel';
import MetricsDashboard from '../components/Dashboard/MetricsDashboard';
import useStore from '../store/useStore';
import { Play, Save, Image as ImageIcon, User, LogOut, HelpCircle, Loader2, FolderOpen, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import GuidedTour from '../components/GuidedTour/GuidedTour';
import LoadModal from '../components/LoadModal/LoadModal';

const Editor = () => {
  const { isSimulating, setIsSimulating, nodes, edges, setSimulationResults, user, token, logout, setIsTourOpen } = useStore();
  const [panelOpen, setPanelOpen] = useState(false);
  const [rpsInput, setRpsInput] = useState(500);
  const [isLoadModalOpen, setLoadModalOpen] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    setPanelOpen(true);
    setSimulationResults(null);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, rps: Number(rpsInput), duration: 60 }) 
      });
      const data = await response.json();
      if (response.ok) {
        setSimulationResults(data);
      } else {
        alert("Error: " + data.error);
        setPanelOpen(false);
      }
    } catch (e) {
      console.error(e);
      alert('Simulation failed to connect to backend.');
      setPanelOpen(false);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportPng = () => {
    const rfElement = document.querySelector('.react-flow');
    if (!rfElement) return;
    toPng(rfElement, { backgroundColor: '#0f172a' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'system-design.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export PNG', err);
        alert('Failed to export image.');
      });
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please log in to save designs.");
      return;
    }
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: 'System Architecture', nodes, edges })
      });
      if (res.ok) alert("Design saved securely to the cloud!");
      else {
        const data = await res.json();
        alert(data.error || "Save failed.");
      }
    } catch(err) {
      console.error(err);
      alert("Save failed to connect to backend.");
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const link = document.createElement('a');
    link.download = 'system-architecture.json';
    link.href = dataStr;
    link.click();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, token, nodes, edges]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 font-sans text-slate-100">
      <GuidedTour />
      <LoadModal isOpen={isLoadModalOpen} onClose={() => setLoadModalOpen(false)} />
      <Sidebar />

      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-16 bg-slate-800 border-b border-slate-700/60 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              SystemScope
            </div>
            <div className="h-4 w-px bg-slate-600"></div>
            <button onClick={handleExportPng} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors" title="Export as Image">
              <ImageIcon size={14}/> Export PNG
            </button>
            <button onClick={handleExportJson} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors" title="Export as Object Data">
              <Download size={14}/> Export JSON
            </button>
            <div className="h-4 w-px bg-slate-700/50"></div>
            <button onClick={handleSave} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors" title="Ctrl+S">
              <Save size={14}/> Save Design
            </button>
            <button onClick={() => setLoadModalOpen(true)} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors">
              <FolderOpen size={14}/> Load Design
            </button>
            <button onClick={() => setIsTourOpen(true)} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors">
              <HelpCircle size={14}/> Tour
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400 font-medium">Load Generator (Req/s):</label>
              <input 
                type="number" 
                value={rpsInput} 
                onChange={e => setRpsInput(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 w-24 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button 
              id="tour-run-simulation"
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all shadow-lg ${
                isSimulating 
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20'
              }`}
            >
              {isSimulating ? <Loader2 className="animate-spin" size={16}/> : <Play fill="currentColor" size={16}/>}
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>

            <div className="h-6 w-px bg-slate-700"></div>
            
            {user ? (
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/30 px-3 py-1.5 rounded-full border border-slate-600/50">
                    <User size={14} className="text-indigo-400"/>
                    <span className="max-w-[100px] truncate">{user.email}</span>
                 </div>
                 <button onClick={logout} className="text-slate-400 hover:text-rose-400 transition-colors" title="Log Out">
                    <LogOut size={16}/>
                 </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600">
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <Canvas />
        </div>

        {panelOpen && (
          <div className="h-72 border-t border-slate-700 bg-slate-800/95 backdrop-blur z-20 flex flex-col transition-all shadow-2xl relative">
             <button 
               className="absolute top-3 right-4 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-colors z-30"
               onClick={() => setPanelOpen(false)}>
               ✕
             </button>
             <MetricsDashboard />
          </div>
        )}
      </div>

      <ConfigPanel />
    </div>
  );
};

export default Editor;
