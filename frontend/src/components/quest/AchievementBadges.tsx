'use client';

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AchievementBadgeType =
  | 'first_quest'
  | 'speed_runner'
  | 'perfect_score'
  | 'social_butterfly'
  | 'night_owl'
  | 'world_traveler'
  | 'master_negotiator'
  | 'riddle_master'
  | 'streak_champion'
  | 'community_creator'
  | 'legendary_explorer'
  | 'questmaster_elite';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface AchievementBadgeProps {
  type: AchievementBadgeType;
  size?: BadgeSize;
  earned?: boolean;
  animate?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Badge metadata
// ---------------------------------------------------------------------------

const BADGE_META: Record<AchievementBadgeType, { name: string; description: string }> = {
  first_quest: { name: 'First Quest', description: 'Complete your very first quest' },
  speed_runner: { name: 'Speed Runner', description: 'Complete a quest in under 5 minutes' },
  perfect_score: { name: 'Perfect Score', description: 'Achieve 100% on any quest' },
  social_butterfly: { name: 'Social Butterfly', description: 'Connect with 20 fellow adventurers' },
  night_owl: { name: 'Night Owl', description: 'Complete 10 quests after midnight' },
  world_traveler: { name: 'World Traveler', description: 'Complete quests in 5 different cities' },
  master_negotiator: { name: 'Master Negotiator', description: 'Ace all negotiation challenges' },
  riddle_master: { name: 'Riddle Master', description: 'Solve 50 riddles without hints' },
  streak_champion: { name: 'Streak Champion', description: 'Maintain a 30-day quest streak' },
  community_creator: { name: 'Community Creator', description: 'Create 10 community quests' },
  legendary_explorer: { name: 'Legendary Explorer', description: 'Complete all legendary quests' },
  questmaster_elite: { name: 'QuestMaster Elite', description: 'Earn every other achievement' },
};

const SIZE_MAP: Record<BadgeSize, number> = { sm: 48, md: 80, lg: 120 };

// ---------------------------------------------------------------------------
// Individual SVG badge renderers
// ---------------------------------------------------------------------------

function FirstQuestBadge() {
  return (
    <>
      <defs>
        <linearGradient id="fq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CD7F32" />
          <stop offset="50%" stopColor="#E8A854" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        <linearGradient id="fq-shine" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="fq-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5E3C" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#fq-bg)" filter="url(#fq-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E8A854" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="44" fill="url(#fq-shine)" />
      {/* Compass icon */}
      <circle cx="50" cy="50" r="18" fill="none" stroke="#FFF" strokeWidth="2.5" opacity="0.9" />
      <circle cx="50" cy="50" r="3" fill="#FFF" opacity="0.9" />
      {/* Compass needle N */}
      <polygon points="50,32 46,50 50,46 54,50" fill="#FF6B6B" opacity="0.9" />
      {/* Compass needle S */}
      <polygon points="50,68 46,50 50,54 54,50" fill="#FFF" opacity="0.7" />
      {/* Cardinal marks */}
      <line x1="50" y1="28" x2="50" y2="33" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
      <line x1="50" y1="67" x2="50" y2="72" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
      <line x1="28" y1="50" x2="33" y2="50" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
      <line x1="67" y1="50" x2="72" y2="50" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
    </>
  );
}

function SpeedRunnerBadge() {
  return (
    <>
      <defs>
        <linearGradient id="sr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="50%" stopColor="#E5E7EB" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
        <filter id="sr-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6B7280" floodOpacity="0.5" />
        </filter>
        <linearGradient id="sr-shine" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#sr-bg)" filter="url(#sr-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="2" opacity="0.5" />
      <circle cx="50" cy="50" r="44" fill="url(#sr-shine)" />
      {/* Lightning bolt */}
      <polygon
        points="54,22 38,52 48,52 44,78 62,46 52,46"
        fill="#FBBF24"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Speed lines */}
      <line x1="25" y1="38" x2="35" y2="38" stroke="#FFF" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="22" y1="50" x2="32" y2="50" stroke="#FFF" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="25" y1="62" x2="35" y2="62" stroke="#FFF" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    </>
  );
}

function PerfectScoreBadge() {
  return (
    <>
      <defs>
        <linearGradient id="ps-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="ps-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FCD34D" floodOpacity="0.6" />
        </filter>
        <linearGradient id="ps-shine" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#ps-bg)" filter="url(#ps-glow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FCD34D" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="44" fill="url(#ps-shine)" />
      {/* Star */}
      <polygon
        points="50,24 56,40 74,40 60,52 65,68 50,58 35,68 40,52 26,40 44,40"
        fill="#FFF"
        opacity="0.95"
        stroke="#F59E0B"
        strokeWidth="1"
      />
      {/* Inner star glow */}
      <polygon
        points="50,30 54,42 66,42 56,50 60,62 50,54 40,62 44,50 34,42 46,42"
        fill="#FEF3C7"
        opacity="0.5"
      />
    </>
  );
}

