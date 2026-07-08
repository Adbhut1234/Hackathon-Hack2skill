import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

// Demo credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin(true);
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 md:p-6">
      
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-accent-purple/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-accent-cyan/5 rounded-full blur-[120px] animate-float-delayed" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(191,0,255,0.15)]"
          >
            <ShieldCheck size={32} className="text-accent-purple" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Authorized access to the MP Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden gradient-border">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/40 focus:border-accent-purple/30 transition-all text-[15px]"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple/40 focus:border-accent-purple/30 transition-all text-[15px]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 px-3 py-2.5 rounded-xl border border-red-400/20"
              >
                <AlertCircle size={14} className="shrink-0" /> {error}
              </motion.div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3.5 mt-1 bg-gradient-to-r from-accent-purple to-accent-cyan rounded-xl font-bold text-white shadow-[0_0_20px_rgba(191,0,255,0.2)] hover:shadow-[0_0_40px_rgba(191,0,255,0.35)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-[15px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Hint */}
        <div className="mt-5 text-center">
          <p className="text-slate-600 text-[11px]">
            Demo credentials: <span className="text-slate-400 font-mono">admin</span> / <span className="text-slate-400 font-mono">admin123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
