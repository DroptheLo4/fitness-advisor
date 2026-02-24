import { ChatRequest, ChatResponse } from '@/types';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export function getLevelProgress(totalXP: number, level: number): number {
  // Calculate XP needed for current level and next level
  let threshold = 0;
  for (let i = 1; i < level; i++) {
    threshold += 100 + (i - 1) * 50;
  }
  const xpForCurrentLevel = totalXP - threshold;
  const xpNeededForNext = 100 + (level - 1) * 50;
  return Math.min((xpForCurrentLevel / xpNeededForNext) * 100, 100);
}
