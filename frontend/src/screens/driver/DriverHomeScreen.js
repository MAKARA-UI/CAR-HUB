import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { profileAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';

export default function DriverHomeScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { driverRequests, fetchDriverRequests, updateBookingStatus } = bookingStore();

  useFocusEffect(
    useCallback(() => {
      fetchData();
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

  const handleAccept = async (bookingId) => {
    const result = await updateBookingStatus(bookingId, 'ACCEPTED');
    if (result.success) {
      await fetchDriverRequests();
    }
  };

  const handleReject = async (bookingId) => {
    const result = await updateBookingStatus(bookingId, 'REJECTED');
    if (result.success) {
      await fetchDriverRequests();
    }
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const pendingRequests = driverRequests.filter((b) => b.status === 'PENDING');
  const activeBookings = driverRequests.filter((b) => b.status === 'ACCEPTED');

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.sectionTitle}>Pending Requests</Text>
        {pendingRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          pendingRequests.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              showActions
              onAccept={() => handleAccept(booking.id)}
              onReject={() => handleReject(booking.id)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confirmed Bookings</Text>
        {activeBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="directions-car" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No confirmed bookings</Text>
          </View>
        ) : (
          activeBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddVehicle}>
        <Icon name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.grayDark,
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
