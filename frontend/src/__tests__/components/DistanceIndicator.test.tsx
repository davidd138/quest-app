import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DistanceIndicator from '@/components/quest/DistanceIndicator';

// Mock the geo lib so tests are deterministic
vi.mock('@/lib/geo', () => ({
  haversineDistance: vi.fn(),
  formatDistance: vi.fn(),
  estimateWalkTime: vi.fn(),
  getDistanceColor: vi.fn(),
}));

import { haversineDistance, formatDistance, estimateWalkTime, getDistanceColor } from '@/lib/geo';

const mockedHaversine = vi.mocked(haversineDistance);
const mockedFormat = vi.mocked(formatDistance);
const mockedWalkTime = vi.mocked(estimateWalkTime);
const mockedColor = vi.mocked(getDistanceColor);

describe('DistanceIndicator', () => {
  it('formats short distance correctly (meters)', () => {
    mockedHaversine.mockReturnValue(0.5);
    mockedFormat.mockReturnValue('500 m');
    mockedWalkTime.mockReturnValue('6 min');
    mockedColor.mockReturnValue('text-emerald-400');

    render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.425}
        targetLng={-3.705}
      />,
    );

    expect(screen.getByText('500 m')).toBeInTheDocument();
    expect(screen.getByText('(6 min)')).toBeInTheDocument();
  });

  it('formats long distance correctly (kilometers)', () => {
    mockedHaversine.mockReturnValue(12.3);
    mockedFormat.mockReturnValue('12 km');
    mockedWalkTime.mockReturnValue('2h 28min');
    mockedColor.mockReturnValue('text-orange-400');

    render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.52}
        targetLng={-3.60}
      />,
    );

    expect(screen.getByText('12 km')).toBeInTheDocument();
    expect(screen.getByText('(2h 28min)')).toBeInTheDocument();
  });

  it('applies green color for close distance (<1km)', () => {
    mockedHaversine.mockReturnValue(0.3);
    mockedFormat.mockReturnValue('300 m');
    mockedWalkTime.mockReturnValue('4 min');
    mockedColor.mockReturnValue('text-emerald-400');

    const { container } = render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.423}
        targetLng={-3.702}
      />,
    );

    const coloredSpan = container.querySelector('.text-emerald-400');
    expect(coloredSpan).toBeInTheDocument();
  });

  it('applies orange color for far distance (<15km)', () => {
    mockedHaversine.mockReturnValue(10);
    mockedFormat.mockReturnValue('10 km');
    mockedWalkTime.mockReturnValue('2h');
    mockedColor.mockReturnValue('text-orange-400');

    const { container } = render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.50}
        targetLng={-3.60}
      />,
    );

    const coloredSpan = container.querySelector('.text-orange-400');
    expect(coloredSpan).toBeInTheDocument();
  });

  it('shows walking time by default', () => {
    mockedHaversine.mockReturnValue(2);
    mockedFormat.mockReturnValue('2.0 km');
    mockedWalkTime.mockReturnValue('24 min');
    mockedColor.mockReturnValue('text-amber-400');

    render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.44}
        targetLng={-3.70}
      />,
    );

    expect(screen.getByText('(24 min)')).toBeInTheDocument();
  });

  it('hides walking time when showWalkTime is false', () => {
    mockedHaversine.mockReturnValue(2);
    mockedFormat.mockReturnValue('2.0 km');
    mockedWalkTime.mockReturnValue('24 min');
    mockedColor.mockReturnValue('text-amber-400');

    render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.44}
        targetLng={-3.70}
        showWalkTime={false}
      />,
    );

    expect(screen.queryByText('(24 min)')).not.toBeInTheDocument();
  });

  it('renders MapPin icon by default', () => {
    mockedHaversine.mockReturnValue(1);
    mockedFormat.mockReturnValue('1.0 km');
    mockedWalkTime.mockReturnValue('12 min');
    mockedColor.mockReturnValue('text-emerald-400');

    const { container } = render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.43}
        targetLng={-3.70}
      />,
    );

    // Lucide MapPin renders as SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has accessible aria-label with distance info', () => {
    mockedHaversine.mockReturnValue(0.8);
    mockedFormat.mockReturnValue('800 m');
    mockedWalkTime.mockReturnValue('10 min');
    mockedColor.mockReturnValue('text-emerald-400');

    const { container } = render(
      <DistanceIndicator
        userLat={40.42}
        userLng={-3.70}
        targetLat={40.427}
        targetLng={-3.705}
      />,
    );

    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('aria-label')).toContain('800 m');
    expect(wrapper?.getAttribute('aria-label')).toContain('10 min');
  });
});
