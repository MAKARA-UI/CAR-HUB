import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { bookingAPI, profileAPI, vehicleAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { BOOKING_STATUS, COLORS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function MyVehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = authStore();
  const isDriver = user?.role === 'driver';

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [isDriver])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDriver) {
        const response = await profileAPI.getMyVehicles();
        if (response.success) {
          setVehicles(response.vehicles || []);
        }
        return;
      }

      const response = await bookingAPI.getMyBookings();
      if (response.success) {
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error('Fetch my vehicles error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleEditVehicle = (vehicle) => {
    navigation.navigate('AddVehicle', { vehicle, mode: 'edit' });
  };

  const handleDeleteVehicle = (vehicle) => {
    Alert.alert('Delete Vehicle', `Delete ${vehicle.make} ${vehicle.model}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await vehicleAPI.delete(vehicle.id);
            if (response.success) {
              await fetchData();
            }
          } catch (error) {
            Alert.alert('Delete Failed', error.message);
          }
        },
      },
    ]);
  };

  const renderCustomerBooking = (booking) => {
    const status = BOOKING_STATUS[booking.status] || { label: booking.status, color: COLORS.grayDark };
    const payment = booking.payment || {};
    const vehicleName = `${booking.vehicle?.make || 'Booked'} ${booking.vehicle?.model || 'Vehicle'}`.trim();

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.vehicleIcon}>
            <Icon name="directions-car" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.bookingTitleBlock}>
            <Text style={styles.bookingTitle}>{vehicleName}</Text>
            <Text style={styles.bookingSubtitle}>{booking.vehicle?.licensePlate || booking.vehicle?.type || 'Booked through KS Car Hub'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="event" size={16} color={COLORS.grayDark} />
          <Text style={styles.infoText}>{formatDate(booking.date, 'date')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="my-location" size={16} color={COLORS.grayDark} />
          <Text style={styles.infoText}>{booking.pickupLocation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color={COLORS.grayDark} />
          <Text style={styles.infoText}>{booking.destination}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Booking total</Text>
          <Text style={styles.totalValue}>{formatCurrency(booking.price)}</Text>
        </View>
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentLabel}>Payment Method</Text>
          <Text style={styles.paymentValue}>{payment.methodLabel || (payment.method === 'CASH' ? 'Cash' : 'Not selected')}</Text>
          <Text style={styles.paymentMeta}>{payment.statusLabel || (payment.status === 'PAID' ? 'Paid' : 'Pending Cash Payment')}</Text>
          {payment.transactionReference ? <Text style={styles.paymentMeta}>Reference: {payment.transactionReference}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.title}>My Vehicles</Text>
          </View>
          {isDriver && (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddVehicle')}>
              <Icon name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Icon name="directions-car" size={28} color={COLORS.primary} />
          <View>
            <Text style={styles.summaryNumber}>{isDriver ? vehicles.length : bookings.length}</Text>
            <Text style={styles.summaryText}>
              {isDriver
                ? `registered vehicle${vehicles.length === 1 ? '' : 's'}`
                : `booked vehicle${bookings.length === 1 ? '' : 's'}`}
            </Text>
          </View>
        </View>

        {isDriver && vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="garage" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptyText}>Add a vehicle from your driver page to start receiving bookings.</Text>
          </View>
        ) : null}

        {isDriver ? (
          vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleManageBlock}>
              <VehicleCard
                vehicle={vehicle}
                showBookButton={false}
                onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id, vehicle })}
              />
              <View style={styles.vehicleActions}>
                <TouchableOpacity style={[styles.vehicleActionButton, styles.editButton]} onPress={() => handleEditVehicle(vehicle)}>
                  <Icon name="edit" size={18} color={COLORS.white} />
                  <Text style={styles.vehicleActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.vehicleActionButton, styles.deleteButton]} onPress={() => handleDeleteVehicle(vehicle)}>
                  <Icon name="delete" size={18} color={COLORS.white} />
                  <Text style={styles.vehicleActionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="event-busy" size={48} color={COLORS.grayLight} />
            <Text style={styles.emptyTitle}>No booked vehicles yet</Text>
            <Text style={styles.emptyText}>Vehicles you book or rent through the app will appear here for reference.</Text>
          </View>
        ) : (
          bookings.map(renderCustomerBooking)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray },
  scrollContainer: { paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addButtonText: { color: COLORS.white, fontWeight: '700' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 14 },
  summaryNumber: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  summaryText: { fontSize: 13, color: COLORS.grayDark, marginTop: 2 },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.white, margin: 16, padding: 28, borderRadius: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.grayDark, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  bookingCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 14 },
  bookingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  vehicleIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  bookingTitleBlock: { flex: 1, marginHorizontal: 12 },
  bookingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  bookingSubtitle: { fontSize: 12, color: COLORS.grayDark, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  infoText: { flex: 1, fontSize: 13, color: COLORS.black },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.grayLight, marginTop: 14, paddingTop: 12 },
  totalLabel: { fontSize: 13, color: COLORS.grayDark },
  totalValue: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  paymentSummary: { backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginTop: 12 },
  paymentLabel: { fontSize: 12, color: COLORS.grayDark },
  paymentValue: { fontSize: 14, color: COLORS.primaryDark, fontWeight: '700', marginTop: 3 },
  paymentMeta: { fontSize: 12, color: COLORS.grayDark, marginTop: 3 },
  vehicleManageBlock: { marginBottom: 8 },
  vehicleActions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: -2, marginBottom: 8 },
  vehicleActionButton: { flex: 1, minHeight: 42, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.error },
  vehicleActionText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
