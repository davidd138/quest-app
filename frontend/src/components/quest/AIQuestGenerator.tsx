'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Check,
  MapPin,
  Loader2,
  ChevronDown,
  Layers,
  Star,
  Clock,
  Pencil,
} from 'lucide-react';
import type { QuestCategory, QuestDifficulty } from '@/types';

interface GeneratedStage {
  title: string;
  description: string;
  location: { name: string; latitude: number; longitude: number };
  characterName: string;
  characterRole: string;
  challengeType: string;
  points: number;
}

interface GeneratedQuest {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  stages: GeneratedStage[];
  totalPoints: number;
}

interface AIQuestGeneratorProps {
  onAccept?: (quest: GeneratedQuest) => void;
  onClose?: () => void;
}

const categories: { value: QuestCategory; label: string }[] = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'culinary', label: 'Culinary' },
  { value: 'nature', label: 'Nature' },
  { value: 'educational', label: 'Educational' },
  { value: 'urban', label: 'Urban' },
  { value: 'team_building', label: 'Team Building' },
];

const difficulties: QuestDifficulty[] = ['easy', 'medium', 'hard', 'legendary'];

const difficultyColors: Record<QuestDifficulty, string> = {
  easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  legendary: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

// Mock AI responses keyed by theme feel
function generateMockQuest(
  city: string,
  theme: QuestCategory,
  difficulty: QuestDifficulty,
  numStages: number,
): GeneratedQuest {
  const stageNames: Record<string, string[]> = {
    adventure: ['Hidden Alley', 'Ancient Gate', 'Secret Garden', 'Rooftop Overlook', 'Final Summit'],
    mystery: ['Crime Scene', 'Witness House', 'Archive Room', 'Clock Tower', 'Reveal Chamber'],
    cultural: ['Heritage Museum', 'Street Mural', 'Traditional Market', 'Temple Steps', 'Art Gallery'],
    culinary: ['Morning Market', 'Spice Bazaar', 'Local Bakery', 'Wine Cellar', 'Chef\'s Table'],
    nature: ['Riverside Trail', 'Botanical Path', 'Hilltop Clearing', 'Waterfall Basin', 'Sunset Point'],
    educational: ['University Hall', 'Science Quarter', 'Library Vault', 'Observatory', 'Innovation Lab'],
    urban: ['Central Station', 'Graffiti Lane', 'Skyline Terrace', 'Night Market', 'Neon District'],
    team_building: ['Base Camp', 'Challenge Arena', 'Puzzle Square', 'Trust Bridge', 'Victory Circle'],
  };

  const names = stageNames[theme] || stageNames.adventure;
  const rolePool = ['Guide', 'Merchant', 'Scholar', 'Guardian', 'Storyteller', 'Chef', 'Detective'];
  const challengePool = ['conversation', 'riddle', 'knowledge', 'negotiation', 'persuasion', 'exploration'];

  const stages: GeneratedStage[] = Array.from({ length: numStages }, (_, i) => ({
    title: `${names[i % names.length]} of ${city}`,
    description: `Explore the ${names[i % names.length].toLowerCase()} and uncover its secrets through an immersive ${theme} experience in ${city}.`,
    location: {
      name: `${names[i % names.length]}, ${city}`,
      latitude: 40.4168 + (Math.random() - 0.5) * 0.02,
      longitude: -3.7038 + (Math.random() - 0.5) * 0.02,
    },
    characterName: `${['Aria', 'Kai', 'Luna', 'Dante', 'Niko'][i % 5]} the ${rolePool[i % rolePool.length]}`,
    characterRole: rolePool[i % rolePool.length],
    challengeType: challengePool[i % challengePool.length],
    points: (i + 1) * (difficulty === 'legendary' ? 200 : difficulty === 'hard' ? 150 : difficulty === 'medium' ? 120 : 100),
  }));

  const totalPoints = stages.reduce((sum, s) => sum + s.points, 0);

  return {
    title: `The ${theme === 'mystery' ? 'Enigma' : theme === 'culinary' ? 'Flavors' : theme === 'cultural' ? 'Heritage' : 'Secrets'} of ${city}`,
    description: `Embark on an unforgettable ${difficulty} ${theme} quest through the heart of ${city}. Discover hidden locations, meet fascinating characters, and overcome ${numStages} unique challenges.`,
    category: theme,
    difficulty,
    estimatedDuration: numStages * (difficulty === 'legendary' ? 25 : difficulty === 'hard' ? 20 : 15),
    stages,
    totalPoints,
  };
}

const AIQuestGenerator: React.FC<AIQuestGeneratorProps> = ({ onAccept, onClose }) => {
  const [city, setCity] = useState('');
  const [theme, setTheme] = useState<QuestCategory>('adventure');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [numStages, setNumStages] = useState(4);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedQuest | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const handleGenerate = useCallback(() => {
    if (!city.trim()) return;
    setLoading(true);
    setGenerated(null);

    // Simulate AI generation delay
    setTimeout(() => {
      const quest = generateMockQuest(city.trim(), theme, difficulty, numStages);
      setGenerated(quest);
      setEditedTitle(quest.title);
      setLoading(false);
    }, 2200);
  }, [city, theme, difficulty, numStages]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleAccept = useCallback(() => {
    if (!generated) return;
    const finalQuest = { ...generated, title: editedTitle || generated.title };
    onAccept?.(finalQuest);
  }, [generated, editedTitle, onAccept]);

  return (
    <div className="rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-violet-600/10" />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/30"
          >
            <Wand2 className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-heading font-bold text-white text-lg flex items-center gap-2">
              AI Quest Generator
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </motion.span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate immersive quests powered by AI
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Input Fields */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">City Name</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Madrid, Tokyo, Paris..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Theme</label>
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as QuestCategory)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value} className="bg-navy-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Stages</label>
            <div className="flex gap-1.5">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumStages(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    numStages === n
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty</label>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  difficulty === d
                    ? difficultyColors[d]
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={!city.trim() || loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Quest
            </>
          )}
        </motion.button>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-6 h-6 text-violet-400" />
                  </motion.div>
                  <span className="text-sm text-slate-300">Crafting your quest...</span>
                </div>
                <div className="space-y-2">
                  {['Analyzing city landmarks...', 'Designing characters...', 'Creating challenges...'].map(
                    (step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400"
                        />
                        <span className="text-xs text-slate-500">{step}</span>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Quest Preview */}
        <AnimatePresence>
          {generated && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                {/* Quest title */}
                <div className="flex items-start justify-between mb-3">
                  {editingTitle ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                      autoFocus
                      className="flex-1 bg-white/5 border border-violet-500/50 rounded-lg px-3 py-1.5 text-white font-heading font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  ) : (
                    <h4
                      className="font-heading font-bold text-white text-lg flex items-center gap-2 cursor-pointer group"
                      onClick={() => setEditingTitle(true)}
                    >
                      {editedTitle}
                      <Pencil className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                  )}
                </div>

                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {generated.description}
                </p>

                {/* Quest meta */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 text-[10px] font-semibold border border-violet-500/30 capitalize">
                    {generated.category.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border capitalize ${difficultyColors[generated.difficulty]}`}>
                    {generated.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-300 text-[10px] font-semibold border border-white/10">
                    <Clock className="w-3 h-3" />
                    {generated.estimatedDuration}m
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-300 text-[10px] font-semibold border border-white/10">
                    <Star className="w-3 h-3" />
                    {generated.totalPoints} pts
                  </span>
                </div>

                {/* Stages list */}
                <div className="space-y-2">
                  {generated.stages.map((stage, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-4 py-3 group hover:border-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{stage.title}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {stage.location.name}
                          </span>
                          <span>&middot;</span>
                          <span>{stage.characterName}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-semibold text-emerald-400">{stage.points} pts</span>
                        <p className="text-[9px] text-slate-600 capitalize">{stage.challengeType}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegenerate}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25"
                >
                  <Check className="w-4 h-4" />
                  Accept & Create
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIQuestGenerator;
