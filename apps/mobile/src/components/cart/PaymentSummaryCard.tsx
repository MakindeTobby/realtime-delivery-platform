import React from "react";
import { Text, View } from "react-native";
import { makeStyles } from "@/theme";

type Props = { subtotal: number };

export function PaymentSummaryCard({ subtotal }: Props) {
  const styles = useStyles();
  const formattedSubtotal = `₦${subtotal.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order summary</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Items subtotal</Text>
        <Text style={styles.value}>{formattedSubtotal}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Delivery fee</Text>
        <Text style={styles.valueMuted}>Calculated later</Text>
      </View>
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Order total</Text>
        <Text style={styles.totalValue}>{formattedSubtotal}</Text>
      </View>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  label: { ...theme.typography.body, color: theme.colors.text.secondary },
  value: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  valueMuted: { ...theme.typography.caption, color: theme.colors.text.tertiary },
  totalRow: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  totalLabel: { ...theme.typography.h3, color: theme.colors.text.primary },
  totalValue: { ...theme.typography.h3, color: theme.colors.text.primary },
}));
