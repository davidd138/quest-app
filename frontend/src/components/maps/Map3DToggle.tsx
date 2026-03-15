'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Box, Mountain, Layers } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Map3DState {
  /** Whether the map is in 3D perspective mode. */
  enabled: boolean;
  /** Camera pitch in degrees (0 = flat, 60 = tilted). */
  pitch: number;
  /** Show 3D building extrusions. */
  buildings: boolean;
  /** Show terrain (requires Mapbox terrain source). */
  terrain: boolean;
}

interface Map3DToggleProps {
  /** Current 3D state. */
  state: Map3DState;
  /** Called when any 3D setting changes. */
  onChange: (state: Map3DState) => void;
  /** Additional class names. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_3D_STATE: Map3DState = {
  enabled: false,
  pitch: 0,
  buildings: false,
  terrain: false,
};

// ---------------------------------------------------------------------------
// Sub-toggle button
// ---------------------------------------------------------------------------

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
  disabled = false,
}) => (
  <motion.button
    whileHover={disabled ? undefined : { scale: 1.05 }}
    whileTap={disabled ? undefined : { scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
      transition-all
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      ${active
        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    title={label}
    aria-pressed={active}
    aria-label={label}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Map3DToggle: React.FC<Map3DToggleProps> = ({
  state,
  onChange,
  className = '',
}) => {
  const [animating, setAnimating] = useState(false);

  /** Toggle 3D perspective on/off with animated pitch transition. */
  const toggle3D = useCallback(() => {
    if (animating) return;

    const newEnabled = !state.enabled;
    const targetPitch = newEnabled ? 60 : 0;

    setAnimating(true);

    // Animate pitch over 500ms (16 steps)
    const steps = 16;
    const startPitch = state.pitch;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      // Ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const pitch = startPitch + (targetPitch - startPitch) * eased;

      onChange({
        ...state,
        enabled: newEnabled,
        pitch: Math.round(pitch * 10) / 10,
        buildings: newEnabled ? state.buildings : false,
        terrain: newEnabled ? state.terrain : false,
      });

      if (step >= steps) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 500 / steps);
  }, [state, onChange, animating]);

  const toggleBuildings = useCallback(() => {
    if (!state.enabled) return;
    onChange({ ...state, buildings: !state.buildings });
  }, [state, onChange]);

  const toggleTerrain = useCallback(() => {
    if (!state.enabled) return;
    onChange({ ...state, terrain: !state.terrain });
  }, [state, onChange]);

  return (
    <div
      className={`flex items-center gap-1 p-1.5 rounded-xl
        bg-black/40 backdrop-blur-xl border border-white/10
        shadow-lg ${className}`}
    >
      {/* Main 3D toggle */}
      <ToggleButton
        active={state.enabled}
        onClick={toggle3D}
        icon={Box}
        label="3D"
      />

      {/* Divider */}
      <div className="w-px h-5 bg-white/10" />

      {/* Buildings */}
      <ToggleButton
        active={state.buildings}
        onClick={toggleBuildings}
        icon={Layers}
        label="Buildings"
        disabled={!state.enabled}
      />

      {/* Terrain */}
      <ToggleButton
        active={state.terrain}
        onClick={toggleTerrain}
        icon={Mountain}
        label="Terrain"
        disabled={!state.enabled}
      />
    </div>
  );
};

export default Map3DToggle;
