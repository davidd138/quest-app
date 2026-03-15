import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, LIST_QUESTS } from '../hooks/useGraphQL';
import QuestCard from '../components/QuestCard';

const CATEGORIES = ['All', 'Adventure', 'Mystery', 'History', 'Nature', 'Culture'];

type Props = { navigation: any };

export default function QuestsScreen({ navigation }: Props) {
  const { data, loading, execute } = useQuery(LIST_QUESTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    execute();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await execute();
    } catch {}
    setRefreshing(false);
  }, [execute]);

  const quests = (data || []).filter(
    (q: any) => selectedCategory === 'All' || q.category === selectedCategory
  );

  const renderItem = ({ item }: { item: any }) => (
    <QuestCard
      quest={item}
      onPress={() => navigation.navigate('QuestDetail', { questId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Quest Catalog</Text>

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        <FlatList
          data={quests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
            />
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.empty}>No quests available</Text>
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
  categoryList: {
    maxHeight: 44,
    marginBottom: 12,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  list: { padding: 20, paddingBottom: 40 },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
