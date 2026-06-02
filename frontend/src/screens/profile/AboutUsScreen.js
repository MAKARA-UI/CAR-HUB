import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function AboutUsScreen({ navigation }) {
  const highlights = [
    { icon: 'verified', label: 'Driver-listed vehicles' },
    { icon: 'event-note', label: 'Booking approval workflow' },
    { icon: 'route', label: 'Local and long-distance transport' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>About Us</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Icon name="local-taxi" size={34} color={COLORS.white} />
          </View>
          <Text style={styles.title}>KS Car Hub</Text>
          <Text style={styles.subtitle}>Smart transport booking for private hire and shared trips.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we do</Text>
          <Text style={styles.cardBody}>
            KS Car Hub connects customers with active vehicles registered by drivers. Customers can browse vehicle details,
            request a booking, and track booking status from pending to confirmed.
          </Text>
        </View>

        {highlights.map((item) => (
          <View key={item.label} style={styles.highlightRow}>
            <Icon name={item.icon} size={22} color={COLORS.primary} />
            <Text style={styles.highlightText}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray },
  scrollContainer: { padding: 16, paddingBottom: SAFE_SCROLL_PADDING_BOTTOM },
  topHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginRight: 12 },
  topHeaderTitle: { fontSize: 24, fontWeight: '700', color: COLORS.black },
  hero: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, marginBottom: 14 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryDark },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginTop: 14 },
  subtitle: { color: COLORS.white, opacity: 0.9, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black },
  cardBody: { fontSize: 14, color: COLORS.grayDark, lineHeight: 21, marginTop: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
  highlightText: { fontSize: 15, color: COLORS.black, fontWeight: '600' },
});
