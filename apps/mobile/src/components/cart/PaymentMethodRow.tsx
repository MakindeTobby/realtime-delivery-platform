import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  methodLabel: string;
  amount: number;
  savedAmount?: number;
  onPress?: () => void;
};

export function PaymentMethodRow({
  methodLabel,
  amount,
  savedAmount,
  onPress,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* No payment-method switcher screen exists yet — onPress is a stub. */}
      <Pressable
        onPress={onPress}
        style={styles.row}
        accessibilityRole="button"
      >
        <Ionicons name="wallet-outline" size={18} color={colors.text.primary} />
        <Text style={styles.methodLabel}>{methodLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        <Text style={styles.dot}>·</Text>
        <Text style={styles.amount}>₦{amount.toLocaleString("en-NG")}</Text>
      </Pressable>
      {!!savedAmount && (
        <Text style={styles.savedText}>
          You saved ₦{savedAmount.toLocaleString("en-NG")}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  methodLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  dot: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginHorizontal: 2,
  },
  amount: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  savedText: {
    ...theme.typography.tiny,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xxs,
  },
}));
