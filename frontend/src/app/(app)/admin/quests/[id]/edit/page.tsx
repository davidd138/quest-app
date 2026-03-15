'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MapPin,
  User,
  Target,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { GET_QUEST } from '@/lib/graphql/queries';
import { UPDATE_QUEST } from '@/lib/graphql/mutations';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { QUEST_CATEGORIES, QUEST_DIFFICULTIES, CHALLENGE_TYPES } from '@/lib/constants';
import type {
  UpdateQuestInput,
  StageInput,
  QuestCategory,
  QuestDifficulty,
  ChallengeType,
  Quest,
} from '@/types';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function createEmptyStage(order: number): StageInput {
  return {
    order,
    title: '',
    description: '',
    location: { latitude: 0, longitude: 0, name: '', address: '' },
    character: {
      name: '',
      role: '',
      personality: '',
      backstory: '',
      voiceStyle: '',
      greetingMessage: '',
    },
    challenge: {
      type: 'conversation' as ChallengeType,
      description: '',
      successCriteria: '',
      failureHints: [],
    },
    points: 100,
    hints: [],
  };
}

interface StageEditorProps {
  stage: StageInput;
  index: number;
  onUpdate: (index: number, stage: StageInput) => void;
  onRemove: (index: number) => void;
}

function StageEditor({ stage, index, onUpdate, onRemove }: StageEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const updateField = <K extends keyof StageInput>(field: K, value: StageInput[K]) => {
    onUpdate(index, { ...stage, [field]: value });
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical size={16} className="text-slate-600" />
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <span className="text-violet-400 text-sm font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">
            {stage.title || `Stage ${index + 1}`}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {stage.location.name || 'No location set'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 size={14} className="text-rose-400" />
        </motion.button>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/5 px-5 py-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                value={stage.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Points</label>
              <input
                type="number"
                value={stage.points}
                onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
            <textarea
              value={stage.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" />
              Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Location name"
                value={stage.location.name}
                onChange={(e) =>
                  updateField('location', { ...stage.location, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                placeholder="Address"
                value={stage.location.address ?? ''}
                onChange={(e) =>
                  updateField('location', { ...stage.location, address: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={stage.location.latitude || ''}
                onChange={(e) =>
                  updateField('location', {
                    ...stage.location,
                    latitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={stage.location.longitude || ''}
                onChange={(e) =>
                  updateField('location', {
                    ...stage.location,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Character */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <User size={14} className="text-violet-400" />
              Character
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Character name"
                value={stage.character.name}
                onChange={(e) =>
                  updateField('character', { ...stage.character, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                placeholder="Role"
                value={stage.character.role}
                onChange={(e) =>
                  updateField('character', { ...stage.character, role: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                placeholder="Personality traits"
                value={stage.character.personality}
                onChange={(e) =>
                  updateField('character', { ...stage.character, personality: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="text"
                placeholder="Voice style"
                value={stage.character.voiceStyle}
                onChange={(e) =>
                  updateField('character', { ...stage.character, voiceStyle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <textarea
              placeholder="Backstory..."
              value={stage.character.backstory}
              onChange={(e) =>
                updateField('character', { ...stage.character, backstory: e.target.value })
              }
              rows={2}
              className="w-full mt-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none"
            />
            <input
              type="text"
              placeholder="Greeting message"
              value={stage.character.greetingMessage}
              onChange={(e) =>
                updateField('character', { ...stage.character, greetingMessage: e.target.value })
              }
              className="w-full mt-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Challenge */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Target size={14} className="text-amber-400" />
              Challenge
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={stage.challenge.type}
                onChange={(e) =>
                  updateField('challenge', {
                    ...stage.challenge,
                    type: e.target.value as ChallengeType,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
              >
                {CHALLENGE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-navy-900">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Max attempts (optional)"
                value={stage.challenge.maxAttempts ?? ''}
                onChange={(e) =>
                  updateField('challenge', {
                    ...stage.challenge,
                    maxAttempts: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <textarea
              placeholder="Challenge description..."
              value={stage.challenge.description}
              onChange={(e) =>
                updateField('challenge', { ...stage.challenge, description: e.target.value })
              }
              rows={2}
              className="w-full mt-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none"
            />
            <input
              type="text"
              placeholder="Success criteria"
              value={stage.challenge.successCriteria}
              onChange={(e) =>
                updateField('challenge', { ...stage.challenge, successCriteria: e.target.value })
              }
              className="w-full mt-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Hints */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Hints (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Hint 1, Hint 2, Hint 3..."
              value={(stage.hints ?? []).join(', ')}
              onChange={(e) =>
                updateField(
                  'hints',
                  e.target.value
                    .split(',')
                    .map((h) => h.trim())
                    .filter(Boolean),
                )
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function EditQuestContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params.id;

  const { data: quest, loading: fetching, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { execute: updateQuest, loading: saving } = useMutation<Quest>(UPDATE_QUEST);

  const [formData, setFormData] = useState<UpdateQuestInput | null>(null);

  useEffect(() => {
    fetchQuest({ id: questId });
  }, [questId, fetchQuest]);

  // Populate form from fetched quest
  useEffect(() => {
    if (quest && !formData) {
      setFormData({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        difficulty: quest.difficulty,
        estimatedDuration: quest.estimatedDuration,
        coverImageUrl: quest.coverImageUrl,
        stages: quest.stages.map((s) => ({
          id: s.id,
          order: s.order,
          title: s.title,
          description: s.description,
          location: { ...s.location },
          character: { ...s.character },
          challenge: { ...s.challenge },
          points: s.points,
          hints: [...s.hints],
          unlockCondition: s.unlockCondition,
        })),
        location: { ...quest.location },
        radius: quest.radius,
        tags: [...quest.tags],
        isPublished: quest.isPublished,
      });
    }
  }, [quest, formData]);

  const updateField = <K extends keyof UpdateQuestInput>(field: K, value: UpdateQuestInput[K]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleStageUpdate = useCallback((index: number, stage: StageInput) => {
    setFormData((prev) => {
      if (!prev?.stages) return prev;
      const stages = [...prev.stages];
      stages[index] = stage;
      return { ...prev, stages };
    });
  }, []);

  const handleStageRemove = useCallback((index: number) => {
    setFormData((prev) => {
      if (!prev?.stages) return prev;
      const stages = prev.stages.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
      return { ...prev, stages };
    });
  }, []);

  const handleAddStage = () => {
    setFormData((prev) => {
      if (!prev) return prev;
      const stages = [...(prev.stages ?? []), createEmptyStage((prev.stages?.length ?? 0) + 1)];
      return { ...prev, stages };
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      await updateQuest({ input: formData });
      router.push('/admin/quests');
    } catch {
      // Error handled by hook
    }
  };

  if (fetching || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/quests')}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Edit Quest</h1>
          <p className="text-slate-400 text-sm mt-1">
            Update quest details and stages
          </p>
        </div>
        <Button leftIcon={Save} loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </motion.div>

      {/* Quest details */}
      <motion.div variants={itemVariants}>
        <Card variant="elevated" padding="lg" className="mb-6">
          <h3 className="font-heading font-semibold text-white mb-4">Quest Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                value={formData.title ?? ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
                <select
                  value={formData.category ?? ''}
                  onChange={(e) => updateField('category', e.target.value as QuestCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50"
                >
                  {QUEST_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-navy-900">
                      {c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Difficulty</label>
                <select
                  value={formData.difficulty ?? ''}
                  onChange={(e) => updateField('difficulty', e.target.value as QuestDifficulty)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50"
                >
                  {QUEST_DIFFICULTIES.map((d) => (
                    <option key={d} value={d} className="bg-navy-900">
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration ?? ''}
                  onChange={(e) => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Radius (m)</label>
                <input
                  type="number"
                  value={formData.radius ?? ''}
                  onChange={(e) => updateField('radius', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Base location name"
                value={formData.location?.name ?? ''}
                onChange={(e) =>
                  updateField('location', { ...(formData.location ?? { latitude: 0, longitude: 0, name: '' }), name: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.location?.latitude ?? ''}
                onChange={(e) =>
                  updateField('location', {
                    ...(formData.location ?? { latitude: 0, longitude: 0, name: '' }),
                    latitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.location?.longitude ?? ''}
                onChange={(e) =>
                  updateField('location', {
                    ...(formData.location ?? { latitude: 0, longitude: 0, name: '' }),
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={(formData.tags ?? []).join(', ')}
                onChange={(e) =>
                  updateField(
                    'tags',
                    e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stages */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white text-lg">
            Stages ({(formData.stages ?? []).length})
          </h3>
          <Button variant="secondary" size="sm" leftIcon={Plus} onClick={handleAddStage}>
            Add Stage
          </Button>
        </div>
        <div className="space-y-3">
          {(formData.stages ?? []).map((stage, index) => (
            <StageEditor
              key={index}
              stage={stage}
              index={index}
              onUpdate={handleStageUpdate}
              onRemove={handleStageRemove}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EditQuestPage() {
  return (
    <AdminGuard>
      <EditQuestContent />
    </AdminGuard>
  );
}
