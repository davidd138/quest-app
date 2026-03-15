import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------- Types ----------

type RewardCategory = 'all' | 'avatars' | 'themes' | 'titles' | 'badges' | 'hints';
type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Reward {
  id: string;
  name: string;
  description: string;
  category: Exclude<RewardCategory, 'all'>;
  rarity: RewardRarity;
  cost: number;
  owned: boolean;
}

// ---------- Mock Data ----------

const CATEGORIES: { key: RewardCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'avatars', label: 'Avatars' },
  { key: 'themes', label: 'Themes' },
  { key: 'titles', label: 'Titles' },
  { key: 'badges', label: 'Badges' },
  { key: 'hints', label: 'Hints' },
];

const RARITY_COLORS: Record<RewardRarity, string> = {
  common: '#94a3b8',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', name: 'Dragon Rider', description: 'Epic dragon avatar', category: 'avatars', rarity: 'epic', cost: 2500, owned: false },
  { id: 'r2', name: 'Shadow Explorer', description: 'Mysterious shadow avatar', category: 'avatars', rarity: 'rare', cost: 1200, owned: true },
  { id: 'r3', name: 'Golden Knight', description: 'Legendary golden knight', category: 'avatars', rarity: 'legendary', cost: 5000, owned: false },
  { id: 'r4', name: 'Neon Cyberpunk', description: 'Neon futuristic theme', category: 'themes', rarity: 'epic', cost: 3000, owned: false },
  { id: 'r5', name: 'Midnight Ocean', description: 'Deep ocean theme', category: 'themes', rarity: 'rare', cost: 1500, owned: false },
  { id: 'r6', name: 'Quest Master', description: 'Expert title', category: 'titles', rarity: 'legendary', cost: 8000, owned: false },
  { id: 'r7', name: 'Night Explorer', description: 'Nocturnal adventurer title', category: 'titles', rarity: 'rare', cost: 1800, owned: false },
  { id: 'r8', name: 'Gold Star', description: 'Badge of excellence', category: 'badges', rarity: 'epic', cost: 2000, owned: false },
  { id: 'r9', name: 'Fire Shield', description: 'Fiery power badge', category: 'badges', rarity: 'rare', cost: 1000, owned: true },
  { id: 'r10', name: 'Hint Pack x5', description: '5 hints for tough quests', category: 'hints', rarity: 'common', cost: 200, owned: false },
  { id: 'r11', name: 'Hint Pack x15', description: '15 hints at a discount', category: 'hints', rarity: 'rare', cost: 500, owned: false },
  { id: 'r12', name: 'Forest Sprite', description: 'Enchanted forest avatar', category: 'avatars', rarity: 'common', cost: 500, owned: true },
];

// ---------- Component ----------

type Props = { navigation: any };

export default function RewardsScreen({ navigation }: Props) {
  const [points] = useState(4850);
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('all');
  const [rewards, setRewards] = useState(INITIAL_REWARDS);

  const filteredRewards = rewards.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const handlePurchase = useCallback(
    (reward: Reward) => {
      if (reward.owned) {
        Alert.alert('Already Owned', 'You already own this reward.');
        return;
      }
      if (points < reward.cost) {
        Alert.alert('Not Enough Points', `You need ${reward.cost - points} more points to unlock this reward.`);
        return;
      }

      Alert.alert(
        'Unlock Reward',
        `Spend ${reward.cost} points to unlock "${reward.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            onPress: () => {
              setRewards((prev) =>
                prev.map((r) => (r.id === reward.id ? { ...r, owned: true } : r)),
              );
            },
          },
        ],
      );
    },
    [points],
  );

  const renderReward = ({ item }: { item: Reward }) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View
          style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[item.rarity] }]}
        />
        <Text style={[styles.rarityText, { color: RARITY_COLORS[item.rarity] }]}>
          {item.rarity}
        </Text>
        {item.owned && (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>Owned</Text>
          </View>
        )}
      </View>

      <Text style={styles.rewardName}>{item.name}</Text>
      <Text style={styles.rewardDesc}>{item.description}</Text>

      <View style={styles.rewardFooter}>
        <Text style={styles.costText}>{item.cost} pts</Text>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            item.owned && styles.purchaseButtonOwned,
            !item.owned && points < item.cost && styles.purchaseButtonDisabled,
          ]}
          onPress={() => handlePurchase(item)}
          disabled={item.owned}
        >
          <Text
            style={[
              styles.purchaseButtonText,
              item.owned && styles.purchaseButtonTextOwned,
            ]}
          >
            {item.owned ? 'Owned' : 'Unlock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Points Balance Header */}
        <View style={styles.balanceHeader}>
          <Text style={styles.title}>Rewards</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceValue}>{points.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* Category Filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.key && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Rewards List */}
        <FlatList
          data={filteredRewards}
          renderItem={renderReward}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <Text style={styles.empty}>No rewards in this category</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  balanceContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a78bfa',
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
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  ownedBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownedText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '600',
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  rewardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 16,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
  },
  purchaseButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  purchaseButtonOwned: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#334155',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  purchaseButtonTextOwned: {
    color: '#94a3b8',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
