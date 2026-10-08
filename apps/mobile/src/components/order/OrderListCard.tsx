import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { makeStyles, useTheme } from "@/theme";
import { OrderStatus, ORDER_STATUS_LABELS } from "@/types/order";
import type { OrderRecord } from "@/store/orders";

type Props = { order: OrderRecord };

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " · " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function OrderListCard({ order }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const isDelivered = order.status === OrderStatus.DELIVERED;

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/order/[id]",
          params: {
            id: order.id,
            restaurantName: order.restaurantName,
            totalPayment: String(order.totalPayment),
          },
        })
      }
      accessibilityRole="button"
    >
      <View style={styles.info}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {order.restaurantName}
        </Text>
        <Text style={styles.itemsSummary} numberOfLines={1}>
          {order.itemsSummary}
        </Text>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>

        <View
          style={[
            styles.statusBadge,
            isCancelled && styles.statusBadgeCancelled,
            isDelivered && styles.statusBadgeDelivered,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCancelled && styles.statusTextCancelled,
              isDelivered && styles.statusTextDelivered,
            ]}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.price}>
          ₦{order.totalPayment.toLocaleString("en-NG")}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.text.tertiary}
        />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  info: { flex: 1, paddingRight: theme.spacing.sm },
  restaurantName: { ...theme.typography.h3, color: theme.colors.text.primary },
  itemsSummary: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  date: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.chip.discountBg,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 3,
    marginTop: theme.spacing.xs,
  },
  statusText: {
    ...theme.typography.tiny,
    color: theme.colors.chip.discountText,
  },
  statusBadgeDelivered: { backgroundColor: theme.colors.brand.primary },
  statusTextDelivered: { color: theme.colors.brand.onPrimary },
  statusBadgeCancelled: { backgroundColor: theme.colors.background.default },
  statusTextCancelled: { color: theme.colors.text.tertiary },
  rightColumn: { alignItems: "flex-end", gap: theme.spacing.sm },
  price: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
}));
