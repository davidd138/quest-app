import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

type Props = { navigation: any };

type Language = 'es' | 'en' | 'fr' | 'de' | 'pt';
type Theme = 'dark' | 'light' | 'system';

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'es', label: 'Espanol' },
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Francais' },
  { key: 'de', label: 'Deutsch' },
  { key: 'pt', label: 'Portugues' },
];

const THEMES: { key: Theme; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'System' },
];

export default function SettingsScreen({ navigation }: Props) {
  const { signOut } = useAuth();

  // Notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [questReminders, setQuestReminders] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(false);

  // Language
  const [language, setLanguage] = useState<Language>('es');

  // Theme
  const [theme, setTheme] = useState<Theme>('dark');

  // Voice settings
  const [autoConnectMic, setAutoConnectMic] = useState(false);
  const [voiceEffects, setVoiceEffects] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive push notifications on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDesc}>Get updates via email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Quest Reminders</Text>
              <Text style={styles.settingDesc}>Reminders for active quests</Text>
            </View>
            <Switch
              value={questReminders}
              onValueChange={setQuestReminders}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Social Notifications</Text>
              <Text style={styles.settingDesc}>Updates from friends and clans</Text>
            </View>
            <Switch
              value={socialNotifications}
              onValueChange={setSocialNotifications}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.optionGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.optionChip,
                  language === lang.key && styles.optionChipActive,
                ]}
                onPress={() => setLanguage(lang.key)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    language === lang.key && styles.optionChipTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.optionGrid}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.optionChip,
                  theme === t.key && styles.optionChipActive,
                ]}
                onPress={() => setTheme(t.key)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    theme === t.key && styles.optionChipTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-connect Microphone</Text>
              <Text style={styles.settingDesc}>Automatically enable mic in voice chats</Text>
            </View>
            <Switch
              value={autoConnectMic}
              onValueChange={setAutoConnectMic}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Voice Effects</Text>
              <Text style={styles.settingDesc}>Apply voice effects to AI characters</Text>
            </View>
            <Switch
              value={voiceEffects}
              onValueChange={setVoiceEffects}
              trackColor={{ false: '#334155', true: '#7c3aed' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.linkText}>Edit Profile</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Change Password</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Export My Data</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={handleDeleteAccount}>
            <Text style={[styles.linkText, { color: '#ef4444' }]}>Delete Account</Text>
            <Text style={[styles.linkArrow, { color: '#ef4444' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2026.03.15</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  settingDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  optionChipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#fff',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  linkArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
