import React, { useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from '@expo/vector-icons/MaterialIcons';
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { COLORS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { validateBooking } from '../../utils/validation';

export default function BookingFormModal({ visible, vehicle, onClose, onBooked }) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [datePickerMode, setDatePickerMode] = useState(null);
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

    const result = await createBooking({
      vehicleId: vehicle.id,
      pickupLocation: pickup,
      destination,
      date: date.toISOString(),
      price: bookingPrice,
      category: vehicle.category || 'local',
      serviceMode: vehicle.serviceMode || 'individual',
      departureTime: isOutsideCountryTrip ? vehicle.departureTime : '',
      notes: '',
    });

    if (result.success) {
      resetForm();
      onBooked?.(result.booking);
      return;
    }

    Alert.alert('Booking Failed', result.error || 'Please try again.');
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Send Booking Request" onPress={handleSubmit} size="large" />
          </View>
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
  footer: { padding: 16, backgroundColor: COLORS.gray, borderTopWidth: 1, borderTopColor: COLORS.grayLight },
});
