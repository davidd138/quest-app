'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, ChevronDown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Map styles
// ---------------------------------------------------------------------------

export interface MapStyleOption {
  id: string;
  label: string;
  url: string;
  thumbnail: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'dark',
    label: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    thumbnail:
      'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/2.17,41.39,10,0/120x80@2x?access_token=placeholder',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    thumbnail:
      'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/2.17,41.39,10,0/120x80@2x?access_token=placeholder',
  },
  {
    id: 'streets',
    label: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    thumbnail:
      'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/2.17,41.39,10,0/120x80@2x?access_token=placeholder',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v12',
    thumbnail:
      'https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/2.17,41.39,10,0/120x80@2x?access_token=placeholder',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MapStyleSwitcherProps {
  /** Currently active style ID. @default 'dark' */
  activeStyle?: string;
  /** Called when the user selects a new style. */
  onStyleChange: (style: MapStyleOption) => void;
  /** Optional Mapbox token for real thumbnail previews. */
  mapboxToken?: string;
  /** Additional class names. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({
  activeStyle = 'dark',
  onStyleChange,
  mapboxToken,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (style: MapStyleOption) => {
      onStyleChange(style);
      setOpen(false);
    },
    [onStyleChange],
  );

  /** Build a real thumbnail URL if a token is provided. */
  const getThumbnail = (style: MapStyleOption) => {
    if (!mapboxToken) return undefined;
    return style.thumbnail.replace('placeholder', mapboxToken);
  };

  const activeLabel =
    MAP_STYLES.find((s) => s.id === activeStyle)?.label ?? 'Dark';

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
          bg-black/40 backdrop-blur-xl border border-white/10
          text-sm text-white shadow-lg hover:bg-black/50 transition-colors"
        aria-label="Switch map style"
        aria-expanded={open}
      >
        <MapIcon className="w-4 h-4 text-violet-400" />
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 grid grid-cols-2 gap-2 p-3
              rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10
              shadow-2xl z-50 min-w-[240px]"
          >
            {MAP_STYLES.map((style) => {
              const isActive = style.id === activeStyle;
              const thumb = getThumbnail(style);

              return (
                <motion.button
                  key={style.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(style)}
                  className={`relative flex flex-col items-center gap-1.5 p-1.5 rounded-xl
                    transition-all cursor-pointer group
                    ${isActive ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-black/60' : 'hover:bg-white/5'}`}
                  title={style.label}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-full aspect-[3/2] rounded-lg overflow-hidden bg-slate-800"
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={`${style.label} map style preview`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapIcon className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs font-medium transition-colors
                      ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-white'}`}
                  >
                    {style.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapStyleSwitcher;
