'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  Download,
  Share2,
  Palette,
  MapPin,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';

type PhotoFilter = 'none' | 'vintage' | 'dramatic' | 'neon' | 'cinematic';

interface PhotoModeProps {
  questTitle: string;
  characterName: string;
  locationName: string;
  children?: React.ReactNode;
}

const filters: { id: PhotoFilter; label: string; style: string }[] = [
  { id: 'none', label: 'Original', style: '' },
  { id: 'vintage', label: 'Vintage', style: 'sepia(0.6) saturate(0.7) brightness(0.9) contrast(1.1)' },
  { id: 'dramatic', label: 'Dramatic', style: 'contrast(1.4) brightness(0.85) saturate(1.2)' },
  { id: 'neon', label: 'Neon', style: 'saturate(2) brightness(1.1) hue-rotate(10deg) contrast(1.15)' },
  { id: 'cinematic', label: 'Cinematic', style: 'saturate(0.8) contrast(1.2) brightness(0.9) sepia(0.15)' },
];

const filterPreviewColors: Record<PhotoFilter, string> = {
  none: 'from-slate-600 to-slate-700',
  vintage: 'from-amber-700 to-orange-800',
  dramatic: 'from-slate-900 to-slate-700',
  neon: 'from-violet-500 to-pink-500',
  cinematic: 'from-blue-900 to-slate-800',
};

const panelVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const PhotoMode: React.FC<PhotoModeProps> = ({
  questTitle,
  characterName,
  locationName,
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const timestamp = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCapture = useCallback(() => {
    setIsCaptured(true);
    // Flash effect
    setTimeout(() => setIsCaptured(false), 600);
  }, []);

  const handleSave = useCallback(() => {
    // In a real implementation, this would use html2canvas to render the
    // captureRef div into a canvas and trigger a download.
    // For now we simulate the flow.
    const link = document.createElement('a');
    link.download = `quest-${questTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.href = '#';
    // Placeholder: would be canvas.toDataURL()
    alert('Photo saved! (html2canvas integration required for actual export)');
  }, [questTitle]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quest: ${questTitle}`,
          text: `Check out my quest moment in "${questTitle}" with ${characterName} at ${locationName}!`,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  }, [questTitle, characterName, locationName]);

  const currentFilterStyle = filters.find((f) => f.id === selectedFilter)?.style || '';

  return (
    <>
      {/* Trigger button */}
      {!isActive && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(true)}
          className="fixed bottom-24 right-4 z-30 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl hover:bg-white/15 transition-colors"
          aria-label="Activate photo mode"
        >
          <Camera size={22} />
        </motion.button>
      )}

      {/* Photo mode overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Capture area */}
            <div
              ref={captureRef}
              className="absolute inset-0"
              style={{ filter: currentFilterStyle || undefined }}
            >
              {/* Content pass-through */}
              <div className="absolute inset-0 bg-navy-950">
                {children}
              </div>

              {/* Frame border */}
              <div className="absolute inset-3 border-2 border-white/20 rounded-2xl pointer-events-none">
                {/* Corner accents */}
                <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl-2xl" />
                <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr-2xl" />
                <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl-2xl" />
                <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br-2xl" />
              </div>

              {/* Info overlays */}
              <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
                <div className="space-y-1">
                  <p className="text-white text-lg font-heading font-bold drop-shadow-lg">
                    {questTitle}
                  </p>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <User size={12} />
                    <span>{characterName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 text-xs">
                  <Sparkles size={12} className="text-violet-400" />
                  <span>QuestMaster</span>
                </div>
              </div>

              <div className="absolute bottom-20 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <MapPin size={12} />
                    <span>{locationName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Clock size={12} />
                    <span>{timestamp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash effect */}
            <AnimatePresence>
              {isCaptured && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white z-50 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Filter strip */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
                  >
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                          selectedFilter === filter.id
                            ? 'bg-violet-500/20 border border-violet-500/40'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${filterPreviewColors[filter.id]}`}
                        />
                        <span className="text-[10px] text-white/80 font-medium">{filter.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action bar */}
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
                <button
                  onClick={() => setIsActive(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-white"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl transition-colors ${
                      showFilters
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    <Palette size={20} />
                  </button>

                  {/* Capture button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCapture}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl shadow-white/20"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-black/20 flex items-center justify-center">
                      <Camera size={24} className="text-navy-950" />
                    </div>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-white"
                  >
                    <Download size={20} />
                  </button>
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-white"
                    >
                      <Share2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhotoMode;
