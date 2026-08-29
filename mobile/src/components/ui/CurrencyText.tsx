import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { formatMinorUnits } from "../../utils/money";
import { useTheme } from "../../context/ThemeContext";

interface CurrencyTextProps {
  amountMinor: number;
  currency?: string;
  type?: "income" | "expense" | "transfer" | "neutral";
  size?: "hero" | "lg" | "md" | "sm";
  style?: TextStyle;
  showSign?: boolean;
}

export function CurrencyText({
  amountMinor,
  currency = "INR",
  type = "neutral",
  size = "md",
  style,
  showSign = false,
}: CurrencyTextProps) {
  const { colors } = useTheme();

  const getColor = () => {
    switch (type) {
      case "income":
        return colors.success;
      case "expense":
        return colors.destructive;
      case "transfer":
        return colors.accent;
      default:
        return colors.foreground;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "hero":
        return 28;
      case "lg":
        return 20;
      case "sm":
        return 12;
      default:
        return 15;
    }
  };

  const sign = showSign ? (type === "income" ? "+ " : type === "expense" ? "− " : "") : "";
  const formatted = formatMinorUnits(Math.abs(amountMinor), currency);

  return (
    <Text
      style={[
        styles.text,
        {
          color: getColor(),
          fontSize: getFontSize(),
        },
        style,
      ]}
    >
      {sign}
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
  },
});
