import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import BookingFormModal from '../../components/booking/BookingFormModal';
import { vehicleAPI } from '../../services/api';
import { COLORS, SERVICE_CATEGORIES, SERVICE_MODES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export default function VehicleDetailScreen({ route, navigation }) {
  const { vehicle: passedVehicle } = route.params;
  const [vehicle, setVehicle] = useState(passedVehicle);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, []);

  const fetchVehicleDetails = async () => {
    if (!passedVehicle?.id) return;

    try {
      const response = await vehicleAPI.getById(passedVehicle.id);
      if (response.success) {
        setVehicle(response.vehicle);
      }
    } catch (error) {
      console.error('Fetch vehicle details error:', error);
    }
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const images = vehicle?.images || [];
  const hasMultipleImages = images.length > 1;
  const categoryLabel = SERVICE_CATEGORIES.find((item) => item.id === (vehicle?.category || 'local'))?.label || 'Local';
  const modeLabel = SERVICE_MODES.find((item) => item.id === (vehicle?.serviceMode || 'individual'))?.label || 'Private Hire';
  const displayPrice = vehicle?.price ?? vehicle?.pricePerKm;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <Image source={{ uri: images[currentImageIndex] }} style={styles.mainImage} />
              {hasMultipleImages && (
                <View style={styles.imageDots}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.imageDot,
                        currentImageIndex === index && styles.imageDotActive,
                      ]}
                      onPress={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="directions-car" size={80} color={COLORS.grayLight} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {vehicle?.make} {vehicle?.model} ({vehicle?.year})
          </Text>

          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color={COLORS.warning} />
            <Text style={styles.ratingText}>{vehicle?.rating?.toFixed(1) || 0}</Text>
            <Text style={styles.reviewCount}>({vehicle?.totalReviews || 0} reviews)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatCurrency(displayPrice)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Icon name="directions-car" size={24} color={COLORS.primary} />
                <Text style={styles.specLabel}>Service</Text>
                <Text style={styles.specValue}>{modeLabel}</Text>
              </View>
              <View style={styles.specItem}>
                <Icon name="people" size={24} color={COLORS.primary} />
                <Text style={styles.specLabel}>Capacity</Text>
                <Text style={styles.specValue}>{vehicle?.capacity} seats</Text>
              </View>
              <View style={styles.specItem}>
                <Icon name="color-lens" size={24} color={COLORS.primary} />
                <Text style={styles.specLabel}>Color</Text>
                <Text style={styles.specValue}>{vehicle?.color || 'Not set'}</Text>
              </View>
              <View style={styles.specItem}>
                <Icon name="confirmation-number" size={24} color={COLORS.primary} />
                <Text style={styles.specLabel}>Category</Text>
                <Text style={styles.specValue}>{categoryLabel}</Text>
              </View>
              <View style={styles.specItem}>
                <Icon name="badge" size={24} color={COLORS.primary} />
                <Text style={styles.specLabel}>Plate</Text>
                <Text style={styles.specValue}>{vehicle?.licensePlate || 'Not set'}</Text>
              </View>
              {vehicle?.departureTime ? (
                <View style={styles.specItem}>
                  <Icon name="schedule" size={24} color={COLORS.primary} />
                  <Text style={styles.specLabel}>Departure</Text>
                  <Text style={styles.specValue}>{vehicle.departureTime}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {vehicle?.features && vehicle.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresList}>
                {vehicle.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {vehicle?.driver && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Icon name="person" size={32} color={COLORS.white} />
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{vehicle.driver.name}</Text>
                  <View style={styles.driverRating}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.driverRatingText}>
                      {vehicle.driver.rating?.toFixed(1) || 0} rating
                    </Text>
                  </View>
                  <Text style={styles.driverTrips}>
                    {vehicle.driver.totalTrips || 0} trips completed
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bookButtonContainer}>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          size="large"
          style={styles.bookButton}
        />
      </View>
      <BookingFormModal
        visible={showBookingForm}
        vehicle={vehicle}
        onClose={() => setShowBookingForm(false)}
        onBooked={() => {
          setShowBookingForm(false);
          navigation.navigate('Bookings');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  imageDotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  perKm: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.grayDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  specLabel: {
    fontSize: 12,
    color: COLORS.grayDark,
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.black,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    padding: 16,
    borderRadius: 12,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    marginLeft: 16,
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  driverRatingText: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginLeft: 4,
  },
  driverTrips: {
    fontSize: 12,
    color: COLORS.grayDark,
    marginTop: 4,
  },
  bookButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  bookButton: {
    borderRadius: 12,
  },
});
