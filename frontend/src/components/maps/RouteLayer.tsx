'use client';

import React from 'react';
import { Source, Layer } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import type { Stage } from '@/types';

interface RouteLayerProps {
  stages: Stage[];
  currentStageIndex: number;
  completedStageIds?: Set<string>;
}

const RouteLayer: React.FC<RouteLayerProps> = ({ stages, currentStageIndex }) => {
  if (stages.length < 2) return null;

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  // Build segments: completed, current, upcoming
  const completedCoords: [number, number][] = [];
  const currentCoords: [number, number][] = [];
  const upcomingCoords: [number, number][] = [];

  for (let i = 0; i < sortedStages.length; i++) {
    const coord: [number, number] = [
      sortedStages[i].location.longitude,
      sortedStages[i].location.latitude,
    ];

    if (i < currentStageIndex) {
      completedCoords.push(coord);
      // Add current stage start to completed segment end
      if (i === currentStageIndex - 1 && currentStageIndex < sortedStages.length) {
        completedCoords.push([
          sortedStages[currentStageIndex].location.longitude,
          sortedStages[currentStageIndex].location.latitude,
        ]);
      }
    } else if (i === currentStageIndex) {
      currentCoords.push(coord);
      if (i + 1 < sortedStages.length) {
        currentCoords.push([
          sortedStages[i + 1].location.longitude,
          sortedStages[i + 1].location.latitude,
        ]);
      }
    } else if (i > currentStageIndex) {
      if (upcomingCoords.length === 0 && i > 0) {
        // Include previous stage coord to connect the line
        upcomingCoords.push([
          sortedStages[i - 1].location.longitude,
          sortedStages[i - 1].location.latitude,
        ]);
      }
      upcomingCoords.push(coord);
    }
  }

  const completedLayer: LineLayer = {
    id: 'route-completed',
    type: 'line',
    source: 'route-completed-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#10b981',
      'line-width': 4,
      'line-opacity': 0.9,
    },
  };

  const currentLayer: LineLayer = {
    id: 'route-current',
    type: 'line',
    source: 'route-current-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#8b5cf6',
      'line-width': 4,
      'line-opacity': 0.9,
      'line-dasharray': [2, 2],
    },
  };

  const upcomingLayer: LineLayer = {
    id: 'route-upcoming',
    type: 'line',
    source: 'route-upcoming-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#64748b',
      'line-width': 3,
      'line-opacity': 0.5,
      'line-dasharray': [1, 3],
    },
  };

  return (
    <>
      {completedCoords.length >= 2 && (
        <Source
          id="route-completed-source"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: completedCoords },
          }}
        >
          <Layer {...completedLayer} />
        </Source>
      )}

      {currentCoords.length >= 2 && (
        <Source
          id="route-current-source"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: currentCoords },
          }}
        >
          <Layer {...currentLayer} />
        </Source>
      )}

      {upcomingCoords.length >= 2 && (
        <Source
          id="route-upcoming-source"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: upcomingCoords },
          }}
        >
          <Layer {...upcomingLayer} />
        </Source>
      )}
    </>
  );
};

export default RouteLayer;
