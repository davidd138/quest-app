import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const CATEGORY_COLORS: Record<string, string> = {
  Adventure: '#7c3aed',
  Mystery: '#6366f1',
  History: '#f59e0b',
  Nature: '#10b981',
  Culture: '#ec4899',
};

type Quest = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: number;
  totalStages?: number;
  location?: string;
};

type Props = {
  quest: Quest;
  onPress: () => void;
  progress?: number;
};

export default function QuestCard({ quest, onPress, progress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {quest.title}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        {quest.difficulty && (
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
        )}
        {quest.category && (
          <View
            style={[
              styles.badge,
              { backgroundColor: CATEGORY_COLORS[quest.category] || '#334155' },
            ]}
          >
            <Text style={styles.badgeText}>{quest.category}</Text>
          </View>
        )}
      </View>

      {quest.description && (
        <Text style={styles.description} numberOfLines={2}>
          {quest.description}
        </Text>
      )}

      <View style={styles.metaRow}>
        {quest.estimatedDuration && (
          <Text style={styles.metaText}>~{quest.estimatedDuration} min</Text>
        )}
        {quest.totalStages && (
          <Text style={styles.metaText}>{quest.totalStages} stages</Text>
        )}
        {quest.location && (
          <Text style={styles.metaText}>{quest.location}</Text>
        )}
      </View>

      {progress != null && progress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressContainer: {
    marginTop: 12,
  },
});
