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
import { useAuth } from '../hooks/useAuth';
import { useQuery, GET_ANALYTICS } from '../hooks/useGraphQL';

type Props = { navigation: any; user: any };

export default function ProfileScreen({ navigation, user }: Props) {
  const { signOut } = useAuth();
  const analytics = useQuery(GET_ANALYTICS);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      analytics.execute();
    });
    return unsubscribe;
  }, [navigation]);

  const stats = analytics.data;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Adventurer'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>

        {analytics.loading ? (
          <ActivityIndicator color="#7c3aed" style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalPoints ?? 0}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.questsCompleted ?? 0}</Text>
                <Text style={styles.statLabel}>Quests Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats?.totalPlayTime ? `${Math.round(stats.totalPlayTime / 60)}m` : '0m'}
                </Text>
                <Text style={styles.statLabel}>Play Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.averageScore ?? '-'}</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.leaderboardButton}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#312e81',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  leaderboardButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  leaderboardButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 24,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
