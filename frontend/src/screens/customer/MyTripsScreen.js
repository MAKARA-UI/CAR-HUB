import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

const BOOKING_FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Confirmed' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function MyTripsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedBookingFilter, setSelectedBookingFilter] = useState('PENDING');
  const { bookings, fetchMyBookings, updateBookingStatus, addReview, isLoading } = bookingStore();

  useFocusEffect(useCallback(() => { fetchMyBookings(); }, []));

  const onRefresh = async () => { setRefreshing(true); await fetchMyBookings(); setRefreshing(false); };
  const handleCancel = async (bookingId) => { const result = await updateBookingStatus(bookingId, 'CANCELLED'); if (result.success) await fetchMyBookings(); };
  const handleReview = (booking) => { setSelectedBooking(booking); setShowReviewModal(true); };
  const submitReview = async () => {
    if (!selectedBooking) return;
    const result = await addReview(selectedBooking.id, rating, reviewText);
    if (result.success) {
      setShowReviewModal(false);
      setRating(5);
      setReviewText('');
      setSelectedBooking(null);
      await fetchMyBookings();
      return;
    }
    Alert.alert('Review Failed', result.error || 'Please try again.');
  };

  const filteredBookings = bookings.filter((b) => b.status === selectedBookingFilter);
  const selectedFilterLabel = BOOKING_FILTERS.find((filter) => filter.id === selectedBookingFilter)?.label || 'Bookings';

  if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Bookings</Text>
          <Text style={styles.screenSubtitle}>Track each request by pending, confirmed, rejected, cancelled, or completed status.</Text>
        </View>

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
                onPress={() => navigation.navigate('BookingDetail', { booking })}
                onCancel={booking.status === 'PENDING' ? () => handleCancel(booking.id) : undefined}
                onReview={() => booking.status === 'COMPLETED' && !booking.hasReview && handleReview(booking)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyTitle}>No {selectedFilterLabel.toLowerCase()} bookings</Text>
            <Text style={styles.emptyText}>Bookings with this status will appear here.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Booking</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Icon name={star <= rating ? 'star' : 'star-border'} size={40} color={star <= rating ? COLORS.warning : COLORS.grayLight} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" variant="outline" onPress={() => setShowReviewModal(false)} style={styles.modalButton} />
              <Button title="Submit" onPress={submitReview} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  scrollContent: { paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
  screenSubtitle: { fontSize: 14, color: COLORS.grayDark, marginTop: 6, lineHeight: 20 },
  filterTabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grayLight },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.grayDark, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 12, paddingHorizontal: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.grayDark, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  emptyButton: { width: 200 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, textAlign: 'center', marginBottom: 20 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  reviewInput: { borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.black, textAlignVertical: 'top', minHeight: 100, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1 },
});
