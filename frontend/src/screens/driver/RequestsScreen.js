import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

const BOOKING_FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Confirmed' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function RequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookingFilter, setSelectedBookingFilter] = useState('PENDING');
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

  const filteredBookings = driverRequests.filter((b) => b.status === selectedBookingFilter);
  const selectedFilterLabel = BOOKING_FILTERS.find((filter) => filter.id === selectedBookingFilter)?.label || 'Bookings';

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Approve, reject, and track every customer booking by status.</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterTabs}>
          {BOOKING_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, selectedBookingFilter === filter.id && styles.filterTabActive]}
              onPress={() => setSelectedBookingFilter(filter.id)}
            >
              <Text style={[styles.filterText, selectedBookingFilter === filter.id && styles.filterTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredBookings.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedFilterLabel} Bookings</Text>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showActions={booking.status === 'PENDING'}
                onAccept={() => handleAccept(booking.id)}
                onReject={() => handleReject(booking.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No {selectedFilterLabel.toLowerCase()} bookings</Text>
            <Text style={styles.emptyText}>Bookings with this status will appear here.</Text>
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
    paddingBottom: SAFE_SCROLL_PADDING_BOTTOM,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.grayDark,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
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
