import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import CitizenPortal from './pages/CitizenPortal';
import MPDashboard from './pages/MPDashboard';
import WhatsAppSimulator from './pages/WhatsAppSimulator';
import AdminLogin from './pages/AdminLogin';
import { useState, useEffect } from 'react';
import { initialComplaints } from './mockData';
import { User, MessageCircle, Cloud, CloudOff, ShieldCheck, LogOut } from 'lucide-react';
import { isAppwriteConfigured, fetchComplaints, createComplaint, subscribeToComplaints } from './lib/appwrite';

function App() {
  const [complaints, setComplaints] = useState([]);
  const [isAppwriteOnline, setIsAppwriteOnline] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (isAppwriteConfigured()) {
        try {
          const dbComplaints = await fetchComplaints();
          if (dbComplaints && dbComplaints.length > 0) {
            setComplaints(dbComplaints);
          } else {
            const seeds = [...initialComplaints];
            for (const s of seeds) {
              await createComplaint(s);
            }
            const populated = await fetchComplaints();
            setComplaints(populated || initialComplaints);
          }
          setIsAppwriteOnline(true);
        } catch (e) {
          console.error("Failed to connect to Appwrite, falling back to LocalStorage:", e);
          fallbackToLocalStorage();
        }
      } else {
        fallbackToLocalStorage();
      }
    }

    function fallbackToLocalStorage() {
      setIsAppwriteOnline(false);
      const saved = localStorage.getItem('complaints');
      if (saved) {
        try {
          setComplaints(JSON.parse(saved));
        } catch (e) {
          setComplaints(initialComplaints);
        }
      } else {
        setComplaints(initialComplaints);
      }
    }

    loadData();

    let unsubscribe = null;
    if (isAppwriteConfigured()) {
      try {
        unsubscribe = subscribeToComplaints((newDoc) => {
          setComplaints(prev => {
            if (prev.find(c => c.id === newDoc.id)) return prev;
            return [newDoc, ...prev];
          });
        });
      } catch (err) {
        console.error("Failed to establish real-time socket:", err);
      }
    }

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (err) { /* ignore */ }
      }
    };
  }, []);

  const addComplaint = async (newComplaint) => {
    if (isAppwriteOnline) {
      try {
        const doc = await createComplaint(newComplaint);
        if (doc) {
          setComplaints(prev => {
            if (prev.find(c => c.id === doc.id)) return prev;
            return [doc, ...prev];
          });
        }
      } catch (err) {
        console.error("Appwrite upload failed. Saving to local storage:", err);
        fallbackAdd(newComplaint);
      }
    } else {
      fallbackAdd(newComplaint);
    }
  };

  const fallbackAdd = (newComplaint) => {
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-white/10 text-white shadow-inner' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
        
        {/* Citizen Navigation (Bottom on Mobile, Center Top on Desktop) */}
        <nav className="fixed bottom-6 md:bottom-auto md:top-4 left-1/2 -translate-x-1/2 z-[100] glass-panel rounded-full md:rounded-2xl px-3 md:px-2 py-2 md:py-1.5 flex items-center justify-center gap-2 md:gap-1 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 w-[85%] md:w-auto max-w-sm md:max-w-none">
          <NavLink to="/citizen" className={navLinkClass}>
            <User size={15} className="text-accent-cyan" /> Portal
          </NavLink>
          <NavLink to="/whatsapp" className={navLinkClass}>
            <MessageCircle size={15} className="text-green-400" /> WhatsApp
          </NavLink>
          
          <div className="w-px h-5 bg-white/10 mx-1"></div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${
            isAppwriteOnline 
              ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' 
              : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
          }`}>
            {isAppwriteOnline ? (
              <><Cloud size={12} className="animate-pulse" /> Live</>
            ) : (
              <><CloudOff size={12} /> Local</>
            )}
          </div>
        </nav>

        {/* Admin Portal Button (Top Right) */}
        {isAdminLoggedIn ? (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent-purple/15 border-accent-purple/30 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 hover:border-accent-purple/20'
                }`
              }
            >
              <ShieldCheck size={16} className="text-accent-purple group-hover:scale-110 transition-transform" />
              <span>Dashboard</span>
            </NavLink>
            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="glass-panel rounded-xl p-2.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-500 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `fixed top-4 right-4 z-50 glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-sm font-semibold transition-all duration-200 group ${
                isActive 
                  ? 'bg-accent-purple/15 border-accent-purple/30 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 hover:border-accent-purple/20'
              }`
            }
          >
            <ShieldCheck size={16} className="text-accent-purple group-hover:scale-110 transition-transform" />
            <span>Admin Portal</span>
          </NavLink>
        )}

        <main className="flex-1 pt-20 pb-24 md:pb-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<CitizenPortal onAddComplaint={addComplaint} />} />
            <Route path="/citizen" element={<CitizenPortal onAddComplaint={addComplaint} />} />
            <Route path="/whatsapp" element={<WhatsAppSimulator onAddComplaint={addComplaint} />} />
            <Route path="/admin" element={
              isAdminLoggedIn 
                ? <Navigate to="/dashboard" replace /> 
                : <AdminLogin onLogin={setIsAdminLoggedIn} />
            } />
            <Route path="/dashboard" element={
              isAdminLoggedIn 
                ? <MPDashboard complaints={complaints} /> 
                : <Navigate to="/admin" replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
