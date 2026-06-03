import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS, BOOKING_STATUS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function BookingCard({ booking, showActions = false, onAccept, onReject, onCancel, onReview, onPress, variant = 'default', userRole = 'customer' }) {
  const status = BOOKING_STATUS[booking.status] || { label: booking.status, color: COLORS.grayDark };
  const categoryLabel = SERVICE_CATEGORIES.find((item) => item.id === (booking.category || booking.vehicle?.category || 'local'))?.label || 'Local';
  const modeLabel = SERVICE_MODES.find((item) => item.id === (booking.serviceMode || booking.vehicle?.serviceMode || 'individual'))?.label || 'Private Hire';
  const payment = booking.payment || {};
  const paymentStatus = payment.statusLabel || (payment.status === 'PAID' ? 'Paid' : 'Pending Cash Payment');
  const paymentMethod = payment.methodLabel || (payment.method === 'CASH' ? 'Cash' : 'Not selected');
  const canCancel = booking.status === 'PENDING';
  const isCompleted = booking.status === 'COMPLETED';
  const canReview = isCompleted && !booking.hasReview && userRole === 'customer';
  const hasReviewed = isCompleted && booking.hasReview && userRole === 'customer';
  const isDriverDark = variant === 'driverDark';

  return (
    <TouchableOpacity style={[styles.card, isDriverDark && styles.driverCard]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.header, isDriverDark && styles.driverHeader]}>
        <View style={styles.vehicleInfo}><Text style={[styles.vehicleName, isDriverDark && styles.driverVehicleName]}>{booking.vehicle?.make} {booking.vehicle?.model}</Text><Text style={[styles.vehicleType, isDriverDark && styles.driverVehicleType]}>{modeLabel} - {categoryLabel}</Text></View>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>
      </View>
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}><Icon name="my-location" size={16} color={COLORS.primary} /><Text style={[styles.locationText, isDriverDark && styles.driverLocationText]}>{booking.pickupLocation}</Text></View>
        <View style={styles.locationRow}><Icon name="location-on" size={16} color={COLORS.error} /><Text style={[styles.locationText, isDriverDark && styles.driverLocationText]}>{booking.destination}</Text></View>
      </View>
      <View style={[styles.details, isDriverDark && styles.driverDetails]}>
        <View style={styles.detailItem}><Icon name="event" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{formatDate(booking.date, 'date')}</Text></View>
        <View style={styles.detailItem}><Icon name="access-time" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{booking.departureTime || formatDate(booking.date, 'time')}</Text></View>
        <View style={styles.priceContainer}><Text style={[styles.priceLabel, isDriverDark && styles.driverPriceLabel]}>Total:</Text><Text style={styles.priceText}>{formatCurrency(booking.price)}</Text></View>
      </View>
      {booking.customer && <View style={[styles.userInfo, isDriverDark && styles.driverUserInfo]}><View style={isDriverDark ? styles.driverUserAvatar : null}>{isDriverDark ? <Text style={styles.driverUserAvatarText}>{booking.customer.name?.charAt(0)?.toUpperCase() || 'C'}</Text> : <Icon name="person" size={14} color={COLORS.grayDark} />}</View><Text style={[styles.userName, isDriverDark && styles.driverUserName]}>{booking.customer.name}</Text><View style={styles.userRating}><Icon name="star" size={12} color={COLORS.warning} /><Text style={styles.ratingText}>{booking.customer.rating?.toFixed(1) || 0}</Text></View></View>}
      <View style={[styles.paymentInfo, isDriverDark && styles.driverPaymentInfo]}>
        <View style={styles.paymentRow}><Icon name={payment.status === 'PAID' ? 'verified' : 'payments'} size={15} color={payment.status === 'PAID' ? COLORS.success : COLORS.warning} /><Text style={[styles.paymentText, isDriverDark && styles.driverPaymentText]}>{isDriverDark ? paymentStatus : `Payment Status: ${paymentStatus}`}</Text></View>
        <Text style={[styles.paymentMeta, isDriverDark && styles.driverPaymentMeta]}>Method: {paymentMethod}{payment.transactionReference ? ` - Ref: ${payment.transactionReference}` : ''}</Text>
        {payment.bankName ? <Text style={styles.paymentMeta}>Bank: {payment.bankName}</Text> : null}
        {payment.paidAt ? <Text style={styles.paymentMeta}>Paid: {formatDate(payment.paidAt, 'full')}</Text> : null}
      </View>
      {showActions && <View style={styles.actions}><TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}><Icon name="check" size={18} color={COLORS.white} /><Text style={styles.actionText}>Approve</Text></TouchableOpacity><TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}><Icon name="close" size={18} color={COLORS.white} /><Text style={styles.actionText}>Reject</Text></TouchableOpacity></View>}
      {canCancel && !showActions && <TouchableOpacity style={styles.cancelButton} onPress={onCancel}><Text style={styles.cancelText}>Cancel Booking</Text></TouchableOpacity>}
      {(canReview || hasReviewed) && !showActions && booking.driver?.name && (
        <View style={styles.driverInfoRow}>
          <View style={styles.driverInfoAvatar}><Text style={styles.driverInfoAvatarText}>{booking.driver.name.charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.driverInfoName}>{booking.driver.name}</Text>
          {booking.driver.rating != null && <View style={styles.userRating}><Icon name="star" size={12} color={COLORS.warning} /><Text style={styles.ratingText}>{booking.driver.rating.toFixed(1)}</Text></View>}
        </View>
      )}
      {canReview && !showActions && (
        <TouchableOpacity style={styles.reviewButton} onPress={onReview}>
          <Icon name="star-border" size={16} color={COLORS.warning} />
          <Text style={styles.reviewText}>Write a Review</Text>
        </TouchableOpacity>
      )}
      {hasReviewed && !showActions && (
        <View style={styles.reviewResult}>
          <View style={styles.reviewResultStars}>
            {[1,2,3,4,5].map((s) => (
              <Icon key={s} name="star" size={14} color={s <= (booking.reviewRating || 0) ? COLORS.warning : COLORS.grayLight} />
            ))}
          </View>
          {booking.reviewComment ? <Text style={styles.reviewResultText}>{booking.reviewComment}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 16, marginVertical: 8, overflow: 'hidden', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  driverCard: { backgroundColor: '#2f302d', borderWidth: 1, borderColor: '#6b665e', borderRadius: 9, marginHorizontal: 18, marginTop: 8, marginBottom: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  driverHeader: { borderBottomColor: '#4c4c49', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  driverVehicleName: { color: COLORS.white },
  vehicleType: { fontSize: 12, color: COLORS.grayDark, marginTop: 2 },
  driverVehicleType: { color: '#d0c8ba', fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  locationInfo: { padding: 12, gap: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: { fontSize: 13, color: COLORS.black, flex: 1 },
  driverLocationText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  details: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.grayLight, alignItems: 'center' },
  driverDetails: { borderColor: '#4c4c49' },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 4 },
  detailText: { fontSize: 12, color: COLORS.grayDark },
  priceContainer: { flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  priceLabel: { fontSize: 12, color: COLORS.grayDark },
  driverPriceLabel: { display: 'none' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  userInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.gray, gap: 8 },
  driverUserInfo: { backgroundColor: '#2f302d', paddingHorizontal: 14 },
  driverUserAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e6fbf3', alignItems: 'center', justifyContent: 'center' },
  driverUserAvatarText: { fontSize: 11, color: COLORS.primary, fontWeight: '800' },
  userName: { fontSize: 13, color: COLORS.black, flex: 1 },
  driverUserName: { color: '#d0c8ba', fontWeight: '800' },
  userRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, color: COLORS.grayDark },
  paymentInfo: { padding: 12, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 4 },
  driverPaymentInfo: { backgroundColor: '#fff2dc', borderTopColor: '#fff2dc', paddingHorizontal: 14 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentText: { fontSize: 13, color: COLORS.black, fontWeight: '700' },
  driverPaymentText: { color: '#7d4300' },
  paymentMeta: { fontSize: 12, color: COLORS.grayDark, lineHeight: 17 },
  driverPaymentMeta: { color: '#7d4300', fontWeight: '600' },
  actions: { flexDirection: 'row', padding: 12, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  acceptButton: { backgroundColor: COLORS.success },
  rejectButton: { backgroundColor: COLORS.error },
  actionText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  cancelButton: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.grayLight },
  cancelText: { color: COLORS.error, fontSize: 13, fontWeight: '500' },
  driverInfoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 8 },
  driverInfoAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e6fbf3', alignItems: 'center', justifyContent: 'center' },
  driverInfoAvatarText: { fontSize: 11, color: COLORS.primary, fontWeight: '800' },
  driverInfoName: { fontSize: 13, color: COLORS.black, flex: 1, fontWeight: '500' },
  reviewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 6 },
  reviewText: { color: COLORS.warning, fontSize: 13, fontWeight: '500' },
  reviewResult: { padding: 12, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 4 },
  reviewResultStars: { flexDirection: 'row', gap: 2 },
  reviewResultText: { fontSize: 12, color: COLORS.grayDark, lineHeight: 17, marginTop: 2 },
});