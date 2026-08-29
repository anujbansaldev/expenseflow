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
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiClient } from "../../api/client";
import { ArrowLeft } from "lucide-react-native";

export function ForgotPasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your registered email address.");
      return;
    }

    try {
      setIsLoading(true);
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      Alert.alert("Request Failed", err.message || "Failed to process password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.foreground} />
            <Text style={[styles.backText, { color: colors.foreground }]}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.foregroundMuted }]}>
              Enter your email to receive password reset instructions.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {isSubmitted ? (
              <View style={styles.successContainer}>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>
                  Reset Instructions Sent
                </Text>
                <Text style={[styles.successText, { color: colors.foregroundMuted }]}>
                  If an account exists for {email}, you will receive a secure recovery token shortly.
                </Text>
                <Button
                  title="Return to Login"
                  onPress={() => navigation.navigate("Login")}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <>
                <Input
                  label="Registered Email Address"
                  placeholder="user@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  size="lg"
                  style={styles.submitButton}
                />
              </>
            )}
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  submitButton: {
    marginTop: 10,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
