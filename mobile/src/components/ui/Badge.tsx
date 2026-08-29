import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface BadgeProps {
  label: string;
  variant?: "income" | "expense" | "transfer" | "warning" | "neutral" | "primary";
  style?: ViewStyle;
}

export function Badge({ label, variant = "neutral", style }: BadgeProps) {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case "income":
        return { bg: colors.successSoft, text: colors.success };
      case "expense":
        return { bg: colors.destructiveSoft, text: colors.destructive };
      case "transfer":
        return { bg: colors.accentSoft, text: colors.accent };
      case "warning":
        return { bg: colors.warningSoft, text: colors.warning };
      case "primary":
        return { bg: colors.accentSoft, text: colors.primary };
      default:
        return { bg: colors.surfaceMuted, text: colors.foregroundSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
