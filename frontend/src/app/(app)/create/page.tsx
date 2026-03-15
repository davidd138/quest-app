'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  MapPin,
  Users,
  Target,
  Eye,
  Save,
  Send,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { useMutation } from '@/hooks/useGraphQL';
import { CREATE_COMMUNITY_QUEST } from '@/lib/graphql/mutations';
import Button from '@/components/ui/Button';
import WizardStep from '@/components/quest/WizardStep';
import CharacterTemplates from '@/components/quest/CharacterTemplates';
import { QUEST_CATEGORIES, QUEST_DIFFICULTIES, CHALLENGE_TYPES } from '@/lib/constants';
import type {
  CreateCommunityQuestInput,
  StageInput,
  QuestCategory,
  QuestDifficulty,
  ChallengeType,
  Quest,
} from '@/types';

const STORAGE_KEY = 'qm-community-quest-draft';
const TOTAL_STEPS = 5;

const STEP_CONFIG = [
  { icon: Wand2, label: 'Info basica', color: 'violet' },
  { icon: MapPin, label: 'Mapa', color: 'emerald' },
  { icon: Users, label: 'Personajes', color: 'amber' },
  { icon: Target, label: 'Desafios', color: 'rose' },
  { icon: Eye, label: 'Revisar', color: 'blue' },
];

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

function getDefaultForm(): CreateCommunityQuestInput {
  return {
    title: '',
    description: '',
    category: 'adventure',
    difficulty: 'medium',
    estimatedDuration: 60,
    stages: [createEmptyStage(1), createEmptyStage(2)],
    location: { latitude: 0, longitude: 0, name: '' },
    radius: 5000,
    tags: [],
  };
}

function loadDraft(): CreateCommunityQuestInput {
  if (typeof window === 'undefined') return getDefaultForm();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return getDefaultForm();
}

