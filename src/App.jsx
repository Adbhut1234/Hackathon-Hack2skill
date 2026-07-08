import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CitizenPortal from './pages/CitizenPortal';
import MPDashboard from './pages/MPDashboard';
import WhatsAppSimulator from './pages/WhatsAppSimulator';
import { useState } from 'react';
import { initialComplaints } from './mockData';
import { User, LayoutDashboard, MessageCircle } from 'lucide-react';

function App() {
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialComplaints;
      }
    }
    return initialComplaints;
  });

  const addComplaint = (newComplaint) => {
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans">
        {/* Simple navigation toggle for demo purposes */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-4 py-2 flex gap-4 backdrop-blur-md shadow-2xl">
          <Link to="/citizen" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium">
            <User size={16} className="text-accent-cyan" /> Portal
          </Link>
          <div className="w-px h-6 bg-glass-border self-center"></div>
          <Link to="/whatsapp" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium">
            <MessageCircle size={16} className="text-green-400" /> WhatsApp
          </Link>
          <div className="w-px h-6 bg-glass-border self-center"></div>
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium">
            <LayoutDashboard size={16} className="text-accent-purple" /> Dashboard
          </Link>
        </nav>

        <main className="flex-1 pt-20 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<CitizenPortal onAddComplaint={addComplaint} />} />
            <Route path="/citizen" element={<CitizenPortal onAddComplaint={addComplaint} />} />
            <Route path="/whatsapp" element={<WhatsAppSimulator onAddComplaint={addComplaint} />} />
            <Route path="/dashboard" element={<MPDashboard complaints={complaints} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
