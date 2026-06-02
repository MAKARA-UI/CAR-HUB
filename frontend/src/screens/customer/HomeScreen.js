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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Booking</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.grayDark} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars..."
          value={searchDraft}
          onChangeText={setSearchDraft}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchDraft.length > 0 && (
          <TouchableOpacity
            style={styles.searchIconButton}
            onPress={() => {
              setSearchDraft('');
              setSearchQuery('');
            }}
          >
            <Icon name="close" size={20} color={COLORS.grayDark} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.modeSelector}>
        {SERVICE_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeChip, selectedMode === mode.id && styles.modeChipActive]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <Text style={[styles.modeText, selectedMode === mode.id && styles.modeTextActive]}>{mode.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
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
            <Icon name="directions-car" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>No cars found for this category</Text>
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
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  searchIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  categories: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 44,
  },
  categoriesContent: {
    alignItems: 'center',
    paddingRight: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeText: {
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: '600',
  },
  modeTextActive: {
    color: COLORS.white,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.grayDark,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SAFE_SCROLL_PADDING_BOTTOM,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginTop: 16,
  },
});
