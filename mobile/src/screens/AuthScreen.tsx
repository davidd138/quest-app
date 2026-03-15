import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

type Props = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onConfirm: (code: string) => Promise<void>;
  error: string | null;
};

export default function AuthScreen({ onSignIn, onSignUp, onConfirm, error }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'confirm'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'confirm') {
      if (!confirmCode) return;
      setLoading(true);
      try {
        await onConfirm(confirmCode);
      } catch {
        // error handled by parent
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await onSignIn(email, password);
      } else {
        if (!name) return;
        await onSignUp(email, password, name);
        setMode('confirm');
      }
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>QuestMaster</Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to your account'
            : mode === 'register'
            ? 'Create your account'
            : 'Enter confirmation code'}
        </Text>

        {mode === 'confirm' ? (
          <TextInput
            style={styles.input}
            placeholder="Confirmation code"
            placeholderTextColor="#64748b"
            value={confirmCode}
            onChangeText={setConfirmCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        ) : (
          <>
            {mode === 'register' && (
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Sign Up'
                : 'Confirm'}
            </Text>
          )}
        </TouchableOpacity>

        {mode !== 'confirm' && (
          <TouchableOpacity
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggle: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#a78bfa',
    fontSize: 14,
  },
});
