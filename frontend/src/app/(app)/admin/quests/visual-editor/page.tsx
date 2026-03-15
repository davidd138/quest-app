'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Save,
  Undo2,
  Layers,
  MapPin,
  MessageSquare,
  Puzzle,
  BookOpen,
  Swords,
  Search as SearchIcon,
  Compass,
  GripVertical,
  X,
  ChevronDown,
  Settings,
  Eye,
  Wand2,
} from 'lucide-react';
import type { QuestCategory, QuestDifficulty, ChallengeType } from '@/types';
import AIQuestGenerator from '@/components/quest/AIQuestGenerator';

// ---------- Types ----------

interface EditorStage {
  id: string;
  title: string;
  description: string;
  x: number; // percent position on canvas
  y: number;
  characterName: string;
  characterRole: string;
  challengeType: ChallengeType;
  points: number;
  locationName: string;
}

interface StageConnection {
  from: string;
  to: string;
  challengeType: ChallengeType;
}

// ---------- Mock Data ----------

const initialStages: EditorStage[] = [
  { id: 's1', title: 'The Grand Entrance', description: 'Begin your journey at the ancient gates', x: 15, y: 30, characterName: 'Aria the Guide', characterRole: 'Guide', challengeType: 'conversation', points: 100, locationName: 'Ancient Gates' },
  { id: 's2', title: 'Market District', description: 'Navigate through the bustling market', x: 40, y: 20, characterName: 'Kai the Merchant', characterRole: 'Merchant', challengeType: 'negotiation', points: 150, locationName: 'Central Market' },
  { id: 's3', title: 'The Hidden Library', description: 'Uncover secrets in the forgotten library', x: 65, y: 45, characterName: 'Luna the Scholar', characterRole: 'Sage', challengeType: 'knowledge', points: 200, locationName: 'Old Library' },
  { id: 's4', title: 'The Final Summit', description: 'Face the ultimate challenge at the peak', x: 85, y: 25, characterName: 'Dante the Guardian', characterRole: 'Guardian', challengeType: 'riddle', points: 300, locationName: 'Summit Peak' },
];

const initialConnections: StageConnection[] = [
  { from: 's1', to: 's2', challengeType: 'conversation' },
  { from: 's2', to: 's3', challengeType: 'negotiation' },
  { from: 's3', to: 's4', challengeType: 'knowledge' },
];

// ---------- Helpers ----------

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: Puzzle,
  knowledge: BookOpen,
  negotiation: Swords,
  persuasion: MessageSquare,
  exploration: Compass,
  trivia: SearchIcon,
};

const challengeColors: Record<ChallengeType, string> = {
  conversation: 'text-violet-400 bg-violet-500/15',
  riddle: 'text-amber-400 bg-amber-500/15',
  knowledge: 'text-cyan-400 bg-cyan-500/15',
  negotiation: 'text-rose-400 bg-rose-500/15',
  persuasion: 'text-fuchsia-400 bg-fuchsia-500/15',
  exploration: 'text-emerald-400 bg-emerald-500/15',
  trivia: 'text-blue-400 bg-blue-500/15',
};

