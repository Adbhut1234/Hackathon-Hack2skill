import { useState, useRef } from 'react';
import { Mic, Camera, MapPin, Send, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeComplaint } from '../lib/aiService';

export default function CitizenPortal({ onAddComplaint }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  
  // New states for voice and photo
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
    // We can leave lang unset so it defaults to the browser's language, 
    // or set it if we know the user's preference.

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn("Geolocation failed or timed out. Falling back to constituency default coordinates.", error);
        // Soft fallback: auto-assign coordinates in our constituency map
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
      // Real AI call: Gemini detects language, translates, classifies
      // category + priority for this submission.
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
      photo: photoPreview // include photo in submission
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
              {detectedLanguage && (
                <p className="mt-3 text-xs text-accent-cyan bg-accent-cyan/10 px-3 py-1.5 rounded-full">
                  AI detected language: {detectedLanguage}
                </p>
              )}
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
              <div className="relative flex flex-col gap-3">
                <textarea
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the issue in your area... (any language works)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
                
                {/* Photo Preview Thumbnail */}
                {photoPreview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 group shadow-lg">
                    <img src={photoPreview} alt="Attached" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={removePhoto}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>
                )}
                
                {/* Listening Indicator */}
                {isListening && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-accent-purple">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-medium animate-pulse">Listening...</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-400/10 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /> {error}
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

              <div className="flex justify-between gap-4">
                <button 
                  type="button" 
                  onClick={handleVoiceClick}
                  className={`flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors ${isListening ? 'text-accent-purple bg-accent-purple/10 border-accent-purple/30 shadow-[0_0_15px_rgba(191,0,255,0.2)]' : 'text-slate-300 hover:text-accent-cyan'} group`}
                >
                  <Mic size={22} className={`${isListening ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                </button>
                <button 
                  type="button" 
                  onClick={handlePhotoClick}
                  className="flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-slate-300 hover:text-accent-purple group"
                >
                  <Camera size={22} className="group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  type="button" 
                  onClick={handleLocationClick}
                  disabled={isGettingLocation}
                  className={`flex-1 flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors ${
                    location ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 
                    isGettingLocation ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' : 'text-slate-300 hover:text-accent-cyan'
                  } group`}
                >
                  {isGettingLocation ? (
                    <Loader2 size={22} className="animate-spin text-amber-400" />
                  ) : (
                    <MapPin size={22} className={`${location ? 'text-accent-cyan' : 'group-hover:scale-110 transition-transform'}`} />
                  )}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || (!description.trim() && !photoPreview)}
                className="w-full py-4 mt-2 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-bold text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(191,0,255,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span className="text-sm">AI analyzing...</span>
                  </>
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
