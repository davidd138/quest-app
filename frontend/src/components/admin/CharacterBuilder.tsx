'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import type { CharacterInput } from '@/types';
import Input from '@/components/ui/Input';

interface CharacterBuilderProps {
  character: CharacterInput;
  onChange: (character: CharacterInput) => void;
  className?: string;
}

const voiceStyles = [
  'warm',
  'mysterious',
  'energetic',
  'calm',
  'authoritative',
  'playful',
] as const;

const voiceColors: Record<string, string> = {
  warm: 'from-amber-600/30 to-orange-600/30 ring-amber-400/60',
  mysterious: 'from-violet-600/30 to-purple-600/30 ring-violet-400/60',
  energetic: 'from-rose-600/30 to-red-600/30 ring-rose-400/60',
  calm: 'from-emerald-600/30 to-teal-600/30 ring-emerald-400/60',
  authoritative: 'from-blue-600/30 to-indigo-600/30 ring-blue-400/60',
  playful: 'from-pink-600/30 to-fuchsia-600/30 ring-pink-400/60',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({
  character,
  onChange,
  className = '',
}) => {
  const update = <K extends keyof CharacterInput>(
    key: K,
    value: CharacterInput[K],
  ) => {
    onChange({ ...character, [key]: value });
  };

  const colorClass = voiceColors[character.voiceStyle] ?? voiceColors.warm;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-4">
        {/* Avatar preview */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ring-2 ${colorClass}`}
          >
            {character.name ? getInitials(character.name) : '?'}
          </div>
          <span className="mt-2 text-[10px] text-slate-500 text-center max-w-[80px] truncate">
            {character.name || 'Character'}
          </span>
          <span className="text-[10px] text-slate-600">
            {character.role || 'Role'}
          </span>
        </div>

        {/* Name + role */}
        <div className="flex-1 space-y-3">
          <Input
            label="Name"
            value={character.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Character name"
          />
          <Input
            label="Role"
            value={character.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="e.g. Merchant, Guide, Sage"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Personality
        </label>
        <textarea
          value={character.personality}
          onChange={(e) => update('personality', e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          placeholder="Describe their personality traits..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Backstory
        </label>
        <textarea
          value={character.backstory}
          onChange={(e) => update('backstory', e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          placeholder="Their background story..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Volume2 size={14} />
            Voice Style
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {voiceStyles.map((style) => (
            <button
              key={style}
              onClick={() => update('voiceStyle', style)}
              className={[
                'px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border',
                character.voiceStyle === style
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Greeting Message
        </label>
        <textarea
          value={character.greetingMessage}
          onChange={(e) => update('greetingMessage', e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          placeholder="What the character says when they first meet the player..."
        />
      </div>

      {/* Character preview card */}
      {character.name && (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
            Preview
          </p>
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ring-1 ${colorClass}`}
            >
              {getInitials(character.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {character.name}
              </p>
              <p className="text-xs text-slate-400">{character.role}</p>
              {character.greetingMessage && (
                <p className="mt-2 text-xs text-slate-300 bg-white/5 rounded-lg px-3 py-2 leading-relaxed">
                  &ldquo;{character.greetingMessage}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterBuilder;
