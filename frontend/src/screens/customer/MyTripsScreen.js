import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';

export default function MyTripsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { bookings, fetchMyBookings, updateBookingStatus, isLoading } = bookingStore();

  useFocusEffect(useCallback(() => { fetchMyBookings(); }, []));

  const onRefresh = async () => { setRefreshing(true); await fetchMyBookings(); setRefreshing(false); };
  const handleCancel = async (bookingId) => { const result = await updateBookingStatus(bookingId, 'CANCELLED'); if (result.success) await fetchMyBookings(); };
  const handleReview = (booking) => { setSelectedBooking(booking); setShowReviewModal(true); };
  const submitReview = async () => { if (!selectedBooking) return; const result = await updateBookingStatus(selectedBooking.id, 'COMPLETED', { rating, reviewText }); if (result.success) { setShowReviewModal(false); setRating(5); setReviewText(''); await fetchMyBookings(); } };

  const active = bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status));
  const completed = bookings.filter((b) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status));

  if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Bookings</Text>
          <Text style={styles.screenSubtitle}>Track each request by pending, confirmed, rejected, cancelled, or completed status.</Text>
        </View>

        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending & Confirmed</Text>
            {active.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => navigation.navigate('BookingDetail', { booking })}
                onCancel={() => handleCancel(booking.id)}
              />
            ))}
          </View>
        )}

        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Statuses</Text>
            {completed.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => navigation.navigate('BookingDetail', { booking })}
                onReview={() => booking.status === 'COMPLETED' && !booking.hasReview && handleReview(booking)}
              />
            ))}
          </View>
        )}

        {bookings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyText}>Your booking requests will appear here once you choose a vehicle.</Text>
            <Button title="Book a Ride" onPress={() => navigation.navigate('Home')} style={styles.emptyButton} />
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
  scrollContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
  screenSubtitle: { fontSize: 14, color: COLORS.grayDark, marginTop: 6, lineHeight: 20 },
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
