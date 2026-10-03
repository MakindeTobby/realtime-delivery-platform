import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { useOrdersStore, ACTIVE_STATUSES, PAST_STATUSES } from "@/store/orders";
import { FilterChips, type FilterChip } from "@/components/near-me/FilterChips";
import { OrderListCard } from "@/components/order/OrderListCard";
import { EmptyState } from "@/components/ui/EmptyState";

const SEGMENTS: FilterChip[] = [
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
];

export default function OrderTabScreen() {
  const styles = useStyles();
  const orders = useOrdersStore((s) => s.orders);
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

      {orders.length === 0 ? (
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
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
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
