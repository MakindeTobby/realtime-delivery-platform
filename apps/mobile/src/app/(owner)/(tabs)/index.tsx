import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";

type OrderStatus = "PENDING" | "PREPARING" | "READY";

type Order = {
  id: string;
  customerName: string;
  items: string;
  total: string;
  status: OrderStatus;
  time: string;
};

// Mock data — swap this out for your real orders hook when it's ready
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    customerName: "Ada L.",
    items: "2x Jollof Rice, 1x Suya",
    total: "$18.50",
    status: "PENDING",
    time: "2 min ago",
  },
  {
    id: "2",
    customerName: "Tunde O.",
    items: "1x Shawarma",
    total: "$9.00",
    status: "PREPARING",
    time: "8 min ago",
  },
  {
    id: "3",
    customerName: "Chioma A.",
    items: "3x Puff Puff, 1x Zobo",
    total: "$12.75",
    status: "READY",
    time: "14 min ago",
  },
];

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "#FDEBD3", text: "#C77A2E", label: "New" },
  PREPARING: { bg: "#E5EBFB", text: "#4A63C7", label: "Preparing" },
  READY: { bg: "#E3F6E9", text: "#2E9A54", label: "Ready" },
};

export default function OwnerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [orders] = useState<Order[]>(MOCK_ORDERS);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  function onRefresh() {
    setRefreshing(true);
    // Replace with a real refetch call
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#B57EDC"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.firstName ?? "there"} 👋</Text>
        <Text style={styles.subGreeting}>Here's what's cooking today</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Awaiting You</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$40.25</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Incoming Orders</Text>
        <Pressable>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.ordersList}>
        {orders.map((order) => {
          const statusStyle = STATUS_STYLES[order.status];
          return (
            <Pressable key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusStyle.text }]}
                  >
                    {statusStyle.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderItems}>{order.items}</Text>
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
            </Pressable>
          );
        })}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No orders yet today</Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => router.push("/create-restaurant")}
        style={{
          backgroundColor: "#8E4FC7",
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          + Create Restaurant
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  subGreeting: {
    fontSize: 14,
    color: "#8E8299",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E5F5",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8299",
    marginTop: 4,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B57EDC",
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    gap: 8,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  orderItems: {
    fontSize: 13,
    color: "#8E8299",
  },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  orderTime: {
    fontSize: 12,
    color: "#B0A9C9",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8299",
  },
});
