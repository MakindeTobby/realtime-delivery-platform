import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";
import { theme } from "@/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.colors.nav.active,
        tabBarInactiveTintColor: theme.colors.nav.inactive,
        tabBarStyle: {
          backgroundColor: theme.colors.background.surface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={styles.fab}>
              <Ionicons
                name="fast-food"
                size={24}
                color={theme.colors.brand.onPrimary}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbox-ellipses-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    borderColor: theme.palette.red100,
    borderWidth: theme.spacing.xxs,
    backgroundColor: theme.colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -6,
    ...theme.shadows.fab,
  },
});
