import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/common/Button';
import { COLORS, STORAGE_KEYS } from '../../utils/constants';
import { SAFE_AREA_EDGES } from '../../utils/safeArea';

const { width } = Dimensions.get('window');

const onboardingData = [
  { id: '1', title: 'Book Transport Easily', description: 'Find private hire and shared trip options in a few taps', icon: 'directions-car' },
  { id: '2', title: 'Reliable Transport', description: 'Verified drivers and vehicles for your safety and peace of mind', icon: 'verified-user' },
  { id: '3', title: 'Track Bookings', description: 'Follow each request from pending to confirmed', icon: 'place' },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.logoFrame}>
        <Image source={require('../../../assets/ks-car-hub-logo.jpg')} style={styles.logoImage} resizeMode="contain" />
      </View>
      <View style={styles.iconCircle}><Icon name={item.icon} size={56} color={COLORS.primary} /></View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <FlatList ref={flatListRef} data={onboardingData} renderItem={renderItem} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))} />
      <View style={styles.pagination}>{onboardingData.map((_, index) => <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />)}</View>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleGetStarted} style={styles.skipButton}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>
        <Button title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'} onPress={handleNext} style={styles.nextButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoFrame: { width: 132, height: 132, borderRadius: 66, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 28, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.grayLight },
  logoImage: { width: 120, height: 120 },
  iconCircle: { width: 112, height: 112, borderRadius: 56, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, color: COLORS.grayDark, textAlign: 'center', lineHeight: 24 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.grayLight, marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: COLORS.primary },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingBottom: 48 },
  skipButton: { paddingVertical: 12, paddingHorizontal: 16 },
  skipText: { fontSize: 16, color: COLORS.grayDark },
  nextButton: { flex: 0.4 },
});
