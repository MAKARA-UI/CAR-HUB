import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function NotificationsScreen({ navigation }) {
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [driverMessages, setDriverMessages] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(false);

  const rows = [
    { icon: 'event-available', title: 'Booking updates', subtitle: 'Pending, confirmed, rejected, and completed bookings.', value: bookingUpdates, setValue: setBookingUpdates },
    { icon: 'chat-bubble-outline', title: 'Driver messages', subtitle: 'Important trip coordination messages.', value: driverMessages, setValue: setDriverMessages },
    { icon: 'account-balance-wallet', title: 'Payment alerts', subtitle: 'Payment reminders and settlement notices.', value: paymentAlerts, setValue: setPaymentAlerts },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <Text style={styles.description}>Choose which updates should reach you while managing bookings and vehicles.</Text>

        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.title} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
              <View style={styles.iconCircle}>
                <Icon name={row.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.setValue}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray },
  scrollContainer: { padding: 16, paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  description: { fontSize: 14, color: COLORS.grayDark, lineHeight: 20, marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  lastRow: { borderBottomWidth: 0 },
  iconCircle: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginHorizontal: 12 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  rowSubtitle: { fontSize: 12, color: COLORS.grayDark, lineHeight: 17, marginTop: 3 },
});
