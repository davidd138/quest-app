import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, GET_QUEST, START_QUEST } from '../hooks/useGraphQL';
import MapView from '../components/MapView';
import ProgressBar from '../components/ProgressBar';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

type Props = { route: any; navigation: any };

export default function QuestDetailScreen({ route, navigation }: Props) {
  const { questId, userQuestId } = route.params;
  const { data: quest, loading, execute } = useQuery(GET_QUEST);
  const startQuest = useMutation(START_QUEST);

  useEffect(() => {
    execute({ id: questId });
  }, [questId]);

  const handleStart = async () => {
    try {
      const result = await startQuest.execute({
        input: { questId },
      });
      navigation.navigate('QuestPlay', {
        quest,
        userQuestId: result.id,
        stageIndex: 0,
      });
    } catch (e) {
      console.error('Failed to start quest:', e);
    }
  };

  const handleContinue = () => {
    navigation.navigate('QuestPlay', {
      quest,
      userQuestId,
      stageIndex: 0,
    });
  };

  if (loading || !quest) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const stages = quest.stages || [];
  const stageLocations = stages
    .filter((s: any) => s.latitude && s.longitude)
    .map((s: any) => ({
      id: s.id,
      title: s.title,
      latitude: s.latitude,
      longitude: s.longitude,
      locationName: s.locationName,
    }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{quest.title}</Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: DIFFICULTY_COLORS[quest.difficulty] || '#94a3b8' },
            ]}
          >
            <Text style={styles.badgeText}>
              {quest.difficulty === 'easy'
                ? 'Easy'
                : quest.difficulty === 'medium'
                ? 'Medium'
                : 'Hard'}
            </Text>
          </View>
          {quest.category && (
            <View style={[styles.badge, { backgroundColor: '#334155' }]}>
              <Text style={styles.badgeText}>{quest.category}</Text>
            </View>
          )}
          {quest.estimatedDuration && (
            <Text style={styles.metaText}>
              ~{quest.estimatedDuration} min
            </Text>
          )}
          <Text style={styles.metaText}>
            {quest.totalStages} stages
          </Text>
        </View>

        <Text style={styles.description}>{quest.description}</Text>

        {stageLocations.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView stages={stageLocations} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Stages</Text>
        {stages.map((stage: any, index: number) => (
          <View key={stage.id} style={styles.stageCard}>
            <View style={styles.stageNumber}>
              <Text style={styles.stageNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>{stage.title}</Text>
              <Text style={styles.stageDesc} numberOfLines={2}>
                {stage.description}
              </Text>
              {stage.characterName && (
                <Text style={styles.stageCharacter}>
                  Character: {stage.characterName}
                </Text>
              )}
              {stage.locationName && (
                <Text style={styles.stageLocation}>
                  Location: {stage.locationName}
                </Text>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.startButton}
          onPress={userQuestId ? handleContinue : handleStart}
          disabled={startQuest.loading}
        >
          {startQuest.loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>
              {userQuestId ? 'Continue Quest' : 'Start Quest'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  backText: { color: '#a78bfa', fontSize: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaText: { color: '#94a3b8', fontSize: 13 },
  description: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  stageCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageNumberText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  stageDesc: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  stageCharacter: { fontSize: 12, color: '#a78bfa', marginTop: 4 },
  stageLocation: { fontSize: 12, color: '#64748b', marginTop: 2 },
  startButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