function SocialButterflyBadge() {
  return (
    <>
      <defs>
        <linearGradient id="sb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <filter id="sb-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#sb-bg)" filter="url(#sb-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.5" />
      {/* Users icon - three people */}
      <circle cx="50" cy="38" r="8" fill="#FFF" opacity="0.9" />
      <path d="M36,62 Q36,50 50,50 Q64,50 64,62" fill="#FFF" opacity="0.9" />
      <circle cx="34" cy="42" r="6" fill="#FFF" opacity="0.6" />
      <path d="M22,60 Q22,52 34,52 Q42,52 42,56" fill="#FFF" opacity="0.5" />
      <circle cx="66" cy="42" r="6" fill="#FFF" opacity="0.6" />
      <path d="M58,56 Q58,52 66,52 Q78,52 78,60" fill="#FFF" opacity="0.5" />
      {/* Sparkle dots */}
      <circle cx="26" cy="30" r="1.5" fill="#FDE68A" opacity="0.7" />
      <circle cx="74" cy="32" r="1.5" fill="#FDE68A" opacity="0.7" />
      <circle cx="50" cy="76" r="1.5" fill="#FDE68A" opacity="0.7" />
    </>
  );
}

function NightOwlBadge() {
  return (
    <>
      <defs>
        <linearGradient id="no-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E3A5F" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <filter id="no-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3B82F6" floodOpacity="0.4" />
        </filter>
        <radialGradient id="no-moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(253,224,71,0.3)" />
          <stop offset="100%" stopColor="rgba(253,224,71,0)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#no-bg)" filter="url(#no-glow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
      {/* Moon glow */}
      <circle cx="50" cy="44" r="24" fill="url(#no-moon-glow)" />
      {/* Crescent moon */}
      <circle cx="50" cy="44" r="16" fill="#FDE68A" />
      <circle cx="58" cy="40" r="13" fill="url(#no-bg)" />
      {/* Stars */}
      <polygon points="30,30 31,33 34,33 32,35 33,38 30,36 27,38 28,35 26,33 29,33" fill="#FDE68A" opacity="0.8" />
      <polygon points="72,36 73,38 75,38 73.5,39.5 74,42 72,40.5 70,42 70.5,39.5 69,38 71,38" fill="#FDE68A" opacity="0.6" />
      <polygon points="64,24 65,26 67,26 65.5,27 66,29 64,28 62,29 62.5,27 61,26 63,26" fill="#FDE68A" opacity="0.7" />
      {/* Small stars */}
      <circle cx="38" cy="68" r="1" fill="#FDE68A" opacity="0.5" />
      <circle cx="62" cy="70" r="1" fill="#FDE68A" opacity="0.5" />
      <circle cx="22" cy="50" r="1" fill="#FDE68A" opacity="0.4" />
    </>
  );
}

function WorldTravelerBadge() {
  return (
    <>
      <defs>
        <linearGradient id="wt-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id="wt-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#059669" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#wt-bg)" filter="url(#wt-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#34D399" strokeWidth="2" opacity="0.5" />
      {/* Globe */}
      <circle cx="50" cy="50" r="20" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.9" />
      <ellipse cx="50" cy="50" rx="10" ry="20" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
      <line x1="30" y1="50" x2="70" y2="50" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="50" cy="42" rx="18" ry="5" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.4" />
      <ellipse cx="50" cy="58" rx="18" ry="5" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.4" />
      {/* Plane silhouette */}
      <path d="M70,28 L74,26 L76,28 L66,36 L68,40 L66,40 L62,36 L56,38 L56,36 L70,28Z" fill="#FFF" opacity="0.8" />
      {/* Trail */}
      <path d="M76,28 Q80,22 78,18" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
    </>
  );
}

