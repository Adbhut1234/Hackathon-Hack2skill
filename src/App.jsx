import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CitizenPortal from './pages/CitizenPortal';
import MPDashboard from './pages/MPDashboard';
import WhatsAppSimulator from './pages/WhatsAppSimulator';
import { useState, useEffect } from 'react';
import { initialComplaints } from './mockData';
import { User, LayoutDashboard, MessageCircle, Cloud, CloudOff } from 'lucide-react';
import { isAppwriteConfigured, fetchComplaints, createComplaint, subscribeToComplaints } from './lib/appwrite';

function App() {
  const [complaints, setComplaints] = useState([]);
  const [isAppwriteOnline, setIsAppwriteOnline] = useState(false);

  // Initialize and Sync
  useEffect(() => {
    async function loadData() {
      if (isAppwriteConfigured()) {
        try {
          const dbComplaints = await fetchComplaints();
          if (dbComplaints && dbComplaints.length > 0) {
            setComplaints(dbComplaints);
          } else {
            // Seed DB with initial items if empty
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

    // Subscribe to real-time updates
    let unsubscribe = null;
    if (isAppwriteConfigured()) {
      try {
        unsubscribe = subscribeToComplaints((newDoc) => {
          setComplaints(prev => {
            if (prev.find(c => c.id === newDoc.id)) return prev; // avoid duplicates
            return [newDoc, ...prev];
          });
        });
      } catch (err) {
        console.error("Failed to establish real-time socket:", err);
      }
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          // ignore
        }
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
          
          <div className="w-px h-6 bg-glass-border self-center"></div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs font-semibold text-slate-400">
            {isAppwriteOnline ? (
              <><Cloud size={14} className="text-emerald-400 animate-pulse" /> Appwrite Live</>
            ) : (
              <><CloudOff size={14} className="text-amber-400" /> Local Mode</>
            )}
          </div>
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
