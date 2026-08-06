import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Copy, Check, MessageSquare, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: "Namaste! 🙏 I am **Sathi AI**, your personal Nepali Mart Shopping Assistant.\n\nHow can I help you today? Ask me about product recommendations, eSewa/Khalti payments, or delivery across Nepal!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTED_PROMPTS = [
  "🇳🇵 Popular Nepali Handicrafts",
  "⚡ Best Electronics & Gadgets",
  "💳 How to pay via eSewa / Khalti?",
  "🚚 Delivery charges in Nepal"
];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation payload for endpoint
      const apiMessages = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "Namaste! How else can I assist you with shopping on Nepali Mart?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (!isOpen) {
        setUnreadCount(c => c + 1);
      }
    } catch (err) {
      console.error('Chat bot error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Namaste! 🙏 I experienced a temporary network connection glitch. You can ask me about eSewa payments, delivery locations, or search items directly in Nepali Mart!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[90] flex flex-col items-end">
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="sathi-ai-chatbot-button"
            className="group relative bg-gradient-to-r from-daraz-orange to-amber-500 text-white p-3.5 md:p-4 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white/80 hover:shadow-daraz-orange/30 transition-all cursor-pointer"
          >
            <div className="relative">
              <Bot size={26} className="text-white drop-shadow-md" />
              <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-200 animate-pulse" />
            </div>
            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 leading-none">AI Shopping</span>
              <span className="text-xs font-black tracking-tight leading-none mt-0.5">Sathi AI</span>
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </motion.button>
        </div>
      )}

      {/* Expandable Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            id="sathi-ai-chatbot-window"
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[85vh] sm:h-[600px] max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl border border-neutral-200 z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-4 flex items-center justify-between border-b border-neutral-700 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-daraz-orange to-amber-400 flex items-center justify-center text-white shadow-inner relative">
                  <Bot size={22} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-900 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm text-white tracking-tight">Sathi AI</h3>
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/30">
                      Nepali Mart Assistant
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" /> Always ready to help you
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Clear conversation"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/60 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-daraz-orange text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className={`group relative max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-daraz-orange to-amber-600 text-white rounded-br-none'
                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none'
                  }`}>
                    {/* Render content with basic markdown line breaks / bold */}
                    <div className="whitespace-pre-wrap space-y-1">
                      {msg.content.split('\n').map((paragraph, i) => (
                        <p key={i}>
                          {paragraph.split('**').map((part, j) => 
                            j % 2 === 1 ? <strong key={j} className={msg.role === 'user' ? 'font-black text-amber-100' : 'font-black text-neutral-900'}>{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/5 pt-1 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-daraz-orange flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-lg bg-daraz-orange text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot size={18} />
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-none p-3.5 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-daraz-orange rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-daraz-orange rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-neutral-100/80 border-t border-neutral-200 flex gap-2 overflow-x-auto scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap text-[11px] font-bold bg-white text-neutral-700 hover:text-daraz-orange hover:bg-neutral-50 px-2.5 py-1 rounded-full border border-neutral-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Sathi AI anything about Nepali Mart..."
                disabled={isLoading}
                className="flex-1 bg-neutral-100 text-neutral-900 border border-transparent rounded-xl py-2.5 px-3.5 text-xs focus:bg-white focus:border-daraz-orange outline-none transition-all placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-daraz-orange hover:bg-amber-600 disabled:bg-neutral-300 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
