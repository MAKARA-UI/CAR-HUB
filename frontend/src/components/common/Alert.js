import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';

export default function Alert({ visible, type = 'info', title, message, onClose, duration = 3000 }) {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onClose?.());
    }
  }, [visible]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.warning;
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: getColor(), opacity: fadeAnim }]}>
      <Icon name={getIcon()} size={20} color={COLORS.white} />
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon name="close" size={16} color={COLORS.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, zIndex: 1000 },
  content: { flex: 1, marginLeft: 12 },
  title: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  message: { color: COLORS.white, fontSize: 12, marginTop: 2 },
  closeButton: { padding: 4 },
});
