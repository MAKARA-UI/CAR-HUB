import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function LoadingSpinner({ fullScreen = false, visible = true, message = '', transparent = true }) {
  if (!visible) return null;

  if (fullScreen) {
    return (
      <Modal transparent={transparent} visible={fullScreen} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  spinnerContainer: { backgroundColor: COLORS.white, padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 120 },
  message: { fontSize: 14, color: COLORS.grayDark, marginTop: 12, textAlign: 'center' },
});
