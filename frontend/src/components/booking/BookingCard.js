import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS, BOOKING_STATUS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function BookingCard({ booking, showActions = false, onAccept, onReject, onCancel, onReview, onPress }) {
  const status = BOOKING_STATUS[booking.status] || { label: booking.status, color: COLORS.grayDark };
  const categoryLabel = SERVICE_CATEGORIES.find((item) => item.id === (booking.category || booking.vehicle?.category || 'local'))?.label || 'Local';
  const modeLabel = SERVICE_MODES.find((item) => item.id === (booking.serviceMode || booking.vehicle?.serviceMode || 'individual'))?.label || 'Private Hire';
  const canCancel = booking.status === 'PENDING';
  const canReview = booking.status === 'COMPLETED' && !booking.hasReview;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.vehicleInfo}><Text style={styles.vehicleName}>{booking.vehicle?.make} {booking.vehicle?.model}</Text><Text style={styles.vehicleType}>{modeLabel} - {categoryLabel}</Text></View>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>
      </View>
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}><Icon name="my-location" size={16} color={COLORS.primary} /><Text style={styles.locationText}>{booking.pickupLocation}</Text></View>
        <View style={styles.locationRow}><Icon name="location-on" size={16} color={COLORS.error} /><Text style={styles.locationText}>{booking.destination}</Text></View>
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}><Icon name="event" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{formatDate(booking.date, 'date')}</Text></View>
        <View style={styles.detailItem}><Icon name="access-time" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{booking.departureTime || formatDate(booking.date, 'time')}</Text></View>
        <View style={styles.priceContainer}><Text style={styles.priceLabel}>Total:</Text><Text style={styles.priceText}>{formatCurrency(booking.price)}</Text></View>
      </View>
      {booking.customer && <View style={styles.userInfo}><Icon name="person" size={14} color={COLORS.grayDark} /><Text style={styles.userName}>{booking.customer.name}</Text><View style={styles.userRating}><Icon name="star" size={12} color={COLORS.warning} /><Text style={styles.ratingText}>{booking.customer.rating?.toFixed(1) || 0}</Text></View></View>}
      {showActions && <View style={styles.actions}><TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}><Icon name="check" size={18} color={COLORS.white} /><Text style={styles.actionText}>Approve</Text></TouchableOpacity><TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}><Icon name="close" size={18} color={COLORS.white} /><Text style={styles.actionText}>Reject</Text></TouchableOpacity></View>}
      {canCancel && !showActions && <TouchableOpacity style={styles.cancelButton} onPress={onCancel}><Text style={styles.cancelText}>Cancel Booking</Text></TouchableOpacity>}
      {canReview && !showActions && <TouchableOpacity style={styles.reviewButton} onPress={onReview}><Icon name="star-border" size={16} color={COLORS.warning} /><Text style={styles.reviewText}>Write a Review</Text></TouchableOpacity>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 16, marginVertical: 8, overflow: 'hidden', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  vehicleType: { fontSize: 12, color: COLORS.grayDark, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  locationInfo: { padding: 12, gap: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: { fontSize: 13, color: COLORS.black, flex: 1 },
  details: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.grayLight, alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 4 },
  detailText: { fontSize: 12, color: COLORS.grayDark },
  priceContainer: { flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  priceLabel: { fontSize: 12, color: COLORS.grayDark },
  priceText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  userInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.gray, gap: 8 },
  userName: { fontSize: 13, color: COLORS.black, flex: 1 },
  userRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, color: COLORS.grayDark },
  actions: { flexDirection: 'row', padding: 12, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  acceptButton: { backgroundColor: COLORS.success },
  rejectButton: { backgroundColor: COLORS.error },
  actionText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  cancelButton: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.grayLight },
  cancelText: { color: COLORS.error, fontSize: 13, fontWeight: '500' },
  reviewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 6 },
  reviewText: { color: COLORS.warning, fontSize: 13, fontWeight: '500' },
});
