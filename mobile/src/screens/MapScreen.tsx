import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNMapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery, LIST_QUESTS } from '../hooks/useGraphQL';
import QuestCard from '../components/QuestCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MIN = 120;
const BOTTOM_SHEET_MAX = SCREEN_HEIGHT * 0.6;

const CATEGORIES = [
  'All',
  'Adventure',
  'Mystery',
  'History',
  'Nature',
  'Culture',
  'Culinary',
  'Educational',
];

const CATEGORY_COLORS: Record<string, string> = {
  adventure: '#7c3aed',
  mystery: '#6366f1',
  history: '#f59e0b',
  nature: '#10b981',
  culture: '#ec4899',
  culinary: '#f97316',
  educational: '#3b82f6',
};

type Quest = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: number;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  latitude?: number;
  longitude?: number;
};

type Props = { navigation: any };

export default function MapScreen({ navigation }: Props) {
  const { data, loading, execute } = useQuery(LIST_QUESTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<RNMapView>(null);
  const sheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_MIN)).current;
  const sheetExpanded = useRef(false);

  useEffect(() => {
    execute();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch {}
  };

  const quests: Quest[] = (data || []).filter((q: Quest) => {
    if (selectedCategory === 'All') return true;
    return (
      q.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const questsWithCoords = quests.filter((q) => {
    const lat = q.latitude ?? q.location?.latitude;
    const lng = q.longitude ?? q.location?.longitude;
    return lat != null && lng != null && (lat !== 0 || lng !== 0);
  });

  const getQuestCoords = (q: Quest) => ({
    latitude: q.latitude ?? q.location?.latitude ?? 0,
    longitude: q.longitude ?? q.location?.longitude ?? 0,
  });

  const handleMarkerPress = useCallback(
    (quest: Quest) => {
      setSelectedQuest(quest);
      Animated.spring(sheetAnim, {
        toValue: BOTTOM_SHEET_MAX * 0.5,
        useNativeDriver: false,
      }).start();
    },
    [sheetAnim]
  );

  const handleNearMe = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        800
      );
    }
  }, [userLocation]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        const newVal = sheetExpanded.current
          ? BOTTOM_SHEET_MAX - gestureState.dy
          : BOTTOM_SHEET_MIN - gestureState.dy;
        const clamped = Math.max(
          BOTTOM_SHEET_MIN,
          Math.min(BOTTOM_SHEET_MAX, newVal)
        );
        sheetAnim.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const target =
          gestureState.dy < -50 ? BOTTOM_SHEET_MAX : BOTTOM_SHEET_MIN;
        sheetExpanded.current = target === BOTTOM_SHEET_MAX;
        Animated.spring(sheetAnim, {
          toValue: target,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const defaultRegion = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 40.4168,
        longitude: -3.7038,
        latitudeDelta: 40,
        longitudeDelta: 40,
      };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Category filter chips */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedCategory === item && styles.chipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === item && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Full-screen map */}
        <RNMapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={defaultRegion}
          userInterfaceStyle="dark"
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={darkMapStyle}
        >
          {questsWithCoords.map((quest) => {
            const coords = getQuestCoords(quest);
            const color =
              CATEGORY_COLORS[quest.category?.toLowerCase() ?? ''] ?? '#7c3aed';
            return (
              <Marker
                key={quest.id}
                coordinate={coords}
                title={quest.title}
                description={quest.location?.name ?? quest.category}
                pinColor={color}
                onPress={() => handleMarkerPress(quest)}
              />
            );
          })}
        </RNMapView>

        {/* Near me button */}
        <TouchableOpacity style={styles.nearMeButton} onPress={handleNearMe}>
          <Text style={styles.nearMeIcon}>{'\u25CE'}</Text>
          <Text style={styles.nearMeText}>Near me</Text>
        </TouchableOpacity>

        {/* Bottom sheet */}
        <Animated.View
          style={[styles.bottomSheet, { height: sheetAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sheetHandle} />

          {selectedQuest ? (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>{selectedQuest.title}</Text>
              <View style={styles.sheetBadgeRow}>
                {selectedQuest.difficulty && (
                  <View style={styles.sheetBadge}>
                    <Text style={styles.sheetBadgeText}>
                      {selectedQuest.difficulty}
                    </Text>
                  </View>
                )}
                {selectedQuest.category && (
                  <View
                    style={[
                      styles.sheetBadge,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[
                            selectedQuest.category.toLowerCase()
                          ] ?? '#334155',
                      },
                    ]}
                  >
                    <Text style={styles.sheetBadgeText}>
                      {selectedQuest.category}
                    </Text>
                  </View>
                )}
              </View>
              {selectedQuest.description && (
                <Text style={styles.sheetDescription} numberOfLines={3}>
                  {selectedQuest.description}
                </Text>
              )}
              <TouchableOpacity
                style={styles.sheetButton}
                onPress={() =>
                  navigation.navigate('QuestDetail', {
                    questId: selectedQuest.id,
                  })
                }
              >
                <Text style={styles.sheetButtonText}>View Quest</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetSubtitle}>
                {loading
                  ? 'Loading quests...'
                  : `${questsWithCoords.length} quests on map`}
              </Text>
              {loading && (
                <ActivityIndicator
                  color="#7c3aed"
                  style={{ marginTop: 12 }}
                />
              )}
              <FlatList
                data={questsWithCoords.slice(0, 10)}
                keyExtractor={(item) => item.id}
                style={styles.sheetList}
                renderItem={({ item }) => (
                  <QuestCard
                    quest={item}
                    onPress={() => {
                      handleMarkerPress(item);
                      const coords = getQuestCoords(item);
                      mapRef.current?.animateToRegion(
                        {
                          ...coords,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        },
                        600
                      );
                    }}
                  />
                )}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'land',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  filterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  nearMeButton: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nearMeIcon: {
    color: '#7c3aed',
    fontSize: 18,
  },
  nearMeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sheetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  sheetBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sheetDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  sheetButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetList: {
    marginTop: 8,
  },
});
