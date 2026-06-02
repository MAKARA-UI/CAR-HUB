import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { authStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';
import { validateLogin } from '../../utils/validation';
import { SAFE_AREA_EDGES } from '../../utils/safeArea';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = authStore();

  const handleLogin = async () => {
    const { isValid, errors: validationErrors } = validateLogin(email, password);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const result = await login(email, password);
    if (!result.success) Alert.alert('Login Failed', result.error || 'Invalid email or password');
  };

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LoadingSpinner visible={isLoading} fullScreen />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image source={require('../../../assets/ks-car-hub-logo.jpg')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>
          <View style={styles.form}>
            <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" icon="email" error={errors.email} />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry={!showPassword} icon="lock" rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.grayDark} /></TouchableOpacity>} error={errors.password} />
            <TouchableOpacity style={styles.forgotPassword} onPress={() => Alert.alert('Forgot Password', 'Please contact support to reset your password')}><Text style={styles.forgotText}>Forgot Password?</Text></TouchableOpacity>
            <Button title="Sign In" onPress={handleLogin} size="large" />
            <View style={styles.register}><Text style={styles.registerText}>Don't have an account? </Text><TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.registerLink}>Sign Up</Text></TouchableOpacity></View>
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
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 32 },
  logo: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.grayLight },
  logoImage: { width: 88, height: 88 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.grayDark, marginTop: 8 },
  form: { flex: 1, paddingHorizontal: 24 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 14 },
  register: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  registerText: { fontSize: 14, color: COLORS.grayDark },
  registerLink: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
});
