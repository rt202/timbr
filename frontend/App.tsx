import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from './src/screens/AuthScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import AgentProfileScreen from './src/screens/AgentProfileScreen';
import HouseDetailScreen from './src/screens/HouseDetailScreen';
import LoadingScreen from './src/components/LoadingScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Swipe') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Preferences') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} options={{ title: 'Houses' }} />
      <Tab.Screen name="Preferences" component={PreferencesScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading, loadingMessage } = useAuth();

  if (loading) {
    try {
      return <LoadingScreen message={loadingMessage} />;
    } catch (error) {
      // Fallback loading screen
      return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B8860B', fontSize: 24, marginBottom: 20 }}>🏛️ timbr</Text>
          <Text style={{ color: '#FDF5E6', fontSize: 16 }}>{loadingMessage}</Text>
        </View>
      );
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : user.role === 'BUYER' ? (
          <>
            <Stack.Screen name="BuyerTabs" component={BuyerTabs} options={{ headerShown: false }} />
            <Stack.Screen name="HouseDetail" component={HouseDetailScreen} options={{ title: 'House Details' }} />
            <Stack.Screen name="AgentProfile" component={AgentProfileScreen} options={{ title: 'Agent' }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
