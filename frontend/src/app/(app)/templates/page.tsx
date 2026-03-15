'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Utensils,
  Landmark,
  Users,
  Ghost,
  Layers,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import TemplateCard from '@/components/quest/TemplateCard';

// ---------- Types ----------

export type TemplateCategory =
  | 'city_tour'
  | 'mystery'
  | 'food_trail'
  | 'historical'
  | 'team_building';

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  stages: TemplateStage[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  uses: number;
  rating: number;
  totalRatings: number;
  featured: boolean;
  createdAt: string;
  author: string;
}

export interface TemplateStage {
  order: number;
  title: string;
  description: string;
  challengeType: 'voice' | 'photo' | 'trivia' | 'exploration';
  estimatedMinutes: number;
}

// ---------- Config ----------

const categoryConfig: Record<
  TemplateCategory,
  { label: string; icon: React.ElementType; gradient: string; accent: string }
> = {
  city_tour: {
    label: 'City Tour',
    icon: MapPin,
    gradient: 'from-violet-600/40 to-indigo-600/40',
    accent: 'text-violet-400',
  },
  mystery: {
    label: 'Mystery',
    icon: Ghost,
    gradient: 'from-slate-600/40 to-zinc-700/40',
    accent: 'text-slate-300',
  },
  food_trail: {
    label: 'Food Trail',
    icon: Utensils,
    gradient: 'from-rose-600/40 to-pink-600/40',
    accent: 'text-rose-400',
  },
  historical: {
    label: 'Historical',
    icon: Landmark,
    gradient: 'from-amber-600/40 to-orange-600/40',
    accent: 'text-amber-400',
  },
  team_building: {
    label: 'Team Building',
    icon: Users,
    gradient: 'from-emerald-600/40 to-teal-600/40',
    accent: 'text-emerald-400',
  },
};

const allCategories: TemplateCategory[] = [
  'city_tour',
  'mystery',
  'food_trail',
  'historical',
  'team_building',
];

// ---------- Mock Data ----------

