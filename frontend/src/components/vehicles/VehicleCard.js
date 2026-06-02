import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export default function VehicleCard({ vehicle, onPress, showBookButton = true }) {
  const { images = [], make, model, year, price, pricePerKm, capacity, type, color, licensePlate, category, serviceMode, departureTime } = vehicle;
  const categoryLabel = SERVICE_CATEGORIES.find((item) => item.id === (category || 'local'))?.label || 'Local';
  const modeLabel = SERVICE_MODES.find((item) => item.id === (serviceMode || 'individual'))?.label || 'Private Hire';
  const displayPrice = price ?? pricePerKm;

  const getTypeIcon = () => {
    switch (type) {
      case 'sedan': return 'directions-car';
      case 'suv': return 'airport-shuttle';
      case '4x4': return 'terrain';
      case 'bakkie': return 'local-shipping';
      case 'minibus': return 'directions-bus';
      default: return 'directions-car';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: images[0] || 'https://via.placeholder.com/400x200/CCCCCC/FFFFFF?text=No+Image' }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{make} {model}</Text>
          <Text style={styles.year}>{year}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.detailItem}><Icon name={getTypeIcon()} size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{type?.toUpperCase()}</Text></View>
          <View style={styles.detailItem}><Icon name="people" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{capacity} seats</Text></View>
          {color ? <View style={styles.detailItem}><Icon name="palette" size={14} color={COLORS.grayDark} /><Text style={styles.detailText}>{color}</Text></View> : null}
        </View>
        {licensePlate ? <Text style={styles.plateText}>{licensePlate}</Text> : null}
        <Text style={styles.plateText}>{modeLabel} - {categoryLabel}{departureTime ? ` - Departs ${departureTime}` : ''}</Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.serviceLabel}>Service + Price</Text>
            <Text style={styles.price}>{categoryLabel} - {formatCurrency(displayPrice)}</Text>
          </View>
          {showBookButton ? <View style={styles.bookBadge}><Text style={styles.bookText}>Book</Text><Icon name="chevron-right" size={16} color={COLORS.white} /></View> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 16, marginVertical: 8, overflow: 'hidden', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  content: { padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, flex: 1 },
  year: { fontSize: 12, color: COLORS.grayDark },
  details: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: COLORS.grayDark },
  plateText: { fontSize: 12, color: COLORS.grayDark, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.grayLight, paddingTop: 12 },
  serviceLabel: { fontSize: 11, color: COLORS.grayDark, marginBottom: 2 },
  price: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  perKm: { fontSize: 12, fontWeight: 'normal', color: COLORS.grayDark },
  bookBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  bookText: { fontSize: 12, fontWeight: '500', color: COLORS.white },
});
