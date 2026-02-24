'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatWindow({ messages, onSend, isLoading }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ff6b00] flex items-center justify-center text-2xl font-black text-black">
              FB
            </div>
            <div>
              <p className="text-white font-bold text-lg">Hey, I&apos;m FitBot.</p>
              <p className="text-[#555] text-sm mt-1">Tell me about your workout, meal, or fitness goals.<br />I&apos;ll track your progress and keep you motivated.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['I just finished a run', 'Had a healthy lunch', 'I want to lose 10lbs'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  className="text-xs border border-[#2a2a2a] text-[#888] px-3 py-1.5 rounded-full hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 rounded-full bg-[#ff6b00] flex items-center justify-center text-xs font-black text-black mr-2 flex-shrink-0">
                FB
              </div>
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1e1e1e] px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log a workout, meal, or ask anything..."
            disabled={isLoading}
            className="flex-1 bg-[#111] border border-[#2a2a2a] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff6b00] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#ff6b00] text-black font-black text-sm px-5 py-3 rounded-xl hover:bg-[#e55f00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
