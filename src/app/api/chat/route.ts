import { NextRequest, NextResponse } from 'next/server';

const AT_TOKEN = process.env.AIRTABLE_TOKEN!;
const AT_BASE = process.env.AIRTABLE_BASE!;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY!;

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

function getLevel(xp: number): number {
  let level = 1, threshold = 0;
  while (xp >= threshold + 100 + (level - 1) * 50) {
    threshold += 100 + (level - 1) * 50;
    level++;
  }
  return level;
}

function parseTag(match: RegExpMatchArray | null): Record<string, string> | null {
  if (!match) return null;
  const result: Record<string, string> = {};
  match[1].split(',').forEach((pair) => {
    const parts = pair.trim().split('=');
    if (parts.length >= 2) result[parts[0].trim()] = parts.slice(1).join('=').trim();
  });
  return result;
}

async function atGet(table: string, formula: string) {
  const url = `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AT_TOKEN}` } });
  return res.json();
}

async function atCreate(table: string, fields: Record<string, unknown>) {
  await fetch(`https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }] }),
  });
}

async function atPatch(table: string, recordId: string, fields: Record<string, unknown>) {
  await fetch(`https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(table)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${AT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ id: recordId, fields }] }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId = 'user_default', sessionId, message } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch user profile
    const profileResp = await atGet('UserProfile', `{userId} = "${userId}"`);
    const profileRecord = profileResp.records?.[0];
    const pf = {
      recordId: profileRecord?.id ?? null,
      displayName: profileRecord?.fields?.displayName ?? 'Athlete',
      level: profileRecord?.fields?.level ?? 1,
      totalXP: profileRecord?.fields?.totalXP ?? 0,
      currentStreak: profileRecord?.fields?.currentStreak ?? 0,
      lastActive: profileRecord?.fields?.lastActive ?? '',
      badges: profileRecord?.fields?.badges ?? '[]',
    };

    let badgeList: string[] = [];
    try { badgeList = JSON.parse(pf.badges); } catch { badgeList = []; }

    const systemPrompt = `You are FitBot, a motivating personal fitness coach. Be concise, warm, and specific.

USER PROFILE:
- Name: ${pf.displayName}
- Level: ${pf.level} | XP: ${pf.totalXP} | Streak: ${pf.currentStreak} days
- Badges earned: ${badgeList.join(', ') || 'none yet'}

YOUR RESPONSIBILITIES:
1. Have natural fitness conversations and give personalized advice
2. When the user logs a workout, confirm it enthusiastically
3. When the user mentions food/meals, acknowledge their nutrition
4. Celebrate streaks, milestones, and personal bests
5. Suggest improvements and next steps

DATA TAGGING - append silently at the END of your response when applicable:
- Workout mentioned: append [WORKOUT: type=X, duration=Xmin]
- Meal mentioned: append [MEAL: type=X, calories=X]
- Goal set: append [GOAL: type=X, description=X]`;

    // 2. Call OpenRouter
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fitbot.app',
        'X-Title': 'FitBot',
      },
      body: JSON.stringify({
        model: 'arcee-ai/trinity-large-preview:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      return NextResponse.json({ error: `AI error: ${err}` }, { status: 502 });
    }

    const aiJson = await aiRes.json();
    const output: string = aiJson.choices?.[0]?.message?.content ?? '';

    // 3. Parse tags
    const workoutMatch = output.match(/\[WORKOUT:\s*([^\]]+)\]/i);
    const mealMatch = output.match(/\[MEAL:\s*([^\]]+)\]/i);
    const goalMatch = output.match(/\[GOAL:\s*([^\]]+)\]/i);

    const workoutData = parseTag(workoutMatch);
    const mealData = parseTag(mealMatch);
    const goalData = parseTag(goalMatch);
    const cleanMessage = output.replace(/\[(WORKOUT|MEAL|GOAL)[^\]]*\]/gi, '').trim();

    // 4. Log to Airtable (parallel)
    const logPromises: Promise<void>[] = [];

    if (workoutData) {
      logPromises.push(atCreate('WorkoutLogs', {
        userId,
        date: today,
        type: workoutData.type ?? 'general',
        details: cleanMessage.substring(0, 300),
        duration: parseInt(workoutData.duration ?? '0') || 0,
        xpEarned: 50,
      }));
    }

    if (mealData) {
      logPromises.push(atCreate('NutritionLogs', {
        userId,
        date: today,
        meal: mealData.type ?? 'general',
        description: cleanMessage.substring(0, 300),
        calories: parseInt(mealData.calories ?? '0') || 0,
        xpEarned: 20,
      }));
    }

    if (goalData) {
      logPromises.push(atCreate('Goals', {
        userId,
        goalType: goalData.type ?? 'general',
        description: goalData.description ?? '',
        status: 'active',
        xpReward: 25,
      }));
    }

    await Promise.all(logPromises);

    // 5. Calculate XP + gamification
    const streakBonus = Math.min(pf.currentStreak * 5, 25);
    let xpGained = 0;
    if (workoutData) xpGained += 50;
    if (mealData) xpGained += 20;
    if (goalData) xpGained += 25;
    if (xpGained > 0) xpGained += streakBonus;

    const newXP = pf.totalXP + xpGained;
    const newLevel = getLevel(newXP);
    const levelUp = newLevel > pf.level;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak =
      xpGained > 0
        ? pf.lastActive === yesterday
          ? pf.currentStreak + 1
          : 1
        : pf.currentStreak;

    let allBadges: string[] = [...badgeList];
    const newBadges: string[] = [];

    const checkBadge = (name: string, condition: boolean) => {
      if (condition && !allBadges.includes(name)) {
        allBadges.push(name);
        newBadges.push(name);
      }
    };

    checkBadge('First Rep', !!workoutData);
    checkBadge('Fuel Up', !!mealData);
    checkBadge('Goal Setter', !!goalData);
    checkBadge('On Fire', newStreak >= 3);
    checkBadge('Week Warrior', newStreak >= 7);
    checkBadge('Iron Will', newStreak >= 30);
    checkBadge('Level 5', newLevel >= 5);
    checkBadge('Level 10', newLevel >= 10);

    // 6. Update profile
    if (pf.recordId) {
      await atPatch('UserProfile', pf.recordId, {
        level: newLevel,
        totalXP: newXP,
        currentStreak: newStreak,
        lastActive: today,
        badges: JSON.stringify(allBadges),
      });
    }

    return NextResponse.json({
      message: cleanMessage,
      xpGained,
      levelUp,
      newAchievement:
        newBadges.length > 0
          ? { name: newBadges[0], icon: BADGE_ICONS[newBadges[0]] ?? '🏆' }
          : null,
      profile: {
        level: newLevel,
        totalXP: newXP,
        currentStreak: newStreak,
        badges: allBadges,
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
