'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#1a1a1a] border border-[#ff6b00] rounded-xl px-5 py-4 shadow-[0_0_30px_rgba(255,107,0,0.3)] cursor-pointer"
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onDismiss}
        >
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <p className="text-[10px] text-[#ff6b00] uppercase tracking-widest font-bold">Badge Unlocked</p>
            <p className="text-white font-bold text-sm">{achievement.name}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
