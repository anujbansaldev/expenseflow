import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Shield, Sparkles } from "lucide-react-native";

export function LoginScreen({ navigation }: any) {
  const { login, quickDemoLogin } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (err: any) {
      Alert.alert("Sign In Failed", err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setIsDemoLoading(true);
      await quickDemoLogin();
    } catch (err: any) {
      Alert.alert("Demo Access Failed", err.message || "Failed to sign in as demo user.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View
              style={[
                styles.logoEmblem,
                { backgroundColor: colors.primary, borderColor: colors.accent },
              ]}
            >
              <Text style={[styles.logoText, { color: colors.primaryForeground }]}>EF</Text>
            </View>
            <Text style={[styles.appName, { color: colors.foreground }]}>ExpenseFlow</Text>
            <Text style={[styles.appTagline, { color: colors.foregroundMuted }]}>
              Financial Ledger &amp; Wealth Suite
            </Text>
          </View>

          {/* Login Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>
            <Text style={[styles.cardSubtitle, { color: colors.foregroundMuted }]}>
              Access your personal double-entry ledger.
            </Text>

            <Input
              label="Email Address"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPassword}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In to Ledger"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.foregroundMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            <Button
              title="Instant Pre-seeded Demo Access"
              onPress={handleDemoAccess}
              isLoading={isDemoLoading}
              variant="outline"
              size="md"
              icon={<Sparkles size={16} color={colors.accent} />}
            />
          </View>

          {/* Footer: Register link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.foregroundMuted }]}>
              Don't have a ledger account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoEmblem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 18,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
  },
});
