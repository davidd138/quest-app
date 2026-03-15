'use client';

import React, { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Clock,
  Footprints,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { MAPBOX_TOKEN } from '@/lib/constants';
import RouteLayer from './RouteLayer';
import type { Stage } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface QuestRoutePreviewProps {
  /** Stages that define the quest route. */
  stages: Stage[];
  /** Map container height. */
  height?: string;
  /** Quest title for the directions link. */
  questTitle?: string;
}

/** Haversine distance in metres between two lat/lng pairs. */
function haversineMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format metres into human-readable distance. */
function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Rough walking time in minutes assuming 5 km/h pace. */
function walkingMinutes(metres: number): number {
  return Math.round(metres / (5000 / 60));
}

interface SegmentInfo {
  from: string;
  to: string;
  distanceM: number;
  walkMin: number;
}

const QuestRoutePreview: React.FC<QuestRoutePreviewProps> = ({
  stages,
  height = '400px',
  questTitle = 'Quest',
}) => {
  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  );

  const segments: SegmentInfo[] = useMemo(() => {
    const result: SegmentInfo[] = [];
    for (let i = 0; i < sortedStages.length - 1; i++) {
      const a = sortedStages[i];
      const b = sortedStages[i + 1];
      const d = haversineMetres(
        a.location.latitude,
        a.location.longitude,
        b.location.latitude,
        b.location.longitude,
      );
      result.push({
        from: a.title,
        to: b.title,
        distanceM: d,
        walkMin: walkingMinutes(d),
      });
    }
    return result;
  }, [sortedStages]);

  const totalDistance = useMemo(
    () => segments.reduce((sum, s) => sum + s.distanceM, 0),
    [segments],
  );

  const totalWalkMin = useMemo(
    () => segments.reduce((sum, s) => sum + s.walkMin, 0),
    [segments],
  );

  /** Simple elevation profile concept — synthetic based on stage order. */
  const elevationProfile = useMemo(() => {
    return sortedStages.map((s, i) => ({
      label: `Stage ${s.order}`,
      elevation: 50 + Math.sin((i / Math.max(1, sortedStages.length - 1)) * Math.PI) * 40 + i * 5,
    }));
  }, [sortedStages]);

  const maxElevation = Math.max(...elevationProfile.map((e) => e.elevation), 1);

  const initialViewState = useMemo(() => {
    if (sortedStages.length === 0) {
      return { longitude: -3.7038, latitude: 40.4168, zoom: 13, pitch: 30, bearing: 0 };
    }
    const lngs = sortedStages.map((s) => s.location.longitude);
    const lats = sortedStages.map((s) => s.location.latitude);
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 14,
      pitch: 30,
      bearing: 0,
    };
  }, [sortedStages]);

  const googleMapsUrl = useMemo(() => {
    if (sortedStages.length === 0) return '#';
    const waypoints = sortedStages
      .map((s) => `${s.location.latitude},${s.location.longitude}`)
      .join('/');
    return `https://www.google.com/maps/dir/${waypoints}/@${initialViewState.latitude},${initialViewState.longitude},14z/data=!4m2!4m1!3e2`;
  }, [sortedStages, initialViewState]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
      {/* Map */}
      <div style={{ height }} className="relative">
        <Map
          initialViewState={initialViewState}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass showZoom />

          <RouteLayer
            stages={sortedStages}
            currentStageIndex={sortedStages.length}
            completedStageIds={new Set(sortedStages.map((s) => s.id))}
          />

          {sortedStages.map((stage) => (
            <Marker
              key={stage.id}
              longitude={stage.location.longitude}
              latitude={stage.location.latitude}
              anchor="center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: stage.order * 0.1 }}
                className="w-8 h-8 rounded-full bg-violet-500 border-2 border-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/30"
              >
                <span className="text-xs font-bold text-white">{stage.order}</span>
              </motion.div>
            </Marker>
          ))}
        </Map>

        {/* Overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-navy-950/60 to-transparent pointer-events-none" />
      </div>

      {/* Info panel */}
      <div className="p-4 space-y-4">
        {/* Summary row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-white">
              <Footprints size={16} className="text-violet-400" />
              <span className="font-semibold">{formatDistance(totalDistance)}</span>
              <span className="text-slate-500">total</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white">
              <Clock size={16} className="text-amber-400" />
              <span className="font-semibold">{totalWalkMin} min</span>
              <span className="text-slate-500">walk</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white">
              <MapPin size={16} className="text-emerald-400" />
              <span className="font-semibold">{sortedStages.length}</span>
              <span className="text-slate-500">stops</span>
            </div>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/20 text-violet-300 border border-violet-400/20 hover:bg-violet-500/30 transition-colors"
          >
            <Navigation size={12} />
            Get directions
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Segment breakdown */}
        <div className="space-y-1.5">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs text-slate-400 px-2 py-1.5 rounded-lg bg-white/5"
            >
              <span className="truncate max-w-[55%]">
                {seg.from} → {seg.to}
              </span>
              <span className="flex items-center gap-3 flex-shrink-0">
                <span>{formatDistance(seg.distanceM)}</span>
                <span className="text-slate-500">~{seg.walkMin} min</span>
              </span>
            </div>
          ))}
        </div>

        {/* Elevation profile */}
        {elevationProfile.length > 1 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <TrendingUp size={12} />
              <span>Elevation profile (concept)</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {elevationProfile.map((ep, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(ep.elevation / maxElevation) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="flex-1 bg-gradient-to-t from-violet-500/40 to-violet-400/20 rounded-t-sm relative group"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(ep.elevation)}m
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {elevationProfile.map((ep, i) => (
                <span key={i} className="flex-1 text-center text-[8px] text-slate-600 truncate">
                  {ep.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestRoutePreview;
