import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, BrainCircuit, Users, TrendingUp, Loader2, Map as MapIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { synthesizeProjectReasoning, generateThemes } from '../lib/aiService';
import { constituencyWards } from '../lib/mockDemographics';

const PROJECT_NAMES = {
  'Water & Drainage': 'Drainage & Waterlogging Overhaul',
  'Road Infrastructure': 'Road Repair & Pothole Initiative',
  'Electricity': 'Power Grid Reliability Upgrade',
  'Sanitation': 'Sanitation & Waste Management Drive',
  'Public Transport': 'Public Transport Infrastructure Fix',
  'Healthcare': 'Primary Healthcare Access Expansion',
  'Education': 'School Infrastructure Upgrade',
  'General': 'General Constituency Improvement',
};

// Baseline ranking logic (Fast, groups by category)
function rankProjectsFromComplaints(complaints) {
  const groups = {};
  complaints.forEach((c) => {
    const cat = c.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(c);
  });

  const maxCount = Math.max(1, ...Object.values(groups).map((g) => g.length));

  return Object.entries(groups)
    .map(([category, items]) => {
      const highCount = items.filter((c) => c.priority === 'High').length;
      const volumeScore = (items.length / maxCount) * 70;
      const urgencyScore = (highCount / items.length) * 30;
      const confidenceScore = Math.round(Math.min(99, volumeScore + urgencyScore + 15));
      return {
        id: category,
        name: PROJECT_NAMES[category] || `${category} Improvement Initiative`,
        category,
        confidenceScore,
        complaints: items,
      };
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// Fix for default marker icon in leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MPDashboard({ complaints }) {
  const [expandedProject, setExpandedProject] = useState(null);
  const [reasoningMap, setReasoningMap] = useState({}); 
  
  // New States for Phase 2
  const [showDemographics, setShowDemographics] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [clusteredThemes, setClusteredThemes] = useState(null); // null means show baseline

  const defaultProjects = useMemo(() => rankProjectsFromComplaints(complaints), [complaints]);
  const activeProjects = clusteredThemes || defaultProjects;

  const handleRunClustering = async () => {
    setIsClustering(true);
    try {
      const themes = await generateThemes(complaints);
      // Ensure it maps to our UI
      const formattedThemes = themes.map(t => ({
        ...t,
        complaints: complaints.filter(c => t.complaintIds?.includes(String(c.id)) || t.complaintIds?.includes(Number(c.id))) 
      }));
      setClusteredThemes(formattedThemes);
    } catch (err) {
      console.error("Deep clustering failed:", err);
      alert("AI Deep Clustering failed. Ensure Gemini API key is valid.");
    }
    setIsClustering(false);
  };

  const handleExpand = async (project) => {
    const isOpen = expandedProject === project.id;
    setExpandedProject(isOpen ? null : project.id);
    if (isOpen) return;

    // If it's a deep cluster, reasoning is already provided in project.reasoning
    if (clusteredThemes) return; 

    // Already fetched
    if (reasoningMap[project.category]) return;

    setReasoningMap((prev) => ({ ...prev, [project.category]: { status: 'loading' } }));
    try {
      const { reasoning } = await synthesizeProjectReasoning(project.category, project.complaints);
      setReasoningMap((prev) => ({ ...prev, [project.category]: { status: 'done', text: reasoning } }));
    } catch (err) {
      console.error('Reasoning generation failed:', err);
      setReasoningMap((prev) => ({
        ...prev,
        [project.category]: {
          status: 'error',
          text: `AI synthesis unavailable — showing raw stats.`,
        },
      }));
    }
  };

  // GeoJSON styling based on gapScore
  const geoJsonStyle = (feature) => {
    const score = feature.properties.gapScore;
    return {
      fillColor: score > 80 ? '#ef4444' : score > 50 ? '#f59e0b' : '#10b981',
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.4
    };
  };

  const stats = [
    { label: 'Total Requests', value: '1,204', icon: Users, color: 'text-accent-cyan' },
    { label: 'High Priority', value: complaints.filter(c => c.priority === 'High').length + 10, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Resolved This Week', value: '342', icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'AI Resolution Rate', value: '78%', icon: TrendingUp, color: 'text-accent-purple' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-white/10 hover:border-l-accent-cyan transition-colors">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px] lg:h-[600px]">
        
        {/* Map Section */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden relative border border-white/10 flex flex-col h-full">
          <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center pointer-events-none">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 pointer-events-auto shadow-lg">
              <MapPinPulse />
              <span className="font-semibold text-white">Live Constituency Map</span>
            </div>
            <button 
              onClick={() => setShowDemographics(!showDemographics)}
              className={`glass-panel px-4 py-2 rounded-lg flex items-center gap-2 pointer-events-auto transition-colors shadow-lg ${showDemographics ? 'bg-accent-purple/20 border-accent-purple/50' : 'hover:bg-white/10'}`}
            >
              <Layers size={18} className={showDemographics ? 'text-accent-purple' : 'text-slate-300'} />
              <span className="font-semibold text-white text-sm">Demographics Overlay</span>
            </button>
          </div>
          
          <div className="flex-1 w-full h-full bg-slate-800/50">
            <MapContainer 
              center={[26.8504, 80.9499]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              
              {showDemographics && (
                <GeoJSON 
                  data={constituencyWards} 
                  style={geoJsonStyle}
                  onEachFeature={(feature, layer) => {
                    layer.bindPopup(`
                      <div class="p-1">
                        <strong class="text-slate-800">${feature.properties.name}</strong>
                        <p class="text-sm mt-1">Population: ${feature.properties.population}</p>
                        <p class="text-sm">Infra Gap Score: <b>${feature.properties.gapScore}/100</b></p>
                        <p class="text-xs text-slate-500 mt-1">${feature.properties.notes}</p>
                      </div>
                    `);
                  }}
                />
              )}

              {complaints.map(complaint => (
                <CircleMarker
                  key={complaint.id}
                  center={[complaint.lat, complaint.lng]}
                  radius={8}
                  pathOptions={{ 
                    color: complaint.priority === 'High' ? '#ef4444' : complaint.priority === 'Medium' ? '#f59e0b' : '#3b82f6',
                    fillColor: complaint.priority === 'High' ? '#ef4444' : complaint.priority === 'Medium' ? '#f59e0b' : '#3b82f6',
                    fillOpacity: 0.7
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <p className="font-bold text-slate-800">{complaint.category}</p>
                      <p className="text-sm text-slate-600 mt-1">{complaint.translation}</p>
                      {complaint.photo && <img src={complaint.photo} alt="Issue" className="w-full h-16 object-cover mt-2 rounded" />}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Live Feed Section */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col h-full border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-accent-purple" size={24} />
            <h2 className="text-xl font-bold text-white">Live Request Feed</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Live</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {complaints.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/10 text-slate-300">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} /> 
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-2">{item.translation}</p>
                  
                  {item.photo && (
                    <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <img src={item.photo} alt="Attached issue" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      item.priority === 'High' ? 'text-red-400' : item.priority === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-xs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Action <ChevronDown size={14} className="-rotate-90" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* AI Priority Engine Section */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20">
              <BrainCircuit className="text-accent-cyan" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Priority Engine 
                {clusteredThemes && <span className="text-[10px] uppercase bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-md tracking-wider">Deep Cluster Mode</span>}
              </h2>
              <p className="text-slate-400 text-sm">Top infrastructure proposals based on citizen data</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!clusteredThemes && (
              <button 
                onClick={handleRunClustering}
                disabled={isClustering || complaints.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan hover:opacity-90 border border-white/10 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(191,0,255,0.2)] disabled:opacity-50 flex items-center gap-2"
              >
                {isClustering ? <><Loader2 size={16} className="animate-spin" /> Clustering...</> : "Run Deep Clustering"}
              </button>
            )}
            {clusteredThemes && (
              <button 
                onClick={() => setClusteredThemes(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-4 pl-4 font-semibold">Rank</th>
                <th className="pb-4 font-semibold">{clusteredThemes ? 'AI Actionable Theme' : 'Project Name'}</th>
                <th className="pb-4 font-semibold">Category</th>
                <th className="pb-4 font-semibold text-center">AI Confidence</th>
                <th className="pb-4 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr 
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group ${expandedProject === project.id ? 'bg-white/[0.03]' : ''}`}
                    onClick={() => handleExpand(project)}
                  >
                    <td className="py-5 pl-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-300'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-5 font-medium text-white max-w-xs truncate">{project.name}</td>
                    <td className="py-5">
                      <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-slate-300">
                        {project.category}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full" 
                            style={{ width: `${project.confidenceScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-300">{project.confidenceScore}%</span>
                      </div>
                    </td>
                    <td className="py-5 pr-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                        {expandedProject === project.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanding AI Reasoning Row */}
                  <AnimatePresence>
                    {expandedProject === project.id && (
                      <tr>
                        <td colSpan="5" className="p-0 border-b border-white/10">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gradient-to-r from-accent-purple/5 to-transparent"
                          >
                            <div className="p-6 pl-16 flex gap-4 border-l-2 border-accent-purple ml-2 my-2">
                              <BrainCircuit className="text-accent-purple shrink-0 mt-1" size={20} />
                              <div>
                                <h4 className="text-sm font-semibold text-accent-purple mb-1">AI Synthesis</h4>
                                {clusteredThemes ? (
                                  <p className="text-slate-300 text-sm leading-relaxed">
                                    {project.reasoning}
                                  </p>
                                ) : reasoningMap[project.category]?.status === 'loading' ? (
                                  <p className="text-slate-400 text-sm leading-relaxed flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Asking Gemini to synthesize {project.complaints.length} submissions...
                                  </p>
                                ) : (
                                  <p className="text-slate-300 text-sm leading-relaxed">
                                    {reasoningMap[project.category]?.text || 'Loading...'}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500 mt-2">
                                  Based on {project.complaints?.length || 0} citizen submission{project.complaints?.length !== 1 ? 's' : ''}.
                                </p>
                                <div className="mt-4 flex gap-3">
                                  <button className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 text-xs font-bold transition-colors">
                                    Approve Project
                                  </button>
                                  <button className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-bold transition-colors">
                                    View Data Sources
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

function MapPinPulse() {
  return (
    <div className="relative flex items-center justify-center h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-50"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
    </div>
  );
}
