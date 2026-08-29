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
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { apiClient } from "../../api/client";
import { ArrowLeft, Trash2, Calendar, CreditCard, Tag, FileText } from "lucide-react-native";

export function TransactionDetailScreen({ route, navigation }: any) {
  const { transactionId } = route.params || {};
  const { colors } = useTheme();

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (transactionId) {
      apiClient(`/transactions/${transactionId}`)
        .then(setTransaction)
        .catch(() => Alert.alert("Error", "Failed to load transaction details."))
        .finally(() => setIsLoading(false));
    }
  }, [transactionId]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? Ledger balances will automatically recalculate.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await apiClient(`/transactions/${transactionId}`, { method: "DELETE" });
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Delete Failed", err.message || "Could not delete transaction.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!transaction && !isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Text style={{ padding: 20, color: colors.foreground }}>Transaction not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Entry Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        {/* Hero Amount Card */}
        <Card style={styles.heroCard} elevated>
          <Badge
            label={transaction?.type || "expense"}
            variant={
              transaction?.type === "income"
                ? "income"
                : transaction?.type === "transfer"
                ? "transfer"
                : "expense"
            }
            style={{ marginBottom: 8 }}
          />

          <CurrencyText
            amountMinor={transaction?.amountMinor || 0}
            type={transaction?.type}
            size="hero"
            showSign
          />

          <Text style={[styles.merchantText, { color: colors.foreground }]}>
            {transaction?.merchant || "Unspecified Entity"}
          </Text>
        </Card>

        {/* Details List Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <Calendar size={16} color={colors.foregroundMuted} />
              <Text style={[styles.detailLabel, { color: colors.foregroundMuted }]}>Date & Time</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {transaction?.date
                ? new Date(transaction.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <CreditCard size={16} color={colors.foregroundMuted} />
              <Text style={[styles.detailLabel, { color: colors.foregroundMuted }]}>
                {transaction?.type === "transfer" ? "Source Account" : "Account"}
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {transaction?.accountName || "Checking"}
            </Text>
          </View>

          {transaction?.type === "transfer" && transaction?.destinationAccountName && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabel}>
                  <CreditCard size={16} color={colors.foregroundMuted} />
                  <Text style={[styles.detailLabel, { color: colors.foregroundMuted }]}>Destination Account</Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>
                  {transaction.destinationAccountName}
                </Text>
              </View>
            </>
          )}

          {transaction?.categoryName && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabel}>
                  <Tag size={16} color={colors.foregroundMuted} />
                  <Text style={[styles.detailLabel, { color: colors.foregroundMuted }]}>Category</Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>
                  {transaction.categoryName}
                </Text>
              </View>
            </>
          )}

          {transaction?.notes && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconLabel}>
                  <FileText size={16} color={colors.foregroundMuted} />
                  <Text style={[styles.detailLabel, { color: colors.foregroundMuted }]}>Journal Notes</Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>
                  {transaction.notes}
                </Text>
              </View>
            </>
          )}
        </Card>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    padding: 6,
  },
  heroCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  detailsCard: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
});
