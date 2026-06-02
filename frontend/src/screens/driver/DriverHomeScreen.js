import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { authStore } from '../../store/authStore';
import { profileAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES } from '../../utils/safeArea';

export default function DriverHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = authStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { driverRequests, fetchDriverRequests } = bookingStore();

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const refreshTimer = setInterval(() => {
        fetchDriverRequests();
      }, 10000);

      return () => clearInterval(refreshTimer);
    }, [])
  );

  const fetchData = async () => {
    await Promise.all([
      fetchDriverRequests(),
      fetchMyVehicles(),
    ]);
    setLoading(false);
  };

  const fetchMyVehicles = async () => {
    try {
      const response = await profileAPI.getMyVehicles();
      if (response.success) {
        setVehicles(response.vehicles);
      }
    } catch (error) {
      console.error('Fetch vehicles error:', error);
    }
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const pendingRequests = driverRequests.filter((b) => b.status === 'PENDING');
  const activeBookings = driverRequests.filter((b) => b.status === 'ACCEPTED');
  const rejectedBookings = driverRequests.filter((b) => b.status === 'REJECTED');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.isAvailable !== false);
  const displayName = user?.name || 'Driver';
  const firstName = displayName.split(' ')[0] || displayName;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('');

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 96 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerCircleLarge} />
          <View style={styles.headerCircleSmall} />
          <View>
            <Text style={styles.greeting}>Good afternoon,</Text>
            <Text style={styles.driverName}>{firstName}</Text>
            <View style={styles.activeStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.activeText}>Online & active</Text>
            </View>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'D'}</Text>
          </View>
        </View>

        <View style={styles.dashboardBody}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{vehicles.length}</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingRequests.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activeBookings.length}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OVERVIEW</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <View style={[styles.iconBadge, styles.warningBadge]}>
                  <Icon name="notifications" size={18} color="#8a5a00" />
                </View>
                <Text style={styles.overviewNumber}>{pendingRequests.length}</Text>
                <Text style={styles.overviewLabel}>Pending approvals</Text>
              </View>
              <View style={styles.overviewCard}>
                <View style={styles.iconBadge}>
                  <Icon name="event-available" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.overviewNumber}>{activeBookings.length}</Text>
                <Text style={styles.overviewLabel}>Confirmed trips</Text>
              </View>
              <View style={styles.overviewCard}>
                <View style={styles.iconBadge}>
                  <Icon name="directions-car" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.overviewNumber}>{availableVehicles.length}</Text>
                <Text style={styles.overviewLabel}>Available vehicles</Text>
              </View>
              <View style={styles.overviewCard}>
                <View style={[styles.iconBadge, styles.errorBadge]}>
                  <Icon name="close" size={18} color={COLORS.error} />
                </View>
                <Text style={styles.overviewNumber}>{rejectedBookings.length}</Text>
                <Text style={styles.overviewLabel}>Rejected requests</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={handleAddVehicle}>
        <Icon name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ef',
  },
  scrollContent: {
    flexGrow: 1,
  },
  dashboardBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  header: {
    minHeight: 164,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerCircleLarge: {
    position: 'absolute',
    right: -28,
    top: -34,
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  headerCircleSmall: {
    position: 'absolute',
    right: 48,
    bottom: -44,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d7f4ec',
    marginBottom: 2,
  },
  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  activeStatus: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#b9f4d8',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  avatar: {
    position: 'absolute',
    top: 22,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 18,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2f302d',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#19b68d',
  },
  statLabel: {
    fontSize: 12,
    color: '#f3eee4',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#b8b5ae',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  overviewCard: {
    width: '48.5%',
    minHeight: 118,
    maxHeight: 132,
    backgroundColor: '#2f302d',
    borderRadius: 9,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#e6fbf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBadge: {
    backgroundColor: '#fff1dc',
  },
  errorBadge: {
    backgroundColor: '#ffe3e6',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 12,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#f3eee4',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
