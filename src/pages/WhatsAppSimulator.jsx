import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, ChevronLeft, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeComplaint } from '../lib/aiService';

export default function WhatsAppSimulator({ onAddComplaint }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! 🙏 Welcome to the Citizen Grievance Bot.", sender: "bot", time: "10:00 AM" },
    { id: 2, text: "Please describe your issue, or send a photo.", sender: "bot", time: "10:00 AM" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Track if we have already submitted an issue in this session
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message
    const userMsg = { id: Date.now(), text: userText, sender: "user", time: timeNow };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (hasSubmitted) {
      // Just chat pleasantly if already submitted
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now()+1, text: "Thank you! We have already recorded your issue. If you have another issue, please start a new session.", sender: "bot", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1000);
      return;
    }

    try {
      // Analyze the complaint
      const analysis = await analyzeComplaint(userText);
      
      const newComplaint = {
        id: Date.now(),
        lat: 26.8504 + (Math.random() - 0.5) * 0.01,
        lng: 80.9499 + (Math.random() - 0.5) * 0.01,
        category: analysis.category,
        translation: analysis.translation,
        originalText: userText,
        language: analysis.language,
        priority: analysis.priority,
        priorityReason: analysis.priorityReason,
        date: new Date().toISOString(),
        status: 'Pending',
        source: 'WhatsApp'
      };

      onAddComplaint(newComplaint);
      setHasSubmitted(true);

      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now()+2, 
        text: `✅ Your issue has been recorded under the category "${analysis.category}".\n\nTicket ID: #${newComplaint.id.toString().slice(-4)}\nPriority: ${analysis.priority}\n\nOur team will review this shortly. Thank you!`, 
        sender: "bot", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now()+2, 
        text: "Sorry, I am having trouble connecting to the AI system right now. Please try again later.", 
        sender: "bot", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 md:p-6">
      
      <div className="w-full max-w-sm h-[700px] bg-[#EFEAE2] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border-4 border-slate-800">
        
        {/* WhatsApp Header */}
        <div className="bg-[#008069] text-white p-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <ChevronLeft size={24} />
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#008069] font-bold text-xl">MP</span>
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Constituency AI Bot</h2>
              <p className="text-[11px] text-white/80">online</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Video size={20} className="opacity-80" />
            <Phone size={20} className="opacity-80" />
            <MoreVertical size={20} className="opacity-80" />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
          <div className="bg-[#FFF3C7] text-[#555] text-[11px] p-2 rounded-lg text-center mx-auto mb-2 max-w-[85%] shadow-sm">
            Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </div>

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
              >
                <div className={`p-2 px-3 rounded-xl shadow-sm text-[15px] leading-snug whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-[#d9fdd3] rounded-tr-none text-slate-800' : 'bg-white rounded-tl-none text-slate-800'}`}>
                  {msg.text}
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                    {msg.sender === 'user' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="self-start bg-white p-3 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1 w-16"
              >
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 pb-6 md:pb-3 flex items-center gap-2">
          <form onSubmit={handleSend} className="flex-1 flex gap-2">
            <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message" 
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-[15px]"
                disabled={isTyping}
              />
            </div>
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm disabled:opacity-50 transition-opacity"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
