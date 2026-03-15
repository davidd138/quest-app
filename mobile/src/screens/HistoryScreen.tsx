import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, LIST_USER_QUESTS } from '../hooks/useGraphQL';

type Props = { navigation: any };

export default function HistoryScreen({ navigation }: Props) {
  const { data, loading, execute } = useQuery(LIST_USER_QUESTS);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInitial();
    });
    return unsubscribe;
  }, [navigation]);

  const loadInitial = async () => {
    const result = await execute({ limit: 20 });
    setItems(result?.items || []);
    setNextToken(result?.nextToken || null);
  };

  const loadMore = async () => {
    if (!nextToken || loading) return;
    const result = await execute({ limit: 20, nextToken });
    setItems((prev) => [...prev, ...(result?.items || [])]);
    setNextToken(result?.nextToken || null);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('QuestDetail', { questId: item.questId, userQuestId: item.id })
      }
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardName}>{item.questTitle || 'Quest'}</Text>
        <Text
          style={[
            styles.statusBadge,
            item.status === 'completed' ? styles.statusCompleted : styles.statusInProgress,
          ]}
        >
          {item.status === 'completed' ? 'Completed' : 'In Progress'}
        </Text>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardDate}>
          {new Date(item.startedAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        {item.score != null && (
          <Text style={styles.cardScore}>Score: {item.score}</Text>
        )}
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(item.currentStage / item.totalStages) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.currentStage}/{item.totalStages}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Quest History</Text>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.empty}>No quests yet. Start your first adventure!</Text>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusCompleted: { backgroundColor: '#064e3b', color: '#10b981' },
  statusInProgress: { backgroundColor: '#312e81', color: '#a78bfa' },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDate: { fontSize: 13, color: '#94a3b8' },
  cardScore: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  progressText: { fontSize: 12, color: '#64748b' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
