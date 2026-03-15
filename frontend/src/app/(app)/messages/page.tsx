'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Compass,
  MoreHorizontal,
  Paperclip,
  Smile,
  Phone,
  Video,
  Trophy,
  Swords,
  MessageCircle,
} from 'lucide-react';
import ChatBubble, { type ChatMessage, type ChatMessageType } from '@/components/social/ChatBubble';
import UserProfileCard, { type UserProfile } from '@/components/social/UserProfileCard';

// ---------- Mock Data ----------

interface Contact {
  id: string;
  name: string;
  online: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  typing?: boolean;
  level: number;
  questsCompleted: number;
  totalPoints: number;
  achievementCount: number;
}

const mockContacts: Contact[] = [
  { id: 'c1', name: 'Elena Voss', online: true, lastMessage: 'Ready for the next quest?', lastMessageTime: '2m', unreadCount: 3, level: 42, questsCompleted: 87, totalPoints: 14200, achievementCount: 12 },
  { id: 'c2', name: 'Marcus Chen', online: true, lastMessage: 'Check out this achievement!', lastMessageTime: '15m', unreadCount: 1, level: 38, questsCompleted: 71, totalPoints: 11800, achievementCount: 9 },
  { id: 'c3', name: 'Sofia Ramirez', online: false, lastMessage: 'That quest was incredible', lastMessageTime: '1h', unreadCount: 0, level: 55, questsCompleted: 134, totalPoints: 22100, achievementCount: 18 },
  { id: 'c4', name: 'James Wright', online: true, lastMessage: 'I beat your score!', lastMessageTime: '3h', unreadCount: 0, typing: true, level: 29, questsCompleted: 45, totalPoints: 7600, achievementCount: 6 },
  { id: 'c5', name: 'Aiko Tanaka', online: false, lastMessage: 'Thanks for the help!', lastMessageTime: '1d', unreadCount: 0, level: 61, questsCompleted: 156, totalPoints: 25800, achievementCount: 22 },
  { id: 'c6', name: 'Liam O\'Brien', online: false, lastMessage: 'Good game yesterday', lastMessageTime: '2d', unreadCount: 0, level: 33, questsCompleted: 52, totalPoints: 8900, achievementCount: 7 },
  { id: 'c7', name: 'Priya Patel', online: true, lastMessage: 'Want to team up?', lastMessageTime: '5m', unreadCount: 2, level: 47, questsCompleted: 98, totalPoints: 16400, achievementCount: 15 },
];

const mockMessages: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', senderId: 'c1', senderName: 'Elena Voss', content: 'Hey! Did you finish the Madrid quest?', timestamp: '2026-03-15T10:00:00', type: 'text', read: true },
    { id: 'm2', senderId: 'me', senderName: 'You', content: 'Yes! Got 920 points on it. So good!', timestamp: '2026-03-15T10:02:00', type: 'text', read: true },
    { id: 'm3', senderId: 'c1', senderName: 'Elena Voss', content: 'Nice! You should try this one next:', timestamp: '2026-03-15T10:03:00', type: 'text', read: true },
    { id: 'm4', senderId: 'c1', senderName: 'Elena Voss', content: 'Check out this quest!', timestamp: '2026-03-15T10:03:30', type: 'quest_share', read: true, meta: { questId: 'q1', questTitle: 'The Lost Temple of Barcelona', questCategory: 'adventure', questDifficulty: 'hard' } },
    { id: 'm5', senderId: 'me', senderName: 'You', content: 'That looks amazing! I\'m in.', timestamp: '2026-03-15T10:05:00', type: 'text', read: true },
    { id: 'm6', senderId: 'c1', senderName: 'Elena Voss', content: 'Also, look what I just unlocked!', timestamp: '2026-03-15T10:06:00', type: 'achievement_share', read: true, meta: { achievementTitle: 'Speed Demon - Complete 3 quests in under 10 minutes' } },
    { id: 'm7', senderId: 'me', senderName: 'You', content: 'Wow congrats! That\'s a tough one.', timestamp: '2026-03-15T10:07:00', type: 'text', read: true },
    { id: 'm8', senderId: 'c1', senderName: 'Elena Voss', content: 'Ready for the next quest?', timestamp: '2026-03-15T10:10:00', type: 'text', read: false },
    { id: 'm9', senderId: 'c1', senderName: 'Elena Voss', content: 'I challenge you!', timestamp: '2026-03-15T10:11:00', type: 'challenge_invite', read: false, meta: { challengeTitle: 'Speed Run: Lost Temple' } },
  ],
  c2: [
    { id: 'mm1', senderId: 'c2', senderName: 'Marcus Chen', content: 'Hey! Just wanted to share something cool', timestamp: '2026-03-15T09:45:00', type: 'text', read: true },
    { id: 'mm2', senderId: 'c2', senderName: 'Marcus Chen', content: 'Check out this achievement!', timestamp: '2026-03-15T09:46:00', type: 'achievement_share', read: false, meta: { achievementTitle: 'Perfectionist - Perfect score on any quest' } },
  ],
  c4: [
    { id: 'mj1', senderId: 'me', senderName: 'You', content: 'No way! What was your score?', timestamp: '2026-03-15T07:00:00', type: 'text', read: true },
    { id: 'mj2', senderId: 'c4', senderName: 'James Wright', content: 'I beat your score! 985 points on Mystery at the Museum!', timestamp: '2026-03-15T07:01:00', type: 'text', read: true },
    { id: 'mj3', senderId: 'me', senderName: 'You', content: 'Challenge accepted. Rematch this weekend?', timestamp: '2026-03-15T07:03:00', type: 'text', read: true },
  ],
};

