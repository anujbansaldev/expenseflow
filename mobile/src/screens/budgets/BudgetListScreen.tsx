import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { EmptyState } from "../../components/ui/EmptyState";
import { apiClient } from "../../api/client";
import { PieChart, AlertTriangle } from "lucide-react-native";

export function BudgetListScreen() {
  const { colors } = useTheme();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await apiClient("/budgets");
      setBudgets(res || []);
    } catch {
      // Handle error
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchBudgets();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <FlatList
          data={budgets}
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
              icon={<PieChart size={24} color={colors.foregroundMuted} />}
              title="No Active Budgets"
              description="Create envelope budgets to track spending limits by category."
            />
          }
          renderItem={({ item }) => {
            const spent = item.spentMinor || 0;
            const limit = item.limitMinor || 1;
            const pct = Math.min(Math.round((spent / limit) * 100), 100);
            const isExceeded = spent > limit;

            return (
              <Card style={styles.budgetCard}>
                <View style={styles.headerRow}>
                  <View>
                    <Text style={[styles.budgetName, { color: colors.foreground }]}>
                      {item.categoryName || "Overall Monthly"}
                    </Text>
                    <Text style={[styles.periodText, { color: colors.foregroundMuted }]}>
                      {item.period.toUpperCase()} ENVELOPE
                    </Text>
                  </View>

                  <Badge
                    label={isExceeded ? "Exceeded" : pct > 80 ? "Warning" : "On Track"}
                    variant={isExceeded ? "expense" : pct > 80 ? "warning" : "income"}
                  />
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.progressFill,
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

                <View style={styles.footerRow}>
                  <View>
                    <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>Spent</Text>
                    <CurrencyText amountMinor={spent} size="md" />
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>Limit</Text>
                    <CurrencyText amountMinor={limit} size="md" />
                  </View>
                </View>
              </Card>
            );
          }}
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
  listContent: {
    paddingBottom: 24,
  },
  budgetCard: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: "700",
  },
  periodText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
});
