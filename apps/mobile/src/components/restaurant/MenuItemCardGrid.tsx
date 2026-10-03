import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { QuantityStepper } from "./QuantityStepper";
import type { MenuItem } from "./restaurantMockData";

type Props = {
  item: MenuItem;
  restaurantId: string;
};

export function MenuItemCardGrid({ item, restaurantId }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.card}>
      <View style={[styles.thumbnail, { backgroundColor: item.imageColor }]}>
        {item.hasExtraDiscount && (
          <View style={styles.discountTag}>
            <Text style={styles.discountTagText}>Extra discount</Text>
          </View>
        )}
        <Pressable
          onPress={() => setIsFavorite((f) => !f)}
          style={styles.favoriteButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={14}
            color={isFavorite ? colors.brand.primary : colors.text.secondary}
          />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>Rp{item.price.toLocaleString("id-ID")}</Text>
        {item.originalPrice && (
          <Text style={styles.originalPrice}>
            Rp{item.originalPrice.toLocaleString("id-ID")}
          </Text>
        )}
      </View>

      <QuantityStepper
        itemId={item.id}
        name={item.name}
        price={item.price}
        restaurantId={restaurantId}
        disabled={item.soldOut}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  card: { width: "47%" },
  thumbnail: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xxs,
  },
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
  favoriteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
  price: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  originalPrice: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    textDecorationLine: "line-through",
  },
}));
