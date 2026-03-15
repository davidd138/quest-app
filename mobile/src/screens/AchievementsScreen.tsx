import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, GET_ACHIEVEMENTS } from '../hooks/useGraphQL';

type Props = { navigation: any };

export default function AchievementsScreen({ navigation }: Props) {
  const { data, loading, execute } = useQuery(GET_ACHIEVEMENTS);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      execute();
    });
    return unsubscribe;
  }, [navigation]);

  const achievements = data || [];

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        !item.earned && styles.cardLocked,
      ]}
    >
      <Text style={styles.icon}>{item.icon || '\u2605'}</Text>
      <Text style={[styles.title, !item.earned && styles.titleLocked]}>
        {item.title}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.earned && item.earnedAt && (
        <Text style={styles.earnedDate}>
          Earned {new Date(item.earnedAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      )}
      {!item.earned && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedText}>Locked</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Achievements</Text>
        <FlatList
          data={achievements}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.empty}>No achievements yet. Start questing!</Text>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLocked: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleLocked: {
    color: '#64748b',
  },
  description: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  earnedDate: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 6,
    fontWeight: '600',
  },
  lockedOverlay: {
    marginTop: 8,
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
