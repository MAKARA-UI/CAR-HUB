import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function Card({ children, onPress, style = {}, elevation = true, padding = 12 }) {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[styles.card, elevation && styles.elevation, { padding }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  elevation: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
