import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { QuantityStepper } from "@/components/restaurant/QuantityStepper";
import { useCartStore, type CartItem } from "@/store/cart";

type Props = { item: CartItem };

export function CartItemRow({ item }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const setNote = useCartStore((s) => s.setNote);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Item</Text>

      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              Rp{item.price.toLocaleString("id-ID")}
            </Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                Rp{item.originalPrice.toLocaleString("id-ID")}
              </Text>
            )}
          </View>
        </View>

        <View
          style={[styles.thumbnail, { backgroundColor: colors.dish.topPicks }]}
        />
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.stepperWrap}>
          <QuantityStepper
            itemId={item.id}
            name={item.name}
            price={item.price}
            originalPrice={item.originalPrice}
            restaurantId={item.restaurantId}
          />
        </View>
        <Pressable onPress={() => setNoteOpen((o) => !o)} hitSlop={6}>
          <Text style={styles.noteLabel}>Note</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsFavorite((f) => !f)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? colors.brand.primary : colors.text.secondary}
          />
        </Pressable>
      </View>

      {noteOpen && (
        <TextInput
          style={styles.noteInput}
          placeholder="Add a note (e.g. no onions)"
          placeholderTextColor={colors.text.tertiary}
          value={item.note ?? ""}
          onChangeText={(v) => setNote(item.id, v)}
          multiline
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  info: { flex: 1 },
  name: { ...theme.typography.h3, color: theme.colors.text.primary },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  price: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  originalPrice: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  thumbnail: { width: 72, height: 72, borderRadius: theme.radius.md },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  stepperWrap: { minWidth: 96 },
  noteLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.secondary,
  },
  noteInput: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
}));
