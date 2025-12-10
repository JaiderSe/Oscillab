import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { generateInsight } from '../services/geminiService';
import { AnalysisData, ChatMessage } from '../types';

interface VirtualAssistantProps {
  metrics: AnalysisData | null;
  embedded?: boolean;
}

export const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ metrics, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Hola. Soy tu Asistente de Laboratorio Virtual. ¿En qué puedo ayudarte con el análisis de tus señales hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await generateInsight(userMsg.text, metrics);

    const botMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!embedded && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-40 group flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-green-500/30 ${isOpen ? 'hidden' : 'flex'}`}
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
          <div className="relative flex flex-col items-center justify-center">
              <Bot className="w-8 h-8 text-green-400 mb-0.5" />
              <span className="text-[10px] font-bold text-green-100">AI Assist</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {(isOpen || embedded) && (
        <div className={`${embedded ? 'w-full h-full' : 'fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'} bg-white rounded-2xl shadow-2xl ${embedded ? 'z-auto' : 'z-50'} flex flex-col border border-slate-200 overflow-hidden ${embedded ? '' : 'animate-in slide-in-from-bottom-10 fade-in duration-300'}`}>
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Asistente Virtual</h3>
                <p className="text-xs text-slate-400">Powered by Gemini</p>
              </div>
            </div>
            {!embedded && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                  ))}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta sobre los datos..."
                className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};