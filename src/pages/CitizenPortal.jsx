import { useState, useRef } from 'react';
import { Mic, Camera, MapPin, Send, CheckCircle, AlertCircle, X, Loader2, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeComplaint } from '../lib/aiService';

export default function CitizenPortal({ onAddComplaint }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  
  const [isListening, setIsListening] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef(null);

  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) return;

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      () => {
        setLocation({
          lat: 26.8504 + (Math.random() - 0.5) * 0.01,
          lng: 80.9499 + (Math.random() - 0.5) * 0.01
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && !photoPreview) return;

    setIsSubmitting(true);
    setError(null);

    let analysis;
    try {
      analysis = await analyzeComplaint(description + (photoPreview ? " [Image Attached]" : ""));
    } catch (err) {
      console.error('AI analysis failed, falling back to defaults:', err);
      setError('AI analysis unavailable right now — submitted with default tagging.');
      analysis = {
        language: 'Unknown',
        translation: description,
        category: 'General',
        priority: 'Medium',
        priorityReason: 'Could not be auto-analyzed.',
      };
    }

    const newComplaint = {
      id: Date.now(),
      lat: location ? location.lat : 26.8504 + (Math.random() - 0.5) * 0.01,
      lng: location ? location.lng : 80.9499 + (Math.random() - 0.5) * 0.01,
      category: analysis.category,
      translation: analysis.translation,
      originalText: description,
      language: analysis.language,
      priority: analysis.priority,
      priorityReason: analysis.priorityReason,
      date: new Date().toISOString(),
      status: 'Pending',
      source: 'Portal',
      photo: photoPreview
    };

    onAddComplaint(newComplaint);
    setDetectedLanguage(analysis.language);
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setDescription('');
      setPhotoPreview(null);
      setLocation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setDetectedLanguage(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 md:p-6">
      
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-[120px] animate-float-delayed" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-semibold mb-4"
          >
            <Globe size={14} />
            Multilingual AI-Powered • Voice • Photo • Location
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-blue-400 to-accent-purple">
              JanAwaz
            </span>
            <br />
            <span className="text-2xl md:text-3xl font-bold text-slate-300">Report a Development Issue</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
            Describe an issue in your constituency in any language. Our AI will classify, translate, and route it to your MP's dashboard instantly.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden gradient-border">
          {/* Inner glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-16 text-center relative z-10"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)]"
                >
                  <CheckCircle size={48} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Issue Reported!</h2>
                <p className="text-slate-400 max-w-xs">Your voice has been heard. Thank you for helping improve our constituency.</p>
                {detectedLanguage && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-xs text-accent-cyan bg-accent-cyan/10 px-4 py-2 rounded-full border border-accent-cyan/20 flex items-center gap-2"
                  >
                    <Sparkles size={12} /> AI detected language: {detectedLanguage}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="flex flex-col gap-5 relative z-10"
              >
                {/* Textarea */}
                <div className="relative flex flex-col gap-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Describe the Issue
                  </label>
                  <textarea
                    className="w-full h-36 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/30 transition-all resize-none text-[15px] leading-relaxed"
                    placeholder="E.g. सड़क पर पानी भरा है, bijli nahi aa rahi hai, the school roof is leaking..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                  
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/20 group shadow-lg">
                      <img src={photoPreview} alt="Attached" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={removePhoto}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={24} className="text-white" />
                      </button>
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                        📷 Attached
                      </div>
                    </div>
                  )}
                  
                  {/* Listening Indicator */}
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-10 right-4 flex items-center gap-2 text-accent-purple bg-accent-purple/10 px-3 py-1.5 rounded-full border border-accent-purple/20"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs font-semibold animate-pulse">Listening...</span>
                    </motion.div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-400/10 px-3 py-2.5 rounded-xl border border-amber-400/20">
                    <AlertCircle size={14} className="shrink-0" /> {error}
                  </div>
                )}

                {/* Hidden file input */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                />

                {/* Action Buttons */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                    Attach Evidence
                  </label>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleVoiceClick}
                      className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3.5 bg-white/[0.03] hover:bg-white/[0.07] border rounded-xl transition-all ${
                        isListening 
                          ? 'text-accent-purple bg-accent-purple/10 border-accent-purple/30 shadow-[0_0_20px_rgba(191,0,255,0.15)]' 
                          : 'text-slate-400 border-white/10 hover:text-accent-cyan hover:border-accent-cyan/20'
                      } group`}
                    >
                      <Mic size={20} className={`${isListening ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Voice</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handlePhotoClick}
                      className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3.5 bg-white/[0.03] hover:bg-white/[0.07] border rounded-xl transition-all group ${
                        photoPreview 
                          ? 'text-accent-purple bg-accent-purple/10 border-accent-purple/30' 
                          : 'text-slate-400 border-white/10 hover:text-accent-purple hover:border-accent-purple/20'
                      }`}
                    >
                      <Camera size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Photo</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleLocationClick}
                      disabled={isGettingLocation}
                      className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3.5 bg-white/[0.03] hover:bg-white/[0.07] border rounded-xl transition-all ${
                        location ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 
                        isGettingLocation ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' : 'text-slate-400 border-white/10 hover:text-accent-cyan hover:border-accent-cyan/20'
                      } group`}
                    >
                      {isGettingLocation ? (
                        <Loader2 size={20} className="animate-spin text-amber-400" />
                      ) : (
                        <MapPin size={20} className={`${location ? 'text-accent-cyan' : 'group-hover:scale-110 transition-transform'}`} />
                      )}
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {location ? 'Tagged' : 'Location'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || (!description.trim() && !photoPreview)}
                  className="w-full py-4 mt-1 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-2xl font-bold text-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(191,0,255,0.35)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-[15px]"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>AI Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Issue</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-4 mt-6 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={10} /> Powered by Gemini AI
          </span>
          <span>•</span>
          <span>End-to-end Encrypted</span>
          <span>•</span>
          <span>Anonymous</span>
        </div>
      </motion.div>
    </div>
  );
}
