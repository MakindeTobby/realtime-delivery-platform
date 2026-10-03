import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  fbDiscountLabel: string;
  fbDiscountSubtitle: string;
  shippingDiscountLabel: string;
  shippingDiscountSubtitle: string;
};

export function DiscountBannersRow({
  fbDiscountLabel,
  fbDiscountSubtitle,
  shippingDiscountLabel,
  shippingDiscountSubtitle,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.chip.discountBg },
          ]}
        >
          <Ionicons
            name="pricetag"
            size={16}
            color={colors.chip.discountText}
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.label}>{fbDiscountLabel}</Text>
          <Text style={styles.subtitle}>{fbDiscountSubtitle}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.chip.discountBg },
          ]}
        >
          <Ionicons name="bicycle" size={16} color={colors.chip.discountText} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.label}>{shippingDiscountLabel}</Text>
          <Text style={styles.subtitle}>{shippingDiscountSubtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
  label: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.tiny,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
}));
