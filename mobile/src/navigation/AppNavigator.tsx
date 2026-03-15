import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import QuestsScreen from '../screens/QuestsScreen';
import QuestDetailScreen from '../screens/QuestDetailScreen';
import QuestPlayScreen from '../screens/QuestPlayScreen';
import VoiceChatScreen from '../screens/VoiceChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? '#7c3aed' : '#64748b', fontSize: 20 }}>
      {label}
    </Text>
  );
}

function MainTabs({ user }: { user: any }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen
        name="Quests"
        options={{
          tabBarLabel: 'Quests',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u2316'} focused={focused} />,
        }}
      >
        {(props) => <QuestsScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="MapTab"
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u25C9'} focused={focused} />,
        }}
      >
        {(props) => (
          <DashboardScreen {...props} userName={user?.name} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u29D6'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AchievementsTab"
        component={AchievementsScreen}
        options={{
          tabBarLabel: 'Trophies',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u2605'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u2662'} focused={focused} />,
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user }: { user: any }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main">
        {() => <MainTabs user={user} />}
      </Stack.Screen>
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
      <Stack.Screen name="QuestPlay" component={QuestPlayScreen} />
      <Stack.Screen
        name="VoiceChat"
        component={VoiceChatScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}
