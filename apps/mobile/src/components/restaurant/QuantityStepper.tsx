import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { useCartStore } from "@/store/cart";

type Props = {
  itemId: string;
  name: string;
  price: number;
  originalPrice?: number;
  restaurantId: string;
  disabled?: boolean; // sold out
};

export function QuantityStepper({
  itemId,
  name,
  price,
  restaurantId,
  disabled,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const quantity = useCartStore((s) => s.getQuantity(itemId));
  const addItem = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  if (disabled) {
    return (
      <View style={[styles.addButton, styles.addButtonDisabled]}>
        <Text style={styles.addLabelDisabled}>Sold out</Text>
      </View>
    );
  }

  if (quantity === 0) {
    return (
      <Pressable
        onPress={() => addItem({ id: itemId, name, price, restaurantId })}
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel={`Add ${name}`}
      >
        <Text style={styles.addLabel}>Add</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => decrement(itemId)}
        style={styles.stepperButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Ionicons name="remove" size={16} color={colors.brand.primary} />
      </Pressable>
      <Text style={styles.stepperValue}>{quantity}</Text>
      <Pressable
        onPress={() => increment(itemId)}
        style={styles.stepperButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Ionicons name="add" size={16} color={colors.brand.primary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  addButton: {
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
    borderRadius: theme.radius.full,
    paddingVertical: 6,
    alignItems: "center",
  },
  addButtonDisabled: { borderColor: theme.colors.border.default },
  addLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
  addLabelDisabled: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.tertiary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
  },
  stepperButton: { padding: 2 },
  stepperValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
}));
