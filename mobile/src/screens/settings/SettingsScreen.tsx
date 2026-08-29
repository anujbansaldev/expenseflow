import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { MobileThemeKey } from "../../constants/theme";
import {
  User,
  Palette,
  Shield,
  LogOut,
  Check,
  Smartphone,
  Sparkles,
} from "lucide-react-native";

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme, availableThemes, colors } = useTheme();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard} elevated>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary, borderColor: colors.accent },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>

            <View style={styles.profileText}>
              <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.foregroundMuted }]}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Theme Workspace Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Palette size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
              Workspace Visual Identity
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.foregroundMuted }]}>
            Select your preferred fintech color mood and surface styling.
          </Text>

          <View style={styles.themeGrid}>
            {availableThemes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: t.colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.themeCardTop}>
                    <Text style={[styles.themeName, { color: t.colors.foreground }]}>{t.name}</Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Check size={12} color={colors.primaryForeground} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.themePaletteText, { color: t.colors.foregroundMuted }]}>
                    {t.paletteDescription}
                  </Text>

                  {/* Swatch preview pills */}
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatchDot, { backgroundColor: t.colors.background }]} />
                    <View style={[styles.swatchDot, { backgroundColor: t.colors.primary }]} />
                    <View style={[styles.swatchDot, { backgroundColor: t.colors.accent }]} />
                    <View style={[styles.swatchDot, { backgroundColor: t.colors.chart[2] }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Device & Security Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
              Active Device Session
            </Text>
          </View>

          <Card style={styles.sessionCard}>
            <View style={styles.sessionLeft}>
              <Smartphone size={18} color={colors.foregroundSecondary} />
              <View>
                <Text style={[styles.sessionDevice, { color: colors.foreground }]}>This Mobile Device</Text>
                <Text style={[styles.sessionStatus, { color: colors.success }]}>Authenticated • Active</Text>
              </View>
            </View>
            <Badge label="Current" variant="primary" />
          </Card>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out of Ledger"
          onPress={handleLogout}
          variant="destructive"
          size="lg"
          icon={<LogOut size={16} color="#FFFFFF" />}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 18,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeCard: {
    width: "48%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  themeCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeName: {
    fontSize: 13,
    fontWeight: "700",
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  themePaletteText: {
    fontSize: 10,
    marginTop: 3,
    marginBottom: 10,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 4,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  sessionCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sessionDevice: {
    fontSize: 13,
    fontWeight: "600",
  },
  sessionStatus: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 10,
  },
});
