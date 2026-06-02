import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { bookingAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { BANK_OPTIONS, COLORS, PAYMENT_METHODS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

const initialForm = {
  phone: '',
  accountName: '',
  amount: '',
  accountNumber: '',
  branchCode: '',
  reference: '',
};

export default function PaymentMethodsScreen({ navigation }) {
  const { user } = authStore();
  const isDriver = user?.role === 'driver';
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CASH.id);
  const [selectedBank, setSelectedBank] = useState(BANK_OPTIONS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [driverPayments, setDriverPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchDriverPayments = async () => {
    if (!isDriver) return;

    setLoadingPayments(true);
    try {
      const response = await bookingAPI.getDriverRequests();
      if (response.success) {
        setDriverPayments((response.bookings || []).filter((booking) => booking.payment));
      }
    } catch (error) {
      console.error('Fetch driver payments error:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isDriver) return undefined;

      fetchDriverPayments();
      const refreshTimer = setInterval(fetchDriverPayments, 10000);
      return () => clearInterval(refreshTimer);
    }, [isDriver])
  );

  const openPaymentPopup = (methodId) => {
    setSelectedMethod(methodId);
    setErrors({});
    setSuccessMessage('');
    setModalVisible(true);
  };

  const validate = () => {
    const nextErrors = {};
    if (selectedMethod === PAYMENT_METHODS.MPESA.id || selectedMethod === PAYMENT_METHODS.ECOCASH.id) {
      if (!form.phone.trim()) nextErrors.phone = true;
      if (!form.amount.trim()) nextErrors.amount = true;
      if (!form.reference.trim()) nextErrors.reference = true;
    }
    if (selectedMethod === PAYMENT_METHODS.BANK_TRANSFER.id) {
      if (!form.accountName.trim()) nextErrors.accountName = true;
      if (!form.accountNumber.trim()) nextErrors.accountNumber = true;
      if (!form.branchCode.trim()) nextErrors.branchCode = true;
      if (!form.amount.trim()) nextErrors.amount = true;
      if (!form.reference.trim()) nextErrors.reference = true;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitPayment = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(
        selectedMethod === PAYMENT_METHODS.CASH.id
          ? 'Cash payment saved as Pending Cash Payment.'
          : `${PAYMENT_METHODS[selectedMethod].label} payment submitted successfully.`
      );
    }, 700);
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const renderPopupFields = () => {
    if (selectedMethod === PAYMENT_METHODS.CASH.id) {
      return (
        <Text style={styles.noticeText}>
          Are you sure you want to pay with cash? Payment will be made directly upon vehicle collection, delivery, or according to the booking agreement.
        </Text>
      );
    }

    if (selectedMethod === PAYMENT_METHODS.BANK_TRANSFER.id) {
      return (
        <>
          <Text style={styles.fieldLabel}>Bank Selection</Text>
          <View style={styles.bankRow}>
            {BANK_OPTIONS.map((bank) => (
              <TouchableOpacity key={bank} style={[styles.bankChip, selectedBank === bank && styles.selectedChip]} onPress={() => setSelectedBank(bank)}>
                <Text style={[styles.bankText, selectedBank === bank && styles.selectedText]}>{bank}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={[styles.input, errors.accountName && styles.inputError]} placeholder="Account Holder Name" placeholderTextColor={COLORS.grayDark} value={form.accountName} onChangeText={(value) => updateForm('accountName', value)} />
          <TextInput style={[styles.input, errors.accountNumber && styles.inputError]} placeholder="Account Number" placeholderTextColor={COLORS.grayDark} value={form.accountNumber} onChangeText={(value) => updateForm('accountNumber', value)} keyboardType="numeric" />
          <TextInput style={[styles.input, errors.branchCode && styles.inputError]} placeholder="Branch Code" placeholderTextColor={COLORS.grayDark} value={form.branchCode} onChangeText={(value) => updateForm('branchCode', value)} keyboardType="numeric" />
          <TextInput style={[styles.input, errors.amount && styles.inputError]} placeholder="Amount" placeholderTextColor={COLORS.grayDark} value={form.amount} onChangeText={(value) => updateForm('amount', value)} keyboardType="numeric" />
          <TextInput style={[styles.input, errors.reference && styles.inputError]} placeholder="Reference Number / Transaction Reference" placeholderTextColor={COLORS.grayDark} value={form.reference} onChangeText={(value) => updateForm('reference', value)} />
        </>
      );
    }

    const label = PAYMENT_METHODS[selectedMethod].label;
    return (
      <>
        <TextInput style={[styles.input, errors.phone && styles.inputError]} placeholder="Phone Number" placeholderTextColor={COLORS.grayDark} value={form.phone} onChangeText={(value) => updateForm('phone', value)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Account Name" placeholderTextColor={COLORS.grayDark} value={form.accountName} onChangeText={(value) => updateForm('accountName', value)} />
        <TextInput style={[styles.input, errors.amount && styles.inputError]} placeholder="Amount" placeholderTextColor={COLORS.grayDark} value={form.amount} onChangeText={(value) => updateForm('amount', value)} keyboardType="numeric" />
        <TextInput style={[styles.input, errors.reference && styles.inputError]} placeholder={`${label} Transaction Reference`} placeholderTextColor={COLORS.grayDark} value={form.reference} onChangeText={(value) => updateForm('reference', value)} />
      </>
    );
  };

  const getPaymentMethod = (payment = {}) => (
    payment.methodLabel || (payment.method === PAYMENT_METHODS.CASH.id ? 'Cash' : 'Not selected')
  );

  const getPaymentStatus = (payment = {}) => (
    payment.statusLabel || (payment.status === 'PAID' ? 'Paid' : 'Pending Cash Payment')
  );

  const renderDriverPayment = (booking) => {
    const payment = booking.payment || {};
    const isCash = payment.method === PAYMENT_METHODS.CASH.id || payment.status === 'CASH_PENDING';
    const vehicleName = `${booking.vehicle?.make || 'Vehicle'} ${booking.vehicle?.model || ''}`.trim();

    return (
      <View key={booking.id} style={styles.driverPaymentCard}>
        <View style={styles.driverPaymentHeader}>
          <View style={[styles.driverPaymentIcon, isCash && styles.cashPaymentIcon]}>
            <Icon name={isCash ? 'payments' : 'verified'} size={22} color={isCash ? COLORS.warning : COLORS.success} />
          </View>
          <View style={styles.driverPaymentTitleBlock}>
            <Text style={styles.methodTitle}>{vehicleName}</Text>
            <Text style={styles.methodSubtitle}>Booking reference: {booking.id}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>{getPaymentMethod(payment)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Status</Text>
          <Text style={[styles.detailValue, { color: isCash ? COLORS.warning : COLORS.success }]}>{getPaymentStatus(payment)}</Text>
        </View>
        {payment.transactionReference ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Reference</Text>
            <Text style={styles.detailValue}>{payment.transactionReference}</Text>
          </View>
        ) : null}
        {payment.paidAt ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Date</Text>
            <Text style={styles.detailValue}>{formatDate(payment.paidAt, 'full')}</Text>
          </View>
        ) : null}
        {payment.bankName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bank Name</Text>
            <Text style={styles.detailValue}>{payment.bankName}</Text>
          </View>
        ) : null}
        {payment.accountName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <Text style={styles.detailValue}>{payment.accountName}</Text>
          </View>
        ) : null}
        {payment.accountNumber ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{payment.accountNumber}</Text>
          </View>
        ) : null}
        {payment.branchCode ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch Code</Text>
            <Text style={styles.detailValue}>{payment.branchCode}</Text>
          </View>
        ) : null}
        {isCash ? (
          <Text style={styles.cashPaymentNotice}>
            Cash Payment: The customer will pay manually upon pickup, delivery, or booking completion. No online transaction exists for this payment.
          </Text>
        ) : null}
      </View>
    );
  };

  if (isDriver) {
    return (
      <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Payment Methods</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Customer payment records</Text>
            <Text style={styles.balanceValue}>Read-only</Text>
            <Text style={styles.balanceNote}>Payments shown here come from customer booking payment actions only.</Text>
          </View>

          {loadingPayments ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}

          {driverPayments.length === 0 && !loadingPayments ? (
            <View style={styles.emptyCard}>
              <Icon name="payments" size={42} color={COLORS.grayLight} />
              <Text style={styles.emptyTitle}>No customer payments yet</Text>
              <Text style={styles.emptyText}>Payment details will appear here after customers submit payment information for bookings.</Text>
            </View>
          ) : (
            driverPayments.map(renderDriverPayment)
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Methods</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Preferred settlement</Text>
          <Text style={styles.balanceValue}>Mobile, Bank, or Cash</Text>
          <Text style={styles.balanceNote}>Choose a payment method during booking. Drivers can see the selected payment status.</Text>
        </View>

        {Object.values(PAYMENT_METHODS).map((method) => (
          <TouchableOpacity key={method.id} style={styles.methodCard} onPress={() => openPaymentPopup(method.id)}>
            <View style={styles.iconCircle}>
              <Icon name={method.id === PAYMENT_METHODS.BANK_TRANSFER.id ? 'account-balance' : method.id === PAYMENT_METHODS.CASH.id ? 'payments' : 'phone-android'} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.methodText}>
              <Text style={styles.methodTitle}>{method.id === PAYMENT_METHODS.CASH.id ? 'Cash Payment' : method.label}</Text>
              <Text style={styles.methodSubtitle}>Tap to enter payment details in a secure popup.</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.grayDark} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{PAYMENT_METHODS[selectedMethod]?.label || 'Cash Payment'}</Text>
            {renderPopupFields()}
            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
            {submitting ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={submitPayment} disabled={submitting}>
                <Text style={styles.submitText}>{selectedMethod === PAYMENT_METHODS.CASH.id ? 'Confirm Cash Payment' : 'Submit Payment'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray },
  scrollContainer: { padding: 16, paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  balanceCard: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 14, marginBottom: 14 },
  balanceLabel: { color: COLORS.white, opacity: 0.85, fontSize: 13 },
  balanceValue: { color: COLORS.white, fontSize: 24, fontWeight: '700', marginTop: 6 },
  balanceNote: { color: COLORS.white, opacity: 0.9, fontSize: 13, lineHeight: 19, marginTop: 10 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 14, marginBottom: 12 },
  iconCircle: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  methodText: { flex: 1, marginLeft: 12 },
  methodTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  methodSubtitle: { fontSize: 13, color: COLORS.grayDark, marginTop: 4, lineHeight: 18 },
  driverPaymentCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 14, marginBottom: 12 },
  driverPaymentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  driverPaymentIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: `${COLORS.success}15`, alignItems: 'center', justifyContent: 'center' },
  cashPaymentIcon: { backgroundColor: `${COLORS.warning}15` },
  driverPaymentTitleBlock: { flex: 1, marginLeft: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  detailLabel: { flex: 1, fontSize: 12, color: COLORS.grayDark },
  detailValue: { flex: 1, fontSize: 12, color: COLORS.black, fontWeight: '700', textAlign: 'right' },
  cashPaymentNotice: { marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: COLORS.primaryLight, fontSize: 12, color: COLORS.grayDark, lineHeight: 18 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.white, padding: 28, borderRadius: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.grayDark, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', backgroundColor: COLORS.white, borderRadius: 16, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.black, marginBottom: 14 },
  noticeText: { fontSize: 14, color: COLORS.grayDark, lineHeight: 20, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  bankRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  bankChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: COLORS.grayLight, backgroundColor: COLORS.gray },
  selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  bankText: { fontSize: 12, color: COLORS.grayDark, fontWeight: '600' },
  selectedText: { color: COLORS.white },
  input: { minHeight: 46, borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, color: COLORS.black },
  inputError: { borderColor: COLORS.error },
  successText: { fontSize: 13, color: COLORS.success, fontWeight: '700', marginTop: 4 },
  loader: { marginVertical: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalButton: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: COLORS.gray, borderWidth: 1, borderColor: COLORS.grayLight },
  submitButton: { backgroundColor: COLORS.primary },
  cancelText: { color: COLORS.grayDark, fontWeight: '700' },
  submitText: { color: COLORS.white, fontWeight: '700' },
});
