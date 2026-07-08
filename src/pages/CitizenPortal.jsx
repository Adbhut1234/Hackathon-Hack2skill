import { useState } from 'react';
import { Mic, Camera, MapPin, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenPortal({ onAddComplaint }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      const newComplaint = {
        id: Date.now(),
        lat: 26.8504 + (Math.random() - 0.5) * 0.01,
        lng: 80.9499 + (Math.random() - 0.5) * 0.01,
        category: 'General',
        translation: description,
        priority: 'High',
        date: new Date().toISOString(),
        status: 'Pending'
      };
      
      onAddComplaint(newComplaint);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setDescription('');
      }, 3000);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cyan/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl"></div>
        
        <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">
          Report an <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">Issue</span>
        </h1>
        
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.5)]"
              >
                <CheckCircle size={40} className="text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Issue Reported!</h2>
              <p className="text-slate-400">Your voice has been heard. Thank you for helping improve our constituency.</p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="flex flex-col gap-6 relative z-10"
            >
              <div className="relative">
                <textarea
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the issue in your area..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-between gap-4">
                <button type="button" className="flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-slate-300 hover:text-accent-cyan group">
                  <Mic size={22} className="group-hover:scale-110 transition-transform" />
                </button>
                <button type="button" className="flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-slate-300 hover:text-accent-purple group">
                  <Camera size={22} className="group-hover:scale-110 transition-transform" />
                </button>
                <button type="button" className="flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-slate-300 hover:text-accent-cyan group">
                  <MapPin size={22} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !description.trim()}
                className="w-full py-4 mt-2 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-bold text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(191,0,255,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Send size={20} />
                    <span>Submit Issue</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
