import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { ACTIVE_STATUSES, PAST_STATUSES } from "@/store/orders";
import { FilterChips, type FilterChip } from "@/components/near-me/FilterChips";
import { OrderListCard } from "@/components/order/OrderListCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMyOrdersQuery } from "@/hooks/use-orders";
import type { OrderRecord } from "@/store/orders";
import { BrandLoader } from "@/components/ui/BrandLoader";

const SEGMENTS: FilterChip[] = [
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
];

export default function OrderTabScreen() {
  const styles = useStyles();
  const ordersQuery = useMyOrdersQuery();
  const orders: OrderRecord[] = (ordersQuery.data ?? []).map((order) => ({
    id: order.id,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurant?.name ?? "Restaurant",
    itemsSummary: order.items.map((item) => `${item.quantity}× ${item.itemName}`).join(", "),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPayment: Number(order.totalAmount),
    status: order.status,
    createdAt: new Date(order.createdAt).getTime(),
  }));
  const [segment, setSegment] = useState("active");

  const filtered = useMemo(() => {
    const statuses = segment === "active" ? ACTIVE_STATUSES : PAST_STATUSES;
    return orders
      .filter((o) => statuses.includes(o.status))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, segment]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.segmentWrap}>
        <FilterChips
          chips={SEGMENTS}
          selectedId={segment}
          onSelect={setSegment}
        />
      </View>

      {ordersQuery.isLoading ? (
        <View style={styles.loadingState}><BrandLoader label="Checking your orders…" /></View>
      ) : ordersQuery.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn’t load orders"
          subtitle="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={() => void ordersQuery.refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          subtitle="Once you place an order, you'll be able to track it here."
          actionLabel="Browse restaurants"
          onPressAction={() => router.push("/")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={segment === "active" ? "time-outline" : "receipt-outline"}
          title={segment === "active" ? "No active orders" : "No past orders"}
          subtitle={
            segment === "active"
              ? "Nothing in progress right now — your next order will show up here."
              : "Orders you've completed or cancelled will show up here."
          }
          actionLabel={segment === "active" ? "Browse restaurants" : undefined}
          onPressAction={
            segment === "active" ? () => router.push("/") : undefined
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderListCard order={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={ordersQuery.isRefetching}
          onRefresh={() => void ordersQuery.refetch()}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.sm,
  },
  title: { ...theme.typography.display, color: theme.colors.text.primary },
  segmentWrap: {
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  listContent: { paddingBottom: theme.spacing.xxxl },
}));
