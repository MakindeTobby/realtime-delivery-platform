import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../theme";

export type RestaurantTag = "discount" | "delivery";

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceFrom: string;
  distanceKm: number;
  deliveryMinutes: number;
  tags: RestaurantTag[];
  imageColor: string; // placeholder swatch until real photos are wired up
  isFavorite?: boolean;
  isOpenNow?: boolean;
  imageUrl?: string | null;
};

type Props = {
  restaurant: Restaurant;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

export function RestaurantCard({
  restaurant,
  onPress,
  onToggleFavorite,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
    >
      <View
        style={[styles.thumbnail, { backgroundColor: restaurant.imageColor }]}
      >
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} resizeMode="cover" style={styles.thumbnailImage} />
        ) : null}
        {restaurant.rating > 0 && <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={colors.rating} />
          <Text style={styles.ratingValue}>{restaurant.rating}</Text>
          <Text style={styles.ratingCount}>({restaurant.reviewCount})</Text>
        </View>}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        {!!restaurant.description && (
          <Text style={styles.description} numberOfLines={1}>
            {restaurant.description}
          </Text>
        )}

        {(restaurant.priceFrom || restaurant.distanceKm > 0 || restaurant.deliveryMinutes > 0 || restaurant.isOpenNow !== undefined) && (
          <View style={styles.metaRow}>
            {!!restaurant.priceFrom && <Text style={styles.metaText}>Start from {restaurant.priceFrom}</Text>}
            {!!restaurant.priceFrom && restaurant.distanceKm > 0 && <Text style={styles.metaDot}>·</Text>}
            {restaurant.distanceKm > 0 && <Text style={styles.metaText}>{restaurant.distanceKm}Km Distance</Text>}
            {restaurant.distanceKm > 0 && restaurant.deliveryMinutes > 0 && <Text style={styles.metaDot}>·</Text>}
            {restaurant.deliveryMinutes > 0 && <Text style={styles.metaText}>Delivery in {restaurant.deliveryMinutes} min</Text>}
            {restaurant.isOpenNow !== undefined && (
              <>
                {(restaurant.priceFrom || restaurant.distanceKm > 0 || restaurant.deliveryMinutes > 0) && <Text style={styles.metaDot}>·</Text>}
                <Text
                  style={
                    restaurant.isOpenNow ? styles.openText : styles.closedText
                  }
                >
                  {restaurant.isOpenNow ? "Open now" : "Closed"}
                </Text>
              </>
            )}
          </View>
        )}

        {restaurant.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {restaurant.tags.includes("discount") && (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.chip.discountBg },
                ]}
              >
                <Text
                  style={[styles.tagText, { color: colors.chip.discountText }]}
                >
                  Extra discount
                </Text>
              </View>
            )}
            {restaurant.tags.includes("delivery") && (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.chip.deliveryBg },
                ]}
              >
                <Text
                  style={[styles.tagText, { color: colors.chip.deliveryText }]}
                >
                  Free delivery
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Pressable
        onPress={onToggleFavorite}
        style={styles.favoriteButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={
          restaurant.isFavorite ? "Remove from favorites" : "Add to favorites"
        }
      >
        <Ionicons
          name={restaurant.isFavorite ? "heart" : "heart-outline"}
          size={18}
          color={
            restaurant.isFavorite ? colors.brand.primary : colors.text.secondary
          }
        />
      </Pressable>
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.sm,
  },
  thumbnailImage: { ...StyleSheet.absoluteFill, borderRadius: theme.radius.md },
  ratingBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  ratingValue: {
    ...theme.typography.tiny,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text.inverse,
  },
  ratingCount: {
    ...theme.typography.tiny,
    color: theme.colors.text.inverse,
    opacity: 0.85,
  },
  info: { flex: 1, paddingRight: theme.spacing.lg },
  name: { ...theme.typography.h3, color: theme.colors.text.primary },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xxs,
    flexWrap: "wrap",
  },
  metaText: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  metaDot: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    marginHorizontal: 4,
  },
  openText: {
    ...theme.typography.tiny,
    color: theme.colors.brand.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  closedText: { ...theme.typography.tiny, color: theme.colors.text.tertiary },
  tagsRow: {
    flexDirection: "row",
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.xs,
  },
  tag: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { ...theme.typography.tiny },
  favoriteButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
}));
