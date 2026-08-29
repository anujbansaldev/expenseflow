import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { apiClient } from "../../api/client";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react-native";

export function AnalyticsScreen() {
  const { colors } = useTheme();

  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [categories, setCategories] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const [catRes, flowRes] = await Promise.all([
        apiClient(`/analytics/categories?period=${period}`),
        apiClient(`/analytics/cash-flow?period=${period}`),
      ]);
      setCategories(catRes?.categories || []);
      setCashFlow(flowRes);
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  };

  const totalIncome = cashFlow?.totalIncomeMinor || 0;
  const totalExpense = cashFlow?.totalExpenseMinor || 0;
  const netSavings = totalIncome - totalExpense;

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
        {/* Period Selector Tabs */}
        <View style={[styles.periodTabs, { backgroundColor: colors.surfaceMuted }]}>
          {(["month", "quarter", "year"] as const).map((p) => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.tabButton,
                  isSelected && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSelected ? colors.primary : colors.foregroundMuted },
                  ]}
                >
                  {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Velocity KPIs */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <TrendingUp size={14} color={colors.success} />
              <Text style={[styles.kpiLabel, { color: colors.foregroundMuted }]}>INFLOW</Text>
            </View>
            <CurrencyText amountMinor={totalIncome} type="income" size="lg" />
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <TrendingDown size={14} color={colors.destructive} />
              <Text style={[styles.kpiLabel, { color: colors.foregroundMuted }]}>OUTFLOW</Text>
            </View>
            <CurrencyText amountMinor={totalExpense} type="expense" size="lg" />
          </Card>
        </View>

        {/* Net Capital Retained */}
        <Card style={styles.netSavingsCard} elevated>
          <View style={styles.kpiHeader}>
            <PiggyBank size={16} color={colors.accent} />
            <Text style={[styles.kpiLabel, { color: colors.foregroundMuted }]}>NET CAPITAL RETAINED</Text>
          </View>
          <CurrencyText amountMinor={netSavings} size="hero" style={{ marginTop: 4 }} />
        </Card>

        {/* Category Allocation Rankings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Category Spending Rankings
          </Text>
        </View>

        {categories.map((cat, index) => {
          const barColor = colors.chart[index % colors.chart.length];
          return (
            <Card key={cat.categoryId || index} style={styles.catRankCard}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <View style={[styles.colorDot, { backgroundColor: barColor }]} />
                  <Text style={[styles.catName, { color: colors.foreground }]}>
                    {cat.categoryName}
                  </Text>
                </View>
                <Text style={[styles.catPct, { color: colors.foregroundSecondary }]}>
                  {cat.percentage}%
                </Text>
              </View>

              <View style={[styles.barTrack, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${cat.percentage}%`, backgroundColor: barColor },
                  ]}
                />
              </View>

              <View style={styles.catFooter}>
                <Text style={[styles.txCount, { color: colors.foregroundMuted }]}>
                  {cat.count} {cat.count === 1 ? "entry" : "entries"}
                </Text>
                <CurrencyText amountMinor={cat.amountMinor} size="sm" />
              </View>
            </Card>
          );
        })}
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
  periodTabs: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 14,
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  netSavingsCard: {
    padding: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  catRankCard: {
    padding: 14,
    marginBottom: 8,
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  catLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13,
    fontWeight: "600",
  },
  catPct: {
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  catFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txCount: {
    fontSize: 11,
  },
});
