import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNMapView, { Marker, Polyline } from 'react-native-maps';

type Stage = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  locationName?: string;
};

type Props = {
  stages: Stage[];
};

export default function MapView({ stages }: Props) {
  if (stages.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No location data</Text>
      </View>
    );
  }

  const latitudes = stages.map((s) => s.latitude);
  const longitudes = stages.map((s) => s.longitude);
  const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  const latDelta = Math.max(Math.max(...latitudes) - Math.min(...latitudes), 0.01) * 1.5;
  const lngDelta = Math.max(Math.max(...longitudes) - Math.min(...longitudes), 0.01) * 1.5;

  const routeCoords = stages.map((s) => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  return (
    <RNMapView
      style={styles.map}
      initialRegion={{
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }}
      userInterfaceStyle="dark"
    >
      {stages.map((stage, index) => (
        <Marker
          key={stage.id}
          coordinate={{
            latitude: stage.latitude,
            longitude: stage.longitude,
          }}
          title={`${index + 1}. ${stage.title}`}
          description={stage.locationName}
          pinColor={index === 0 ? '#7c3aed' : '#f59e0b'}
        />
      ))}

      {routeCoords.length > 1 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor="#7c3aed"
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      )}
    </RNMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    minHeight: 200,
  },
  placeholder: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
  },
});
