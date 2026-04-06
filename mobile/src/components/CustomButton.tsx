import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { COLORS, ROUNDING, SPACING } from "../theme";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.textSecondary + "40";
    if (variant === "primary") return COLORS.primary;
    if (variant === "secondary") return COLORS.secondary;
    if (variant === "outline" || variant === "ghost") return "transparent";
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    if (variant === "outline") return COLORS.primary;
    if (variant === "ghost") return COLORS.textSecondary;
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (variant === "outline") return COLORS.primary;
    return "transparent";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        variant === "outline" && { borderWidth: 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: ROUNDING.xl,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
