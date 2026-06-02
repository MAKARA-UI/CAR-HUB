import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { profileAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = authStore();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      if (response.success) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  const isDriver = profile?.role === 'driver';
  const menuItems = [
    { id: 'editProfile', title: 'Edit Profile', icon: 'person', action: () => navigateTo('Settings', { section: 'profile' }) },
    ...(isDriver ? [
      { id: 'myVehicles', title: 'My Vehicles', icon: 'directions-car', action: () => navigateTo('MyVehicles') },
      { id: 'paymentMethods', title: 'Payment Methods', icon: 'credit-card', action: () => navigateTo('PaymentMethods') },
    ] : []),
    { id: 'notifications', title: 'Notifications', icon: 'notifications', action: () => navigateTo('Notifications') },
    { id: 'privacyPolicy', title: 'Privacy Policy', icon: 'policy', action: () => navigateTo('PrivacyPolicy') },
    { id: 'aboutUs', title: 'About Us', icon: 'info', action: () => navigateTo('AboutUs') },
    { id: 'logout', title: 'Logout', icon: 'exit-to-app', action: handleLogout },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'D'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{profile?.name || 'Driver Name'}</Text>
          <Text style={styles.email}>{profile?.email || 'driver@example.com'}</Text>
          <Text style={styles.subtitle}>{profile?.role === 'driver' ? 'Driver Profile' : 'User Profile'}</Text>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, item.id === 'logout' && styles.logoutItem]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuRow}>
                <View style={[styles.iconCircle, item.id === 'logout' && styles.logoutIconCircle]}>
                  <Icon name={item.icon} size={22} color={item.id === 'logout' ? COLORS.error : COLORS.primary} />
                </View>
                <Text style={[styles.menuText, item.id === 'logout' && styles.logoutMenuText]}>{item.title}</Text>
              </View>
              {item.id !== 'logout' && <Icon name="chevron-right" size={24} color={COLORS.grayDark} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContainer: {
    paddingBottom: SAFE_SCROLL_PADDING_BOTTOM,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    marginBottom: 16,
    width: 96,
    height: 96,
    maxWidth: 96,
    maxHeight: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    backgroundColor: COLORS.grayLight,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  email: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  menuCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconCircle: {
    backgroundColor: COLORS.error + '12',
  },
  menuText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  logoutText: {
    color: COLORS.error,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
});