function MasterNegotiatorBadge() {
  return (
    <>
      <defs>
        <linearGradient id="mn-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <filter id="mn-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D97706" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#mn-bg)" filter="url(#mn-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.5" />
      {/* Handshake */}
      <path
        d="M28,52 L36,44 L42,44 L50,36 L54,40 L48,46 L54,46 L58,42 L64,42 L72,50"
        fill="none"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M28,52 L34,58 L40,58 L48,66"
        fill="none"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M72,50 L66,56 L60,56 L52,64"
        fill="none"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* Sparkle */}
      <circle cx="50" cy="28" r="2" fill="#FFF" opacity="0.7" />
      <line x1="50" y1="24" x2="50" y2="22" stroke="#FFF" strokeWidth="1" opacity="0.5" />
      <line x1="50" y1="34" x2="50" y2="32" stroke="#FFF" strokeWidth="1" opacity="0.5" />
      <line x1="46" y1="28" x2="44" y2="28" stroke="#FFF" strokeWidth="1" opacity="0.5" />
      <line x1="54" y1="28" x2="56" y2="28" stroke="#FFF" strokeWidth="1" opacity="0.5" />
    </>
  );
}

function RiddleMasterBadge() {
  return (
    <>
      <defs>
        <linearGradient id="rm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <filter id="rm-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#A855F7" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#rm-bg)" filter="url(#rm-glow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#C084FC" strokeWidth="2" opacity="0.5" />
      {/* Puzzle piece */}
      <path
        d="M34,36 L44,36 C44,32 48,30 50,30 C52,30 56,32 56,36 L66,36 L66,46 C70,46 72,50 72,52 C72,54 70,58 66,58 L66,66 L56,66 C56,62 52,60 50,60 C48,60 44,62 44,66 L34,66 L34,56 C30,56 28,52 28,50 C28,48 30,44 34,44 Z"
        fill="#FFF"
        opacity="0.9"
        stroke="#E9D5FF"
        strokeWidth="1"
      />
      {/* Question mark inside */}
      <text x="50" y="54" textAnchor="middle" fill="#7E22CE" fontSize="16" fontWeight="bold" fontFamily="serif">?</text>
    </>
  );
}

function StreakChampionBadge() {
  return (
    <>
      <defs>
        <linearGradient id="sc-bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="sc-fire" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="40%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <filter id="sc-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F97316" floodOpacity="0.6" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#sc-bg)" filter="url(#sc-glow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FB923C" strokeWidth="2" opacity="0.5" />
      {/* Fire */}
      <path
        d="M50,22 C50,22 62,36 62,50 C62,58 58,66 50,70 C42,66 38,58 38,50 C38,36 50,22 50,22Z"
        fill="url(#sc-fire)"
        opacity="0.9"
      />
      <path
        d="M50,34 C50,34 56,42 56,50 C56,56 54,60 50,62 C46,60 44,56 44,50 C44,42 50,34 50,34Z"
        fill="#FDE68A"
        opacity="0.7"
      />
      <ellipse cx="50" cy="56" rx="4" ry="6" fill="#FFF" opacity="0.5" />
      {/* 30 */}
      <text x="50" y="56" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="bold" fontFamily="sans-serif">30</text>
    </>
  );
}

function CommunityCreatorBadge() {
  return (
    <>
      <defs>
        <linearGradient id="cc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="50%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <filter id="cc-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0D9488" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#cc-bg)" filter="url(#cc-shadow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#2DD4BF" strokeWidth="2" opacity="0.5" />
      {/* Paint brush */}
      <path
        d="M62,26 L70,34 L46,58 L38,50 Z"
        fill="#FFF"
        opacity="0.9"
        stroke="#CCFBF1"
        strokeWidth="0.5"
      />
      <path
        d="M38,50 L46,58 L40,64 C38,66 34,68 32,66 C30,64 30,60 32,58 L38,50Z"
        fill="#FDE68A"
        opacity="0.9"
      />
      <line x1="62" y1="26" x2="70" y2="34" stroke="#FFF" strokeWidth="1" opacity="0.5" />
      {/* Paint splashes */}
      <circle cx="28" cy="40" r="3" fill="#FB923C" opacity="0.6" />
      <circle cx="72" cy="60" r="2.5" fill="#A78BFA" opacity="0.6" />
      <circle cx="66" cy="72" r="2" fill="#34D399" opacity="0.6" />
      <circle cx="32" cy="70" r="2" fill="#F472B6" opacity="0.6" />
    </>
  );
}

