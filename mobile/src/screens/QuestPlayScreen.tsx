import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';

type Props = { route: any; navigation: any };

export default function QuestPlayScreen({ route, navigation }: Props) {
  const { quest, userQuestId, stageIndex } = route.params;
  const stages = quest?.stages || [];
  const currentStage = stages[stageIndex];

  if (!currentStage) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>No stage data available</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = stages.length > 0 ? (stageIndex + 1) / stages.length : 0;

  const handleStartConversation = () => {
    navigation.navigate('VoiceChat', {
      quest,
      userQuestId,
      stageIndex,
      character: {
        name: currentStage.characterName,
        role: currentStage.characterRole || 'Quest Character',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.progressText}>
            Stage {stageIndex + 1} of {stages.length}
          </Text>
        </View>

        <ProgressBar progress={progress} />

        <View style={styles.stageHeader}>
          <Text style={styles.stageTitle}>{currentStage.title}</Text>
          {currentStage.locationName && (
            <Text style={styles.stageLocation}>{currentStage.locationName}</Text>
          )}
        </View>

        <Text style={styles.stageDescription}>{currentStage.description}</Text>

        {currentStage.characterName && (
          <View style={styles.characterCard}>
            <View style={styles.characterAvatar}>
              <Text style={styles.characterAvatarText}>
                {currentStage.characterName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{currentStage.characterName}</Text>
              <Text style={styles.characterRole}>
                {currentStage.characterRole || 'Quest Character'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.conversationButton}
          onPress={handleStartConversation}
        >
          <Text style={styles.conversationButtonText}>Start Conversation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: { color: '#a78bfa', fontSize: 16 },
  progressText: { color: '#94a3b8', fontSize: 14 },
  stageHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  stageLocation: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 4,
  },
  stageDescription: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 24,
  },
  characterCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  characterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  characterAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  characterInfo: { flex: 1 },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  characterRole: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  conversationButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  conversationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
