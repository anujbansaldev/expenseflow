import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { EmptyState } from "../../components/ui/EmptyState";
import { apiClient } from "../../api/client";
import { Wallet, Landmark, CreditCard, Banknote, ShieldCheck } from "lucide-react-native";

export function AccountListScreen() {
  const { colors } = useTheme();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await apiClient("/accounts");
      setAccounts(res || []);
    } catch {
      // Handle error
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAccounts();
    setIsRefreshing(false);
  };

  const totalBalance = accounts.reduce((acc, a) => acc + (a.currentBalanceMinor || 0), 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark size={18} color={colors.primary} />;
      case "credit":
        return <CreditCard size={18} color={colors.destructive} />;
      case "cash":
        return <Banknote size={18} color={colors.success} />;
      default:
        return <Wallet size={18} color={colors.accent} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Total Liquidity Summary */}
        <Card style={styles.summaryCard} elevated>
          <Text style={[styles.summaryLabel, { color: colors.foregroundMuted }]}>
            TOTAL LIQUIDITY ACROSS {accounts.length} ACCOUNTS
          </Text>
          <CurrencyText amountMinor={totalBalance} size="hero" style={{ marginTop: 4 }} />
        </Card>

        {/* Accounts List */}
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon={<Wallet size={24} color={colors.foregroundMuted} />}
              title="No Accounts Found"
              description="No financial accounts connected to this ledger."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                    {getAccountIcon(item.type)}
                  </View>
                  <View>
                    <Text style={[styles.accountName, { color: colors.foreground }]}>{item.name}</Text>
                    <Text style={[styles.accountType, { color: colors.foregroundMuted }]}>
                      {item.type.toUpperCase()} • {item.currency}
                    </Text>
                  </View>
                </View>

                <Badge label={item.isArchived ? "Archived" : "Active"} variant={item.isArchived ? "neutral" : "primary"} />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.balanceRow}>
                <Text style={[styles.balanceLabel, { color: colors.foregroundMuted }]}>Current Balance</Text>
                <CurrencyText amountMinor={item.currentBalanceMinor} size="lg" />
              </View>
            </Card>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    padding: 18,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  listContent: {
    paddingBottom: 24,
  },
  accountCard: {
    padding: 14,
    marginBottom: 10,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontSize: 14,
    fontWeight: "700",
  },
  accountType: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    fontSize: 12,
  },
});
