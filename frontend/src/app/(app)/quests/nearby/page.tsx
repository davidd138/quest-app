'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  List,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import { MAPBOX_TOKEN } from '@/lib/constants';
import {
  haversineDistance,
  formatDistance,
  estimateWalkTime,
  sortByDistance,
  getDistanceColor,
} from '@/lib/geo';
import DistanceIndicator from '@/components/quest/DistanceIndicator';
import type { Quest, QuestConnection } from '@/types';

type ViewMode = 'list' | 'map';

const DISTANCE_OPTIONS = [1, 5, 10, 25, 50, 100] as const;

export default function NearbyQuestsPage() {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const { data, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);

  // Request geolocation
  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permiso de ubicación denegado. Activa la ubicación en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('No se pudo obtener tu ubicación.');
            break;
          case error.TIMEOUT:
            setLocationError('Tiempo de espera agotado al obtener ubicación.');
            break;
          default:
            setLocationError('Error desconocido al obtener ubicación.');
        }
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    execute({ limit: 100 });
  }, [execute]);

  // Filter and sort quests by distance
  const nearbyQuests = useMemo(() => {
    if (!userPosition || !data?.items) return [];
    const withinRadius = data.items.filter((quest) => {
      const dist = haversineDistance(
        userPosition.lat,
        userPosition.lng,
        quest.location.latitude,
        quest.location.longitude,
      );
      return dist <= radiusKm;
    });
    return sortByDistance(withinRadius, userPosition.lat, userPosition.lng);
  }, [data, userPosition, radiusKm]);

  // Enable location prompt
  if (locationError) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Activar ubicación
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">{locationError}</p>
          <button
            onClick={requestLocation}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            <Navigation className="w-4 h-4 inline mr-2" />
            Reintentar ubicación
          </button>
        </motion.div>
      </div>
    );
  }

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Obteniendo tu ubicación...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">
          Aventuras Cercanas
        </h1>
        <p className="text-slate-400 mt-1">
          {nearbyQuests.length} aventura{nearbyQuests.length !== 1 ? 's' : ''} en un radio
          de {radiusKm} km
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-navy-800/60 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={16} />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon size={16} />
            Mapa
          </button>
        </div>

        {/* Distance filter */}
        <div className="flex items-center gap-3 flex-1">
          <MapPin size={16} className="text-violet-400 shrink-0" />
          <span className="text-sm text-slate-400 shrink-0">Radio:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {DISTANCE_OPTIONS.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  radiusKm === km
                    ? 'bg-violet-600 text-white'
                    : 'bg-navy-800/60 text-slate-400 hover:text-white hover:bg-navy-700/60'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-navy-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-navy-800 rounded" />
                <div className="h-4 w-full bg-navy-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'map' && userPosition ? (
        /* Map View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl overflow-hidden"
          style={{ height: '600px' }}
        >
          <div className="relative w-full h-full bg-navy-800 flex items-center justify-center">
            {/* Map placeholder — requires mapbox-gl to be loaded */}
            <div className="text-center">
              <MapIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">
                Mapa centrado en tu ubicación
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)} — Radio: {radiusKm} km
              </p>
              <p className="text-slate-500 text-xs mt-3">
                {nearbyQuests.length} aventura{nearbyQuests.length !== 1 ? 's' : ''} en el mapa
              </p>
            </div>
          </div>
        </motion.div>
      ) : nearbyQuests.length > 0 ? (
        /* List View */
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {nearbyQuests.map((quest) => {
            const dist = haversineDistance(
              userPosition!.lat,
              userPosition!.lng,
              quest.location.latitude,
              quest.location.longitude,
            );
            return (
              <motion.div
                key={quest.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
              >
                <Link href={`/quests/${quest.id}`}>
                  <div className="glass rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-violet-500/20 transition-all duration-300">
                    {/* Cover */}
                    <div className="relative h-40 bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10">
                      <div className="w-full h-full flex items-center justify-center">
                        <Compass className="w-12 h-12 text-violet-500/20" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                      {/* Distance badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold bg-navy-900/80 backdrop-blur-sm ${getDistanceColor(dist)}`}
                        >
                          {formatDistance(dist)}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs text-slate-300 bg-navy-900/60 px-2 py-1 rounded-lg backdrop-blur-sm capitalize">
                          {quest.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {quest.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <DistanceIndicator
                          userLat={userPosition!.lat}
                          userLng={userPosition!.lng}
                          targetLat={quest.location.latitude}
                          targetLng={quest.location.longitude}
                        />
                        <span className="text-xs text-slate-500">
                          {quest.totalPoints} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No hay aventuras cerca
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            No se encontraron aventuras en un radio de {radiusKm} km. Prueba a aumentar el radio de búsqueda.
          </p>
        </motion.div>
      )}
    </div>
  );
}
