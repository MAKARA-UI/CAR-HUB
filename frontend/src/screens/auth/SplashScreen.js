import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, STORAGE_KEYS } from '../../utils/constants';
import { SAFE_AREA_EDGES } from '../../utils/safeArea';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setTimeout(async () => {
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      navigation.replace(onboardingCompleted === 'true' ? 'Login' : 'Onboarding');
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <View style={styles.logo}>
          <Image source={require('../../../assets/ks-car-hub-logo.jpg')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>KS Car Hub</Text>
        <Text style={styles.subtitle}>Smart Transport Booking System</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 124, height: 124, borderRadius: 62, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImage: { width: 112, height: 112 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
  subtitle: { fontSize: 14, color: COLORS.white, marginTop: 8, opacity: 0.9 },
});
