'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Compass, Trophy, Swords } from 'lucide-react';

export type ChatMessageType = 'text' | 'quest_share' | 'achievement_share' | 'challenge_invite';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: ChatMessageType;
  read?: boolean;
  meta?: {
    questId?: string;
    questTitle?: string;
    questCategory?: string;
    questDifficulty?: string;
    achievementTitle?: string;
    achievementIcon?: string;
    challengeTitle?: string;
  };
}

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const colors = [
    'from-violet-500 to-fuchsia-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function QuestShareCard({ meta }: { meta: ChatMessage['meta'] }) {
  return (
    <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Compass className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {meta?.questTitle || 'Shared Quest'}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">
            {meta?.questCategory} &middot; {meta?.questDifficulty}
          </p>
        </div>
      </div>
      <button className="w-full py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[10px] font-semibold hover:bg-violet-600/30 transition-colors">
        View Quest
      </button>
    </div>
  );
}

function AchievementShareCard({ meta }: { meta: ChatMessage['meta'] }) {
  return (
    <div className="mt-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-3 min-w-[220px]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
            Achievement Unlocked
          </p>
          <p className="text-xs font-semibold text-white">
            {meta?.achievementTitle || 'New Achievement'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChallengeInviteCard({ meta }: { meta: ChatMessage['meta'] }) {
  return (
    <div className="mt-2 rounded-xl bg-gradient-to-br from-rose-500/10 to-fuchsia-500/5 border border-rose-500/20 p-3 min-w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Swords className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
            Challenge Invite
          </p>
          <p className="text-xs font-semibold text-white">
            {meta?.challengeTitle || 'New Challenge'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 text-[10px] font-semibold hover:bg-rose-600/30 transition-colors">
          Accept
        </button>
        <button className="flex-1 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[10px] font-semibold hover:bg-white/10 transition-colors">
          Decline
        </button>
      </div>
    </div>
  );
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-3`}
    >
      {showAvatar && !isOwn ? (
        <AvatarCircle name={message.senderName} />
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && showAvatar && (
          <span className="text-[10px] text-slate-500 font-medium mb-1 px-1">
            {message.senderName}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-tr-md'
              : 'bg-white/[0.07] backdrop-blur-xl border border-white/10 text-slate-200 rounded-tl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          {message.type === 'quest_share' && <QuestShareCard meta={message.meta} />}
          {message.type === 'achievement_share' && <AchievementShareCard meta={message.meta} />}
          {message.type === 'challenge_invite' && <ChallengeInviteCard meta={message.meta} />}
        </div>

        <div
          className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}
        >
          <span className="text-[10px] text-slate-600">{formatTime(message.timestamp)}</span>
          {isOwn && (
            message.read ? (
              <CheckCheck className="w-3 h-3 text-violet-400" />
            ) : (
              <Check className="w-3 h-3 text-slate-600" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
