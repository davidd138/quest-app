import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';

type Collection = {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  icon: string;
  questCount: number;
  completedCount: number;
  category: string;
};

const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    title: 'European Mysteries',
    description: 'Solve mysteries across the great cities of Europe.',
    coverColor: '#6366f1',
    icon: '\u2316',
    questCount: 5,
    completedCount: 0,
    category: 'Mystery',
  },
  {
    id: 'col-2',
    title: 'World Food Tour',
    description: 'Eat your way around the globe with culinary adventures.',
    coverColor: '#f97316',
    icon: '\u2668',
    questCount: 4,
    completedCount: 0,
    category: 'Culinary',
  },
  {
    id: 'col-3',
    title: 'Ancient Civilizations',
    description: 'Walk in the footsteps of lost empires and forgotten kings.',
    coverColor: '#f59e0b',
    icon: '\u2653',
    questCount: 3,
    completedCount: 0,
    category: 'History',
  },
  {
    id: 'col-4',
    title: 'Nature Expeditions',
    description: 'Explore the wildest places on Earth and protect the planet.',
    coverColor: '#10b981',
    icon: '\u2618',
    questCount: 3,
    completedCount: 0,
    category: 'Nature',
  },
  {
    id: 'col-5',
    title: 'Getting Started',
    description: 'Learn the ropes with beginner-friendly tutorial quests.',
    coverColor: '#3b82f6',
    icon: '\u2605',
    questCount: 1,
    completedCount: 0,
    category: 'Tutorial',
  },
  {
    id: 'col-6',
    title: 'Spy Thrillers',
    description: 'Enter the world of espionage, deception, and coded messages.',
    coverColor: '#ef4444',
    icon: '\u2622',
    questCount: 2,
    completedCount: 0,
    category: 'Mystery',
  },
];

type Props = { navigation: any };

export default function CollectionsScreen({ navigation }: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollections = useCallback(() => {
    // In production this would fetch from GraphQL
    setTimeout(() => {
      setCollections(SAMPLE_COLLECTIONS);
      setLoading(false);
      setRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCollections();
  }, [loadCollections]);

  const handleCollectionPress = (collection: Collection) => {
    // Navigate to collection detail screen (placeholder: go to Quests filtered)
    navigation.navigate('Quests', { category: collection.category });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <Text style={styles.screenTitle}>Collections</Text>
          <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
      >
        <Text style={styles.screenTitle}>Collections</Text>
        <Text style={styles.subtitle}>
          Curated quest collections to explore
        </Text>

        {collections.map((collection) => {
          const progress =
            collection.questCount > 0
              ? collection.completedCount / collection.questCount
              : 0;

          return (
            <TouchableOpacity
              key={collection.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handleCollectionPress(collection)}
            >
              <View
                style={[
                  styles.cardCover,
                  { backgroundColor: collection.coverColor },
                ]}
              >
                <Text style={styles.cardIcon}>{collection.icon}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{collection.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {collection.description}
                </Text>

                <View style={styles.cardMeta}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>
                      {collection.category}
                    </Text>
                  </View>
                  <Text style={styles.metaText}>
                    {collection.completedCount}/{collection.questCount} quests
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <ProgressBar progress={progress} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {collections.length === 0 && (
          <Text style={styles.empty}>No collections available yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cardCover: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 36,
    color: '#fff',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  metaBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressContainer: {
    marginTop: 2,
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
