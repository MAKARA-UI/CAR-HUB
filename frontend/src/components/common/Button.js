import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  style = {},
  textStyle = {},
}) {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.grayLight;
    if (variant === 'primary') return COLORS.primary;
    if (variant === 'secondary') return COLORS.secondary;
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return COLORS.error;
    return COLORS.primary;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'danger') return COLORS.error;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return COLORS.grayDark;
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'danger') return COLORS.error;
    return COLORS.white;
  };

  const getPadding = () => {
    if (size === 'small') return { paddingVertical: 8, paddingHorizontal: 16 };
    if (size === 'large') return { paddingVertical: 14, paddingHorizontal: 24 };
    return { paddingVertical: 12, paddingHorizontal: 20 };
  };

  const getFontSize = () => {
    if (size === 'small') return 14;
    if (size === 'large') return 16;
    return 15;
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator color={getTextColor()} />;

    const textElement = (
      <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }, textStyle]}>
        {title}
      </Text>
    );

    if (icon) {
      return (
        <View style={styles.iconContainer}>
          {iconPosition === 'left' && icon}
          {textElement}
          {iconPosition === 'right' && icon}
        </View>
      );
    }

    return textElement;
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor(), borderColor: getBorderColor(), ...getPadding() }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
