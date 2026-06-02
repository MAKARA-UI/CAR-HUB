import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { authStore } from '../store/authStore';
import { COLORS } from '../utils/constants';

import HomeScreen from '../screens/customer/HomeScreen';
import VehicleDetailScreen from '../screens/customer/VehicleDetailScreen';
import FilterScreen from '../screens/customer/FilterScreen';
import BookingFormScreen from '../screens/customer/BookingFormScreen';
import MyTripsScreen from '../screens/customer/MyTripsScreen';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import RequestsScreen from '../screens/driver/RequestsScreen';
import AddVehicleScreen from '../screens/driver/AddVehicleScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import MyVehiclesScreen from '../screens/profile/MyVehiclesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/profile/AboutUsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="HomeScreen" component={HomeScreen} /><Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} /><Stack.Screen name="Filter" component={FilterScreen} /><Stack.Screen name="BookingForm" component={BookingFormScreen} /></Stack.Navigator>;
}
function BookingsStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="MyTripsScreen" component={MyTripsScreen} /></Stack.Navigator>;
}
function DriverBookingsStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="RequestsScreen" component={RequestsScreen} /></Stack.Navigator>;
}
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MyVehicles" component={MyVehiclesScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}
function DriverHomeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="DriverHome" component={DriverHomeScreen} /><Stack.Screen name="Requests" component={RequestsScreen} /><Stack.Screen name="AddVehicle" component={AddVehicleScreen} /><Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} /></Stack.Navigator>;
}

export default function MainTabs() {
  const { user } = authStore();
  const insets = useSafeAreaInsets();
  const isDriver = user?.role === 'driver';

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Bookings') iconName = 'event-note';
        else if (route.name === 'Profile') iconName = 'person';
        else if (route.name === 'Driver') iconName = 'local-taxi';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.grayDark,
      headerShown: false,
      tabBarStyle: { height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom, paddingTop: 8 },
    })}>
      {isDriver ? <Tab.Screen name="Driver" component={DriverHomeStack} /> : <Tab.Screen name="Home" component={HomeStack} />}
      <Tab.Screen name="Bookings" component={isDriver ? DriverBookingsStack : BookingsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
