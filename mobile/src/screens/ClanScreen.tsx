import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------- Types ----------

interface ClanMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  points: number;
}

interface Clan {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  totalPoints: number;
  isJoined: boolean;
  members: ClanMember[];
  tag: string;
}

// ---------- Mock Data ----------

const MOCK_CLANS: Clan[] = [
  {
    id: 'c1',
    name: 'Shadow Seekers',
    description: 'Elite group of mystery quest enthusiasts exploring the darkest secrets.',
    memberCount: 24,
    maxMembers: 30,
    totalPoints: 45200,
    isJoined: true,
    tag: 'SSK',
    members: [
      { id: 'm1', name: 'Carlos Ruiz', role: 'leader', points: 8500 },
      { id: 'm2', name: 'Ana Torres', role: 'officer', points: 6200 },
      { id: 'm3', name: 'Pablo Garcia', role: 'member', points: 4100 },
      { id: 'm4', name: 'Maria Lopez', role: 'member', points: 3800 },
    ],
  },
  {
    id: 'c2',
    name: 'Dragon Explorers',
    description: 'Adventure lovers who conquer every quest that comes their way.',
    memberCount: 18,
    maxMembers: 25,
    totalPoints: 38700,
    isJoined: false,
    tag: 'DRX',
    members: [
      { id: 'm5', name: 'Luis Fernandez', role: 'leader', points: 9200 },
      { id: 'm6', name: 'Sofia Martinez', role: 'officer', points: 5800 },
      { id: 'm7', name: 'Diego Sanchez', role: 'member', points: 3400 },
    ],
  },
  {
    id: 'c3',
    name: 'Culture Vultures',
    description: 'Passionate about cultural heritage and historical quests.',
    memberCount: 12,
    maxMembers: 20,
    totalPoints: 22100,
    isJoined: false,
    tag: 'CVT',
    members: [
      { id: 'm8', name: 'Elena Diaz', role: 'leader', points: 7100 },
      { id: 'm9', name: 'Miguel Ramos', role: 'member', points: 4500 },
    ],
  },
  {
    id: 'c4',
    name: 'Night Owls',
    description: 'We quest when the sun goes down. Nocturnal adventurers unite!',
    memberCount: 28,
    maxMembers: 30,
    totalPoints: 51800,
    isJoined: false,
    tag: 'NWL',
    members: [
      { id: 'm10', name: 'Lucia Vega', role: 'leader', points: 10200 },
      { id: 'm11', name: 'Javier Ortiz', role: 'officer', points: 7600 },
    ],
  },
];

// ---------- Component ----------

type Props = { navigation: any };

const ROLE_COLORS: Record<string, string> = {
  leader: '#fbbf24',
  officer: '#a78bfa',
  member: '#94a3b8',
};

