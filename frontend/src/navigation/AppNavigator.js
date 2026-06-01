import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { authStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = authStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? <Stack.Screen name="Auth" component={AuthStack} /> : <Stack.Screen name="Main" component={MainTabs} />}
    </Stack.Navigator>
  );
}
