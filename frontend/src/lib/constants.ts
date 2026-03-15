export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
export const QUEST_CATEGORIES = ['adventure', 'mystery', 'cultural', 'educational', 'culinary', 'nature', 'urban', 'team_building'] as const;
export const QUEST_DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary'] as const;
export const CHALLENGE_TYPES = ['conversation', 'riddle', 'knowledge', 'negotiation', 'persuasion', 'exploration', 'trivia'] as const;

export const DIFFICULTY_COLORS = {
  easy: 'emerald',
  medium: 'amber',
  hard: 'rose',
  legendary: 'violet',
} as const;

export const CATEGORY_ICONS = {
  adventure: 'Compass',
  mystery: 'Search',
  cultural: 'Landmark',
  educational: 'GraduationCap',
  culinary: 'ChefHat',
  nature: 'TreePine',
  urban: 'Building2',
  team_building: 'Users',
} as const;