export default function ClanScreen({ navigation }: Props) {
  const [clans, setClans] = useState(MOCK_CLANS);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClans = clans.filter((c) =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleJoin = (clanId: string) => {
    const clan = clans.find((c) => c.id === clanId);
    if (!clan) return;

    if (clan.memberCount >= clan.maxMembers) {
      Alert.alert('Clan Full', 'This clan has reached its maximum member capacity.');
      return;
    }

    Alert.alert('Join Clan', `Do you want to join "${clan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join',
        onPress: () => {
          setClans((prev) =>
            prev.map((c) =>
              c.id === clanId
                ? { ...c, isJoined: true, memberCount: c.memberCount + 1 }
                : c,
            ),
          );
          if (selectedClan?.id === clanId) {
            setSelectedClan((prev) =>
              prev ? { ...prev, isJoined: true, memberCount: prev.memberCount + 1 } : null,
            );
          }
        },
      },
    ]);
  };

  const handleLeave = (clanId: string) => {
    Alert.alert('Leave Clan', 'Are you sure you want to leave this clan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          setClans((prev) =>
            prev.map((c) =>
              c.id === clanId
                ? { ...c, isJoined: false, memberCount: c.memberCount - 1 }
                : c,
            ),
          );
          if (selectedClan?.id === clanId) {
            setSelectedClan((prev) =>
              prev ? { ...prev, isJoined: false, memberCount: prev.memberCount - 1 } : null,
            );
          }
        },
      },
    ]);
  };

  // ---------- Clan Detail View ----------

  if (selectedClan) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setSelectedClan(null)}>
              <Text style={styles.backButton}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedClan.name}</Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>[{selectedClan.tag}]</Text>
            </View>
          </View>

          {/* Clan Info */}
          <View style={styles.detailInfo}>
            <Text style={styles.detailDesc}>{selectedClan.description}</Text>
            <View style={styles.detailStats}>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatValue}>{selectedClan.memberCount}/{selectedClan.maxMembers}</Text>
                <Text style={styles.detailStatLabel}>Members</Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatValue}>{selectedClan.totalPoints.toLocaleString()}</Text>
                <Text style={styles.detailStatLabel}>Total Points</Text>
              </View>
            </View>
          </View>

          {/* Join/Leave Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              selectedClan.isJoined && styles.actionButtonLeave,
            ]}
            onPress={() =>
              selectedClan.isJoined
                ? handleLeave(selectedClan.id)
                : handleJoin(selectedClan.id)
            }
          >
            <Text
              style={[
                styles.actionButtonText,
                selectedClan.isJoined && styles.actionButtonTextLeave,
              ]}
            >
              {selectedClan.isJoined ? 'Leave Clan' : 'Join Clan'}
            </Text>
          </TouchableOpacity>

          {/* Members */}
          <Text style={styles.membersTitle}>Members</Text>
          <FlatList
            data={selectedClan.members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={[styles.memberRole, { color: ROLE_COLORS[item.role] }]}>
                    {item.role}
                  </Text>
                </View>
                <Text style={styles.memberPoints}>{item.points.toLocaleString()} pts</Text>
              </View>
            )}
          />

          {/* Clan Chat Placeholder */}
          <View style={styles.chatPlaceholder}>
            <Text style={styles.chatPlaceholderTitle}>Clan Chat</Text>
            <Text style={styles.chatPlaceholderText}>
              Chat feature coming soon! Stay tuned for real-time messaging with your clan.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Clan List View ----------

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Clans</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clans..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Clan List */}
        <FlatList
          data={filteredClans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.clanCard}
              onPress={() => setSelectedClan(item)}
            >
              <View style={styles.clanHeader}>
                <View style={styles.clanTitleRow}>
                  <Text style={styles.clanName}>{item.name}</Text>
                  <View style={styles.tagBadgeSmall}>
                    <Text style={styles.tagTextSmall}>[{item.tag}]</Text>
                  </View>
                </View>
                {item.isJoined && (
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedText}>Joined</Text>
                  </View>
                )}
              </View>
              <Text style={styles.clanDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.clanFooter}>
                <Text style={styles.clanStat}>
                  {item.memberCount}/{item.maxMembers} members
                </Text>
                <Text style={styles.clanStat}>
                  {item.totalPoints.toLocaleString()} pts
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No clans found</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  clanCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  clanName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  tagBadgeSmall: {
    backgroundColor: '#312e81',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagTextSmall: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '600',
  },
  joinedBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  joinedText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  clanDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 12,
  },
  clanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  clanStat: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },

  // ---------- Detail View ----------
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    color: '#7c3aed',
    fontSize: 20,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  tagBadge: {
    backgroundColor: '#312e81',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
  },
  detailInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  detailDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailStats: {
    flexDirection: 'row',
    gap: 12,
  },
  detailStat: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionButton: {
    marginHorizontal: 20,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonLeave: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextLeave: {
    color: '#ef4444',
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a78bfa',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  memberPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  chatPlaceholder: {
    margin: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  chatPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  chatPlaceholderText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
