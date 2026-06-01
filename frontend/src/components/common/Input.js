import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../utils/constants';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = '',
  icon,
  rightIcon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style = {},
  inputStyle = {},
  onFocus,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const inputType = isPassword ? !showPassword : false;

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputFocused, error ? styles.inputError : null]}>
        {icon && <Icon name={icon} size={20} color={COLORS.grayDark} style={styles.leftIcon} />}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grayDark}
          secureTextEntry={inputType}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && !rightIcon && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.grayDark} />
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.black, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 8, backgroundColor: COLORS.white },
  inputFocused: { borderColor: COLORS.primary, borderWidth: 2 },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, color: COLORS.black },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  leftIcon: { marginLeft: 12 },
  rightIcon: { marginRight: 12 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});
