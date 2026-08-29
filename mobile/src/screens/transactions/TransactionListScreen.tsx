import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CurrencyText } from "../../components/ui/CurrencyText";
import { EmptyState } from "../../components/ui/EmptyState";
import { apiClient } from "../../api/client";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Receipt,
  Filter,
} from "lucide-react-native";

export function TransactionListScreen({ navigation }: any) {
  const { colors } = useTheme();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      const query = filterType !== "all" ? `?type=${filterType}` : "";
      const res = await apiClient(`/transactions${query}`);
      setTransactions(res?.transactions || []);
    } catch {
      // Handle error
    }
  }, [filterType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
  };

  const filtered = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.merchant && t.merchant.toLowerCase().includes(q)) ||
      (t.categoryName && t.categoryName.toLowerCase().includes(q)) ||
      (t.accountName && t.accountName.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={16} color={colors.foregroundMuted} />
          <TextInput
            placeholder="Search merchants, categories, notes..."
            placeholderTextColor={colors.foregroundMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {["all", "expense", "income", "transfer"].map((type) => {
            const isSelected = filterType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transaction List */}
        <FlatList
          data={filtered}
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
              icon={<Receipt size={24} color={colors.foregroundMuted} />}
              title="No Ledger Transactions"
              description="No entries matched your active search or filter selection."
            />
          }
          renderItem={({ item }) => {
            const isIncome = item.type === "income";
            const isTransfer = item.type === "transfer";

            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TransactionDetail", { transactionId: item.id })
                }
              >
                <Card style={styles.txCard}>
                  <View style={styles.txLeft}>
                    <View
                      style={[
                        styles.iconBox,
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

                    <View style={styles.txTextContainer}>
                      <Text style={[styles.txTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {item.merchant || item.categoryName || (isTransfer ? "Account Transfer" : "Uncategorized")}
                      </Text>
                      <View style={styles.txMetaRow}>
                        <Text style={[styles.txAccount, { color: colors.foregroundMuted }]}>
                          {item.accountName || "Account"}
                        </Text>
                        {item.categoryName && (
                          <>
                            <Text style={[styles.dot, { color: colors.foregroundMuted }]}>•</Text>
                            <Text style={[styles.txCategory, { color: colors.foregroundMuted }]}>
                              {item.categoryName}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <CurrencyText
                      amountMinor={item.amountMinor}
                      type={item.type}
                      size="md"
                      showSign
                    />
                    <Text style={[styles.txDate, { color: colors.foregroundMuted }]}>
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  txTextContainer: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  txMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  txAccount: {
    fontSize: 11,
  },
  dot: {
    marginHorizontal: 4,
    fontSize: 10,
  },
  txCategory: {
    fontSize: 11,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txDate: {
    fontSize: 10,
    marginTop: 2,
  },
});
