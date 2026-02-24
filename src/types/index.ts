export interface ChatRequest {
  userId: string;
  sessionId: string;
  message: string;
}

export interface Achievement {
  name: string;
  icon: string;
}

export interface UserProfile {
  level: number;
  totalXP: number;
  currentStreak: number;
  badges: string[];
}

export interface ChatResponse {
  message: string;
  xpGained: number;
  levelUp: boolean;
  newAchievement: Achievement | null;
  profile: UserProfile;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  xpGained?: number;
}
