'use client';
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, UserProfile, Achievement, WorkoutTotal } from '@/types';
import { sendMessage } from '@/lib/n8n';
import ProfileSidebar from '@/components/ProfileSidebar';
import ChatWindow from '@/components/ChatWindow';
import AchievementToast from '@/components/AchievementToast';

const SESSION_ID = uuidv4();
const DEFAULT_PROFILE: UserProfile = { level: 1, totalXP: 0, currentStreak: 0, badges: [] };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [workoutTotals, setWorkoutTotals] = useState<Record<string, WorkoutTotal>>({});

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = { id: uuidv4(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLastXP(0);
    setLevelUp(false);

    try {
      const response = await sendMessage({ userId: 'user_default', sessionId: SESSION_ID, message: text });

      const botMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        xpGained: response.xpGained,
      };

      setMessages((prev) => [...prev, botMsg]);
      setProfile(response.profile);
      setLastXP(response.xpGained);
      setLevelUp(response.levelUp);
      if (response.workoutTotals) setWorkoutTotals(response.workoutTotals);

      if (response.newAchievement) {
        setAchievement(response.newAchievement);
        setTimeout(() => setAchievement(null), 4000);
      }
    } catch {
      const errMsg: Message = {
        id: uuidv4(),
        role: 'bot',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      <ProfileSidebar profile={profile} lastXP={lastXP} levelUp={levelUp} workoutTotals={workoutTotals} />
      <ChatWindow messages={messages} onSend={handleSend} isLoading={isLoading} />
      <AchievementToast achievement={achievement} onDismiss={() => setAchievement(null)} />
    </main>
  );
}