function AvatarCircle({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = ['from-violet-500 to-fuchsia-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-blue-500'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-[8px] font-bold text-white`}>
      {initials}
    </div>
  );
}

// ---------- Page ----------

export default function VisualEditorPage() {
  const [stages, setStages] = useState<EditorStage[]>(initialStages);
  const [connections, setConnections] = useState<StageConnection[]>(initialConnections);
  const [selectedStageId, setSelectedStageId] = useState<string | null>('s1');
  const [zoom, setZoom] = useState(1);
  const [gridSnap, setGridSnap] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedStage = stages.find((s) => s.id === selectedStageId) || null;

  const handleDragStart = useCallback((id: string) => {
    setDragging(id);
    setSelectedStageId(id);
  }, []);

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      if (gridSnap) {
        x = Math.round(x / 5) * 5;
        y = Math.round(y / 5) * 5;
      }

      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));

      setStages((prev) =>
        prev.map((s) => (s.id === dragging ? { ...s, x, y } : s)),
      );
    },
    [dragging, gridSnap],
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, []);

  const updateStageField = useCallback(
    (field: keyof EditorStage, value: string | number) => {
      if (!selectedStageId) return;
      setStages((prev) =>
        prev.map((s) => (s.id === selectedStageId ? { ...s, [field]: value } : s)),
      );
    },
    [selectedStageId],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Layers className="w-6 h-6 text-white" />
            </div>
            Visual Quest Editor
          </h1>
          <p className="text-slate-400 mt-1 ml-[60px]">Drag stages, draw connections, and design your quest visually</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium flex items-center gap-2 hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            AI Generate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Layout'}
          </motion.button>
        </div>
      </div>

      {/* AI Generator Panel */}
      <AnimatePresence>
        {showAIGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AIQuestGenerator
              onAccept={(quest) => {
                const newStages: EditorStage[] = quest.stages.map((s, i) => ({
                  id: `ai-${i}`,
                  title: s.title,
                  description: s.description,
                  x: 10 + (i * 80) / Math.max(1, quest.stages.length - 1),
                  y: 20 + Math.sin(i) * 25 + 25,
                  characterName: s.characterName,
                  characterRole: s.characterRole,
                  challengeType: s.challengeType as ChallengeType,
                  points: s.points,
                  locationName: s.location.name,
                }));
                const newConnections: StageConnection[] = newStages.slice(0, -1).map((s, i) => ({
                  from: s.id,
                  to: newStages[i + 1].id,
                  challengeType: newStages[i + 1].challengeType,
                }));
                setStages(newStages);
                setConnections(newConnections);
                setSelectedStageId(newStages[0]?.id || null);
                setShowAIGenerator(false);
              }}
              onClose={() => setShowAIGenerator(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Canvas */}
        <div className="flex-1 glass rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={() => setGridSnap(!gridSnap)}
                className={`p-2 rounded-lg transition-colors ${
                  gridSnap
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={gridSnap ? 'Grid snap ON' : 'Grid snap OFF'}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              {stages.length} stages &middot; {connections.length} connections
            </div>
          </div>

          {/* Canvas area */}
          <div
            ref={canvasRef}
            className="flex-1 relative cursor-crosshair overflow-hidden"
            style={{
              backgroundImage: gridSnap
                ? 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)'
                : 'none',
              backgroundSize: `${5 * zoom}% ${5 * zoom}%`,
            }}
            onMouseMove={dragging ? handleDrag : undefined}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Map-like gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900/50 to-navy-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_70%)]" />

            {/* Connections (SVG lines) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {connections.map((conn) => {
                const fromStage = stages.find((s) => s.id === conn.from);
                const toStage = stages.find((s) => s.id === conn.to);
                if (!fromStage || !toStage) return null;

                const ChallengeIcon = challengeIcons[conn.challengeType] || MessageSquare;
                const midX = (fromStage.x + toStage.x) / 2;
                const midY = (fromStage.y + toStage.y) / 2;

                return (
                  <g key={`${conn.from}-${conn.to}`}>
                    <line
                      x1={`${fromStage.x}%`}
                      y1={`${fromStage.y}%`}
                      x2={`${toStage.x}%`}
                      y2={`${toStage.y}%`}
                      stroke="rgba(139,92,246,0.3)"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />
                    {/* Glow line */}
                    <line
                      x1={`${fromStage.x}%`}
                      y1={`${fromStage.y}%`}
                      x2={`${toStage.x}%`}
                      y2={`${toStage.y}%`}
                      stroke="rgba(139,92,246,0.1)"
                      strokeWidth="6"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Connection midpoint challenge icons */}
            {connections.map((conn) => {
              const fromStage = stages.find((s) => s.id === conn.from);
              const toStage = stages.find((s) => s.id === conn.to);
              if (!fromStage || !toStage) return null;
              const ChallengeIcon = challengeIcons[conn.challengeType] || MessageSquare;
              const colors = challengeColors[conn.challengeType] || challengeColors.conversation;
              const midX = (fromStage.x + toStage.x) / 2;
              const midY = (fromStage.y + toStage.y) / 2;

              return (
                <div
                  key={`icon-${conn.from}-${conn.to}`}
                  className={`absolute z-20 w-7 h-7 rounded-full ${colors} flex items-center justify-center border border-white/10`}
                  style={{
                    left: `${midX}%`,
                    top: `${midY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <ChallengeIcon className="w-3 h-3" />
                </div>
              );
            })}

            {/* Stage nodes */}
            {stages.map((stage) => {
              const isSelected = stage.id === selectedStageId;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`absolute z-30 cursor-grab active:cursor-grabbing group ${
                    dragging === stage.id ? 'z-40' : ''
                  }`}
                  style={{
                    left: `${stage.x}%`,
                    top: `${stage.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDragStart(stage.id);
                  }}
                  onClick={() => setSelectedStageId(stage.id)}
                >
                  <div
                    className={`relative px-4 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-200 min-w-[140px] ${
                      isSelected
                        ? 'bg-violet-500/20 border-violet-500/50 shadow-xl shadow-violet-500/20'
                        : 'bg-white/[0.06] border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/10'
                    }`}
                  >
                    {/* Character avatar */}
                    <div className="absolute -top-3 -left-3">
                      <AvatarCircle name={stage.characterName} />
                    </div>

                    {/* Stage number */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-navy-950 shadow-lg">
                      {stages.indexOf(stage) + 1}
                    </div>

                    <div className="ml-4">
                      <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {stage.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" />
                        <span className="text-[9px] text-slate-500 truncate max-w-[100px]">
                          {stage.locationName}
                        </span>
                      </div>
                    </div>

                    {/* Points badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 whitespace-nowrap">
                      {stage.points} pts
                    </div>

                    {/* Drag handle */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity">
                      <GripVertical className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Properties Panel (Sidebar) */}
        <div className="w-80 glass rounded-2xl border border-white/10 overflow-hidden flex-col flex-shrink-0 hidden lg:flex">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-400" />
              Stage Properties
            </h3>
            {selectedStage && (
              <button
                onClick={() => setSelectedStageId(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedStage ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {/* Title */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Stage Title
                </label>
                <input
                  type="text"
                  value={selectedStage.title}
                  onChange={(e) => updateStageField('title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Description
                </label>
                <textarea
                  value={selectedStage.description}
                  onChange={(e) => updateStageField('description', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Location Name
                </label>
                <input
                  type="text"
                  value={selectedStage.locationName}
                  onChange={(e) => updateStageField('locationName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div className="border-t border-white/10 pt-4" />

              {/* Character */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Character Name
                </label>
                <input
                  type="text"
                  value={selectedStage.characterName}
                  onChange={(e) => updateStageField('characterName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Character Role
                </label>
                <input
                  type="text"
                  value={selectedStage.characterRole}
                  onChange={(e) => updateStageField('characterRole', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div className="border-t border-white/10 pt-4" />

              {/* Challenge Type */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Challenge Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(challengeIcons) as ChallengeType[]).map((type) => {
                    const Icon = challengeIcons[type];
                    const isActive = selectedStage.challengeType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => updateStageField('challengeType', type)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-medium capitalize transition-all ${
                          isActive
                            ? challengeColors[type]
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        } border ${isActive ? 'border-current/20' : 'border-white/5'}`}
                      >
                        <Icon className="w-3 h-3" />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Points */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Points
                </label>
                <input
                  type="number"
                  value={selectedStage.points}
                  onChange={(e) => updateStageField('points', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    X Position
                  </label>
                  <span className="text-sm text-slate-300 font-mono">{Math.round(selectedStage.x)}%</span>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    Y Position
                  </label>
                  <span className="text-sm text-slate-300 font-mono">{Math.round(selectedStage.y)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8">
              <Eye className="w-8 h-8 mb-3" />
              <p className="text-sm text-center">Select a stage on the canvas to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
