'use client';

import React, { useMemo, useCallback, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Lock,
  MapPin,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
} from 'lucide-react';
import RouteLayer from './RouteLayer';
import { MAPBOX_TOKEN } from '@/lib/constants';
import type { Stage, ChallengeType } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface QuestMapProps {
  stages: Stage[];
  currentStageIndex: number;
  completedStageIds?: Set<string>;
  onStageClick?: (stage: Stage, index: number) => void;
  height?: string;
  interactive?: boolean;
}

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: HelpCircle,
  knowledge: BookOpen,
  negotiation: Handshake,
  persuasion: Megaphone,
  exploration: Compass,
  trivia: Lightbulb,
};

function getMarkerState(index: number, currentStageIndex: number, completedIds: Set<string>, stageId: string) {
  if (completedIds.has(stageId)) return 'completed' as const;
  if (index === currentStageIndex) return 'current' as const;
  return 'locked' as const;
}

const QuestMap: React.FC<QuestMapProps> = ({
  stages,
  currentStageIndex,
  completedStageIds = new Set(),
  onStageClick,
  height = '100%',
  interactive = true,
}) => {
  const [popupStage, setPopupStage] = useState<Stage | null>(null);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  );

  // Calculate bounds to fit all stages
  const initialViewState = useMemo(() => {
    if (sortedStages.length === 0) {
      return { longitude: -3.7038, latitude: 40.4168, zoom: 12, pitch: 45, bearing: 0 };
    }

    const lngs = sortedStages.map((s) => s.location.longitude);
    const lats = sortedStages.map((s) => s.location.latitude);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Estimate zoom based on spread
    const lngSpread = maxLng - minLng;
    const latSpread = maxLat - minLat;
    const maxSpread = Math.max(lngSpread, latSpread);
    let zoom = 14;
    if (maxSpread > 0.1) zoom = 11;
    else if (maxSpread > 0.05) zoom = 12;
    else if (maxSpread > 0.01) zoom = 13;
    else if (maxSpread > 0.005) zoom = 14;
    else zoom = 15;

    return { longitude: centerLng, latitude: centerLat, zoom, pitch: 45, bearing: -10 };
  }, [sortedStages]);

  const handleMarkerClick = useCallback(
    (stage: Stage, index: number) => {
      setPopupStage(stage);
      onStageClick?.(stage, index);
    },
    [onStageClick],
  );

  return (
    <div style={{ height }} className="relative rounded-2xl overflow-hidden border border-white/10">
      <Map
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactive={interactive}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass showZoom />

        {/* Route lines */}
        <RouteLayer
          stages={sortedStages}
          currentStageIndex={currentStageIndex}
          completedStageIds={completedStageIds}
        />

        {/* Stage markers */}
        {sortedStages.map((stage, index) => {
          const markerState = getMarkerState(index, currentStageIndex, completedStageIds, stage.id);
          const Icon =
            markerState === 'completed'
              ? Check
              : markerState === 'locked'
                ? Lock
                : challengeIcons[stage.challenge.type];

          const bgColor =
            markerState === 'completed'
              ? 'bg-emerald-500 border-emerald-400'
              : markerState === 'current'
                ? 'bg-violet-500 border-violet-400'
                : 'bg-slate-600 border-slate-500';

          return (
            <Marker
              key={stage.id}
              longitude={stage.location.longitude}
              latitude={stage.location.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(stage, index);
              }}
            >
              <div className="relative cursor-pointer">
                {/* Pulse for current */}
                {markerState === 'current' && (
                  <motion.div
                    className="absolute inset-[-6px] rounded-full bg-violet-500/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={`relative w-10 h-10 rounded-full ${bgColor} border-2 flex items-center justify-center shadow-lg z-10`}
                >
                  {markerState === 'completed' ? (
                    <Check size={18} className="text-white" />
                  ) : markerState === 'locked' ? (
                    <Lock size={14} className="text-slate-300" />
                  ) : (
                    <span className="text-sm font-bold text-white">{stage.order}</span>
                  )}
                </motion.div>
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        <AnimatePresence>
          {popupStage && (
            <Popup
              longitude={popupStage.location.longitude}
              latitude={popupStage.location.latitude}
              anchor="bottom"
              onClose={() => setPopupStage(null)}
              closeOnClick={false}
              offset={24}
              className="quest-popup"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="p-3 min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const PopupIcon = challengeIcons[popupStage.challenge.type];
                    return <PopupIcon size={14} className="text-violet-400" />;
                  })()}
                  <h4 className="font-heading font-bold text-sm text-navy-900">
                    {popupStage.title}
                  </h4>
                </div>
                <p className="text-xs text-navy-600 mb-2 line-clamp-2">
                  {popupStage.description}
                </p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-navy-500">
                    <MapPin size={10} />
                    {popupStage.location.name}
                  </span>
                  <span className="font-semibold text-violet-600">
                    {popupStage.points} pts
                  </span>
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Map overlay gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-navy-950/60 to-transparent" />
      </div>
    </div>
  );
};

export default QuestMap;
