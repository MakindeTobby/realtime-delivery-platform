import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { QuantityStepper } from "@/components/restaurant/QuantityStepper";
import type { MenuItem } from "@/components/restaurant/restaurantMockData";

type Props = {
  restaurantId: string;
  dishes: MenuItem[];
  excludeIds: string[];
};

export function UpsellDishesRow({ restaurantId, dishes, excludeIds }: Props) {
  const styles = useStyles();
  const visible = dishes.filter((d) => !excludeIds.includes(d.id));

  if (visible.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Popular dishes from this resto</Text>
        <Pressable
          onPress={() => router.push(`/restaurant/${restaurantId}`)}
          hitSlop={6}
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {visible.map((dish) => (
          <View key={dish.id} style={styles.card}>
            <View
              style={[styles.thumbnail, { backgroundColor: dish.imageColor }]}
            />
            <Text style={styles.name} numberOfLines={1}>
              {dish.name}
            </Text>
            <Text style={styles.price}>
              ₦{dish.price.toLocaleString("en-NG")}
            </Text>
            <QuantityStepper
              itemId={dish.id}
              name={dish.name}
              price={dish.price}
              originalPrice={dish.originalPrice}
              restaurantId={restaurantId}
              disabled={dish.soldOut}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { marginTop: theme.spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  heading: { ...theme.typography.h3, color: theme.colors.text.primary },
  seeAll: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
  row: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
  card: { width: 140 },
  thumbnail: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xxs,
  },
  name: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  price: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
}));
