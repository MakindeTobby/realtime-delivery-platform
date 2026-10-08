import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useRestaurantOrdersQuery, useUpdateOrderStatusMutation } from "@/hooks/use-orders";
import type { ApiOrder } from "@/api/orders";
import type { OrderStatusValue } from "@/types/order";
import { BrandLoader } from "@/components/ui/BrandLoader";

const STATUS_STYLES: Record<
  OrderStatusValue,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "#FDEBD3", text: "#C77A2E", label: "New" },
  CONFIRMED: { bg: "#E5EBFB", text: "#4A63C7", label: "Accepted" },
  PREPARING: { bg: "#E5EBFB", text: "#4A63C7", label: "Preparing" },
  READY: { bg: "#E3F6E9", text: "#2E9A54", label: "Ready" },
  PICKED_UP: { bg: "#E3F6E9", text: "#2E9A54", label: "Picked up" },
  DELIVERED: { bg: "#E3F6E9", text: "#2E9A54", label: "Delivered" },
  CANCELLED: { bg: "#F2F2F2", text: "#777777", label: "Cancelled" },
};

export default function OwnerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const ordersQuery = useRestaurantOrdersQuery();
  const updateStatus = useUpdateOrderStatusMutation();
  const orders = ordersQuery.data ?? [];

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  async function onRefresh() {
    setRefreshing(true);
    await ordersQuery.refetch();
    setRefreshing(false);
  }

  function nextAction(order: ApiOrder): { status: OrderStatusValue; label: string } | null {
    if (order.status === "PENDING") return { status: "CONFIRMED", label: "Accept order" };
    if (order.status === "CONFIRMED") return { status: "PREPARING", label: "Start preparing" };
    if (order.status === "PREPARING") return { status: "READY", label: "Ready for pickup" };
    return null;
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
          <Text style={styles.statValue}>{orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Awaiting You</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₦{orders.filter((o) => o.status === "DELIVERED").reduce((sum, order) => sum + Number(order.totalAmount), 0).toLocaleString("en-NG")}</Text>
          <Text style={styles.statLabel}>Delivered sales</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Incoming Orders</Text>
        <Text style={styles.seeAll}>Refreshes every 10 sec</Text>
      </View>

      <View style={styles.ordersList}>
        {ordersQuery.isLoading ? (
          <BrandLoader label="Loading restaurant orders…" />
        ) : ordersQuery.isError ? (
          <Pressable onPress={() => void ordersQuery.refetch()}><Text style={styles.emptyText}>Couldn’t load orders. Tap to retry.</Text></Pressable>
        ) : orders.map((order) => {
          const statusStyle = STATUS_STYLES[order.status];
          const action = nextAction(order);
          const itemSummary = order.items.map((item) => `${item.quantity}× ${item.itemName}`).join(", ");
          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.customerName}>Order #{order.id.slice(-6)}</Text>
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
              <Text style={styles.orderItems}>{itemSummary || "No item details"}</Text>
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₦{Number(order.totalAmount).toLocaleString("en-NG")}</Text>
                <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
              {action && (
                <Pressable
                  style={styles.orderAction}
                  disabled={updateStatus.isPending}
                  onPress={() => updateStatus.mutate(
                    { id: order.id, status: action.status },
                    { onError: () => Alert.alert("Couldn’t update order", "Refresh the order and try again.") },
                  )}
                >
                  <Text style={styles.orderActionText}>{action.label}</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
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
  orderAction: {
    backgroundColor: "#8E4FC7",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  orderActionText: { color: "#FFFFFF", textAlign: "center", fontWeight: "700" },
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
