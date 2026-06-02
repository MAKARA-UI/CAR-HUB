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
  const selectedFilterLabel =
    BOOKING_FILTERS.find((filter) => filter.id === selectedBookingFilter)?.label || 'Bookings';

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      {/* ── Teal header ── */}
      <View style={styles.header}>
        {/* decorative circles */}
        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />

        <Text style={styles.subtitle}>Manage your trips</Text>
        <Text style={styles.title}>Bookings</Text>

        {/* filter tabs live inside the header */}
        <View style={styles.filterTabs}>
          {BOOKING_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedBookingFilter === filter.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedBookingFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedBookingFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.emptyTitle}>
              No {selectedFilterLabel.toLowerCase()} bookings
            </Text>
            <Text style={styles.emptyText}>
              Bookings with this status will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ef',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
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
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d7f4ec',
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 14,
  },

  // ── Filter tabs (inside header) ─────────────────────────
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterTabActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  filterTextActive: {
    color: '#085041',
  },

  // ── Scroll body ─────────────────────────────────────────
  listContent: {
    paddingTop: 14,
    paddingHorizontal: 15,
    paddingBottom: SAFE_SCROLL_PADDING_BOTTOM,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#888780',
    marginBottom: 10,
  },

  // ── Empty state ──────────────────────────────────────────
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