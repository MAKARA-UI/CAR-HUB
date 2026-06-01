import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { validateBooking } from '../../utils/validation';

export default function BookingFormScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [datePickerMode, setDatePickerMode] = useState(null);
  const [errors, setErrors] = useState({});
  const { createBooking, isLoading } = bookingStore();

  const bookingPrice = Number(vehicle.price ?? vehicle.pricePerKm ?? 0);
  const isOutsideCountryTrip = vehicle.category === 'outside_country' && vehicle.serviceMode === 'trip';

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

    setErrors({});

    const bookingData = {
      vehicleId: vehicle.id,
      pickupLocation: pickup,
      destination,
      date: date.toISOString(),
      price: bookingPrice,
      category: vehicle.category || 'local',
      serviceMode: vehicle.serviceMode || 'individual',
      departureTime: vehicle.category === 'outside_country' && vehicle.serviceMode === 'trip' ? vehicle.departureTime : '',
      notes: '',
    };

    const result = await createBooking(bookingData);

    if (result.success) {
      Alert.alert(
        'Booking Sent',
        'Your booking request has been sent to the driver. You will be notified when they respond.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Bookings'),
          },
        ]
      );
    } else {
      Alert.alert('Booking Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LoadingSpinner visible={isLoading} fullScreen />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.vehiclePrice}>
            {formatCurrency(vehicle.price ?? vehicle.pricePerKm)}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label={isOutsideCountryTrip ? 'Current Place' : 'Pickup Location'}
            value={pickup}
            onChangeText={setPickup}
            placeholder={isOutsideCountryTrip ? 'Enter current place' : 'Enter pickup location'}
            icon="location-on"
            error={errors.pickup}
          />

          <Input
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination"
            icon="location-on"
            error={errors.destination}
          />

          <Text style={styles.dateLabel}>{isOutsideCountryTrip ? 'Departure Date' : 'Pickup Date & Time'}</Text>
          <TouchableOpacity style={[styles.dateField, errors.date && styles.dateFieldError]} onPress={() => setDatePickerMode('date')}>
            <Text style={styles.dateText}>{isOutsideCountryTrip ? date.toLocaleDateString() : date.toLocaleString()}</Text>
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

          <View style={styles.priceBreakdown}>
            <Text style={styles.priceTitle}>Booking Summary</Text>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>{formatCurrency(bookingPrice)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          size="large"
          style={styles.bookButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    backgroundColor: COLORS.gray,
  },
  vehicleInfo: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  vehiclePrice: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  form: {
    padding: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  dateField: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateFieldError: {
    borderColor: COLORS.error,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.black,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -10,
    marginBottom: 16,
  },
  priceBreakdown: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.grayDark,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bookButton: {
    borderRadius: 12,
  },
});
