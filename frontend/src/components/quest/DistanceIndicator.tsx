'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import {
  haversineDistance,
  formatDistance,
  estimateWalkTime,
  getDistanceColor,
} from '@/lib/geo';

interface DistanceIndicatorProps {
  /** User's current latitude */
  userLat: number;
  /** User's current longitude */
  userLng: number;
  /** Quest / target latitude */
  targetLat: number;
  /** Quest / target longitude */
  targetLng: number;
  /** Show walking time estimate */
  showWalkTime?: boolean;
  /** Use Navigation icon instead of MapPin */
  useNavigationIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  userLat,
  userLng,
  targetLat,
  targetLng,
  showWalkTime = true,
  useNavigationIcon = false,
  className = '',
}) => {
  const distance = haversineDistance(userLat, userLng, targetLat, targetLng);
  const formattedDistance = formatDistance(distance);
  const walkTime = estimateWalkTime(distance);
  const colorClass = getDistanceColor(distance);

  const Icon = useNavigationIcon ? Navigation : MapPin;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-sm ${className}`}
      aria-label={`Distance: ${formattedDistance}${showWalkTime ? `, walking time: ${walkTime}` : ''}`}
    >
      <Icon size={14} className={colorClass} />
      <span className={`font-medium ${colorClass}`}>{formattedDistance}</span>
      {showWalkTime && (
        <span className="text-slate-500 text-xs">({walkTime})</span>
      )}
    </div>
  );
};

export default DistanceIndicator;
