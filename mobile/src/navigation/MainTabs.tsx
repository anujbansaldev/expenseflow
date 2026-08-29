import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../context/ThemeContext";
import { HomeScreen } from "../screens/dashboard/HomeScreen";
import { TransactionListScreen } from "../screens/transactions/TransactionListScreen";
import { AnalyticsScreen } from "../screens/analytics/AnalyticsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { QuickAddModal } from "../components/sheets/QuickAddModal";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react-native";

const Tab = createBottomTabNavigator();

function Placeholder() {
  return <View style={{ flex: 1 }} />;
}

export function MainTabs() {
  const { colors } = useTheme();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 84 : 64,
            paddingBottom: Platform.OS === "ios" ? 28 : 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Ledger",
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
          }}
        />

        <Tab.Screen
          name="Transactions"
          component={TransactionListScreen}
          options={{
            tabBarLabel: "Journal",
            tabBarIcon: ({ color, size }) => <Receipt size={size - 2} color={color} />,
          }}
        />

        {/* Central Elevated Quick-Add FAB */}
        <Tab.Screen
          name="QuickAdd"
          component={Placeholder}
          options={{
            tabBarLabel: "",
            tabBarButton: () => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsQuickAddOpen(true)}
                style={[
                  styles.fabButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Plus size={24} color={colors.primaryForeground} />
              </TouchableOpacity>
            ),
          }}
        />

        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: "Velocity",
            tabBarIcon: ({ color, size }) => <BarChart3 size={size - 2} color={color} />,
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} />,
          }}
        />
      </Tab.Navigator>

      {/* Instant Quick-Add Transaction Sheet */}
      <QuickAddModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
