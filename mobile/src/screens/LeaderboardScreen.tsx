import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, GET_LEADERBOARD } from '../hooks/useGraphQL';

type Props = { navigation: any };

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];

export default function LeaderboardScreen({ navigation }: Props) {
  const { data, loading, execute } = useQuery(GET_LEADERBOARD);

  useEffect(() => {
    execute();
  }, []);

  const entries = data?.entries || [];
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        {topThree.length > 0 && (
          <View style={styles.podium}>
            {topThree.map((entry: any, i: number) => (
              <View
                key={entry.userId}
                style={[
                  styles.podiumItem,
                  i === 0 && styles.podiumFirst,
                ]}
              >
                <View
                  style={[
                    styles.podiumAvatar,
                    { borderColor: PODIUM_COLORS[i] },
                  ]}
                >
                  <Text style={styles.podiumAvatarText}>
                    {(entry.name || entry.email || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.podiumRank}>#{i + 1}</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {entry.name || entry.email}
                </Text>
                <Text style={[styles.podiumPoints, { color: PODIUM_COLORS[i] }]}>
                  {entry.totalPoints} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        {rest.map((entry: any, i: number) => (
          <View key={entry.userId} style={styles.leaderRow}>
            <Text style={styles.leaderRank}>#{i + 4}</Text>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>
                {entry.name || entry.email}
              </Text>
              <Text style={styles.leaderQuests}>
                {entry.questsCompleted} quests completed
              </Text>
            </View>
            <Text style={styles.leaderPoints}>{entry.totalPoints}</Text>
          </View>
        ))}

        {entries.length === 0 && (
          <Text style={styles.empty}>No rankings yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: { color: '#a78bfa', fontSize: 16 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
  },
  podiumFirst: {
    marginTop: -10,
    paddingTop: 24,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  podiumAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  podiumRank: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  podiumName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  leaderRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    width: 40,
  },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  leaderQuests: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  leaderPoints: { fontSize: 18, fontWeight: '700', color: '#10b981' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
