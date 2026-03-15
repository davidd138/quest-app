import 'react-native-get-random-values';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { configureAWS } from './src/config/aws';
import { useAuth } from './src/hooks/useAuth';
import AuthScreen from './src/screens/AuthScreen';
import AppNavigator from './src/navigation/AppNavigator';

configureAWS();

const QuestDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#7c3aed',
    background: '#0f172a',
    card: '#1e293b',
    text: '#ffffff',
    border: '#334155',
    notification: '#7c3aed',
  },
};

export default function App() {
  const { user, loading, error, signIn, signUp, confirmAccount, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={QuestDarkTheme}>
      {user ? (
        <AppNavigator user={user} />
      ) : (
        <AuthScreen
          onSignIn={signIn}
          onSignUp={signUp}
          onConfirm={confirmAccount}
          error={error}
        />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
