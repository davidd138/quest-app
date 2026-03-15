'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Compass,
  Mic,
  User,
  CreditCard,
  Rocket,
  MessageCircle,
  BookOpen,
  Play,
  ExternalLink,
  Mail,
} from 'lucide-react';

// ---------- Data ----------

type FaqCategory = 'getting_started' | 'quests' | 'voice_chat' | 'account' | 'billing';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

const categoryConfig: Record<FaqCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  getting_started: { label: 'Getting Started', icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  quests: { label: 'Quests', icon: Compass, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  voice_chat: { label: 'Voice Chat', icon: Mic, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  account: { label: 'Account', icon: User, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  billing: { label: 'Billing', icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-500/15' },
};

const faqs: FaqItem[] = [
  // Getting Started
  { id: 'gs1', question: 'How do I create my account?', answer: 'Click "Sign Up" on the login page. Enter your email, create a password, and you\'re in! Your account is automatically confirmed, so you can start questing right away.', category: 'getting_started' },
  { id: 'gs2', question: 'What is QuestMaster?', answer: 'QuestMaster is an interactive adventure platform where you explore real-world locations, talk to AI-powered characters using voice, solve challenges, and compete with friends on leaderboards. Think of it as a gamified treasure hunt with NPCs!', category: 'getting_started' },
  { id: 'gs3', question: 'How do I start my first quest?', answer: 'Go to the Quests page, browse available quests, and click on one you like. Read the briefing, then hit "Begin Quest" to start. Each quest has multiple stages with unique characters and challenges.', category: 'getting_started' },
  { id: 'gs4', question: 'Do I need to be at a physical location?', answer: 'Quests are designed around real locations, but you can participate from anywhere! When you\'re near a quest location, you get bonus points and unlock special content. Remote players can still enjoy the conversations and challenges.', category: 'getting_started' },

  // Quests
  { id: 'q1', question: 'How are quests scored?', answer: 'Each stage has a point value based on your performance in the challenge. Points are awarded for conversation quality, correct answers, persuasion success, and more. Your total quest score is the sum of all stage scores.', category: 'quests' },
  { id: 'q2', question: 'Can I replay a quest?', answer: 'Yes! You can replay any quest to improve your score. The leaderboard tracks your best performance. Each replay offers slightly different AI responses, so it never feels exactly the same.', category: 'quests' },
  { id: 'q3', question: 'What are the difficulty levels?', answer: 'Quests come in four difficulties: Easy (beginner-friendly), Medium (some challenge), Hard (requires skill and strategy), and Legendary (the ultimate test). Higher difficulties offer more points and exclusive achievements.', category: 'quests' },
  { id: 'q4', question: 'How do challenges work?', answer: 'Each stage has a unique challenge: conversations, riddles, knowledge tests, negotiations, or exploration tasks. For voice challenges, you speak naturally with AI characters. Your responses are analyzed by AI to determine success.', category: 'quests' },

  // Voice Chat
  { id: 'vc1', question: 'How does voice chat work?', answer: 'Voice chat uses cutting-edge AI to create real-time conversations with quest characters. Just click the microphone button and speak naturally. The AI character will respond with a unique voice and personality.', category: 'voice_chat' },
  { id: 'vc2', question: 'What if voice chat isn\'t working?', answer: 'Make sure your browser has microphone permissions enabled. Check your device\'s audio settings. Try using Chrome or Edge for the best experience. If issues persist, check the transcript panel to continue with text.', category: 'voice_chat' },
  { id: 'vc3', question: 'Are voice conversations recorded?', answer: 'Conversations are transcribed and stored securely to provide scoring, replay, and analysis features. You can view and delete your conversation history from your Profile > Data page. We never share your voice data.', category: 'voice_chat' },

  // Account
  { id: 'a1', question: 'How do I change my profile?', answer: 'Go to Settings to update your display name, avatar, and preferences. You can also manage notification settings and privacy options from the same page.', category: 'account' },
  { id: 'a2', question: 'How do I delete my account?', answer: 'Navigate to Profile > Data to request account deletion. All your data including quest progress, scores, and conversations will be permanently removed within 30 days.', category: 'account' },
  { id: 'a3', question: 'Can I export my data?', answer: 'Yes! Go to Profile > Data and click "Export My Data" to download all your quest history, scores, achievements, and conversation transcripts in a portable format.', category: 'account' },

  // Billing
  { id: 'b1', question: 'Is QuestMaster free?', answer: 'QuestMaster offers a generous free tier with access to community quests and basic features. Premium plans unlock exclusive quests, advanced analytics, team features, and priority voice processing.', category: 'billing' },
  { id: 'b2', question: 'How do I upgrade my plan?', answer: 'Go to Settings > Subscription to view available plans and upgrade. Payment is processed securely through Stripe. You can upgrade, downgrade, or cancel at any time.', category: 'billing' },
];

const quickStartSteps = [
  { icon: Rocket, title: 'Create Account', description: 'Sign up in seconds with just an email' },
  { icon: Compass, title: 'Choose a Quest', description: 'Browse quests by category and difficulty' },
  { icon: Mic, title: 'Talk to Characters', description: 'Use voice chat for immersive conversations' },
  { icon: BookOpen, title: 'Complete Challenges', description: 'Solve riddles, negotiate, and explore' },
];

const videoTutorials = [
  { title: 'Getting Started with QuestMaster', duration: '3:45', thumbnail: null },
  { title: 'Voice Chat Tips & Tricks', duration: '5:12', thumbnail: null },
  { title: 'How to Climb the Leaderboard', duration: '4:30', thumbnail: null },
  { title: 'Creating Community Quests', duration: '7:15', thumbnail: null },
];

// ---------- Components ----------

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      className="glass rounded-xl border border-white/10 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-white pr-4">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------- Page ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
      const matchesSearch =
        !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          Help Center
        </h1>
        <p className="text-slate-400 mt-2 ml-[60px]">Find answers, learn how to quest, and get support</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search for help..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
        />
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Quick Start Guide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStartSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass rounded-2xl p-5 border border-white/10 text-center relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center mx-auto mb-2">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          All Topics
        </button>
        {(Object.entries(categoryConfig) as [FaqCategory, typeof categoryConfig[FaqCategory]][]).map(
          ([key, config]) => {
            const Icon = config.icon;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? `${config.bg} ${config.color} border border-current/20`
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </button>
            );
          },
        )}
      </motion.div>

      {/* FAQ List */}
      <motion.div variants={itemVariants} className="space-y-2">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <FaqAccordion
              key={faq.id}
              item={faq}
              isOpen={openFaqIds.has(faq.id)}
              onToggle={() => toggleFaq(faq.id)}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No results found. Try a different search term.</p>
          </div>
        )}
      </motion.div>

      {/* Video Tutorials */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Video Tutorials</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videoTutorials.map((video, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="glass rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                  {video.duration}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-white line-clamp-2">{video.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-emerald-600/10" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Still need help?</h3>
              <p className="text-sm text-slate-400 mt-1">Our support team is ready to assist you</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm flex items-center gap-2 shadow-xl shadow-violet-500/25"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
