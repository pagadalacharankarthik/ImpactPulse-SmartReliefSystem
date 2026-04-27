import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { getAIResponse, type ChatMessage } from '../services/geminiService';
import { useDatabaseStore } from '../store/useDatabaseStore';
import { Button } from './ui/Button';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { tasks, surveys, users, organizations } = useDatabaseStore();

  // Prepare context data for Gemini
  const getContextData = () => {
    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed');
    const pendingSurveys = surveys.length;
    const activeOrgs = organizations.length;
    const totalPeople = tasks.reduce((sum, t) => sum + (t.peopleAffected || 0), 0);
    
    return `
      - Total Tasks: ${tasks.length}
      - High Priority Tasks: ${highPriority.length} (${highPriority.map(t => t.title).join(', ')})
      - Pending Surveys: ${pendingSurveys}
      - Active Organizations: ${activeOrgs}
      - People Affected (Total): ${totalPeople}
      - Latest Alerts: ${highPriority.slice(0, 2).map(t => `${t.title} in ${t.location}`).join('; ')}
    `;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Map existing messages to Gemini format
      const history: ChatMessage[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await getAIResponse(userMessage, getContextData(), history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: error.message || "AI not available right now. Please check your API key." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Impact Intelligence</h3>
                <p className="text-[10px] text-primary-100">AI Assistant Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <div className="inline-block p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-600 mb-2">
                  <Bot className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Hello Admin!</p>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                  I can help you analyze mission data and prioritize relief efforts.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-2">
                  {["What needs urgent help?", "Summarize reports", "Priority areas"].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary-500 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                  <span className="text-xs text-gray-500 italic">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask intelligence..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="rounded-xl h-10 w-10 p-0 flex items-center justify-center bg-primary-600 hover:bg-primary-700"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' 
            : 'bg-primary-600 text-white'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500 border-2 border-white dark:border-gray-900"></span>
          </span>
        )}
      </button>
    </div>
  );
};
