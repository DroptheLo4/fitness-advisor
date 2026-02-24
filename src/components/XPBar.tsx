'use client';
import { motion } from 'framer-motion';

interface XPBarProps {
  progress: number; // 0-100
  xpGained?: number;
}

export default function XPBar({ progress, xpGained }: XPBarProps) {
  return (
    <div className="w-full">
      <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#ff6b00] to-[#c8f731]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {xpGained !== undefined && xpGained > 0 && (
        <motion.p
          className="text-xs text-[#c8f731] mt-1 text-right font-mono"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          +{xpGained} XP
        </motion.p>
      )}
    </div>
  );
}