const mockTemplates: QuestTemplate[] = [
  {
    id: 't1',
    title: 'Classic City Walking Tour',
    description:
      'A versatile walking tour template perfect for any city. Guide players through iconic landmarks, hidden gems, and local favorites with voice-guided storytelling.',
    category: 'city_tour',
    stages: [
      { order: 1, title: 'Meeting Point', description: 'Gather at the starting landmark', challengeType: 'exploration', estimatedMinutes: 10 },
      { order: 2, title: 'Historic District', description: 'Explore the old town area', challengeType: 'trivia', estimatedMinutes: 20 },
      { order: 3, title: 'Local Market', description: 'Discover the local market scene', challengeType: 'photo', estimatedMinutes: 15 },
      { order: 4, title: 'Viewpoint', description: 'Reach the scenic overlook', challengeType: 'exploration', estimatedMinutes: 15 },
      { order: 5, title: 'Grand Finale', description: 'Complete the tour at the final landmark', challengeType: 'voice', estimatedMinutes: 10 },
    ],
    estimatedDuration: 70,
    difficulty: 'easy',
    uses: 1284,
    rating: 4.7,
    totalRatings: 342,
    featured: true,
    createdAt: '2025-11-01',
    author: 'QuestMaster Team',
  },
  {
    id: 't2',
    title: 'Murder Mystery Night',
    description:
      'An immersive whodunit experience. Players interrogate AI suspects, collect clues at crime scenes, and piece together the evidence to catch the culprit.',
    category: 'mystery',
    stages: [
      { order: 1, title: 'Crime Scene', description: 'Investigate the initial crime scene', challengeType: 'exploration', estimatedMinutes: 15 },
      { order: 2, title: 'First Suspect', description: 'Interrogate the first suspect', challengeType: 'voice', estimatedMinutes: 20 },
      { order: 3, title: 'Evidence Room', description: 'Analyze collected evidence', challengeType: 'trivia', estimatedMinutes: 15 },
      { order: 4, title: 'Second Suspect', description: 'Confront the second suspect', challengeType: 'voice', estimatedMinutes: 20 },
      { order: 5, title: 'Chase Scene', description: 'Track down the fleeing suspect', challengeType: 'exploration', estimatedMinutes: 15 },
      { order: 6, title: 'Final Accusation', description: 'Present your case and reveal the culprit', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 100,
    difficulty: 'hard',
    uses: 876,
    rating: 4.9,
    totalRatings: 218,
    featured: true,
    createdAt: '2025-10-15',
    author: 'QuestMaster Team',
  },
  {
    id: 't3',
    title: 'Foodie Adventure',
    description:
      'Take players on a culinary journey through local gastronomy. Each stop features a different dish, a cooking challenge, or a flavor trivia round.',
    category: 'food_trail',
    stages: [
      { order: 1, title: 'Breakfast Spot', description: 'Start with local breakfast specialties', challengeType: 'photo', estimatedMinutes: 15 },
      { order: 2, title: 'Market Visit', description: 'Explore the fresh food market', challengeType: 'exploration', estimatedMinutes: 20 },
      { order: 3, title: 'Street Food Stop', description: 'Sample famous street food', challengeType: 'trivia', estimatedMinutes: 15 },
      { order: 4, title: 'Dessert Finale', description: 'End with a sweet challenge', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 65,
    difficulty: 'easy',
    uses: 2103,
    rating: 4.6,
    totalRatings: 567,
    featured: true,
    createdAt: '2025-09-20',
    author: 'QuestMaster Team',
  },
  {
    id: 't4',
    title: 'Through the Ages',
    description:
      'A historical deep-dive template. Walk through centuries of history, from ancient ruins to modern landmarks, with AI historian guides at every stop.',
    category: 'historical',
    stages: [
      { order: 1, title: 'Ancient Origins', description: 'Explore the oldest site', challengeType: 'voice', estimatedMinutes: 20 },
      { order: 2, title: 'Medieval Quarter', description: 'Walk through medieval streets', challengeType: 'trivia', estimatedMinutes: 20 },
      { order: 3, title: 'Renaissance Era', description: 'Discover renaissance architecture', challengeType: 'photo', estimatedMinutes: 15 },
      { order: 4, title: 'Modern History', description: 'Learn about recent history', challengeType: 'exploration', estimatedMinutes: 15 },
      { order: 5, title: 'Time Capsule', description: 'Complete the historical journey', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 85,
    difficulty: 'medium',
    uses: 654,
    rating: 4.5,
    totalRatings: 143,
    featured: false,
    createdAt: '2025-12-01',
    author: 'QuestMaster Team',
  },
  {
    id: 't5',
    title: 'Team Rally Challenge',
    description:
      'A competitive team-building quest designed for corporate events and groups. Teams race to complete challenges, solve puzzles, and earn the most points.',
    category: 'team_building',
    stages: [
      { order: 1, title: 'Team Formation', description: 'Form teams and get briefed', challengeType: 'voice', estimatedMinutes: 10 },
      { order: 2, title: 'Puzzle Station', description: 'Collaborative puzzle solving', challengeType: 'trivia', estimatedMinutes: 20 },
      { order: 3, title: 'Photo Challenge', description: 'Creative team photo missions', challengeType: 'photo', estimatedMinutes: 15 },
      { order: 4, title: 'Navigation Race', description: 'Race to the checkpoint', challengeType: 'exploration', estimatedMinutes: 20 },
      { order: 5, title: 'Final Showdown', description: 'Head-to-head team challenge', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 80,
    difficulty: 'medium',
    uses: 432,
    rating: 4.4,
    totalRatings: 97,
    featured: false,
    createdAt: '2025-11-15',
    author: 'QuestMaster Team',
  },
  {
    id: 't6',
    title: 'Ghost Walk',
    description:
      'A spine-tingling mystery tour through haunted locations. AI ghost characters share their stories as players uncover paranormal secrets.',
    category: 'mystery',
    stages: [
      { order: 1, title: 'The Haunted Gate', description: 'Enter the haunted area', challengeType: 'exploration', estimatedMinutes: 10 },
      { order: 2, title: 'First Apparition', description: 'Encounter the first ghost', challengeType: 'voice', estimatedMinutes: 20 },
      { order: 3, title: 'Cursed Artifact', description: 'Find the cursed object', challengeType: 'exploration', estimatedMinutes: 15 },
      { order: 4, title: 'Seance Room', description: 'Conduct a virtual seance', challengeType: 'voice', estimatedMinutes: 20 },
    ],
    estimatedDuration: 65,
    difficulty: 'medium',
    uses: 789,
    rating: 4.8,
    totalRatings: 201,
    featured: false,
    createdAt: '2025-10-31',
    author: 'QuestMaster Team',
  },
  {
    id: 't7',
    title: 'Artisan Coffee Trail',
    description:
      'Explore the best local coffee spots. Learn about brewing methods, taste different origins, and become a coffee connoisseur along the way.',
    category: 'food_trail',
    stages: [
      { order: 1, title: 'Origin Story', description: 'Learn about coffee origins', challengeType: 'trivia', estimatedMinutes: 15 },
      { order: 2, title: 'Roaster Visit', description: 'Visit a local roaster', challengeType: 'photo', estimatedMinutes: 20 },
      { order: 3, title: 'Tasting Challenge', description: 'Blind taste test', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 50,
    difficulty: 'easy',
    uses: 1456,
    rating: 4.3,
    totalRatings: 389,
    featured: false,
    createdAt: '2025-12-10',
    author: 'QuestMaster Team',
  },
  {
    id: 't8',
    title: 'Architectural Wonders',
    description:
      'Discover stunning architecture from different eras. Each stage focuses on a different architectural style with expert AI commentary.',
    category: 'city_tour',
    stages: [
      { order: 1, title: 'Gothic Masterpiece', description: 'Explore gothic architecture', challengeType: 'photo', estimatedMinutes: 15 },
      { order: 2, title: 'Art Nouveau Gems', description: 'Find art nouveau details', challengeType: 'exploration', estimatedMinutes: 20 },
      { order: 3, title: 'Modernist Vision', description: 'Discover modern buildings', challengeType: 'trivia', estimatedMinutes: 15 },
      { order: 4, title: 'Contemporary Icons', description: 'Visit contemporary landmarks', challengeType: 'voice', estimatedMinutes: 15 },
    ],
    estimatedDuration: 65,
    difficulty: 'medium',
    uses: 567,
    rating: 4.5,
    totalRatings: 134,
    featured: false,
    createdAt: '2025-11-20',
    author: 'QuestMaster Team',
  },
];

// ---------- Page Variants ----------

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------- Component ----------

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const featuredTemplates = useMemo(
    () => mockTemplates.filter((t) => t.featured),
    [],
  );

  const filteredTemplates = useMemo(() => {
    let filtered = mockTemplates;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          categoryConfig[t.category].label.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case 'popular':
        return [...filtered].sort((a, b) => b.uses - a.uses);
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      default:
        return filtered;
    }
  }, [activeCategory, searchQuery, sortBy]);

  const handleUseTemplate = useCallback((templateId: string) => {
    // Navigate to quest creator with template data pre-filled
    window.location.href = `/create?template=${templateId}`;
  }, []);

  const handlePreviewTemplate = useCallback((templateId: string) => {
    // Could open a modal or navigate to preview page
    console.log('Preview template:', templateId);
  }, []);

  const handleCarouselPrev = useCallback(() => {
    setCarouselIndex((prev) =>
      prev === 0 ? featuredTemplates.length - 1 : prev - 1,
    );
  }, [featuredTemplates.length]);

  const handleCarouselNext = useCallback(() => {
    setCarouselIndex((prev) =>
      prev === featuredTemplates.length - 1 ? 0 : prev + 1,
    );
  }, [featuredTemplates.length]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">
              Quest Templates
            </h1>
            <p className="text-sm text-slate-400">
              Start with a pre-made template and customize it to your city
            </p>
          </div>
        </div>
      </div>

      {/* Featured Carousel */}
      {featuredTemplates.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Featured Templates</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCarouselPrev}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={handleCarouselNext}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${categoryConfig[featuredTemplates[carouselIndex].category].gradient} opacity-30`}
                  />
                  <div className="relative flex flex-col md:flex-row gap-6">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 ${categoryConfig[featuredTemplates[carouselIndex].category].accent} mb-3`}
                      >
                        {(() => {
                          const Icon = categoryConfig[featuredTemplates[carouselIndex].category].icon;
                          return <Icon className="w-3 h-3" />;
                        })()}
                        {categoryConfig[featuredTemplates[carouselIndex].category].label}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {featuredTemplates[carouselIndex].title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {featuredTemplates[carouselIndex].description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {featuredTemplates[carouselIndex].stages.length} stages
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          {featuredTemplates[carouselIndex].rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {featuredTemplates[carouselIndex].uses.toLocaleString()} uses
                        </span>
                      </div>
                      <button
                        onClick={() => handleUseTemplate(featuredTemplates[carouselIndex].id)}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-600/25"
                      >
                        Use This Template
                      </button>
                    </div>

                    {/* Right: Stage preview */}
                    <div className="md:w-64 flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                        Stage Structure
                      </span>
                      {featuredTemplates[carouselIndex].stages.map((stage) => (
                        <div
                          key={stage.order}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5"
                        >
                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                            {stage.order}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {stage.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {stage.challengeType} - {stage.estimatedMinutes}m
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {featuredTemplates.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === carouselIndex
                      ? 'bg-violet-400 w-6'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
            </button>
          )}
        </div>

        {/* Category pills & sort */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => {
              const cfg = categoryConfig[cat];
              const Icon = cfg.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'newest')}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 focus:outline-none focus:border-violet-500/50"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 mb-4">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
      </p>

      {/* Template Grid */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredTemplates.map((template) => (
          <motion.div key={template.id} variants={fadeUp}>
            <TemplateCard
              template={template}
              onUseTemplate={handleUseTemplate}
              onPreview={handlePreviewTemplate}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
          <p className="text-sm text-slate-500 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </motion.div>
  );
}
