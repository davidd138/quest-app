import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, COMPLETE_STAGE } from '../hooks/useGraphQL';
import { useRealtimeVoice } from '../hooks/useRealtimeVoice';
import AudioVisualizer from '../components/AudioVisualizer';

type Props = { route: any; navigation: any };

export default function VoiceChatScreen({ route, navigation }: Props) {
  const { quest, userQuestId, stageIndex, character } = route.params;
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const timerStartedRef = useRef(false);
  const transcriptScrollRef = useRef<ScrollView>(null);

  const completeStage = useMutation(COMPLETE_STAGE);
  const { state, transcript, connect, disconnect } = useRealtimeVoice(character);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const isActive = state === 'connected' || state === 'speaking' || state === 'listening';
    if (isActive && !timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
  }, [state]);

  useEffect(() => {
    transcriptScrollRef.current?.scrollToEnd({ animated: true });
  }, [transcript]);

  const handleDisconnect = useCallback(async () => {
    disconnect();
    if (timerRef.current) clearInterval(timerRef.current);

    if (userQuestId) {
      try {
        const stages = quest?.stages || [];
        const currentStage = stages[stageIndex];
        await completeStage.execute({
          input: {
            userQuestId,
            stageId: currentStage?.id,
            transcript: JSON.stringify(transcript),
            duration: elapsed,
          },
        });
      } catch (e) {
        console.error('Failed to complete stage:', e);
      }
    }

    navigation.goBack();
  }, [userQuestId, elapsed, transcript, disconnect, navigation, quest, stageIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stateLabel =
    state === 'connecting'
      ? 'Connecting...'
      : state === 'listening'
      ? 'Listening...'
      : state === 'speaking'
      ? 'Speaking...'
      : state === 'connected'
      ? 'Connected'
      : state === 'error'
      ? 'Connection Error'
      : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterRole}>{character.role}</Text>
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          <Text style={[styles.stateLabel, state === 'error' && styles.errorLabel]}>
            {stateLabel}
          </Text>

          {(state === 'listening' || state === 'speaking') && (
            <AudioVisualizer isActive={state === 'speaking'} />
          )}

          {state === 'error' && (
            <TouchableOpacity style={styles.retryButton} onPress={connect}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>

        {transcript.length > 0 && (
          <ScrollView
            ref={transcriptScrollRef}
            style={styles.transcriptContainer}
            contentContainerStyle={styles.transcriptContent}
          >
            {transcript.map((entry, index) => (
              <View
                key={index}
                style={[
                  styles.transcriptEntry,
                  entry.role === 'user'
                    ? styles.transcriptUser
                    : styles.transcriptAssistant,
                ]}
              >
                <Text style={styles.transcriptRole}>
                  {entry.role === 'user' ? 'You' : character.name}
                </Text>
                <Text style={styles.transcriptText}>{entry.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  characterName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  characterRole: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  centerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  stateLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  errorLabel: {
    color: '#ef4444',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  transcriptContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    maxHeight: 200,
  },
  transcriptContent: {
    padding: 12,
  },
  transcriptEntry: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  transcriptUser: {
    backgroundColor: '#312e81',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  transcriptAssistant: {
    backgroundColor: '#1a2332',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  transcriptRole: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
