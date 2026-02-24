'use client';
import { motion } from 'framer-motion';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#ff6b00] flex items-center justify-center text-xs font-black text-black mr-2 flex-shrink-0 mt-1">
          FB
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#ff6b00] text-black font-medium rounded-tr-sm'
              : 'bg-[#1e1e1e] text-[#f0f0f0] border border-[#2a2a2a] rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        {message.xpGained !== undefined && message.xpGained > 0 && (
          <motion.span
            className="text-[11px] text-[#c8f731] font-mono px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            +{message.xpGained} XP earned
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
