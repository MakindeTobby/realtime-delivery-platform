import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  discountsAppliedCount: number;
  originalPrice: number;
  finalPrice: number;
  originalDeliveryFee: number;
  finalDeliveryFee: number; // 0 renders as "Free"
};

export function PaymentSummaryCard({
  discountsAppliedCount,
  originalPrice,
  finalPrice,
  originalDeliveryFee,
  finalDeliveryFee,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const totalPayment = finalPrice + finalDeliveryFee;
  const priceDiscounted = originalPrice !== finalPrice;
  const deliveryDiscounted = originalDeliveryFee !== finalDeliveryFee;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payment summary</Text>

      {discountsAppliedCount > 0 && (
        <Pressable style={styles.discountBanner} accessibilityRole="button">
          <Ionicons name="pricetags" size={16} color={colors.brand.primary} />
          <Text style={styles.discountBannerText}>
            {discountsAppliedCount} Discounts are applied
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.brand.primary}
          />
        </Pressable>
      )}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Price</Text>
        <View style={styles.rowValues}>
          {priceDiscounted && (
            <Text style={styles.strikethrough}>
              Rp{originalPrice.toLocaleString("id-ID")}
            </Text>
          )}
          <Text style={styles.rowValue}>
            Rp{finalPrice.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Delivery fee</Text>
        <View style={styles.rowValues}>
          {deliveryDiscounted && (
            <Text style={styles.strikethrough}>
              Rp{originalDeliveryFee.toLocaleString("id-ID")}
            </Text>
          )}
          <Text style={styles.rowValue}>
            {finalDeliveryFee === 0
              ? "Free"
              : `Rp${finalDeliveryFee.toLocaleString("id-ID")}`}
          </Text>
        </View>
      </View>

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total payment</Text>
        <Text style={styles.totalValue}>
          Rp{totalPayment.toLocaleString("id-ID")}
        </Text>
      </View>

      <Pressable onPress={() => setDetailsOpen((o) => !o)} hitSlop={6}>
        <Text style={styles.link}>View details</Text>
      </Pressable>

      {detailsOpen && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>
            Savings breakdown isn't wired up yet — this is a placeholder for an
            itemized discount list (per-dish discount, delivery discount, etc).
          </Text>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  discountBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.chip.deliveryBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  discountBannerText: {
    flex: 1,
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xxs,
  },
  rowLabel: { ...theme.typography.body, color: theme.colors.text.secondary },
  rowValues: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  strikethrough: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  totalRow: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  totalLabel: { ...theme.typography.h3, color: theme.colors.text.primary },
  totalValue: { ...theme.typography.h3, color: theme.colors.text.primary },
  link: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
    marginTop: theme.spacing.sm,
  },
  detailsBox: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  detailsText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
}));
