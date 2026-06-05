import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingStore } from '../../store/bookingStore';
import { authStore } from '../../store/authStore';
import { profileAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';
import { SAFE_AREA_EDGES } from '../../utils/safeArea';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '🚗' };
  return { text: 'Good Evening', emoji: '🌙' };
}

// ── Animated count-up hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({ number, label }) {
  const count = useCountUp(number);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: Animated.multiply(scale, pressScale) }], opacity }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.statCardInner}>
        <Text style={styles.statNumber}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Animated car banner ───────────────────────────────────────────────────────
function CarBanner({ message }) {
  const carX = useRef(new Animated.Value(-80)).current;
  const roadOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(carX, { toValue: SCREEN_WIDTH + 20, duration: 4500, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(roadOffset, { toValue: -40, duration: 600, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={styles.bannerCard}>
      <View style={styles.bannerRoad}>
        {[...Array(10)].map((_, i) => (
          <Animated.View
            key={i}
            style={[styles.roadDash, { left: i * 44, transform: [{ translateX: roadOffset }] }]}
          />
        ))}
      </View>
      <Animated.Text style={[styles.bannerCar, { transform: [{ translateX: carX }] }]}>🚗</Animated.Text>
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

// ── Pulsing FAB ───────────────────────────────────────────────────────────────
function PulsingFAB({ onPress, bottom }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.14, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.fabGlow, { bottom, transform: [{ scale: pulse }] }]}>
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
        <Icon name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Overview card with fade-in ────────────────────────────────────────────────
function OverviewCard({ iconName, iconColor, badgeStyle, number, label }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.overviewCard, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.iconBadge, badgeStyle]}>
        <Icon name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.overviewNumber}>{number}</Text>
      <Text style={styles.overviewLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DriverHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = authStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { driverRequests, fetchDriverRequests } = bookingStore();
  const greeting = getGreeting();

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const refreshTimer = setInterval(() => { fetchDriverRequests(); }, 10000);
      return () => clearInterval(refreshTimer);
    }, [])
  );

  const fetchData = async () => {
    await Promise.all([fetchDriverRequests(), fetchMyVehicles()]);
    setLoading(false);
  };

  const fetchMyVehicles = async () => {
    try {
      const response = await profileAPI.getMyVehicles();
      if (response.success) setVehicles(response.vehicles);
    } catch (error) {
      console.error('Fetch vehicles error:', error);
    }
  };

  const handleAddVehicle = () => navigation.navigate('AddVehicle');

  const pendingRequests = driverRequests.filter((b) => b.status === 'PENDING');
  const activeBookings = driverRequests.filter((b) => b.status === 'ACCEPTED');
  const rejectedBookings = driverRequests.filter((b) => b.status === 'REJECTED');
  const availableVehicles = vehicles.filter((v) => v.isAvailable !== false);

  const displayName = user?.name || 'Driver';
  const firstName = displayName.split(' ')[0] || displayName;
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((n) => n.charAt(0).toUpperCase()).join('');

  // Dynamic banner message
  const bannerMessage = pendingRequests.length > 0
    ? `${pendingRequests.length} customer${pendingRequests.length > 1 ? 's' : ''} waiting for approval`
    : activeBookings.length > 0
    ? 'Drive More. Earn More.'
    : 'Ready for Your Next Journey';

  // Achievements based on real data
  const totalBookings = driverRequests.length;
  const achievements = [
    { icon: '🏆', label: 'First Booking', unlocked: totalBookings >= 1 },
    { icon: '⭐', label: '5 Trips', unlocked: activeBookings.length >= 5 },
    { icon: '🚘', label: '2+ Vehicles', unlocked: vehicles.length >= 2 },
    { icon: '💯', label: 'Top Rated', unlocked: (user?.rating || 0) >= 4.5 },
    { icon: '🎯', label: 'Active Driver', unlocked: pendingRequests.length > 0 },
  ];

  // Progress: monthly goal of 20 trips
  const MONTHLY_GOAL = 20;
  const progressValue = Math.min(activeBookings.length / MONTHLY_GOAL, 1);
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progressValue, duration: 900, useNativeDriver: false }).start();
  }, [progressValue]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* ── 1. Header ── */}
        <View style={styles.header}>
          <View style={styles.headerCircleLarge} />
          <View style={styles.headerCircleSmall} />
          <View>
            <Text style={styles.greeting}>{greeting.emoji} {greeting.text},</Text>
            <Text style={styles.driverName}>{firstName}</Text>
            <View style={styles.activeStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.activeText}>Online & active</Text>
            </View>
            <Text style={styles.headerSub}>Ready for your next trip today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'D'}</Text>
          </View>
        </View>

        {/* ── 2. Animated car banner ── */}
        <CarBanner message={bannerMessage} />

        <View style={styles.dashboardBody}>

          {/* ── 3. Animated stats ── */}
          <View style={styles.statsContainer}>
            <StatCard number={vehicles.length} label="Vehicles" />
            <StatCard number={pendingRequests.length} label="Pending" />
            <StatCard number={activeBookings.length} label="Confirmed" />
          </View>

          {/* ── 7. Achievements ── */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
              {achievements.map((a, i) => (
                <View key={i} style={[styles.achievementBadge, !a.unlocked && styles.achievementLocked]}>
                  <Text style={styles.achievementIcon}>{a.icon}</Text>
                  <Text style={[styles.achievementLabel, !a.unlocked && styles.achievementLabelLocked]}>{a.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── 8. Progress card ── */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>MONTHLY GOAL</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Confirmed trips</Text>
                <Text style={styles.progressCount}>{activeBookings.length} / {MONTHLY_GOAL}</Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                }]} />
              </View>
              <Text style={styles.progressSub}>
                {activeBookings.length >= MONTHLY_GOAL
                  ? '🎉 Goal reached!'
                  : `${MONTHLY_GOAL - activeBookings.length} trips to reach your monthly goal`}
              </Text>
            </View>
          </View>

          {/* ── 10. Recent activity feed ── */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
            <View style={styles.activityCard}>
              {driverRequests.length === 0 ? (
                <Text style={styles.activityEmpty}>No recent activity</Text>
              ) : (
                driverRequests.slice(0, 5).map((req, i) => (
                  <View key={req.id} style={[styles.activityRow, i < Math.min(driverRequests.length - 1, 4) && styles.activityRowBorder]}>
                    <View style={[styles.activityDot,
                      req.status === 'ACCEPTED' ? styles.activityDotGreen
                      : req.status === 'REJECTED' ? styles.activityDotRed
                      : styles.activityDotAmber
                    ]} />
                    <View style={styles.activityText}>
                      <Text style={styles.activityTitle}>
                        {req.status === 'ACCEPTED' ? 'Booking confirmed'
                          : req.status === 'REJECTED' ? 'Booking rejected'
                          : 'New booking request'}
                      </Text>
                      <Text style={styles.activitySub}>
                        {req.pickupLocation} → {req.destination}
                      </Text>
                    </View>
                    <View style={[styles.activityBadge,
                      req.status === 'ACCEPTED' ? styles.activityBadgeGreen
                      : req.status === 'REJECTED' ? styles.activityBadgeRed
                      : styles.activityBadgeAmber
                    ]}>
                      <Text style={styles.activityBadgeText}>
                        {req.status === 'ACCEPTED' ? 'Confirmed' : req.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── 12. Pulsing FAB ── */}
      <PulsingFAB onPress={handleAddVehicle} bottom={insets.bottom + 24} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ef' },
  scrollContent: { flexGrow: 1 },
  dashboardBody: { flex: 1, paddingBottom: 16 },

  // Header
  header: { minHeight: 164, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, justifyContent: 'center', overflow: 'hidden' },
  headerCircleLarge: { position: 'absolute', right: -28, top: -34, width: 122, height: 122, borderRadius: 61, backgroundColor: 'rgba(255,255,255,0.10)' },
  headerCircleSmall: { position: 'absolute', right: 48, bottom: -44, width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.08)' },
  greeting: { fontSize: 13, fontWeight: '700', color: '#d7f4ec', marginBottom: 2 },
  driverName: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  activeStatus: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#b9f4d8' },
  activeText: { fontSize: 12, fontWeight: '800', color: COLORS.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.70)', fontWeight: '500' },
  avatar: { position: 'absolute', top: 22, right: 20, width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.white },

  // Banner
  bannerCard: { backgroundColor: '#1a2e24', marginHorizontal: 15, marginTop: 14, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, overflow: 'hidden', minHeight: 70 },
  bannerRoad: { position: 'absolute', bottom: 16, left: 0, right: 0, height: 4, backgroundColor: '#2e4a38', flexDirection: 'row', overflow: 'hidden' },
  roadDash: { position: 'absolute', width: 24, height: 4, backgroundColor: '#19b68d', borderRadius: 2 },
  bannerCar: { fontSize: 28, position: 'absolute', bottom: 18 },
  bannerText: { fontSize: 13, fontWeight: '800', color: '#9FE1CB', marginBottom: 20 },

  // Stats
  statsContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingTop: 14, paddingBottom: 6, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#2f302d', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 4 },
  statCardInner: { paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#19b68d' },
  statLabel: { fontSize: 12, color: '#f3eee4', marginTop: 4 },

  // Section wrapper
  sectionWrap: { paddingHorizontal: 15, marginTop: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#b8b5ae', letterSpacing: 0.7, marginBottom: 10 },

  // Achievements
  achievementsRow: { gap: 10, paddingRight: 4 },
  achievementBadge: { backgroundColor: '#2f302d', borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 72, gap: 5 },
  achievementLocked: { opacity: 0.35 },
  achievementIcon: { fontSize: 22 },
  achievementLabel: { fontSize: 10, fontWeight: '700', color: '#f3eee4', textAlign: 'center' },
  achievementLabelLocked: { color: '#888' },

  // Progress
  progressCard: { backgroundColor: '#2f302d', borderRadius: 12, padding: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#f3eee4' },
  progressCount: { fontSize: 13, fontWeight: '800', color: '#19b68d' },
  progressTrack: { height: 8, backgroundColor: '#1a2e24', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#19b68d', borderRadius: 4 },
  progressSub: { fontSize: 11, color: '#b8b5ae', marginTop: 8, fontWeight: '600' },

  // Activity feed
  activityCard: { backgroundColor: '#2f302d', borderRadius: 12, overflow: 'hidden' },
  activityEmpty: { fontSize: 13, color: '#888', padding: 16, textAlign: 'center' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  activityRowBorder: { borderBottomWidth: 0.5, borderBottomColor: '#3a3b38' },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityDotGreen: { backgroundColor: '#19b68d' },
  activityDotRed: { backgroundColor: COLORS.error },
  activityDotAmber: { backgroundColor: '#EF9F27' },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '700', color: '#f3eee4' },
  activitySub: { fontSize: 11, color: '#888', marginTop: 2 },
  activityBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  activityBadgeGreen: { backgroundColor: '#1a3d2c' },
  activityBadgeRed: { backgroundColor: '#3d1a1a' },
  activityBadgeAmber: { backgroundColor: '#3d2e00' },
  activityBadgeText: { fontSize: 10, fontWeight: '700', color: '#9FE1CB' },

  // FAB
  fabGlow: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 12, elevation: 8 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});