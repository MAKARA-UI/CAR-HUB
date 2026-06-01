import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import Button from '../common/Button';
import { COLORS, VEHICLE_TYPES } from '../../utils/constants';

export default function VehicleFilter({ visible, onClose, onApply, initialFilters = {} }) {
  const [selectedType, setSelectedType] = useState(initialFilters.type || 'all');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'price_asc');

  const handleApply = () => {
    onApply?.({ type: selectedType, sortBy });
    onClose?.();
  };

  const handleReset = () => {
    setSelectedType('all');
    setSortBy('price_asc');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color={COLORS.black} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle Type</Text>
              <View style={styles.typeGrid}>
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity key={type.id} style={[styles.typeChip, selectedType === type.id && styles.typeChipActive]} onPress={() => setSelectedType(type.id)}>
                    <Icon name={type.icon} size={16} color={selectedType === type.id ? COLORS.white : COLORS.grayDark} />
                    <Text style={[styles.typeText, selectedType === type.id && styles.typeTextActive]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  ['price_asc', 'Price: Low to High'],
                  ['price_desc', 'Price: High to Low'],
                  ['rating', 'Highest Rated'],
                ].map(([value, label]) => (
                  <TouchableOpacity key={value} style={[styles.sortChip, sortBy === value && styles.sortChipActive]} onPress={() => setSortBy(value)}>
                    <Text style={[styles.sortText, sortBy === value && styles.sortTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}><Text style={styles.resetText}>Reset All</Text></TouchableOpacity>
            <Button title="Apply Filters" onPress={handleApply} style={styles.applyButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray, gap: 6 },
  typeChipActive: { backgroundColor: COLORS.primary },
  typeText: { fontSize: 13, color: COLORS.grayDark },
  typeTextActive: { color: COLORS.white },
  sortOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray },
  sortChipActive: { backgroundColor: COLORS.primary },
  sortText: { fontSize: 13, color: COLORS.grayDark },
  sortTextActive: { color: COLORS.white },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.grayLight, gap: 12 },
  resetButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grayLight },
  resetText: { fontSize: 14, fontWeight: '500', color: COLORS.grayDark },
  applyButton: { flex: 2 },
});
