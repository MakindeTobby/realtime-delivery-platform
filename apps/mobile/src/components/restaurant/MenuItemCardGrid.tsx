import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { QuantityStepper } from "./QuantityStepper";
import type { MenuItem } from "./restaurantMockData";
import { useCartStore } from "@/store/cart";

type Props = {
  item: MenuItem;
  restaurantId: string;
  cardWidth?: number;
  restaurantName?: string;
  onPressCard?: () => void;
  compactAdd?: boolean;
};

export function MenuItemCardGrid({ item, restaurantId, cardWidth, restaurantName, onPressCard, compactAdd = false }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  return (
    <View style={[styles.card, cardWidth ? { width: cardWidth } : null]}>
      <Pressable
        onPress={onPressCard}
        accessibilityRole={onPressCard ? "button" : undefined}
        style={[styles.thumbnail, { backgroundColor: item.imageColor }]}
      >
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.thumbnailImage} /> : null}
        {item.hasExtraDiscount && (
          <View style={styles.discountTag}>
            <Text style={styles.discountTagText}>Extra discount</Text>
          </View>
        )}
        {compactAdd && !item.soldOut && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to cart`}
            onPress={(event) => {
              event.stopPropagation();
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                restaurantId,
              });
            }}
            style={styles.compactAddButton}
          >
            <Ionicons name="add" size={19} color={colors.brand.onPrimary} />
          </Pressable>
        )}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            setIsFavorite((f) => !f);
          }}
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
      </Pressable>

      <Pressable onPress={onPressCard} disabled={!onPressCard}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {!!restaurantName && <Text style={styles.restaurantName} numberOfLines={1}>{restaurantName}</Text>}
      </Pressable>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatNaira(item.price)}</Text>
        {item.originalPrice && (
          <Text style={styles.originalPrice}>
            {formatNaira(item.originalPrice)}
          </Text>
        )}
      </View>

      {!compactAdd && (
        <QuantityStepper
          itemId={item.id}
          name={item.name}
          price={item.price}
          restaurantId={restaurantId}
          disabled={item.soldOut}
        />
      )}
    </View>
  );
}

function formatNaira(value: number) {
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;
}

const useStyles = makeStyles((theme) => ({
  card: { width: "47%" },
  thumbnail: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xxs,
  },
  thumbnailImage: { position: "absolute", width: "100%", height: "100%", borderRadius: theme.radius.md },
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
  compactAddButton: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.fab,
  },
  name: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  restaurantName: { ...theme.typography.tiny, color: theme.colors.text.secondary, marginTop: 2 },
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
