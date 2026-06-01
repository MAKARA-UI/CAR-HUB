import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';

export default function RequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { driverRequests, fetchDriverRequests, updateBookingStatus, isLoading } = bookingStore();

  useEffect(() => {
    fetchDriverRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverRequests();
    setRefreshing(false);
  };

  const handleAccept = async (bookingId) => {
    await updateBookingStatus(bookingId, 'ACCEPTED');
    await fetchDriverRequests();
  };

  const handleReject = async (bookingId) => {
    await updateBookingStatus(bookingId, 'REJECTED');
    await fetchDriverRequests();
  };

  const pendingRequests = driverRequests.filter((b) => b.status === 'PENDING');
  const confirmedRequests = driverRequests.filter((b) => b.status === 'ACCEPTED');
  const rejectedRequests = driverRequests.filter((b) => b.status === 'REJECTED');

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Approve, reject, and track every customer booking by status.</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingRequests.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showActions
                onAccept={() => handleAccept(booking.id)}
                onReject={() => handleReject(booking.id)}
              />
            ))}
          </View>
        )}

        {confirmedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmed Bookings</Text>
            {confirmedRequests.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </View>
        )}

        {rejectedRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejected Bookings</Text>
            {rejectedRequests.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </View>
        )}

        {driverRequests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Customer booking requests will appear here with their current status.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayDark,
    textAlign: 'center',
    lineHeight: 20,
  },
});
