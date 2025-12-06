import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

export const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: 'model', text: 'Hola. Soy tu asistente de cuarto oscuro. ¿Tienes dudas sobre el proceso D-76?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: AssistantMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await sendMessageToGemini(userMsg.text, history);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg border-2 border-red-500 transition-colors ${
          isOpen ? 'bg-red-900 text-red-100' : 'bg-black text-red-500'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 h-96 bg-black border border-red-800 rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden">
          <div className="bg-red-900/30 p-3 border-b border-red-800 font-bold text-red-500 flex justify-between items-center">
            <span>AI Darkroom Guide</span>
            <span className="text-xs opacity-50">Gemini Powered</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-red-900/40 text-red-100 ml-auto border border-red-800/50'
                    : 'bg-safe-dim text-red-400 mr-auto border border-red-900/30'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-red-500 text-xs italic animate-pulse">Escribiendo...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-red-800 bg-black">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta sobre tiempos, químicos..."
                className="flex-1 bg-gray-900 text-red-100 border border-red-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-red-800 hover:bg-red-700 text-black px-4 py-2 rounded font-bold disabled:opacity-50"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};