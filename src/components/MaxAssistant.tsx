import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  ArrowRight, 
  User, 
  Bot 
} from 'lucide-react';
import { AssetData } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MaxAssistantProps {
  assetData: AssetData;
  currency: string;
  portfolios: { id: string; name: string }[];
}

export function MaxAssistant({ assetData, currency, portfolios }: MaxAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Max, your personal wealth and portfolio AI assistant. I can analyze your savings, FDs, mutual funds, landed estates, and insurances. Ask me anything about your current holdings, net worth, or advice on yield optimization!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { text: "Analyze my portfolio", icon: PieChart },
    { text: "Optimize my yields", icon: TrendingUp },
    { text: "List my properties", icon: Sparkles },
    { text: "Insurance check-up", icon: ArrowRight }
  ];

  // Auto scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Package up user messages history for the API call
      // We will send up to the last 15 messages to keep it lightweight but maintain context
      const chatHistory = [...messages, userMessage].slice(-15).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          userPortfolioData: assetData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI assistant response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.text || "I apologize, but I ran into an empty response.",
        timestamp: new Date()
      }]);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "Oops! I encountered an error connecting to my core brain. Please check that you have configured your `GEMINI_API_KEY` correctly in Settings > Secrets or try again in a few moments.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div id="max-assistant-root" className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            id="max-toggle-btn"
            layoutId="max-chat-box"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-2xl hover:from-indigo-500 hover:to-indigo-650 cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="relative">
              <Bot className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="font-extrabold text-xs tracking-wider uppercase">Ask Max AI</span>
          </motion.button>
        ) : (
          <motion.div
            id="max-chat-window"
            layoutId="max-chat-box"
            className="w-96 h-[550px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-100 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-850/80 border-b border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase">
                    Max Support AI
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-bold normal-case tracking-normal">Online</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Personal Portfolio Advisor</p>
                </div>
              </div>
              <button 
                id="max-close-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200/20">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800/85 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-700/30'
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <span className="block text-[8px] opacity-60 text-right mt-1.5">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/85 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs shadow-sm flex items-center gap-1.5 border border-slate-200/30 dark:border-slate-700/30">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 bg-slate-50/50 dark:bg-slate-900/40">
                {suggestions.map((sug, i) => {
                  const IconComp = sug.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(sug.text)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-[10px] font-semibold border border-slate-200/60 dark:border-slate-750 cursor-pointer shadow-sm transition-all duration-200"
                    >
                      <IconComp className="h-3 w-3 text-slate-400" />
                      <span>{sug.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input Form */}
            <form 
              onSubmit={handleFormSubmit}
              className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center gap-2"
            >
              <input
                id="max-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Max about your portfolio..."
                className="flex-1 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-200/60 dark:border-slate-700/60"
              />
              <button
                id="max-send-btn"
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-md transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
