'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import {
  ArrowLeft,
  X,
  MapPin,
  Navigation,
  Clock,
  Sparkles,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
  Check,
  Lock,
  Footprints,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import RouteLayer from '@/components/maps/RouteLayer';
import { MAPBOX_TOKEN } from '@/lib/constants';
import { haversineDistance, formatDistance } from '@/lib/geo';
import type { Quest, Stage, ChallengeType } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

/* ─── Constants ──────────────────────────────────────────────────────── */

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: HelpCircle,
  knowledge: BookOpen,
  negotiation: Handshake,
  persuasion: Megaphone,
  exploration: Compass,
  trivia: Lightbulb,
};

/* ─── Component ──────────────────────────────────────────────────────── */

export default function QuestMapPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.id as string;

  const { data: quest, loading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { data: progress, execute: fetchProgress } = useQuery<{
    completedStages: { stageId: string }[];
    currentStageIndex: number;
  } | null>(GET_PROGRESS);

  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    fetchQuest({ questId });
    fetchProgress({ questId });
  }, [questId, fetchQuest, fetchProgress]);

  const sortedStages = useMemo(() => {
    if (!quest?.stages) return [];
    return [...quest.stages].sort((a, b) => a.order - b.order);
  }, [quest]);

  const completedStageIds = useMemo(() => {
    const ids = new Set<string>();
    if (progress?.completedStages) {
      for (const cs of progress.completedStages) {
        ids.add(cs.stageId);
      }
    }
    return ids;
  }, [progress]);

  const currentStageIndex = progress?.currentStageIndex ?? 0;

  // Calculate map center from stages
  const mapCenter = useMemo(() => {
    if (sortedStages.length === 0) {
      return { latitude: 40.4168, longitude: -3.7038, zoom: 13 };
    }

    const lats = sortedStages.map((s) => s.location.latitude);
    const lngs = sortedStages.map((s) => s.location.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    // Estimate zoom from bounds spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    const zoom = maxSpread < 0.005 ? 16 : maxSpread < 0.02 ? 14 : maxSpread < 0.1 ? 12 : 10;

    return { latitude: centerLat, longitude: centerLng, zoom };
  }, [sortedStages]);

  // Calculate walking directions between consecutive stages
  const walkingSegments = useMemo(() => {
    if (sortedStages.length < 2) return [];

    return sortedStages.slice(1).map((stage, i) => {
      const prev = sortedStages[i];
      const distance = haversineDistance(
        prev.location.latitude,
        prev.location.longitude,
        stage.location.latitude,
        stage.location.longitude,
      );
      const walkTime = Math.round((distance / 5) * 60);

      return {
        from: prev,
        to: stage,
        distance,
        walkTime,
      };
    });
  }, [sortedStages]);

  const handleStageClick = useCallback((stage: Stage) => {
    setSelectedStage((prev) => (prev?.id === stage.id ? null : stage));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-navy-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-slate-600 border-t-violet-400 rounded-full"
        />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-navy-950">
        <div className="text-center">
          <MapPin size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Quest not found</p>
          <button
            onClick={() => router.back()}
            className="mt-3 text-sm text-violet-400 hover:underline cursor-pointer"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-950">
      {/* Full-screen map */}
      <Map
        initialViewState={mapCenter}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="bottom-right" />

        {/* Route between stages */}
        {sortedStages.length > 1 && (
          <RouteLayer
            stages={sortedStages}
            currentStageIndex={0}
          />
        )}

        {/* Stage markers */}
        {sortedStages.map((stage, index) => {
          const isCompleted = completedStageIds.has(stage.id);
          const isCurrent = index === currentStageIndex;
          const ChallengeIcon = challengeIcons[stage.challenge.type] ?? MapPin;

          return (
            <Marker
              key={stage.id}
              latitude={stage.location.latitude}
              longitude={stage.location.longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleStageClick(stage);
              }}
            >
              <motion.div
                className="cursor-pointer"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  isCurrent
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={
                  isCurrent
                    ? { repeat: Infinity, duration: 2 }
                    : {}
                }
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ${
                    isCompleted
                      ? 'bg-emerald-500/30 border-emerald-400 shadow-emerald-500/30'
                      : isCurrent
                        ? 'bg-violet-500/30 border-violet-400 shadow-violet-500/40'
                        : 'bg-slate-700/50 border-slate-500 shadow-black/30'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-emerald-300" />
                  ) : isCurrent ? (
                    <ChallengeIcon size={16} className="text-violet-300" />
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                </div>
                {/* Stage number label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold text-slate-400 bg-navy-950/80 px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              </motion.div>
            </Marker>
          );
        })}

        {/* Stage detail popup */}
        {selectedStage && (
          <Popup
            latitude={selectedStage.location.latitude}
            longitude={selectedStage.location.longitude}
            onClose={() => setSelectedStage(null)}
            closeButton={false}
            offset={25}
            className="!p-0"
          >
            <div className="bg-navy-950/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 min-w-[220px] max-w-[280px]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {selectedStage.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Stage {selectedStage.order} of {sortedStages.length}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={12} className="text-slate-400" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mb-2 line-clamp-3">
                {selectedStage.description}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin size={10} />
                  {selectedStage.location.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-violet-400">
                  <Sparkles size={10} />
                  {selectedStage.points} pts
                </span>
              </div>

              {/* Character */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 mb-2">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300">
                  {selectedStage.character.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white">
                    {selectedStage.character.name}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {selectedStage.character.role}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div
                className={`text-center py-1.5 rounded-lg text-[10px] font-medium ${
                  completedStageIds.has(selectedStage.id)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : selectedStage.order - 1 === currentStageIndex
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'bg-white/5 text-slate-500'
                }`}
              >
                {completedStageIds.has(selectedStage.id)
                  ? 'Completed'
                  : selectedStage.order - 1 === currentStageIndex
                    ? 'Current Stage'
                    : 'Locked'}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Top overlay: Back button and title */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-10">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-navy-950/80 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="text-slate-300" />
        </button>
        <div className="px-3 py-2 rounded-xl bg-navy-950/80 backdrop-blur-xl border border-white/10">
          <h1 className="text-sm font-semibold text-white truncate">
            {quest.title}
          </h1>
          <p className="text-[10px] text-slate-400">
            {sortedStages.length} stages &middot;{' '}
            {completedStageIds.size} completed
          </p>
        </div>
      </div>

      {/* Walking directions toggle */}
      <button
        onClick={() => setShowDirections(!showDirections)}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-xl backdrop-blur-xl border transition-colors cursor-pointer ${
          showDirections
            ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
            : 'bg-navy-950/80 border-white/10 text-slate-300 hover:bg-white/10'
        }`}
        title="Walking directions"
      >
        <Footprints size={16} />
      </button>

      {/* Walking directions panel */}
      <AnimatePresence>
        {showDirections && walkingSegments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-16 right-4 bottom-4 w-72 z-10 bg-navy-950/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Navigation size={14} className="text-violet-400" />
                  Walking Route
                </h2>
                <button
                  onClick={() => setShowDirections(false)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Total:{' '}
                {formatDistance(
                  walkingSegments.reduce((acc, s) => acc + s.distance, 0),
                )}{' '}
                &middot;{' '}
                {Math.round(
                  walkingSegments.reduce((acc, s) => acc + s.walkTime, 0),
                )}{' '}
                min walk
              </p>
            </div>

            <div className="overflow-y-auto max-h-[calc(100%-80px)] p-3 space-y-2">
              {walkingSegments.map((segment, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-[9px] font-bold text-violet-300">
                      {i + 1}
                    </div>
                    <span className="text-[11px] text-white font-medium truncate">
                      {segment.from.title}
                    </span>
                  </div>
                  <div className="ml-2.5 pl-3 border-l border-dashed border-white/10 py-1">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Footprints size={10} />
                        {formatDistance(segment.distance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {Math.round(segment.walkTime)} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-emerald-300">
                      {i + 2}
                    </div>
                    <span className="text-[11px] text-white font-medium truncate">
                      {segment.to.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom stage strip */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sortedStages.map((stage, index) => {
            const isCompleted = completedStageIds.has(stage.id);
            const isCurrent = index === currentStageIndex;
            const isSelected = selectedStage?.id === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-500/20 border-violet-500/30'
                    : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : isCurrent
                        ? 'bg-navy-950/80 border-violet-500/20'
                        : 'bg-navy-950/80 border-white/10 hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isCurrent
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check size={10} /> : index + 1}
                </div>
                <span className="text-[11px] font-medium text-white whitespace-nowrap max-w-[100px] truncate">
                  {stage.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
