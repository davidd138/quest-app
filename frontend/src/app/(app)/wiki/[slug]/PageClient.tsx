'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface GuideContent {
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number;
  lastUpdated: string;
  sections: { id: string; title: string; content: string }[];
  relatedGuides: { slug: string; title: string }[];
}

const GUIDES: Record<string, GuideContent> = {
  'voice-chat-tips': {
    slug: 'voice-chat-tips',
    title: 'Voice Chat Tips',
    difficulty: 'beginner',
    readingTime: 5,
    lastUpdated: '2026-03-10',
    sections: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        content: '<p>Voice chat is the heart of QuestMaster. Each AI character has a unique personality and voice style that responds to your tone and approach.</p><p>Before starting a voice conversation, make sure you have a stable internet connection and your microphone is working properly. Use headphones for the best experience.</p>',
      },
      {
        id: 'tone-and-pacing',
        title: 'Tone and Pacing',
        content: '<p>Characters respond differently based on how you speak. A calm, measured tone works best for wise NPCs, while energetic speech engages adventurous characters.</p><p><strong>Pro tip:</strong> Pause briefly between sentences to give the AI time to process and respond naturally.</p>',
      },
      {
        id: 'hidden-dialogue',
        title: 'Unlocking Hidden Dialogue',
        content: '<p>Many characters have secret dialogue trees that unlock when you ask the right questions. Try asking about their backstory, mentioning locations, or using keywords from the quest description.</p><p>Some legendary quests have characters that only reveal crucial information if you build enough rapport first.</p>',
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: '<p>If voice chat isn\'t working, check your browser permissions and ensure microphone access is granted. On mobile, make sure the app has microphone permissions enabled in your device settings.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'character-interaction', title: 'Character Interaction' },
      { slug: 'challenge-strategies', title: 'Challenge Strategies' },
    ],
  },
  'challenge-strategies': {
    slug: 'challenge-strategies',
    title: 'Challenge Strategies',
    difficulty: 'intermediate',
    readingTime: 8,
    lastUpdated: '2026-03-08',
    sections: [
      {
        id: 'challenge-types',
        title: 'Challenge Types',
        content: '<p>QuestMaster features several challenge types: <strong>conversation puzzles</strong>, <strong>knowledge tests</strong>, <strong>riddles</strong>, and <strong>location-based tasks</strong>. Each requires a different approach.</p>',
      },
      {
        id: 'conversation-puzzles',
        title: 'Conversation Puzzles',
        content: '<p>These challenges require you to extract specific information or convince a character through dialogue. Listen carefully to clues in their responses and ask follow-up questions.</p><p>Keep track of what characters say; they often hint at the answer early in the conversation.</p>',
      },
      {
        id: 'knowledge-tests',
        title: 'Knowledge Tests',
        content: '<p>Knowledge tests quiz you on real-world facts related to the quest location or theme. Reading the quest description thoroughly before starting gives you a significant advantage.</p>',
      },
      {
        id: 'scoring-tips',
        title: 'Maximizing Your Score',
        content: '<p>Complete challenges on your first attempt for maximum points. Speed bonuses apply to timed challenges, and conversation quality scores factor into your final rating.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'voice-chat-tips', title: 'Voice Chat Tips' },
      { slug: 'scoring-guide', title: 'Scoring Guide' },
    ],
  },
  'character-interaction': {
    slug: 'character-interaction',
    title: 'Character Interaction',
    difficulty: 'intermediate',
    readingTime: 7,
    lastUpdated: '2026-03-05',
    sections: [
      {
        id: 'understanding-characters',
        title: 'Understanding Characters',
        content: '<p>Every quest character has a defined personality, backstory, and voice style. Understanding these traits helps you navigate conversations more effectively.</p>',
      },
      {
        id: 'building-rapport',
        title: 'Building Rapport',
        content: '<p>Characters remember context within a conversation. Being polite, showing interest in their story, and referencing things they mention builds rapport and can unlock special dialogue paths.</p>',
      },
      {
        id: 'personality-types',
        title: 'Personality Types',
        content: '<p>Characters fall into several archetypes: <strong>the wise mentor</strong>, <strong>the reluctant helper</strong>, <strong>the trickster</strong>, and <strong>the guardian</strong>. Each type responds differently to various approaches.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'voice-chat-tips', title: 'Voice Chat Tips' },
      { slug: 'challenge-strategies', title: 'Challenge Strategies' },
    ],
  },
  'map-navigation': {
    slug: 'map-navigation',
    title: 'Map Navigation',
    difficulty: 'beginner',
    readingTime: 4,
    lastUpdated: '2026-03-12',
    sections: [
      {
        id: 'reading-the-map',
        title: 'Reading the Map',
        content: '<p>The quest map shows your current location, stage markers, and the recommended route. Blue markers indicate upcoming stages, green markers show completed stages, and golden markers highlight your current objective.</p>',
      },
      {
        id: 'route-planning',
        title: 'Route Planning',
        content: '<p>Plan your route before starting a quest. Some quests have stages that are far apart, so checking distances helps you estimate completion time. Use the 3D toggle for a better sense of the terrain.</p>',
      },
      {
        id: 'hidden-locations',
        title: 'Finding Hidden Locations',
        content: '<p>Some quests feature bonus locations that don\'t appear on the map initially. Characters may reveal these locations during conversations, so pay attention to geographical hints.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'scoring-guide', title: 'Scoring Guide' },
      { slug: 'challenge-strategies', title: 'Challenge Strategies' },
    ],
  },
  'scoring-guide': {
    slug: 'scoring-guide',
    title: 'Scoring Guide',
    difficulty: 'advanced',
    readingTime: 10,
    lastUpdated: '2026-03-01',
    sections: [
      {
        id: 'point-system',
        title: 'Point System',
        content: '<p>Points are earned for completing stages, solving challenges, and maintaining quality conversations. Each stage has a base point value that can be multiplied by performance bonuses.</p>',
      },
      {
        id: 'multipliers',
        title: 'Bonus Multipliers',
        content: '<p><strong>Speed bonus:</strong> Complete timed challenges faster for up to 1.5x points.<br/><strong>First attempt:</strong> Solving a challenge on your first try awards 1.25x points.<br/><strong>Streak bonus:</strong> Consecutive perfect completions increase your multiplier up to 2x.</p>',
      },
      {
        id: 'leaderboard-tips',
        title: 'Climbing the Leaderboard',
        content: '<p>Focus on legendary difficulty quests for the highest point yields. Maintain daily streaks and participate in seasonal events for bonus points that count toward your global ranking.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'challenge-strategies', title: 'Challenge Strategies' },
      { slug: 'map-navigation', title: 'Map Navigation' },
    ],
  },
  'community-rules': {
    slug: 'community-rules',
    title: 'Community Rules',
    difficulty: 'beginner',
    readingTime: 3,
    lastUpdated: '2026-02-28',
    sections: [
      {
        id: 'general-guidelines',
        title: 'General Guidelines',
        content: '<p>QuestMaster is a community-driven platform. Treat fellow players with respect, provide constructive feedback on community quests, and report any inappropriate content using the built-in reporting system.</p>',
      },
      {
        id: 'creating-quests',
        title: 'Creating Community Quests',
        content: '<p>Community quests go through an approval process before being published. Ensure your quest has clear descriptions, well-defined stages, and appropriate content for all ages.</p>',
      },
      {
        id: 'clan-etiquette',
        title: 'Clan Etiquette',
        content: '<p>Clans are collaborative groups. Participate actively, help new members, and coordinate on multiplayer quests. Clan leaders should maintain fair and inclusive environments.</p>',
      },
    ],
    relatedGuides: [
      { slug: 'character-interaction', title: 'Character Interaction' },
      { slug: 'scoring-guide', title: 'Scoring Guide' },
    ],
  },
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-400',
  intermediate: 'bg-amber-500/15 text-amber-400',
  advanced: 'bg-rose-500/15 text-rose-400',
};

export default function WikiGuidePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  const guide = GUIDES[slug];

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-16 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-white mb-2">Guide not found</h2>
          <p className="text-slate-400 mb-6">The guide you are looking for does not exist.</p>
          <Link
            href="/wiki"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Wiki
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: guide.title,
        text: `Check out this QuestMaster guide: ${guide.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto"
    >
      {/* Back Link */}
      <motion.div variants={itemVariants} className="mb-6">
        <Link
          href="/wiki"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wiki
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Table of Contents Sidebar */}
        <motion.aside variants={itemVariants} className="lg:col-span-1 order-2 lg:order-1">
          <div className="glass rounded-2xl p-5 sticky top-24 backdrop-blur-xl bg-white/[0.03]">
            <h3 className="font-heading text-sm font-bold text-white mb-3">Table of Contents</h3>
            <nav className="space-y-1">
              {guide.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-violet-500/15 text-violet-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="glass rounded-2xl p-8 backdrop-blur-xl bg-white/[0.03]">
            <h1 className="font-heading text-3xl font-bold text-white">{guide.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${difficultyColors[guide.difficulty]}`}>
                {guide.difficulty}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {guide.readingTime} min read
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Updated {new Date(guide.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={handleShare}
                className="ml-auto text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </motion.div>

          {/* Content Sections */}
          {guide.sections.map((section) => (
            <motion.div
              key={section.id}
              id={section.id}
              variants={itemVariants}
              className="glass rounded-2xl p-8 backdrop-blur-xl bg-white/[0.03]"
            >
              <h2 className="font-heading text-xl font-bold text-white mb-4">{section.title}</h2>
              <div
                className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed [&_p]:mb-3 [&_strong]:text-white [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </motion.div>
          ))}

          {/* Feedback */}
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 text-center backdrop-blur-xl bg-white/[0.03]"
          >
            <p className="text-sm text-slate-300 mb-4">Was this guide helpful?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFeedback('helpful')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  feedback === 'helpful'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-slate-700/50'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Yes, helpful
              </button>
              <button
                onClick={() => setFeedback('not-helpful')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  feedback === 'not-helpful'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-slate-700/50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Not really
              </button>
            </div>
            {feedback && (
              <p className="text-xs text-slate-500 mt-3">
                Thank you for your feedback!
              </p>
            )}
          </motion.div>

          {/* Related Guides */}
          {guide.relatedGuides.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="font-heading text-xl font-bold text-white mb-4">Related Guides</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {guide.relatedGuides.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/wiki/${related.slug}`}
                    className="glass rounded-xl p-4 flex items-center gap-3 hover:border-violet-500/20 border border-transparent transition-all group backdrop-blur-xl bg-white/[0.03]"
                  >
                    <BookOpen className="w-5 h-5 text-violet-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                      {related.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-violet-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