function LegendaryExplorerBadge() {
  return (
    <>
      <defs>
        <linearGradient id="le-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="30%" stopColor="#FCD34D" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <filter id="le-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#FCD34D" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="le-crown" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#le-bg)" filter="url(#le-glow)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FCD34D" strokeWidth="2.5" opacity="0.7" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="#FCD34D" strokeWidth="0.5" opacity="0.3" />
      {/* Crown */}
      <path
        d="M30,58 L30,42 L38,50 L50,34 L62,50 L70,42 L70,58 Z"
        fill="url(#le-crown)"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="30" y1="62" x2="70" y2="62" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* Jewels on crown */}
      <circle cx="38" cy="55" r="2.5" fill="#EF4444" opacity="0.9" />
      <circle cx="50" cy="50" r="3" fill="#3B82F6" opacity="0.9" />
      <circle cx="62" cy="55" r="2.5" fill="#10B981" opacity="0.9" />
      {/* Glow particles */}
      <circle cx="24" cy="30" r="1.5" fill="#FDE68A" opacity="0.6" />
      <circle cx="76" cy="34" r="1" fill="#FDE68A" opacity="0.5" />
      <circle cx="20" cy="60" r="1" fill="#FDE68A" opacity="0.4" />
      <circle cx="80" cy="56" r="1.5" fill="#FDE68A" opacity="0.5" />
    </>
  );
}

function QuestMasterEliteBadge() {
  return (
    <>
      <defs>
        <linearGradient id="qe-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="25%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="75%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="qe-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#8B5CF6" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="qe-diamond" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="50%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="qe-diamond-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#qe-bg)" filter="url(#qe-glow)" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Diamond shape */}
      <polygon
        points="50,24 68,48 50,76 32,48"
        fill="url(#qe-diamond)"
        stroke="#E0E7FF"
        strokeWidth="1.5"
      />
      {/* Diamond facets */}
      <polygon points="50,24 58,40 42,40" fill="rgba(255,255,255,0.3)" />
      <polygon points="42,40 50,24 32,48" fill="rgba(255,255,255,0.15)" />
      <polygon points="42,40 58,40 50,76 32,48" fill="url(#qe-diamond-shine)" opacity="0.3" />
      <line x1="42" y1="40" x2="58" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      <line x1="42" y1="40" x2="50" y2="76" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="58" y1="40" x2="50" y2="76" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="32" y1="48" x2="68" y2="48" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Sparkle particles */}
      <circle cx="24" cy="28" r="2" fill="#FDE68A" opacity="0.7" />
      <circle cx="76" cy="30" r="1.5" fill="#FDE68A" opacity="0.6" />
      <circle cx="78" cy="68" r="1.5" fill="#FDE68A" opacity="0.5" />
      <circle cx="22" cy="66" r="2" fill="#FDE68A" opacity="0.6" />
      <circle cx="50" cy="14" r="1" fill="#FFF" opacity="0.7" />
      <circle cx="82" cy="50" r="1" fill="#FFF" opacity="0.5" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Badge registry
// ---------------------------------------------------------------------------

const BADGE_RENDERERS: Record<AchievementBadgeType, React.FC> = {
  first_quest: FirstQuestBadge,
  speed_runner: SpeedRunnerBadge,
  perfect_score: PerfectScoreBadge,
  social_butterfly: SocialButterflyBadge,
  night_owl: NightOwlBadge,
  world_traveler: WorldTravelerBadge,
  master_negotiator: MasterNegotiatorBadge,
  riddle_master: RiddleMasterBadge,
  streak_champion: StreakChampionBadge,
  community_creator: CommunityCreatorBadge,
  legendary_explorer: LegendaryExplorerBadge,
  questmaster_elite: QuestMasterEliteBadge,
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  size = 'md',
  earned = true,
  animate = true,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const Renderer = BADGE_RENDERERS[type];
  const meta = BADGE_META[type];
  const px = SIZE_MAP[size];

  if (!Renderer || !meta) return null;

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={[
          'transition-all duration-300',
          !earned ? 'grayscale opacity-40' : '',
          animate && earned ? 'hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]' : '',
        ].join(' ')}
        role="img"
        aria-label={`${meta.name} achievement badge`}
      >
        <Renderer />
      </svg>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-xl min-w-[160px] text-center">
            <p className="text-xs font-semibold text-white whitespace-nowrap">{meta.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{meta.description}</p>
            {!earned && (
              <p className="text-[10px] text-amber-400 mt-1 font-medium">Not yet earned</p>
            )}
          </div>
          <div className="w-2 h-2 bg-navy-900/95 border-b border-r border-white/10 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;

// ---------------------------------------------------------------------------
// Collection export for displaying all badges
// ---------------------------------------------------------------------------

export const ALL_BADGE_TYPES: AchievementBadgeType[] = [
  'first_quest',
  'speed_runner',
  'perfect_score',
  'social_butterfly',
  'night_owl',
  'world_traveler',
  'master_negotiator',
  'riddle_master',
  'streak_champion',
  'community_creator',
  'legendary_explorer',
  'questmaster_elite',
];

export { BADGE_META };
