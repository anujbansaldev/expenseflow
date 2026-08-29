import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { apiClient } from "../../api/client";
import { toMinorUnits } from "../../utils/money";
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react-native";

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickAddModal({ visible, onClose, onSuccess }: QuickAddModalProps) {
  const { colors } = useTheme();

  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      // Fetch user accounts and categories
      apiClient("/accounts").then(setAccounts).catch(() => {});
      apiClient("/categories").then(setCategories).catch(() => {});
    }
  }, [visible]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
    if (accounts.length > 1 && !destinationAccountId) {
      setDestinationAccountId(accounts[1].id);
    }
  }, [accounts]);

  const filteredCategories = categories.filter((c) => c.type === type && !c.isArchived);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, categories]);

  const handleSubmit = async () => {
    const minorUnits = toMinorUnits(amount);
    if (minorUnits <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    if (!accountId) {
      Alert.alert("Account Required", "Please select an account.");
      return;
    }

    if (type === "transfer" && accountId === destinationAccountId) {
      Alert.alert("Invalid Transfer", "Source and destination accounts must be different.");
      return;
    }

    try {
      setIsLoading(true);
      await apiClient("/transactions", {
        method: "POST",
        body: JSON.stringify({
          type,
          amountMinor: minorUnits,
          accountId,
          destinationAccountId: type === "transfer" ? destinationAccountId : undefined,
          categoryId: type !== "transfer" ? categoryId : undefined,
          merchant: merchant.trim() || undefined,
          notes: notes.trim() || undefined,
          date: new Date().toISOString(),
        }),
      });

      // Reset form
      setAmount("");
      setMerchant("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert("Creation Failed", err.message || "Failed to record transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.sheetContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header Bar */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Record Entry</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.foregroundMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Segmented Control */}
            <View style={[styles.segmentedWrapper, { backgroundColor: colors.surfaceMuted }]}>
              <TouchableOpacity
                onPress={() => setType("expense")}
                style={[
                  styles.segmentButton,
                  type === "expense" && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <ArrowDownRight size={14} color={type === "expense" ? colors.destructive : colors.foregroundMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: type === "expense" ? colors.destructive : colors.foregroundMuted },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("income")}
                style={[
                  styles.segmentButton,
                  type === "income" && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <ArrowUpRight size={14} color={type === "income" ? colors.success : colors.foregroundMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: type === "income" ? colors.success : colors.foregroundMuted },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("transfer")}
                style={[
                  styles.segmentButton,
                  type === "transfer" && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <ArrowLeftRight size={14} color={type === "transfer" ? colors.accent : colors.foregroundMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: type === "transfer" ? colors.accent : colors.foregroundMuted },
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hero Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={[styles.currencyPrefix, { color: colors.foregroundMuted }]}>₹</Text>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.heroAmountInput}
              />
            </View>

            {/* Account Selector Pill Scroll */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.foregroundSecondary }]}>
                {type === "transfer" ? "From Account" : "Account"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {accounts.map((acc) => {
                  const isSelected = acc.id === accountId;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setAccountId(acc.id)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: isSelected ? colors.primaryForeground : colors.foreground },
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* If Transfer: Destination Account */}
            {type === "transfer" ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.foregroundSecondary }]}>To Account</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => {
                      const isSelected = acc.id === destinationAccountId;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          onPress={() => setDestinationAccountId(acc.id)}
                          style={[
                            styles.pill,
                            {
                              backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                              borderColor: isSelected ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              { color: isSelected ? "#FFFFFF" : colors.foreground },
                            ]}
                          >
                            {acc.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            ) : (
              /* Category Selector */
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.foregroundSecondary }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {filteredCategories.map((cat) => {
                    const isSelected = cat.id === categoryId;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: isSelected ? colors.primaryForeground : colors.foreground },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Merchant / Entity & Notes */}
            <Input
              label={type === "expense" ? "Merchant / Store" : type === "income" ? "Payer / Source" : "Reference"}
              placeholder="e.g. Starbucks, Amazon, Salary"
              value={merchant}
              onChangeText={setMerchant}
            />

            <Input
              label="Notes (Optional)"
              placeholder="Add journal context..."
              value={notes}
              onChangeText={setNotes}
            />

            <Button
              title="Post to Financial Ledger"
              onPress={handleSubmit}
              isLoading={isLoading}
              size="lg"
              style={{ marginTop: 8, marginBottom: 24 }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  segmentedWrapper: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: "800",
    marginRight: 8,
    paddingBottom: 14,
  },
  heroAmountInput: {
    fontSize: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pillScroll: {
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
