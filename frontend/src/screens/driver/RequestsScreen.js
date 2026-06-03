import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

const BOOKING_FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Confirmed' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function RequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookingFilter, setSelectedBookingFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearedIds, setClearedIds] = useState({ PENDING: [], ACCEPTED: [], COMPLETED: [], REJECTED: [] });

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

  const handleComplete = (bookingId) => {
    Alert.alert(
      'Mark as Completed',
      'Confirm that this trip has been completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await updateBookingStatus(bookingId, 'COMPLETED');
            await fetchDriverRequests();
          },
        },
      ]
    );
  };

  const visibleBookings = driverRequests.filter((b) => {
    if (b.status !== selectedBookingFilter) return false;
    if ((clearedIds[selectedBookingFilter] || []).includes(b.id)) return false;
    if (searchQuery.trim() === '') return true;

    const q = searchQuery.toLowerCase();
    const customerName = b.customer?.name?.toLowerCase() || '';
    const vehicleName = `${b.vehicle?.make || ''} ${b.vehicle?.model || ''}`.toLowerCase();
    return customerName.includes(q) || vehicleName.includes(q);
  });

  const selectedFilterLabel =
    BOOKING_FILTERS.find((f) => f.id === selectedBookingFilter)?.label || 'Bookings';

  const handleClearHistory = () => {
    if (visibleBookings.length === 0) return;
    Alert.alert(
      `Clear ${selectedFilterLabel} history`,
      `This will hide all ${selectedFilterLabel.toLowerCase()} bookings from your view. This does not delete them from the system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const ids = visibleBookings.map((b) => b.id);
            setClearedIds((prev) => ({
              ...prev,
              [selectedBookingFilter]: [...(prev[selectedBookingFilter] || []), ...ids],
            }));
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>

      {/* ── Teal header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />

        <Text style={styles.subtitle}>Manage your trips</Text>
        <Text style={styles.title}>Bookings</Text>

        {/* search bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer or car..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* status filter tabs */}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleBookings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{selectedFilterLabel} Bookings</Text>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
                <Icon name="delete-sweep" size={15} color="#888780" />
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {visibleBookings.map((booking) => (
              <View key={booking.id}>
                <BookingCard
                  booking={booking}
                  variant="driverDark"
                  showActions={booking.status === 'PENDING'}
                  onAccept={() => handleAccept(booking.id)}
                  onReject={() => handleReject(booking.id)}
                />
                {booking.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => handleComplete(booking.id)}
                  >
                    <Icon name="check-circle" size={16} color={COLORS.white} />
                    <Text style={styles.completeBtnText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No {selectedFilterLabel.toLowerCase()} bookings
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `No results for "${searchQuery}"`
                : 'Bookings with this status will appear here.'}
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
    paddingBottom: 20,
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

  // ── Search bar ───────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
  },

  // ── Filter tabs ─────────────────────────────────────────
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#888780',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#e4e8e5',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888780',
  },

  // ── Complete button ──────────────────────────────────────
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -4,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.success,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
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