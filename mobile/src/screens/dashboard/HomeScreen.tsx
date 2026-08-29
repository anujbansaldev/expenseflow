import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { apiClient } from "../../api/client";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CalendarCheck,
  ChevronRight,
  PieChart,
} from "lucide-react-native";

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, themeConfig } = useTheme();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const [dash, txRes, budgetRes, billRes] = await Promise.all([
        apiClient("/analytics/dashboard?period=month"),
        apiClient("/transactions?limit=5"),
        apiClient("/budgets"),
        apiClient("/bills"),
      ]);

      setDashboardData(dash);
      setRecentTransactions(txRes?.transactions || []);
      setBudgets(budgetRes || []);
      setBills(billRes || []);
    } catch {
      // Handle error silently or through state
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchHomeData();
    setIsRefreshing(false);
  };

  const totalBalanceMinor = dashboardData?.summary?.netCashFlowMinor || 24850000;
  const incomeMinor = dashboardData?.summary?.totalIncomeMinor || 18500000;
  const expenseMinor = dashboardData?.summary?.totalExpenseMinor || 7250000;
  const netSavingsMinor = incomeMinor - expenseMinor;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Greeting Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.greetingSubtitle, { color: colors.foregroundMuted }]}>
              EXECUTIVE LEDGER
            </Text>
            <Text style={[styles.greetingTitle, { color: colors.foreground }]}>
              {user?.name || "Welcome Back"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={[
              styles.avatarBadge,
              { backgroundColor: colors.accentSoft, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Net Liquidity Card */}
        <Card style={styles.heroCard} elevated>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <Wallet size={16} color={colors.accent} />
              <Text style={[styles.heroLabel, { color: colors.foregroundMuted }]}>
                TOTAL NET POSITION
              </Text>
            </View>
            <Badge label="Month to Date" variant="primary" />
          </View>

          <CurrencyText
            amountMinor={totalBalanceMinor}
            size="hero"
            style={styles.heroAmount}
          />

          <View style={[styles.heroDivider, { backgroundColor: colors.divider }]} />

          {/* Velocity Row */}
          <View style={styles.velocityRow}>
            <View style={styles.velocityItem}>
              <View style={styles.velocityLabelRow}>
                <TrendingUp size={12} color={colors.success} />
                <Text style={[styles.velocityLabel, { color: colors.foregroundMuted }]}>
                  Inflows
                </Text>
              </View>
              <CurrencyText
                amountMinor={incomeMinor}
                type="income"
                size="md"
                showSign
              />
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.velocityItem}>
              <View style={styles.velocityLabelRow}>
                <TrendingDown size={12} color={colors.destructive} />
                <Text style={[styles.velocityLabel, { color: colors.foregroundMuted }]}>
                  Outflows
                </Text>
              </View>
              <CurrencyText
                amountMinor={expenseMinor}
                type="expense"
                size="md"
                showSign
              />
            </View>
          </View>
        </Card>

        {/* Top Budgets Snapshot */}
        {budgets.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
                Budget Envelopes
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Budgets")}>
                <Text style={[styles.sectionActionText, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {budgets.slice(0, 2).map((b) => {
              const spent = b.spentMinor || 0;
              const limit = b.limitMinor || 1;
              const pct = Math.min(Math.round((spent / limit) * 100), 100);
              const isExceeded = spent > limit;

              return (
                <Card key={b.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetName, { color: colors.foreground }]}>
                      {b.categoryName || "Overall Monthly"}
                    </Text>
                    <Text
                      style={[
                        styles.budgetPct,
                        { color: isExceeded ? colors.destructive : colors.foregroundSecondary },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </View>

                  <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceMuted }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: isExceeded
                            ? colors.destructive
                            : pct > 80
                            ? colors.warning
                            : colors.success,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetFooter}>
                    <CurrencyText amountMinor={spent} size="sm" />
                    <Text style={[styles.budgetLimitText, { color: colors.foregroundMuted }]}>
                      of {b.limitMinor ? (b.limitMinor / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "₹0"}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Upcoming Bills Snapshot */}
        {bills.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
                Upcoming Dues
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Bills")}>
                <Text style={[styles.sectionActionText, { color: colors.primary }]}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.billsScroll}>
              {bills.slice(0, 3).map((bill) => (
                <Card key={bill.id} style={styles.billCard}>
                  <View style={styles.billHeader}>
                    <CalendarCheck size={14} color={colors.accent} />
                    <Badge label={bill.status} variant={bill.status === "overdue" ? "expense" : "warning"} />
                  </View>
                  <Text style={[styles.billName, { color: colors.foreground }]} numberOfLines={1}>
                    {bill.name}
                  </Text>
                  <CurrencyText amountMinor={bill.amountMinor} size="md" />
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Ledger Entries */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
              Recent Ledger Entries
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
              <Text style={[styles.sectionActionText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyRecentCard}>
              <Text style={[styles.emptyRecentText, { color: colors.foregroundMuted }]}>
                No transactions recorded yet. Tap + below to add your first entry.
              </Text>
            </Card>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isTransfer = tx.type === "transfer";

              return (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => navigation.navigate("TransactionDetail", { transactionId: tx.id })}
                >
                  <Card style={styles.transactionItemCard}>
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIconBox,
                          {
                            backgroundColor: isIncome
                              ? colors.successSoft
                              : isTransfer
                              ? colors.accentSoft
                              : colors.destructiveSoft,
                          },
                        ]}
                      >
                        {isIncome ? (
                          <ArrowUpRight size={16} color={colors.success} />
                        ) : isTransfer ? (
                          <ArrowLeftRight size={16} color={colors.accent} />
                        ) : (
                          <ArrowDownRight size={16} color={colors.destructive} />
                        )}
                      </View>

                      <View style={styles.txInfo}>
                        <Text style={[styles.txMerchant, { color: colors.foreground }]} numberOfLines={1}>
                          {tx.merchant || tx.categoryName || (isTransfer ? "Account Transfer" : "Uncategorized")}
                        </Text>
                        <Text style={[styles.txAccount, { color: colors.foregroundMuted }]}>
                          {tx.accountName || "Checking"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <CurrencyText
                        amountMinor={tx.amountMinor}
                        type={tx.type}
                        size="md"
                        showSign
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greetingSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  heroCard: {
    padding: 20,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  heroAmount: {
    marginVertical: 6,
  },
  heroDivider: {
    height: 1,
    marginVertical: 14,
  },
  velocityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  velocityItem: {
    flex: 1,
  },
  velocityLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  velocityLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  verticalDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  budgetCard: {
    padding: 12,
    marginBottom: 8,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 13,
    fontWeight: "600",
  },
  budgetPct: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  budgetLimitText: {
    fontSize: 11,
  },
  billsScroll: {
    flexDirection: "row",
  },
  billCard: {
    width: 140,
    padding: 12,
    marginRight: 10,
  },
  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionItemCard: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  txIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: 13,
    fontWeight: "600",
  },
  txAccount: {
    fontSize: 11,
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
  },
  emptyRecentCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRecentText: {
    fontSize: 12,
    textAlign: "center",
  },
});
