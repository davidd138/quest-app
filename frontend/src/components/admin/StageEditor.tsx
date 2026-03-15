'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  X,
  MapPin,
} from 'lucide-react';
import type { StageInput, ChallengeType } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CharacterBuilder from './CharacterBuilder';

interface StageEditorProps {
  stage: StageInput;
  index: number;
  onChange: (stage: StageInput) => void;
  onRemove: () => void;
  className?: string;
}

const challengeTypes: ChallengeType[] = [
  'conversation',
  'riddle',
  'knowledge',
  'negotiation',
  'persuasion',
  'exploration',
  'trivia',
];

const voiceStyles = [
  'warm',
  'mysterious',
  'energetic',
  'calm',
  'authoritative',
  'playful',
];

const StageEditor: React.FC<StageEditorProps> = ({
  stage,
  index,
  onChange,
  onRemove,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic']),
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const updateField = <K extends keyof StageInput>(
    key: K,
    value: StageInput[K],
  ) => {
    onChange({ ...stage, [key]: value });
  };

  const addHint = () => {
    updateField('hints', [...stage.hints, '']);
  };

  const updateHint = (i: number, value: string) => {
    const updated = [...stage.hints];
    updated[i] = value;
    updateField('hints', updated);
  };

  const removeHint = (i: number) => {
    updateField(
      'hints',
      stage.hints.filter((_, idx) => idx !== i),
    );
  };

  const addFailureHint = () => {
    updateField('challenge', {
      ...stage.challenge,
      failureHints: [...stage.challenge.failureHints, ''],
    });
  };

  const updateFailureHint = (i: number, value: string) => {
    const updated = [...stage.challenge.failureHints];
    updated[i] = value;
    updateField('challenge', { ...stage.challenge, failureHints: updated });
  };

  const removeFailureHint = (i: number) => {
    updateField('challenge', {
      ...stage.challenge,
      failureHints: stage.challenge.failureHints.filter((_, idx) => idx !== i),
    });
  };

  const SectionHeader: React.FC<{
    id: string;
    title: string;
    badge?: string;
  }> = ({ id, title, badge }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-2 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-300">{title}</span>
        {badge && (
          <Badge color="slate" size="sm">
            {badge}
          </Badge>
        )}
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp size={14} className="text-slate-500" />
      ) : (
        <ChevronDown size={14} className="text-slate-500" />
      )}
    </button>
  );

  return (
    <div
      className={`rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 ${className}`}
    >
      {/* Stage header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-white">
            {stage.title || `Stage ${index + 1}`}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Basic section */}
      <SectionHeader id="basic" title="Basic Info" />
      <AnimatePresence>
        {expandedSections.has('basic') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 pb-3"
          >
            <Input
              label="Title"
              value={stage.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Stage title"
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={stage.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                placeholder="What happens at this stage..."
              />
            </div>
            <Input
              label="Points"
              type="number"
              value={stage.points.toString()}
              onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location section */}
      <SectionHeader id="location" title="Location" />
      <AnimatePresence>
        {expandedSections.has('location') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 pb-3"
          >
            <Input
              label="Location Name"
              value={stage.location.name}
              onChange={(e) =>
                updateField('location', { ...stage.location, name: e.target.value })
              }
              leftIcon={MapPin}
              placeholder="e.g. Old Town Square"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                value={stage.location.latitude.toString()}
                onChange={(e) =>
                  updateField('location', {
                    ...stage.location,
                    latitude: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Longitude"
                type="number"
                value={stage.location.longitude.toString()}
                onChange={(e) =>
                  updateField('location', {
                    ...stage.location,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <Input
              label="Address"
              value={stage.location.address ?? ''}
              onChange={(e) =>
                updateField('location', { ...stage.location, address: e.target.value })
              }
              placeholder="Full address"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character section */}
      <SectionHeader
        id="character"
        title="Character"
        badge={stage.character.name || undefined}
      />
      <AnimatePresence>
        {expandedSections.has('character') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-3"
          >
            <CharacterBuilder
              character={stage.character}
              onChange={(c) => updateField('character', c)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge section */}
      <SectionHeader
        id="challenge"
        title="Challenge"
        badge={stage.challenge.type}
      />
      <AnimatePresence>
        {expandedSections.has('challenge') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 pb-3"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={stage.challenge.type}
                onChange={(e) =>
                  updateField('challenge', {
                    ...stage.challenge,
                    type: e.target.value as ChallengeType,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
              >
                {challengeTypes.map((ct) => (
                  <option key={ct} value={ct} className="bg-navy-950 text-white">
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={stage.challenge.description}
                onChange={(e) =>
                  updateField('challenge', {
                    ...stage.challenge,
                    description: e.target.value,
                  })
                }
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                placeholder="What the player must do..."
              />
            </div>

            <Input
              label="Success Criteria"
              value={stage.challenge.successCriteria}
              onChange={(e) =>
                updateField('challenge', {
                  ...stage.challenge,
                  successCriteria: e.target.value,
                })
              }
              placeholder="How is success determined?"
            />

            <Input
              label="Max Attempts"
              type="number"
              value={(stage.challenge.maxAttempts ?? 3).toString()}
              onChange={(e) =>
                updateField('challenge', {
                  ...stage.challenge,
                  maxAttempts: parseInt(e.target.value) || 3,
                })
              }
            />

            {/* Failure hints */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">
                  Failure Hints
                </span>
                <button
                  onClick={addFailureHint}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {stage.challenge.failureHints.map((hint, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={hint}
                      onChange={(e) => updateFailureHint(i, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder={`Hint ${i + 1}`}
                    />
                    <button
                      onClick={() => removeFailureHint(i)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints section */}
      <SectionHeader id="hints" title="Hints" badge={`${stage.hints.length}`} />
      <AnimatePresence>
        {expandedSections.has('hints') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-3"
          >
            <div className="space-y-2">
              {stage.hints.map((hint, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={hint}
                    onChange={(e) => updateHint(i, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder={`Hint ${i + 1}`}
                  />
                  <button
                    onClick={() => removeHint(i)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={addHint}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
              >
                <Plus size={12} /> Add Hint
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StageEditor;
