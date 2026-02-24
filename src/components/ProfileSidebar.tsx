'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types';
import XPBar from './XPBar';
import StreakCounter from './StreakCounter';
import { getLevelProgress } from '@/lib/n8n';

interface ProfileSidebarProps {
  profile: UserProfile;
  lastXP: number;
  levelUp: boolean;
}

const BADGE_ICONS: Record<string, string> = {
  'First Rep': '💪',
  'Fuel Up': '🥗',
  'Goal Setter': '🎯',
  'On Fire': '🔥',
  'Week Warrior': '⚡',
  'Iron Will': '🦾',
  'Level 5': '⭐',
  'Level 10': '🌟',
};

export default function ProfileSidebar({ profile, lastXP, levelUp }: ProfileSidebarProps) {
  const progress = getLevelProgress(profile.totalXP, profile.level);

  return (
    <aside className="w-72 flex-shrink-0 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col p-6 gap-8">
      {/* Header */}
      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">FitBot</p>
        <h1 className="text-2xl font-black text-white tracking-tight">AI FITNESS<br />ADVISOR</h1>
        <div className="w-8 h-0.5 bg-[#ff6b00] mt-2" />
      </div>

      {/* Level */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] text-[#555] uppercase tracking-widest">Level</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={profile.level}
                className="text-5xl font-black text-white font-mono leading-none"
                initial={levelUp ? { scale: 1.4, color: '#c8f731' } : {}}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.5 }}
              >
                {profile.level}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#555] uppercase tracking-widest">Total XP</p>
            <p className="text-xl font-black text-[#ff6b00] font-mono">{profile.totalXP.toLocaleString()}</p>
          </div>
        </div>
        <XPBar progress={progress} xpGained={lastXP} />
        <p className="text-[10px] text-[#444] mt-1">{Math.round(progress)}% to level {profile.level + 1}</p>
      </div>

      {/* Streak */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
        <StreakCounter streak={profile.currentStreak} />
      </div>

      {/* Badges */}
      <div className="flex-1">
        <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">Badges</p>
        {profile.badges.length === 0 ? (
          <p className="text-[#333] text-xs">Complete workouts to earn badges</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <motion.div
                key={badge}
                className="flex items-center gap-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                title={badge}
              >
                <span className="text-sm">{BADGE_ICONS[badge] || '🏆'}</span>
                <span className="text-[10px] text-[#888]">{badge}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e1e1e] pt-4">
        <p className="text-[10px] text-[#333] uppercase tracking-widest">Powered by n8n + GPT-4o</p>
      </div>
    </aside>
  );
}
