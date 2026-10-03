import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";
import { useCartStore } from "@/store/cart";

export function CartSummaryBar() {
  const styles = useStyles();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (totalItems === 0) return null;

  const firstItemName = items[0]?.name ?? "";

  return (
    <Pressable
      onPress={() => router.push("/cart")}
      style={[styles.container, { bottom: insets.bottom + spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel="View cart"
    >
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{totalItems}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.itemLabel}>
          {totalItems} Item{totalItems > 1 ? "s" : ""}
        </Text>
        <Text style={styles.itemName} numberOfLines={1}>
          {firstItemName}
        </Text>
      </View>
      <Text style={styles.price}>Rp{totalPrice.toLocaleString("id-ID")}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.brand.onPrimary}
      />
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.fab,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.onPrimary,
  },
  textBlock: { flex: 1 },
  itemLabel: {
    ...theme.typography.tiny,
    color: theme.colors.brand.onPrimary,
    opacity: 0.85,
  },
  itemName: {
    ...theme.typography.bodyMedium,
    color: theme.colors.brand.onPrimary,
  },
  price: {
    ...theme.typography.bodyMedium,
    color: theme.colors.brand.onPrimary,
  },
}));
