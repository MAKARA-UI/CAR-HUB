import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS, BOOKING_STATUS } from '../../utils/constants';

export default function StatusBadge({ status, size = 'medium', showIcon = true }) {
  const statusConfig = BOOKING_STATUS[status] || { label: status || 'Unknown', color: COLORS.grayDark };

  const getIcon = () => {
    switch (status) {
      case 'PENDING': return 'schedule';
      case 'ACCEPTED': return 'check-circle';
      case 'COMPLETED': return 'verified';
      case 'REJECTED': return 'cancel';
      case 'CANCELLED': return 'close';
      default: return 'info';
    }
  };

  const getSizeStyles = () => {
    if (size === 'small') return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, iconSize: 12, gap: 4 };
    if (size === 'large') return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, iconSize: 16, gap: 8 };
    return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, iconSize: 14, gap: 6 };
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.badge, { backgroundColor: `${statusConfig.color}20`, paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical, gap: sizeStyles.gap }]}>
      {showIcon && <Icon name={getIcon()} size={sizeStyles.iconSize} color={statusConfig.color} />}
      <Text style={[styles.text, { color: statusConfig.color, fontSize: sizeStyles.fontSize }]}>{statusConfig.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontWeight: '500' },
});
