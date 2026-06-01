import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vehicleAPI } from '../../services/api';
import { CATEGORY_MODE_REQUIRED, COLORS, SERVICE_CATEGORIES, SERVICE_MODES, VEHICLE_TYPES } from '../../utils/constants';
import { validateVehicle } from '../../utils/validation';

export default function AddVehicleScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('sedan');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('local');
  const [serviceMode, setServiceMode] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const shouldShowMode = CATEGORY_MODE_REQUIRED.includes(category);
  const shouldShowDepartureTime = category === 'outside_country' && serviceMode === 'trip';

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to add vehicle images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.35,
        base64: true,
      });

      if (result.canceled || result.cancelled) {
        return;
      }

      const assets = result.assets ?? (result.uri ? [result] : []);
      setImages((currentImages) => [...currentImages, ...assets]);
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Unable to pick images. Please try again.');
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const getImageDataUrls = async () => {
    const imageDataUrls = [];
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      if (image.base64) {
        const contentType = image.mimeType || 'image/jpeg';
        imageDataUrls.push(`data:${contentType};base64,${image.base64}`);
      }
    }
    return imageDataUrls;
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateVehicle(
      type,
      make,
      model,
      year,
      price,
      capacity,
      color,
      licensePlate,
      category,
      shouldShowMode ? serviceMode : 'individual',
      shouldShowDepartureTime ? departureTime : ''
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await getImageDataUrls();
      }

      const vehicleData = {
        type,
        make,
        model,
        year: parseInt(year, 10),
        color,
        licensePlate,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price),
        pricePerKm: parseFloat(price),
        category,
        serviceMode: shouldShowMode ? serviceMode : 'individual',
        departureTime: shouldShowDepartureTime ? departureTime : '',
        images: imageUrls,
      };

      const response = await vehicleAPI.create(vehicleData);
      if (response.success) {
        Alert.alert('Success', 'Vehicle added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LoadingSpinner visible={loading} fullScreen />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Vehicle Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
            {VEHICLE_TYPES.filter((vehicleType) => vehicleType.id !== 'all').map((vehicleType) => (
              <TouchableOpacity
                key={vehicleType.id}
                style={[
                  styles.typeChip,
                  type === vehicleType.id && styles.typeChipActive,
                ]}
                onPress={() => setType(vehicleType.id)}
              >
                <Icon
                  name={vehicleType.icon}
                  size={20}
                  color={type === vehicleType.id ? COLORS.white : COLORS.grayDark}
                />
                <Text style={[styles.typeText, type === vehicleType.id && styles.typeTextActive]}>
                  {vehicleType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

          <Text style={styles.label}>Category</Text>
          <View style={styles.optionGrid}>
            {SERVICE_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.optionChip, category === item.id && styles.optionChipActive]}
                onPress={() => {
                  setCategory(item.id);
                  if (!CATEGORY_MODE_REQUIRED.includes(item.id)) {
                    setServiceMode('');
                    setDepartureTime('');
                  }
                }}
              >
                <Text style={[styles.optionText, category === item.id && styles.optionTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {shouldShowMode && (
            <>
              <Text style={styles.label}>Booking Type</Text>
              <View style={styles.optionGrid}>
                {SERVICE_MODES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.optionChip, serviceMode === item.id && styles.optionChipActive]}
                    onPress={() => {
                      setServiceMode(item.id);
                      if (item.id !== 'trip') setDepartureTime('');
                    }}
                  >
                    <Text style={[styles.optionText, serviceMode === item.id && styles.optionTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.serviceMode && <Text style={styles.errorText}>{errors.serviceMode}</Text>}
            </>
          )}

          {shouldShowDepartureTime && (
            <Input
              label="Departure Time"
              value={departureTime}
              onChangeText={setDepartureTime}
              placeholder="Example: 06:30 AM"
              error={errors.departureTime}
            />
          )}

          <Input
            label="Make"
            value={make}
            onChangeText={setMake}
            placeholder="Toyota, Honda"
            error={errors.make}
          />

          <Input
            label="Model"
            value={model}
            onChangeText={setModel}
            placeholder="Rav4, Civic"
            error={errors.model}
          />

          <Input
            label="Year"
            value={year}
            onChangeText={setYear}
            placeholder="2022"
            keyboardType="numeric"
            error={errors.year}
          />

          <Input
            label="Color"
            value={color}
            onChangeText={setColor}
            placeholder="White, Black"
            error={errors.color}
          />

          <Input
            label="License Plate"
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="LS123ABC"
            autoCapitalize="characters"
            error={errors.licensePlate}
          />

          <Input
            label="Capacity (seats)"
            value={capacity}
            onChangeText={setCapacity}
            placeholder="4"
            keyboardType="numeric"
            error={errors.capacity}
          />

          <Input
            label="Price (LSL)"
            value={price}
            onChangeText={setPrice}
            placeholder="Driver price"
            keyboardType="numeric"
            error={errors.price}
          />

          <Text style={styles.label}>Vehicle Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Icon name="add-photo-alternate" size={40} color={COLORS.grayDark} />
              <Text style={styles.addImageText}>Add Photos</Text>
            </TouchableOpacity>
            {images.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(index)}>
                  <Icon name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Add Vehicle" onPress={handleSubmit} size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    backgroundColor: COLORS.gray,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    marginRight: 12,
    gap: 8,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.grayDark,
  },
  typeTextActive: {
    color: COLORS.white,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.white,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginBottom: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.grayDark,
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.gray,
  },
});