// ---------- Helpers ----------

function AvatarCircle({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = [
    'from-violet-500 to-fuchsia-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-indigo-500 to-violet-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ---------- Page ----------

export default function MessagesPage() {
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string>('c1');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState(mockMessages);
  const [hoveredContact, setHoveredContact] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = mockContacts.find((c) => c.id === selectedContactId);
  const currentMessages = conversations[selectedContactId] || [];

  const filteredContacts = mockContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, selectedContactId]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false,
    };
    setConversations((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), msg],
    }));
    setNewMessage('');
  }, [newMessage, selectedContactId]);

  const handleShareQuest = useCallback(() => {
    const msg: ChatMessage = {
      id: `share-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      content: 'Check out this quest!',
      timestamp: new Date().toISOString(),
      type: 'quest_share',
      read: false,
      meta: {
        questId: 'demo-quest',
        questTitle: 'Mystery at the Museum',
        questCategory: 'mystery',
        questDifficulty: 'medium',
      },
    };
    setConversations((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), msg],
    }));
  }, [selectedContactId]);

  const profileUser: UserProfile | null = selectedContact
    ? {
        id: selectedContact.id,
        name: selectedContact.name,
        level: selectedContact.level,
        questsCompleted: selectedContact.questsCompleted,
        totalPoints: selectedContact.totalPoints,
        achievementCount: selectedContact.achievementCount,
        title: `Level ${selectedContact.level} Adventurer`,
        isFriend: true,
        recentActivity: [
          { quest: 'The Lost Temple', action: 'Completed', time: '2h ago' },
          { quest: 'Urban Explorer', action: 'Started', time: '5h ago' },
        ],
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          Messages
        </h1>
        <p className="text-slate-400 mt-2 ml-[60px]">Chat with friends, share quests, and send challenges</p>
      </motion.div>

      {/* Main Chat Layout */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left: Contact List */}
        <div className="w-80 border-r border-white/10 flex flex-col flex-shrink-0 hidden md:flex">
          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {filteredContacts.map((contact) => {
              const isActive = contact.id === selectedContactId;
              return (
                <motion.button
                  key={contact.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors relative ${
                    isActive ? 'bg-violet-500/10 border-l-2 border-l-violet-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <AvatarCircle name={contact.name} />
                    {contact.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-navy-900" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-violet-300' : 'text-white'}`}>
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">
                        {contact.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {contact.typing ? (
                        <span className="text-xs text-violet-400 italic">typing...</span>
                      ) : (
                        <span className="text-xs text-slate-500 truncate">{contact.lastMessage}</span>
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-violet-500 text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          {selectedContact && (
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div
                className="flex items-center gap-3 relative"
                onMouseEnter={() => setHoveredContact(selectedContact.id)}
                onMouseLeave={() => setHoveredContact(null)}
              >
                <div className="relative">
                  <AvatarCircle name={selectedContact.name} />
                  {selectedContact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-navy-900" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedContact.name}</h3>
                  <p className="text-[10px] text-slate-500">
                    {selectedContact.typing ? (
                      <span className="text-violet-400">typing...</span>
                    ) : selectedContact.online ? (
                      <span className="text-emerald-400">Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>

                {/* Profile hover card */}
                {profileUser && (
                  <UserProfileCard
                    user={profileUser}
                    visible={hoveredContact === selectedContact.id}
                    position="bottom"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShareQuest}
                  className="p-2 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors"
                  title="Share Quest"
                >
                  <Compass className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10">
            {currentMessages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === 'me'}
                showAvatar={msg.senderId !== 'me'}
              />
            ))}

            {/* Typing indicator */}
            {selectedContact?.typing && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 ml-10 mb-3"
              >
                <div className="bg-white/[0.07] border border-white/10 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-slate-500"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Message input */}
          <div className="px-5 py-4 border-t border-white/10">
            <div className="flex items-end gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>

              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <Smile className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
