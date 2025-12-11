import React, { useState, useRef, useEffect } from 'react';
import { InstrumentState, ChatMessage } from '../types';
import { generateIVDAssistance } from '../services/geminiService';
import { Bot, Send, User, Loader2, Wrench } from 'lucide-react';

interface Props {
  instrumentState: InstrumentState;
}

const ChatAssistant: React.FC<Props> = ({ instrumentState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: `IVD-Copilot System Online. Connected to Instrument Controller.\n\nCurrent Status: ${instrumentState.status}\nI can assist with troubleshooting, QC analysis, and maintenance procedures.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateIVDAssistance(userMsg.text, instrumentState);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "System Error: Unable to process request.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-ivd-900 to-ivd-800 p-4 flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <Bot className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-white font-semibold">IVD-Copilot</h2>
          <p className="text-ivd-100 text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            AI Inference Engine Active
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-ivd-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-gray-200 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.text}
              </div>
              {msg.role === 'model' && msg.text.toLowerCase().includes('error') && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-xs font-semibold text-ivd-600 hover:text-ivd-800 transition-colors">
                     <Wrench size={14} />
                     View Troubleshooting Guide
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-ivd-600" size={16} />
              <span className="text-xs text-gray-500">Analyzing telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about QC status, errors, or maintenance..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ivd-500 focus:bg-white transition-all text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-ivd-600 hover:bg-ivd-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;