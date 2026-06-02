import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import VehicleCard from '../../components/vehicles/VehicleCard';
import BookingFormModal from '../../components/booking/BookingFormModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vehicleAPI } from '../../services/api';
import { CATEGORY_MODE_REQUIRED, COLORS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { SAFE_AREA_EDGES, SAFE_SCROLL_PADDING_BOTTOM } from '../../utils/safeArea';

export default function HomeScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('individual');
  const [selectedCategory, setSelectedCategory] = useState('local');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, selectedMode, selectedCategory, vehicles]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      if (response.success) {
        setVehicles(response.vehicles);
        setFilteredVehicles(response.vehicles);
      }
    } catch (error) {
      console.error('Fetch vehicles error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    filtered = filtered.filter((v) => (v.category || 'local') === selectedCategory);
    filtered = filtered.filter((v) => {
      const mode = v.serviceMode || 'individual';
      if (!CATEGORY_MODE_REQUIRED.includes(v.category || 'local')) {
        return selectedMode === 'individual';
      }
      return mode === selectedMode;
    });

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((v) =>
        v.make?.toLowerCase().includes(normalizedQuery) ||
        v.model?.toLowerCase().includes(normalizedQuery) ||
        v.type?.toLowerCase().includes(normalizedQuery) ||
        v.color?.toLowerCase().includes(normalizedQuery) ||
        v.licensePlate?.toLowerCase().includes(normalizedQuery) ||
        v.location?.toLowerCase().includes(normalizedQuery)
      );
    }

    setFilteredVehicles(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const handleVehiclePress = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSearch = () => {
    setSearchQuery(searchDraft.trim());
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>

      {/* ── Teal header with search ── */}
      <View style={styles.header}>
        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />

        <Text style={styles.headerSub}>Discover available rides</Text>
        <Text style={styles.headerTitle}>Find your booking</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#9FE1CB" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={searchDraft}
            onChangeText={setSearchDraft}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchDraft.length > 0 && (
            <TouchableOpacity
              style={styles.searchClearBtn}
              onPress={() => {
                setSearchDraft('');
                setSearchQuery('');
              }}
            >
              <Icon name="close" size={16} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="search" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Trip type toggle */}
        <Text style={styles.sectionLabel}>Trip type</Text>
        <View style={styles.modeSelector}>
          {SERVICE_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeChip, selectedMode === mode.id && styles.modeChipActive]}
              onPress={() => setSelectedMode(mode.id)}
            >
              <Text style={[styles.modeText, selectedMode === mode.id && styles.modeTextActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {SERVICE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Available vehicles</Text>
      </View>

      {/* ── Vehicle list ── */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} onPress={() => handleVehiclePress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="directions-car" size={56} color="#D3D1C7" />
            <Text style={styles.emptyTitle}>No cars found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <BookingFormModal
        visible={Boolean(selectedVehicle)}
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onBooked={() => {
          setSelectedVehicle(null);
          navigation.navigate('Bookings');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ef',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerCircleLarge: {
    position: 'absolute',
    right: -28,
    top: -34,
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  headerCircleSmall: {
    position: 'absolute',
    right: 48,
    bottom: -44,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d7f4ec',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 16,
  },

  // ── Search (inside header) ───────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
  },
  searchClearBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginLeft: 6,
  },

  // ── Body labels & filters ────────────────────────────────
  body: {
    paddingHorizontal: 15,
    paddingTop: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '700',
  },
  modeTextActive: {
    color: COLORS.white,
  },
  categories: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 14,
  },
  categoriesContent: {
    alignItems: 'center',
    paddingRight: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  categoryTextActive: {
    color: COLORS.white,
  },

  // ── List ─────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: SAFE_SCROLL_PADDING_BOTTOM,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#888780',
    textAlign: 'center',
    lineHeight: 20,
  },
});