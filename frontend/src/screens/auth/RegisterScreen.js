import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { authStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import { validateRegister } from '../../utils/validation';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading } = authStore();

  const handleRegister = async () => {
    const { isValid, errors: validationErrors } = validateRegister(name, email, phone, password, confirmPassword, role);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const result = await register({ name, email, phone, password, role });
    if (!result.success) Alert.alert('Registration Failed', result.error);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LoadingSpinner visible={isLoading} fullScreen />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image source={require('../../../assets/ks-car-hub-logo.jpg')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Create Account</Text><Text style={styles.subtitle}>Join KS Car Hub today</Text>
          </View>
          <View style={styles.form}>
            <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" icon="person" error={errors.name} />
            <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" icon="email" error={errors.email} />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+266 XXXX XXXX" keyboardType="phone-pad" icon="phone" error={errors.phone} />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry={!showPassword} icon="lock" rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.grayDark} /></TouchableOpacity>} error={errors.password} />
            <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm your password" secureTextEntry={!showConfirmPassword} icon="lock" rightIcon={<TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><Icon name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.grayDark} /></TouchableOpacity>} error={errors.confirmPassword} />
            <Text style={styles.roleLabel}>I want to</Text>
            <View style={styles.roleContainer}>{['customer', 'driver'].map((item) => <TouchableOpacity key={item} style={[styles.roleButton, role === item && styles.roleButtonActive]} onPress={() => setRole(item)}><Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item === 'customer' ? 'Book Rides' : 'Offer Transport'}</Text></TouchableOpacity>)}</View>
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            <Button title="Sign Up" onPress={handleRegister} size="large" />
            <View style={styles.login}><Text style={styles.loginText}>Already have an account? </Text><TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.loginLink}>Sign In</Text></TouchableOpacity></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, paddingHorizontal: 32 },
  logo: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.grayLight },
  logoImage: { width: 70, height: 70 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.grayDark, marginTop: 4 },
  form: { paddingHorizontal: 24, paddingBottom: 40 },
  roleLabel: { fontSize: 14, fontWeight: '500', color: COLORS.black, marginBottom: 8 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grayLight, alignItems: 'center' },
  roleButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { fontSize: 14, color: COLORS.grayDark },
  roleTextActive: { color: COLORS.white },
  errorText: { fontSize: 12, color: COLORS.error, marginBottom: 8 },
  login: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: COLORS.grayDark },
  loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
});