export default function CreateQuestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [formData, setFormData] = useState<CreateCommunityQuestInput>(getDefaultForm);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const { execute: createQuest, loading: saving, error: saveError } = useMutation<Quest>(CREATE_COMMUNITY_QUEST);

  // Load draft from localStorage
  useEffect(() => {
    setFormData(loadDraft());
    setDraftLoaded(true);
  }, []);

  // Auto-save to localStorage
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!draftLoaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [formData, draftLoaded]);

  const updateField = useCallback(<K extends keyof CreateCommunityQuestInput>(
    field: K,
    value: CreateCommunityQuestInput[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateStage = useCallback((index: number, stage: StageInput) => {
    setFormData((prev) => {
      const stages = [...prev.stages];
      stages[index] = stage;
      return { ...prev, stages };
    });
  }, []);

  const addStage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, createEmptyStage(prev.stages.length + 1)],
    }));
  }, []);

  const removeStage = useCallback((index: number) => {
    setFormData((prev) => {
      if (prev.stages.length <= 2) return prev; // Minimum 2 stages
      const stages = prev.stages.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
      return { ...prev, stages };
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Validation
  const step1Valid = formData.title.trim().length >= 3 && formData.description.trim().length >= 10;
  const step2Valid = formData.location.name.trim().length > 0 &&
    formData.stages.every((s) => s.location.name.trim().length > 0);
  const step3Valid = formData.stages.every(
    (s) => s.character.name.trim().length > 0 && s.character.personality.trim().length > 0 && s.character.voiceStyle.trim().length > 0 && s.character.greetingMessage.trim().length > 0,
  );
  const step4Valid = formData.stages.every(
    (s) =>
      s.title.trim().length > 0 &&
      s.challenge.description.trim().length > 0 &&
      s.challenge.successCriteria.trim().length > 0,
  );
  const step5Valid = step1Valid && step2Valid && step3Valid && step4Valid && formData.stages.length >= 2;

  const stepValidation = [step1Valid, step2Valid, step3Valid, step4Valid, step5Valid];

  const handlePublish = async () => {
    try {
      await createQuest({ input: formData });
      localStorage.removeItem(STORAGE_KEY);
      router.push('/community');
    } catch { /* error handled by hook */ }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600';
  const textareaClass = `${inputClass} resize-none`;
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.push('/quests')}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Crear Quest
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Crea una aventura para la comunidad
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2">
          {STEP_CONFIG.map((step, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepValidation[i];
            const Icon = step.icon;

            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                    isComplete || stepNum <= currentStep ? 'bg-violet-500/50' : 'bg-slate-700/50'
                  }`} />
                )}
                <button
                  onClick={() => goToStep(stepNum)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-violet-500/20 text-violet-300' : isComplete ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden md:inline">{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard steps */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 1: Basic Info */}
        <WizardStep
          stepNumber={1}
          title="Informacion basica"
          description="Dale un nombre y descripcion a tu quest"
          totalSteps={TOTAL_STEPS}
          currentStep={currentStep}
          isValid={step1Valid}
          onNext={handleNext}
          direction={direction}
        >
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Titulo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={inputClass}
              placeholder="Nombre de tu quest..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Descripcion</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="Describe la aventura que van a vivir los jugadores..."
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value as QuestCategory)}
                className={selectClass}
              >
                {QUEST_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-navy-900">
                    {c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Dificultad</label>
              <select
                value={formData.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as QuestDifficulty)}
                className={selectClass}
              >
                {QUEST_DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-navy-900">
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Duracion (min)</label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Radio (m)</label>
              <input
                type="number"
                value={formData.radius}
                onChange={(e) => updateField('radius', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) =>
                updateField(
                  'tags',
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              className={inputClass}
              placeholder="aventura, historia, exterior..."
            />
          </div>
        </WizardStep>

        {/* Step 2: Map & Locations */}
        <WizardStep
          stepNumber={2}
          title="Mapa y ubicaciones"
          description="Define la ubicacion base y los puntos de cada etapa"
          totalSteps={TOTAL_STEPS}
          currentStep={currentStep}
          isValid={step2Valid}
          onNext={handleNext}
          onPrevious={handlePrevious}
          direction={direction}
        >
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400" />
              Ubicacion base de la quest
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre del lugar"
                value={formData.location.name}
                onChange={(e) => updateField('location', { ...formData.location, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                step="any"
                placeholder="Latitud"
                value={formData.location.latitude || ''}
                onChange={(e) => updateField('location', { ...formData.location, latitude: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitud"
                value={formData.location.longitude || ''}
                onChange={(e) => updateField('location', { ...formData.location, longitude: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">
                Etapas ({formData.stages.length})
              </h4>
              <Button variant="secondary" size="sm" leftIcon={Plus} onClick={addStage}>
                Añadir etapa
              </Button>
            </div>
            <div className="space-y-3">
              {formData.stages.map((stage, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-white flex-1">
                      {stage.title || `Etapa ${i + 1}`}
                    </span>
                    {formData.stages.length > 2 && (
                      <button
                        onClick={() => removeStage(i)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del lugar"
                      value={stage.location.name}
                      onChange={(e) =>
                        updateStage(i, { ...stage, location: { ...stage.location, name: e.target.value } })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Direccion"
                      value={stage.location.address ?? ''}
                      onChange={(e) =>
                        updateStage(i, { ...stage, location: { ...stage.location, address: e.target.value } })
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitud"
                      value={stage.location.latitude || ''}
                      onChange={(e) =>
                        updateStage(i, {
                          ...stage,
                          location: { ...stage.location, latitude: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitud"
                      value={stage.location.longitude || ''}
                      onChange={(e) =>
                        updateStage(i, {
                          ...stage,
                          location: { ...stage.location, longitude: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WizardStep>

        {/* Step 3: Characters */}
        <WizardStep
          stepNumber={3}
          title="Personajes"
          description="Elige y personaliza los personajes de cada etapa"
          totalSteps={TOTAL_STEPS}
          currentStep={currentStep}
          isValid={step3Valid}
          onNext={handleNext}
          onPrevious={handlePrevious}
          direction={direction}
        >
          {formData.stages.map((stage, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 space-y-4">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                </div>
                {stage.title || `Etapa ${i + 1}`}
              </h4>

              <CharacterTemplates
                onSelect={(character) =>
                  updateStage(i, { ...stage, character })
                }
                selectedTemplateName={stage.character.name}
              />

              {/* Editable character fields */}
              {stage.character.name && (
                <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del personaje"
                    value={stage.character.name}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, name: e.target.value } })
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Rol"
                    value={stage.character.role}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, role: e.target.value } })
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Estilo de voz"
                    value={stage.character.voiceStyle}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, voiceStyle: e.target.value } })
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Saludo"
                    value={stage.character.greetingMessage}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, greetingMessage: e.target.value } })
                    }
                    className={inputClass}
                  />
                  <textarea
                    placeholder="Personalidad..."
                    value={stage.character.personality}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, personality: e.target.value } })
                    }
                    rows={2}
                    className={`${textareaClass} md:col-span-2`}
                  />
                  <textarea
                    placeholder="Historia del personaje..."
                    value={stage.character.backstory}
                    onChange={(e) =>
                      updateStage(i, { ...stage, character: { ...stage.character, backstory: e.target.value } })
                    }
                    rows={2}
                    className={`${textareaClass} md:col-span-2`}
                  />
                </div>
              )}
            </div>
          ))}
        </WizardStep>

        {/* Step 4: Challenges */}
        <WizardStep
          stepNumber={4}
          title="Desafios"
          description="Define los retos que deben superar los jugadores en cada etapa"
          totalSteps={TOTAL_STEPS}
          currentStep={currentStep}
          isValid={step4Valid}
          onNext={handleNext}
          onPrevious={handlePrevious}
          direction={direction}
        >
          {formData.stages.map((stage, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                </div>
                <input
                  type="text"
                  placeholder="Titulo de la etapa"
                  value={stage.title}
                  onChange={(e) => updateStage(i, { ...stage, title: e.target.value })}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  placeholder="Puntos"
                  value={stage.points}
                  onChange={(e) => updateStage(i, { ...stage, points: parseInt(e.target.value) || 0 })}
                  className={`${inputClass} w-24`}
                />
              </div>
              <textarea
                placeholder="Descripcion de la etapa..."
                value={stage.description}
                onChange={(e) => updateStage(i, { ...stage, description: e.target.value })}
                rows={2}
                className={textareaClass}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Tipo de desafio</label>
                  <select
                    value={stage.challenge.type}
                    onChange={(e) =>
                      updateStage(i, {
                        ...stage,
                        challenge: { ...stage.challenge, type: e.target.value as ChallengeType },
                      })
                    }
                    className={selectClass}
                  >
                    {CHALLENGE_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-navy-900">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    Max intentos (opcional)
                  </label>
                  <input
                    type="number"
                    value={stage.challenge.maxAttempts ?? ''}
                    onChange={(e) =>
                      updateStage(i, {
                        ...stage,
                        challenge: {
                          ...stage.challenge,
                          maxAttempts: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <textarea
                placeholder="Descripcion del desafio..."
                value={stage.challenge.description}
                onChange={(e) =>
                  updateStage(i, {
                    ...stage,
                    challenge: { ...stage.challenge, description: e.target.value },
                  })
                }
                rows={2}
                className={textareaClass}
              />
              <input
                type="text"
                placeholder="Criterios de exito"
                value={stage.challenge.successCriteria}
                onChange={(e) =>
                  updateStage(i, {
                    ...stage,
                    challenge: { ...stage.challenge, successCriteria: e.target.value },
                  })
                }
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Pistas (separadas por comas)"
                value={(stage.hints ?? []).join(', ')}
                onChange={(e) =>
                  updateStage(i, {
                    ...stage,
                    hints: e.target.value
                      .split(',')
                      .map((h) => h.trim())
                      .filter(Boolean),
                  })
                }
                className={inputClass}
              />
            </div>
          ))}
        </WizardStep>

        {/* Step 5: Review & Publish */}
        <WizardStep
          stepNumber={5}
          title="Revisar y publicar"
          description="Revisa tu quest antes de enviarla a la comunidad"
          totalSteps={TOTAL_STEPS}
          currentStep={currentStep}
          isValid={step5Valid}
          onPrevious={handlePrevious}
          direction={direction}
          nextLabel="Publicar"
        >
          {/* Quest summary */}
          <div className="space-y-4">
            <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
              <h3 className="text-lg font-heading font-bold text-white">{formData.title || 'Sin titulo'}</h3>
              <p className="text-sm text-slate-400 mt-1">{formData.description || 'Sin descripcion'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">
                  {formData.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300">
                  {formData.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-300">
                  {formData.estimatedDuration} min
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-300">
                  {formData.stages.length} etapas
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">
                  {formData.stages.reduce((sum, s) => sum + s.points, 0)} pts
                </span>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stages preview */}
            {formData.stages.map((stage, i) => (
              <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{stage.title || `Etapa ${i + 1}`}</h4>
                  <span className="text-xs text-emerald-400 ml-auto">{stage.points} pts</span>
                </div>
                <p className="text-xs text-slate-400">{stage.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {stage.location.name || 'Sin ubicacion'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {stage.character.name || 'Sin personaje'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> {stage.challenge.type}
                  </span>
                </div>
              </div>
            ))}

            {/* Validation warnings */}
            {!step5Valid && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm text-amber-300 font-medium mb-2">Faltan campos obligatorios:</p>
                <ul className="text-xs text-amber-300/70 space-y-1 list-disc list-inside">
                  {!step1Valid && <li>Completa la informacion basica (titulo y descripcion)</li>}
                  {!step2Valid && <li>Define las ubicaciones de todas las etapas</li>}
                  {!step3Valid && <li>Configura los personajes de todas las etapas</li>}
                  {!step4Valid && <li>Completa los desafios de todas las etapas</li>}
                  {formData.stages.length < 2 && <li>Se requieren al menos 2 etapas</li>}
                </ul>
              </div>
            )}

            {saveError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <p className="text-sm text-rose-300">{saveError}</p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Las quests de la comunidad pasan por revision antes de publicarse. Recibiras una notificacion cuando sea aprobada.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                leftIcon={Save}
                onClick={handleSaveDraft}
              >
                Guardar borrador
              </Button>
              <Button
                leftIcon={Send}
                loading={saving}
                disabled={!step5Valid}
                onClick={handlePublish}
              >
                Publicar como Quest Comunitaria
              </Button>
            </div>
          </div>
        </WizardStep>
      </AnimatePresence>
    </div>
  );
}
