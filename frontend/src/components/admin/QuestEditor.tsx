'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Save, X } from 'lucide-react';
import type {
  QuestCategory,
  QuestDifficulty,
  StageInput,
  CreateQuestInput,
  LocationInput,
} from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StageEditor from './StageEditor';

interface QuestEditorProps {
  initialData?: Partial<CreateQuestInput>;
  onSave: (data: CreateQuestInput) => void;
  onCancel: () => void;
  saving?: boolean;
  className?: string;
}

const categories: QuestCategory[] = [
  'adventure',
  'mystery',
  'cultural',
  'educational',
  'culinary',
  'nature',
  'urban',
  'team_building',
];

const difficulties: QuestDifficulty[] = ['easy', 'medium', 'hard', 'legendary'];

function createEmptyStage(order: number): StageInput {
  return {
    id: crypto.randomUUID(),
    order,
    title: '',
    description: '',
    location: { latitude: 0, longitude: 0, name: '', address: '' },
    character: {
      name: '',
      role: '',
      personality: '',
      backstory: '',
      voiceStyle: 'warm',
      greetingMessage: '',
    },
    challenge: {
      type: 'conversation',
      description: '',
      successCriteria: '',
      failureHints: [],
      maxAttempts: 3,
    },
    points: 100,
    hints: [],
  };
}

interface SortableStageProps {
  stage: StageInput;
  index: number;
  onChange: (index: number, stage: StageInput) => void;
  onRemove: (index: number) => void;
}

const SortableStage: React.FC<SortableStageProps> = ({
  stage,
  index,
  onChange,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id ?? `stage-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-0 top-4 z-10 cursor-grab" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-slate-500 hover:text-white" />
      </div>
      <div className="pl-7">
        <StageEditor
          stage={stage}
          index={index}
          onChange={(updated) => onChange(index, updated)}
          onRemove={() => onRemove(index)}
        />
      </div>
    </div>
  );
};

const QuestEditor: React.FC<QuestEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  saving = false,
  className = '',
}) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState<QuestCategory>(
    initialData?.category ?? 'adventure',
  );
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(
    initialData?.difficulty ?? 'medium',
  );
  const [duration, setDuration] = useState(initialData?.estimatedDuration ?? 60);
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl ?? '',
  );
  const [tags, setTags] = useState<string>(
    initialData?.tags?.join(', ') ?? '',
  );
  const [location, setLocation] = useState<LocationInput>(
    initialData?.location ?? { latitude: 0, longitude: 0, name: '' },
  );
  const [radius, setRadius] = useState(initialData?.radius ?? 500);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [stages, setStages] = useState<StageInput[]>(
    initialData?.stages ?? [createEmptyStage(0)],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setStages((prev) => {
        const oldIdx = prev.findIndex(
          (s) => (s.id ?? `stage-${prev.indexOf(s)}`) === active.id,
        );
        const newIdx = prev.findIndex(
          (s) => (s.id ?? `stage-${prev.indexOf(s)}`) === over.id,
        );
        const reordered = arrayMove(prev, oldIdx, newIdx);
        return reordered.map((s, i) => ({ ...s, order: i }));
      });
    },
    [],
  );

  const handleStageChange = useCallback(
    (index: number, updated: StageInput) => {
      setStages((prev) => prev.map((s, i) => (i === index ? updated : s)));
    },
    [],
  );

  const handleStageRemove = useCallback((index: number) => {
    setStages((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    );
  }, []);

  const handleAddStage = useCallback(() => {
    setStages((prev) => [...prev, createEmptyStage(prev.length)]);
  }, []);

  const handleSubmit = () => {
    const data: CreateQuestInput = {
      title,
      description,
      category,
      difficulty,
      estimatedDuration: duration,
      coverImageUrl: coverImageUrl || undefined,
      stages,
      location,
      radius,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished,
    };
    onSave(data);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {initialData ? 'Edit Quest' : 'Create Quest'}
        </h2>
        <div className="flex items-center gap-3">
          <Button variant="ghost" leftIcon={X} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={Save}
            onClick={handleSubmit}
            loading={saving}
          >
            Save Quest
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white mb-4">Basic Information</h3>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quest title"
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your quest..."
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestCategory)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-navy-950 text-white">
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-navy-950 text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            value={duration.toString()}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
          />
          <Input
            label="Cover Image URL"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Input
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="adventure, outdoor, historic"
        />

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location Name"
            value={location.name}
            onChange={(e) => setLocation({ ...location, name: e.target.value })}
            placeholder="City center"
          />
          <Input
            label="Radius (meters)"
            type="number"
            value={radius.toString()}
            onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            value={location.latitude.toString()}
            onChange={(e) =>
              setLocation({ ...location, latitude: parseFloat(e.target.value) || 0 })
            }
          />
          <Input
            label="Longitude"
            type="number"
            value={location.longitude.toString()}
            onChange={(e) =>
              setLocation({ ...location, longitude: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isPublished ? 'bg-violet-500' : 'bg-white/10'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isPublished ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`}
              style={{ transform: isPublished ? 'translateX(22px)' : 'translateX(0)' }}
            />
          </button>
          <span className="text-sm text-slate-300">Published</span>
        </div>
      </div>

      {/* Stages */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Stages ({stages.length})
          </h3>
          <Button variant="secondary" size="sm" leftIcon={Plus} onClick={handleAddStage}>
            Add Stage
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stages.map((s, i) => s.id ?? `stage-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <SortableStage
                  key={stage.id ?? `stage-${idx}`}
                  stage={stage}
                  index={idx}
                  onChange={handleStageChange}
                  onRemove={handleStageRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default QuestEditor;
