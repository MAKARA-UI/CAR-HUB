import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, ActionSheetIOS, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import BookingCard from '../../components/booking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { bookingStore } from '../../store/bookingStore';
import { COLORS, BOOKING_STATUS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

const BOOKING_FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Confirmed' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REJECTED', label: 'Rejected' },
];

// ─── Build HTML ──────────────────────────────────────────────────────────────
function buildConfirmationHTML(booking) {
  const status = BOOKING_STATUS[booking.status] || { label: booking.status, color: '#6b7280' };
  const categoryLabel = SERVICE_CATEGORIES.find((c) => c.id === (booking.category || booking.vehicle?.category || 'local'))?.label || 'Local';
  const modeLabel = SERVICE_MODES.find((m) => m.id === (booking.serviceMode || booking.vehicle?.serviceMode || 'individual'))?.label || 'Private Hire';
  const payment = booking.payment || {};
  const paymentStatus = payment.statusLabel || (payment.status === 'PAID' ? 'Paid' : 'Pending Cash Payment');
  const paymentMethod = payment.methodLabel || (payment.method === 'CASH' ? 'Cash' : 'Not selected');
  const vehicleName = `${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`.trim() || 'N/A';
  const customerName = booking.customer?.name || booking.customer?.fullName || booking.customerName || booking.user?.name || 'N/A';
  const driverName = booking.driver?.name || booking.driver?.fullName || booking.driverName || (`${booking.driver?.firstName || ''} ${booking.driver?.lastName || ''}`.trim()) || 'N/A';
  const bookingDate = formatDate(booking.date, 'date');
  const bookingTime = booking.departureTime || formatDate(booking.date, 'time');
  const price = formatCurrency(booking.price);
  const now = formatDate(new Date(), 'full');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f6f8; color: #1f2937; }
    .page { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #0f7f7d; padding: 32px 32px 24px; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; right: -40px; top: -50px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.08); }
    .header::after { content: ''; position: absolute; right: 60px; bottom: -60px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,0.06); }
    .brand { font-size: 11px; font-weight: 700; color: #d7f4ec; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
    .header h1 { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .status-pill { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .ref { font-size: 11px; color: #d7f4ec; margin-top: 10px; }
    .body { padding: 28px 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 10px; font-weight: 800; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .card { background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; }
    .card-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; border-bottom: 1px solid #e5e7eb; }
    .card-row:last-child { border-bottom: none; }
    .card-label { font-size: 12px; color: #6b7280; }
    .card-value { font-size: 13px; font-weight: 600; color: #111827; text-align: right; max-width: 55%; }
    .route-card { background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; padding: 14px; }
    .route-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .route-row:last-child { margin-bottom: 0; }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot-green { background: #22c55e; }
    .dot-red { background: #ef4444; }
    .route-location { font-size: 13px; font-weight: 600; color: #111827; }
    .price-box { background: #e6f4ef; border-radius: 10px; border: 1px solid #b6e0d4; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .price-label { font-size: 13px; color: #065f46; font-weight: 600; }
    .price-value { font-size: 22px; font-weight: 800; color: #0f7f7d; }
    .payment-box { background: ${payment.status === 'PAID' ? '#f0fdf4' : '#fff7ed'}; border-radius: 10px; border: 1px solid ${payment.status === 'PAID' ? '#bbf7d0' : '#fed7aa'}; padding: 14px 16px; }
    .payment-status { font-size: 13px; font-weight: 700; color: ${payment.status === 'PAID' ? '#065f46' : '#92400e'}; margin-bottom: 4px; }
    .payment-meta { font-size: 12px; color: ${payment.status === 'PAID' ? '#047857' : '#b45309'}; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #9ca3af; line-height: 18px; }
    .footer strong { color: #6b7280; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">KS Car Hub</div>
    <h1>Booking Confirmation</h1>
    <span class="status-pill">${status.label}</span>
    <div class="ref">Booking ID: ${booking.id || 'N/A'} &nbsp;·&nbsp; Generated: ${now}</div>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Vehicle & Trip</div>
      <div class="card">
        <div class="card-row"><span class="card-label">Vehicle</span><span class="card-value">${vehicleName}</span></div>
        <div class="card-row"><span class="card-label">Service</span><span class="card-value">${modeLabel} — ${categoryLabel}</span></div>
        <div class="card-row"><span class="card-label">Date</span><span class="card-value">${bookingDate}</span></div>
        <div class="card-row"><span class="card-label">Departure</span><span class="card-value">${bookingTime}</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Route</div>
      <div class="route-card">
        <div class="route-row"><div class="dot dot-green"></div><span class="route-location">${booking.pickupLocation || 'N/A'}</span></div>
        <div class="route-row"><div class="dot dot-red"></div><span class="route-location">${booking.destination || 'N/A'}</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">People</div>
      <div class="card">
        <div class="card-row"><span class="card-label">Customer</span><span class="card-value">${customerName}</span></div>
        <div class="card-row"><span class="card-label">Driver</span><span class="card-value">${driverName}</span></div>
        ${booking.customer?.phone ? `<div class="card-row"><span class="card-label">Contact</span><span class="card-value">${booking.customer.phone}</span></div>` : ''}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Amount</div>
      <div class="price-box">
        <span class="price-label">Total Fare</span>
        <span class="price-value">${price}</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Payment</div>
      <div class="payment-box">
        <div class="payment-status">${paymentStatus}</div>
        <div class="payment-meta">Method: ${paymentMethod}${payment.transactionReference ? ` · Ref: ${payment.transactionReference}` : ''}${payment.paidAt ? ` · Paid: ${formatDate(payment.paidAt, 'full')}` : ''}</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <p><strong>KS Car Hub</strong> — This is an official booking confirmation.</p>
    <p>Please keep this document for your records.</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Download / Share helpers ────────────────────────────────────────────────
async function downloadAsPDF(booking) {
  try {
    const html = buildConfirmationHTML(booking);
    const { uri } = await Print.printToFileAsync({ html });
    const dest = `${FileSystem.cacheDirectory}booking_${booking.id || Date.now()}.pdf`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(dest, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Booking Confirmation (PDF)',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Saved', `PDF saved to: ${dest}`);
    }
  } catch (e) {
    Alert.alert('Download failed', e.message);
  }
}

async function downloadAsHTML(booking) {
  try {
    const html = buildConfirmationHTML(booking);
    const dest = `${FileSystem.cacheDirectory}booking_${booking.id || Date.now()}.html`;
    await FileSystem.writeAsStringAsync(dest, html, { encoding: FileSystem.EncodingType.UTF8 });
    await WebBrowser.openBrowserAsync(`file://${dest}`).catch(async () => {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(dest, {
          mimeType: 'text/html',
          dialogTitle: 'Save or Share Booking Confirmation (HTML)',
        });
      }
    });
  } catch (e) {
    try {
      const dest2 = `${FileSystem.cacheDirectory}booking_${booking.id || Date.now()}.html`;
      await Sharing.shareAsync(dest2, { mimeType: 'text/html', dialogTitle: 'Booking Confirmation (HTML)' });
    } catch (e2) {
      Alert.alert('Download failed', e.message);
    }
  }
}

function showDownloadOptions(booking) {
  const title = 'Download Confirmation';
  const message = 'Choose a format to view & save';

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: ['Cancel', 'Download as PDF', 'View as HTML'],
        cancelButtonIndex: 0,
      },
      (idx) => {
        if (idx === 1) downloadAsPDF(booking);
        if (idx === 2) downloadAsHTML(booking);
      }
    );
  } else {
    Alert.alert(title, message, [
      { text: 'Download as PDF', onPress: () => downloadAsPDF(booking) },
      { text: 'View as HTML', onPress: () => downloadAsHTML(booking) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function MyTripsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedBookingFilter, setSelectedBookingFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const { bookings, fetchMyBookings, updateBookingStatus, addReview, isLoading } = bookingStore();

  useFocusEffect(useCallback(() => { fetchMyBookings(); }, []));

  const onRefresh = async () => { setRefreshing(true); await fetchMyBookings(); setRefreshing(false); };
  const handleCancel = async (bookingId) => { const result = await updateBookingStatus(bookingId, 'CANCELLED'); if (result.success) await fetchMyBookings(); };
  const handleReview = (booking) => { setSelectedBooking(booking); setShowReviewModal(true); };
  const submitReview = async () => {
    if (!selectedBooking) return;
    const result = await addReview(selectedBooking.id, rating, reviewText);
    if (result.success) {
      setShowReviewModal(false); setRating(5); setReviewText(''); setSelectedBooking(null);
      await fetchMyBookings(); return;
    }
    Alert.alert('Review Failed', result.error || 'Please try again.');
  };

  const filteredBookings = bookings.filter((b) => {
    if (b.status !== selectedBookingFilter) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    const vehicleName = `${b.vehicle?.make || ''} ${b.vehicle?.model || ''}`.toLowerCase();
    const driverName = b.driver?.name?.toLowerCase() || '';
    return vehicleName.includes(q) || driverName.includes(q);
  });

  const selectedFilterLabel = BOOKING_FILTERS.find((f) => f.id === selectedBookingFilter)?.label || 'Bookings';

  if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>

      <View style={styles.header}>
        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />
        <Text style={styles.subtitle}>Track your trips</Text>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by driver or car..."
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
        <View style={styles.filterTabs}>
          {BOOKING_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, selectedBookingFilter === filter.id && styles.filterTabActive]}
              onPress={() => setSelectedBookingFilter(filter.id)}
            >
              <Text style={[styles.filterText, selectedBookingFilter === filter.id && styles.filterTextActive]}>
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
        {filteredBookings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{selectedFilterLabel} Bookings</Text>
            </View>
            {filteredBookings.map((booking) => (
              <View key={booking.id}>
                <BookingCard
                  booking={booking}
                  onPress={() => navigation.navigate('BookingDetail', { booking })}
                  onCancel={booking.status === 'PENDING' ? () => handleCancel(booking.id) : undefined}
                  onReview={() => booking.status === 'COMPLETED' && !booking.hasReview && handleReview(booking)}
                />
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => showDownloadOptions(booking)}
                >
                  <Icon name="download" size={15} color={COLORS.primary} />
                  <Text style={styles.downloadBtnText}>Download Confirmation</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No {selectedFilterLabel.toLowerCase()} bookings</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `No results for "${searchQuery}"`
                : 'Bookings with this status will appear here.'}
            </Text>
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
  container: { flex: 1, backgroundColor: '#eef2ef' },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, overflow: 'hidden' },
  headerCircleLarge: { position: 'absolute', right: -28, top: -34, width: 122, height: 122, borderRadius: 61, backgroundColor: 'rgba(255,255,255,0.10)' },
  headerCircleSmall: { position: 'absolute', right: 48, bottom: -44, width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.08)' },
  subtitle: { fontSize: 12, fontWeight: '700', color: '#d7f4ec', marginBottom: 3 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 14, gap: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#111827', padding: 0 },
  filterTabs: { flexDirection: 'row', gap: 8 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', backgroundColor: 'rgba(255,255,255,0.12)' },
  filterTabActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  filterText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  filterTextActive: { color: '#085041' },
  listContent: { paddingTop: 14, paddingHorizontal: 15, paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  section: { marginBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#888780' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: -4, marginBottom: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: '#e6f4ef', borderWidth: 1, borderColor: '#b6e0d4' },
  downloadBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.grayDark, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, textAlign: 'center', marginBottom: 20 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  reviewInput: { borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.black, textAlignVertical: 'top', minHeight: 100, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1 },
});