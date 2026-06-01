import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import { COLORS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';

export default function FilterScreen({ navigation, route }) {
  const { onApplyFilters } = route.params || {};
  const [selectedMode, setSelectedMode] = useState('individual');
  const [selectedCategory, setSelectedCategory] = useState('local');

  const handleApply = () => {
    onApplyFilters?.({ serviceMode: selectedMode, category: selectedCategory });
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedMode('individual');
    setSelectedCategory('local');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Icon name="close" size={24} color={COLORS.black} /></TouchableOpacity><Text style={styles.headerTitle}>Filter Vehicles</Text><TouchableOpacity onPress={handleReset}><Text style={styles.resetText}>Reset</Text></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}><Text style={styles.sectionTitle}>Booking Type</Text><View style={styles.typeGrid}>{SERVICE_MODES.map((mode) => <TouchableOpacity key={mode.id} style={[styles.typeChip, selectedMode === mode.id && styles.typeChipActive]} onPress={() => setSelectedMode(mode.id)}><Text style={[styles.typeText, selectedMode === mode.id && styles.typeTextActive]}>{mode.label}</Text></TouchableOpacity>)}</View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Sub Category</Text><View style={styles.typeGrid}>{SERVICE_CATEGORIES.map((category) => <TouchableOpacity key={category.id} style={[styles.typeChip, selectedCategory === category.id && styles.typeChipActive]} onPress={() => setSelectedCategory(category.id)}><Text style={[styles.typeText, selectedCategory === category.id && styles.typeTextActive]}>{category.label}</Text></TouchableOpacity>)}</View></View>
      </ScrollView>
      <View style={styles.buttonContainer}><Button title="Apply Filters" onPress={handleApply} size="large" /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  resetText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  section: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: COLORS.gray, gap: 8 },
  typeChipActive: { backgroundColor: COLORS.primary },
  typeText: { fontSize: 14, color: COLORS.grayDark },
  typeTextActive: { color: COLORS.white },
  buttonContainer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.grayLight, backgroundColor: COLORS.gray },
});
