import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { profileAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';

export default function SettingsScreen({ navigation, route }) {
  const { section } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.updateProfile({ name, phone });
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Edit Profile</Text>
      <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your name" />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="Enter your phone" keyboardType="phone-pad" />
      <Input label="Email" value={email} editable={false} placeholder="Email" />
      <Button title="Save Changes" onPress={handleSaveProfile} />
    </View>
  );

  const renderMyVehicles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Vehicles</Text>
      <Text style={styles.bodyText}>Review your current vehicle list and make updates from the driver dashboard.</Text>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Methods</Text>
      <Text style={styles.bodyText}>Add or manage credit cards and payout options for your driver account.</Text>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon style={styles.settingIcon} name="notifications" size={24} color={COLORS.primary} />
          <Text style={styles.settingLabel}>Push Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
        />
      </View>
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon style={styles.settingIcon} name="email" size={24} color={COLORS.primary} />
          <Text style={styles.settingLabel}>Email Alerts</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
        />
      </View>
    </View>
  );

  const renderPrivacyPolicy = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Policy</Text>
      <Text style={styles.bodyText}>View the terms and privacy policy that govern your use of the driver app.</Text>
    </View>
  );

  const renderAboutUs = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About Us</Text>
      <Text style={styles.bodyText}>Learn more about the app, our goals, and how driver service works.</Text>
    </View>
  );

  const renderContent = () => {
    switch (section) {
      case 'profile':
        return renderProfileSection();
      case 'myVehicles':
        return renderMyVehicles();
      case 'paymentMethods':
        return renderPaymentMethods();
      case 'notifications':
        return renderNotifications();
      case 'privacyPolicy':
        return renderPrivacyPolicy();
      case 'aboutUs':
        return renderAboutUs();
      default:
        return (
          <>
            {renderProfileSection()}
            {renderNotifications()}
          </>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray },
  scrollContainer: { paddingBottom: 24 },
  section: { backgroundColor: COLORS.white, marginTop: 12, marginHorizontal: 16, paddingHorizontal: 16, paddingVertical: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { marginRight: 12 },
  settingLabel: { fontSize: 16, color: COLORS.black },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 12 },
  menuTitle: { fontSize: 16, color: COLORS.black },
  bodyText: { fontSize: 15, color: COLORS.grayDark, lineHeight: 22 },
});
