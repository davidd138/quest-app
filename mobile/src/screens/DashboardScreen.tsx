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
import { useQuery, GET_ANALYTICS, LIST_USER_QUESTS } from '../hooks/useGraphQL';

type Props = {
  navigation: any;
  userName: string | null;
};

export default function DashboardScreen({ navigation, userName }: Props) {
  const analytics = useQuery(GET_ANALYTICS);
  const userQuests = useQuery(LIST_USER_QUESTS);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      analytics.execute();
      userQuests.execute({ limit: 5 });
    });
    return unsubscribe;
  }, [navigation]);

  const stats = analytics.data;
  const activeQuests = (userQuests.data?.items || []).filter(
    (q: any) => q.status === 'in_progress'
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>
          Welcome, {userName || 'Adventurer'}
        </Text>

        {analytics.loading ? (
          <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard
                label="Points"
                value={stats?.totalPoints ?? 0}
                color="#7c3aed"
              />
              <StatCard
                label="Completed"
                value={stats?.questsCompleted ?? 0}
                color="#10b981"
              />
              <StatCard
                label="Play Time"
                value={stats?.totalPlayTime ? `${Math.round(stats.totalPlayTime / 60)}m` : '0m'}
                color="#f59e0b"
              />
            </View>

            {activeQuests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Active Quests</Text>
                {activeQuests.map((quest: any) => (
                  <TouchableOpacity
                    key={quest.id}
                    style={styles.questCard}
                    onPress={() =>
                      navigation.navigate('QuestDetail', { questId: quest.questId, userQuestId: quest.id })
                    }
                  >
                    <View style={styles.questInfo}>
                      <Text style={styles.questName}>{quest.questTitle}</Text>
                      <Text style={styles.questProgress}>
                        Stage {quest.currentStage} / {quest.totalStages}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${(quest.currentStage / quest.totalStages) * 100}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Quests')}
            >
              <Text style={styles.exploreButtonText}>Explore Quests</Text>
            </TouchableOpacity>

            {stats?.achievements?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recent Achievements</Text>
                {stats.achievements.slice(0, 3).map((a: any) => (
                  <View key={a.id} style={styles.achievementCard}>
                    <Text style={styles.achievementIcon}>{a.icon || '\u2605'}</Text>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementTitle}>{a.title}</Text>
                      <Text style={styles.achievementDesc}>{a.description}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
  },
  questCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  questInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questName: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
  questProgress: { fontSize: 12, color: '#94a3b8' },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  exploreButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  achievementCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  achievementDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
