import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { BANK_OPTIONS, COLORS, PAYMENT_METHODS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { validateBooking } from '../../utils/validation';
import { SAFE_SCROLL_PADDING_BOTTOM, getSafeActionPaddingBottom } from '../../utils/safeArea';

export default function BookingFormModal({ visible, vehicle, onClose, onBooked }) {
  const insets = useSafeAreaInsets();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH.id);
  const [paymentDetails, setPaymentDetails] = useState({
    accountName: '',
    phone: '',
    amount: '',
    bankName: BANK_OPTIONS[0],
    accountNumber: '',
    branchCode: '',
    reference: '',
  });
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { createBooking, isLoading } = bookingStore();
  const categoryLabel = useMemo(() => (
    SERVICE_CATEGORIES.find((item) => item.id === (vehicle?.category || 'local'))?.label || 'Local'
  ), [vehicle]);
  const modeLabel = useMemo(() => (
    SERVICE_MODES.find((item) => item.id === (vehicle?.serviceMode || 'individual'))?.label || 'Private Hire'
  ), [vehicle]);
  const isOutsideCountryTrip = vehicle?.category === 'outside_country' && vehicle?.serviceMode === 'trip';
  const bookingPrice = Number(vehicle?.price ?? vehicle?.pricePerKm ?? 0);

  const resetForm = () => {
    setPickup('');
    setDestination('');
    setDate(new Date(Date.now() + 60 * 60 * 1000));
    setDatePickerMode(null);
    setPaymentMethod(PAYMENT_METHODS.CASH.id);
    setPaymentDetails({
      accountName: '',
      phone: '',
      amount: '',
      bankName: BANK_OPTIONS[0],
      accountNumber: '',
      branchCode: '',
      reference: '',
    });
    setPaymentModalVisible(false);
    setPaymentSubmitted(false);
    setPaymentSubmitting(false);
    setPaymentSuccessMessage('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleDateChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setDatePickerMode(null);
      return;
    }

    if (!selectedDate) return;

    const nextDate = new Date(date);
    if (datePickerMode === 'date') {
      nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(nextDate);
      if (isOutsideCountryTrip) {
        setDatePickerMode(null);
        return;
      }
      setDatePickerMode(Platform.OS === 'android' ? 'time' : null);
      return;
    }

    nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setDate(nextDate);
    setDatePickerMode(null);
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateBooking(pickup, destination, date);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    if (!paymentSubmitted) {
      setErrors({ payment: 'Select a payment method and submit payment details.' });
      return;
    }
    const payment = buildPaymentPayload();
    if (!payment) return;

    const result = await createBooking({
      vehicleId: vehicle.id,
      pickupLocation: pickup,
      destination,
      date: date.toISOString(),
      price: bookingPrice,
      category: vehicle.category || 'local',
      serviceMode: vehicle.serviceMode || 'individual',
      departureTime: isOutsideCountryTrip ? vehicle.departureTime : '',
      payment,
      notes: '',
    });

    if (result.success) {
      resetForm();
      onBooked?.(result.booking);
      return;
    }

    Alert.alert('Booking Failed', result.error || 'Please try again.');
  };

  const buildPaymentPayload = () => {
    const nextErrors = {};
    if (paymentMethod === PAYMENT_METHODS.MPESA.id || paymentMethod === PAYMENT_METHODS.ECOCASH.id) {
      if (!paymentDetails.phone.trim()) nextErrors.phone = 'Mobile money number is required';
      if (!paymentDetails.amount.trim()) nextErrors.amount = 'Amount is required';
      if (!paymentDetails.reference.trim()) nextErrors.reference = 'Transaction reference is required';
    }
    if (paymentMethod === PAYMENT_METHODS.BANK_TRANSFER.id) {
      if (!paymentDetails.accountName.trim()) nextErrors.accountName = 'Account holder is required';
      if (!paymentDetails.accountNumber.trim()) nextErrors.accountNumber = 'Account number is required';
      if (!paymentDetails.branchCode.trim()) nextErrors.branchCode = 'Branch code is required';
      if (!paymentDetails.amount.trim()) nextErrors.amount = 'Amount is required';
      if (!paymentDetails.reference.trim()) nextErrors.reference = 'Transfer reference is required';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return null;
    }
    const paymentLabel = PAYMENT_METHODS[paymentMethod]?.label || 'Cash';
    const isCash = paymentMethod === PAYMENT_METHODS.CASH.id;

    return {
      method: paymentMethod,
      methodLabel: paymentLabel,
      status: isCash ? 'CASH_PENDING' : 'PAID',
      statusLabel: isCash ? 'Pending Cash Payment' : 'Paid',
      paidAt: isCash ? '' : new Date().toISOString(),
      transactionReference: isCash ? 'Cash Payment Pending' : paymentDetails.reference.trim(),
      amount: isCash ? bookingPrice : Number(paymentDetails.amount || bookingPrice),
      accountName: paymentDetails.accountName.trim(),
      phone: paymentDetails.phone.trim(),
      bankName: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER.id ? paymentDetails.bankName : '',
      accountNumber: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER.id ? paymentDetails.accountNumber.trim() : '',
      branchCode: paymentMethod === PAYMENT_METHODS.BANK_TRANSFER.id ? paymentDetails.branchCode.trim() : '',
    };
  };

  const openPaymentModal = (methodId) => {
    setPaymentMethod(methodId);
    setPaymentSuccessMessage('');
    setErrors({});
    setPaymentDetails((current) => ({
      ...current,
      amount: current.amount || String(bookingPrice),
    }));
    setPaymentModalVisible(true);
  };

  const submitPayment = () => {
    const payload = buildPaymentPayload();
    if (!payload) return;

    setPaymentSubmitting(true);
    setTimeout(() => {
      setPaymentSubmitting(false);
      setPaymentSubmitted(true);
      setPaymentSuccessMessage(`${payload.methodLabel} payment details submitted successfully.`);
    }, 700);
  };

  if (!vehicle) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <LoadingSpinner visible={isLoading} fullScreen />
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Book Vehicle</Text>
              <Text style={styles.subtitle}>{vehicle.make} {vehicle.model}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={22} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SAFE_SCROLL_PADDING_BOTTOM }]} keyboardShouldPersistTaps="handled">
            <View style={styles.serviceRow}>
              <View style={styles.serviceBox}>
                <Text style={styles.metaLabel}>Service</Text>
                <Text style={styles.metaValue}>{modeLabel}</Text>
              </View>
              <View style={styles.serviceBox}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{categoryLabel}</Text>
              </View>
            </View>

            <View style={styles.serviceRow}>
              <View style={styles.serviceBox}>
                <Text style={styles.metaLabel}>Price</Text>
                <Text style={styles.metaValue}>{formatCurrency(bookingPrice)}</Text>
              </View>
              {isOutsideCountryTrip ? (
                <View style={styles.serviceBox}>
                  <Text style={styles.metaLabel}>Departure</Text>
                  <Text style={styles.metaValue}>{vehicle.departureTime}</Text>
                </View>
              ) : null}
            </View>

            <Input label={isOutsideCountryTrip ? 'Current Place' : 'Pickup Location'} value={pickup} onChangeText={setPickup} placeholder={isOutsideCountryTrip ? 'Enter current place' : 'Enter pickup location'} icon="my-location" error={errors.pickup} />
            <Input label="Destination" value={destination} onChangeText={setDestination} placeholder="Enter destination" icon="location-on" error={errors.destination} />

            <Text style={styles.inputLabel}>{isOutsideCountryTrip ? 'Departure Date' : 'Pickup Date & Time'}</Text>
            <TouchableOpacity style={[styles.dateField, errors.date && styles.dateFieldError]} onPress={() => setDatePickerMode('date')}>
              <Icon name="event" size={20} color={COLORS.grayDark} />
              <Text style={styles.dateText}>{formatDate(date, isOutsideCountryTrip ? 'date' : 'full')}</Text>
            </TouchableOpacity>
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

            {datePickerMode && (
              <DateTimePicker
                value={date}
                mode={datePickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(bookingPrice)}</Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.summaryTitle}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                {Object.values(PAYMENT_METHODS).map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.paymentChip, paymentMethod === method.id && styles.paymentChipActive]}
                    onPress={() => openPaymentModal(method.id)}
                  >
                    <Text style={[styles.paymentChipText, paymentMethod === method.id && styles.paymentChipTextActive]}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.payment ? <Text style={styles.errorText}>{errors.payment}</Text> : null}
              {paymentSubmitted ? <Text style={styles.cashNote}>{PAYMENT_METHODS[paymentMethod]?.label || 'Cash'} selected - {paymentMethod === PAYMENT_METHODS.CASH.id ? 'Pending Cash Payment' : 'Paid'}</Text> : null}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: getSafeActionPaddingBottom(insets.bottom) }]}>
            <Button title="Send Booking Request" onPress={handleSubmit} size="large" />
          </View>

          <Modal visible={paymentModalVisible} animationType="fade" transparent onRequestClose={() => setPaymentModalVisible(false)}>
            <View style={styles.paymentOverlay}>
              <View style={styles.paymentModal}>
                <Text style={styles.paymentModalTitle}>{PAYMENT_METHODS[paymentMethod]?.label || 'Cash Payment'}</Text>
                {paymentMethod === PAYMENT_METHODS.CASH.id ? (
                  <Text style={styles.cashConfirmText}>Are you sure you want to pay with cash? Payment will be made directly upon vehicle collection, delivery, or according to the booking agreement.</Text>
                ) : null}

                {(paymentMethod === PAYMENT_METHODS.MPESA.id || paymentMethod === PAYMENT_METHODS.ECOCASH.id) ? (
                  <>
                    <TextInput style={[styles.paymentInput, errors.phone && styles.paymentInputError]} placeholder="Phone Number" value={paymentDetails.phone} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
                    <TextInput style={styles.paymentInput} placeholder="Account Name" value={paymentDetails.accountName} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, accountName: value }))} />
                    <TextInput style={[styles.paymentInput, errors.amount && styles.paymentInputError]} placeholder="Amount" value={paymentDetails.amount} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, amount: value }))} keyboardType="numeric" />
                    <TextInput style={[styles.paymentInput, errors.reference && styles.paymentInputError]} placeholder="Transaction Reference" value={paymentDetails.reference} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, reference: value }))} />
                  </>
                ) : null}

                {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER.id ? (
                  <>
                    <View style={styles.paymentOptions}>
                      {BANK_OPTIONS.map((bank) => (
                        <TouchableOpacity key={bank} style={[styles.bankChip, paymentDetails.bankName === bank && styles.paymentChipActive]} onPress={() => setPaymentDetails((current) => ({ ...current, bankName: bank }))}>
                          <Text style={[styles.paymentChipText, paymentDetails.bankName === bank && styles.paymentChipTextActive]}>{bank}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput style={[styles.paymentInput, errors.accountName && styles.paymentInputError]} placeholder="Account Holder Name" value={paymentDetails.accountName} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, accountName: value }))} />
                    <TextInput style={[styles.paymentInput, errors.accountNumber && styles.paymentInputError]} placeholder="Account Number" value={paymentDetails.accountNumber} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, accountNumber: value }))} keyboardType="numeric" />
                    <TextInput style={[styles.paymentInput, errors.branchCode && styles.paymentInputError]} placeholder="Branch Code" value={paymentDetails.branchCode} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, branchCode: value }))} keyboardType="numeric" />
                    <TextInput style={[styles.paymentInput, errors.amount && styles.paymentInputError]} placeholder="Amount" value={paymentDetails.amount} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, amount: value }))} keyboardType="numeric" />
                    <TextInput style={[styles.paymentInput, errors.reference && styles.paymentInputError]} placeholder="Reference Number / Transaction Reference" value={paymentDetails.reference} onChangeText={(value) => setPaymentDetails((current) => ({ ...current, reference: value }))} />
                  </>
                ) : null}

                {paymentSuccessMessage ? <Text style={styles.paymentSuccess}>{paymentSuccessMessage}</Text> : null}
                {paymentSubmitting ? <ActivityIndicator color={COLORS.primary} style={styles.paymentLoader} /> : null}

                <View style={styles.paymentModalActions}>
                  <TouchableOpacity style={[styles.modalActionButton, styles.cancelPaymentButton]} onPress={() => setPaymentModalVisible(false)}>
                    <Text style={styles.cancelPaymentText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionButton, styles.submitPaymentButton]} onPress={submitPayment} disabled={paymentSubmitting}>
                    <Text style={styles.submitPaymentText}>{paymentMethod === PAYMENT_METHODS.CASH.id ? 'Confirm Cash Payment' : 'Submit Payment'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '92%', backgroundColor: COLORS.gray, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.grayLight, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.black },
  subtitle: { fontSize: 13, color: COLORS.grayDark, marginTop: 2 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  content: { paddingHorizontal: 16, paddingBottom: 12 },
  serviceRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  serviceBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.grayLight },
  metaLabel: { fontSize: 12, color: COLORS.grayDark, marginBottom: 4 },
  metaValue: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  inputLabel: { fontSize: 14, fontWeight: '500', color: COLORS.black, marginBottom: 8 },
  dateField: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 8, marginBottom: 4 },
  dateFieldError: { borderColor: COLORS.error },
  dateText: { flex: 1, fontSize: 15, color: COLORS.black },
  errorText: { fontSize: 12, color: COLORS.error, marginBottom: 12 },
  summary: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.success, marginTop: 8 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.grayDark },
  summaryValue: { fontSize: 13, color: COLORS.black, fontWeight: '600' },
  totalValue: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },
  paymentSection: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.grayLight, marginTop: 12 },
  paymentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  paymentChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: COLORS.gray, borderWidth: 1, borderColor: COLORS.grayLight },
  bankChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: COLORS.gray, borderWidth: 1, borderColor: COLORS.grayLight, marginRight: 8, marginBottom: 8 },
  paymentChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentChipText: { fontSize: 12, color: COLORS.grayDark, fontWeight: '600' },
  paymentChipTextActive: { color: COLORS.white },
  cashNote: { fontSize: 13, color: COLORS.grayDark, lineHeight: 19, backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 10 },
  paymentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  paymentModal: { width: '100%', maxHeight: '88%', backgroundColor: COLORS.white, borderRadius: 16, padding: 18 },
  paymentModalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.black, marginBottom: 14 },
  cashConfirmText: { fontSize: 14, color: COLORS.grayDark, lineHeight: 20, marginBottom: 14 },
  paymentInput: { minHeight: 46, borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, color: COLORS.black },
  paymentInputError: { borderColor: COLORS.error },
  paymentSuccess: { fontSize: 13, color: COLORS.success, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  paymentLoader: { marginVertical: 8 },
  paymentModalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalActionButton: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelPaymentButton: { backgroundColor: COLORS.gray, borderWidth: 1, borderColor: COLORS.grayLight },
  submitPaymentButton: { backgroundColor: COLORS.primary },
  cancelPaymentText: { color: COLORS.grayDark, fontWeight: '700' },
  submitPaymentText: { color: COLORS.white, fontWeight: '700' },
  footer: { padding: 16, backgroundColor: COLORS.gray, borderTopWidth: 1, borderTopColor: COLORS.grayLight },
});
