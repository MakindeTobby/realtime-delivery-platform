import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { QuantityStepper } from "./QuantityStepper";
import { useCartStore } from "@/store/cart";
import type { MenuItem } from "./restaurantMockData";

type Props = {
  item: MenuItem;
  restaurantId: string;
};

export function MenuItemCardRow({ item, restaurantId }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const quantity = useCartStore((s) => s.getQuantity(item.id));
  const note = useCartStore(
    (s) => s.items.find((i) => i.id === item.id)?.note ?? "",
  );
  const setNote = useCartStore((s) => s.setNote);
  const inCart = quantity > 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {item.soldOut ? (
            <Text style={styles.soldOut}>Menu habis terjual</Text>
          ) : (
            !!item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )
          )}

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

          <View style={styles.actionsRow}>
            <View style={styles.stepperWrap}>
              <QuantityStepper
                itemId={item.id}
                name={item.name}
                price={item.price}
                restaurantId={restaurantId}
                disabled={item.soldOut}
              />
            </View>

            {inCart && (
              <>
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
                    color={
                      isFavorite ? colors.brand.primary : colors.text.secondary
                    }
                  />
                </Pressable>
              </>
            )}
          </View>

          {inCart && noteOpen && (
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (e.g. no onions)"
              placeholderTextColor={colors.text.tertiary}
              value={note}
              onChangeText={(v) => setNote(item.id, v)}
              multiline
            />
          )}
        </View>

        <View style={[styles.thumbnail, { backgroundColor: item.imageColor }]}>
          {item.hasExtraDiscount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>Extra discount</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  info: { flex: 1 },
  name: { ...theme.typography.h3, color: theme.colors.text.primary },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  soldOut: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
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
  thumbnail: { width: 84, height: 84, borderRadius: theme.radius.md },
  discountTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: theme.colors.chip.discountText,
    borderRadius: theme.radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountTagText: {
    ...theme.typography.tiny,
    color: theme.colors.text.inverse,
  },
}));
