import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function PrivacyPolicyScreen({ navigation }) {
  const sections = [
    { title: 'Account data', body: 'We use your profile details to identify customers and drivers during bookings.' },
    { title: 'Vehicle data', body: 'Vehicle details entered by drivers are shown to customers only when the vehicle is active.' },
    { title: 'Booking data', body: 'Pickup, destination, date, status, and price are used to coordinate transport requests.' },
    { title: 'Safety', body: 'Booking history supports trust, dispute review, and reliable service records.' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_AREA_EDGES}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>Privacy</Text>
        </View>
        <View style={styles.header}>
          <Icon name="policy" size={32} color={COLORS.primary} />
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>How KS Car Hub handles booking and profile information.</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
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
  header: { backgroundColor: COLORS.white, borderRadius: 14, padding: 18, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.black, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.grayDark, lineHeight: 20, marginTop: 6 },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  sectionBody: { fontSize: 14, color: COLORS.grayDark, lineHeight: 20, marginTop: 6 },
});
