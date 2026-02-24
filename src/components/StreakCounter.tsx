'use client';
import { motion } from 'framer-motion';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        className="text-2xl"
        animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        🔥
      </motion.span>
      <div>
        <p className="text-2xl font-black text-[#ff6b00] font-mono leading-none">{streak}</p>
        <p className="text-[10px] text-[#666] uppercase tracking-widest">day streak</p>
      </div>
    </div>
  );
}
