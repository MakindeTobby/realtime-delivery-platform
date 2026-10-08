import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { HomeMenuItem, PublicRestaurant } from "@/api/customer";
import type { MenuItem } from "@/components/restaurant/restaurantMockData";
import { MenuItemCardGrid } from "@/components/restaurant/MenuItemCardGrid";
import { makeStyles, theme, useTheme } from "@/theme";

const HERO_MEAL = require("../../../assets/images/grilled-chicken-rice.png");

export type HomeCategory = "All" | "Food" | "Drinks" | "Snacks" | "Burger";

export const HOME_CATEGORIES: { id: HomeCategory; icon: string }[] = [
  { id: "All", icon: "🍽️" },
  { id: "Food", icon: "🍛" },
  { id: "Drinks", icon: "🥤" },
  { id: "Snacks", icon: "🍿" },
  { id: "Burger", icon: "🍔" },
];

export function HomePromoBanner() {
  const styles = useStyles();
  return (
    <LinearGradient colors={["#352014", "#1D100A"]} style={styles.promo}>
      <View style={styles.promoCopy}>
        <View style={styles.promoEyebrow}>
          <Ionicons name="sparkles" size={12} color="#FFC76A" />
          <Text style={styles.promoEyebrowText}>GOOD FOOD, CLOSE BY</Text>
        </View>
        <Text style={styles.promoTitle}>Find your{ "\n" }next favourite.</Text>
        <Text style={styles.promoSubtitle}>Explore meals from local kitchens.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(customer)/(tabs)/discover")}
          style={styles.promoButton}
        >
          <Text style={styles.promoButtonText}>Explore now</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <Image source={HERO_MEAL} resizeMode="contain" style={styles.promoImage} />
    </LinearGradient>
  );
}

type CategoryRowProps = {
  selected: HomeCategory;
  onSelect: (category: HomeCategory) => void;
};

export function HomeCategoryRow({ selected, onSelect }: CategoryRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <FlatList
      horizontal
      data={HOME_CATEGORIES}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryList}
      renderItem={({ item }) => {
        const active = selected === item.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.id)}
            style={styles.categoryItem}
          >
            <View style={[styles.categoryCircle, active && styles.categoryCircleActive]}>
              <Text style={styles.categoryEmoji}>{item.icon}</Text>
            </View>
            <Text style={[styles.categoryLabel, active && { color: colors.brand.primary }]}>{item.id}</Text>
          </Pressable>
        );
      }}
    />
  );
}

type FoodSectionProps = {
  items: HomeMenuItem[];
  title?: string;
  showSeeAll?: boolean;
  emptyMessage?: string;
};

export function HomeFoodSection({ items, title = "Top picks for you", showSeeAll = true, emptyMessage = "Menu favourites will show here as local restaurants come online." }: FoodSectionProps) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.44, 190);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && <Pressable onPress={() => router.push("/(customer)/(tabs)/discover")} hitSlop={8}>
          <Text style={styles.seeAll}>See all <Ionicons name="chevron-forward" size={12} /></Text>
        </Pressable>}
      </View>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => `${item.restaurantId}:${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodList}
          renderItem={({ item }) => {
            const menuItem: MenuItem = {
              id: item.id,
              name: item.name,
              description: item.description ?? undefined,
              price: Number(item.price),
              imageColor: theme.colors.dish.topPicks,
              imageUrl: item.imageUrl,
            };
            return (
              <MenuItemCardGrid
                item={menuItem}
                restaurantId={item.restaurantId}
                restaurantName={item.restaurantName}
                cardWidth={cardWidth}
                compactAdd
                onPressCard={() => router.push(`/restaurant/${item.restaurantId}`)}
              />
            );
          }}
        />
      )}
    </View>
  );
}

type RestaurantSectionProps = { restaurants: PublicRestaurant[] };

export function HomeRestaurantSection({ restaurants }: RestaurantSectionProps) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.78, 330);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Restaurants near you</Text>
        <Pressable onPress={() => router.push("/(customer)/(tabs)/discover")} hitSlop={8}>
          <Text style={styles.seeAll}>See all <Ionicons name="chevron-forward" size={12} /></Text>
        </Pressable>
      </View>
      {restaurants.length === 0 ? (
        <Text style={styles.emptyText}>No open restaurants yet. Check back soon.</Text>
      ) : (
        <FlatList
          horizontal
          data={restaurants}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/restaurant/${item.id}`)}
              style={[styles.restaurantCard, { width: cardWidth }]}
            >
              <View style={styles.restaurantImageWrap}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.restaurantImage} />
                ) : (
                  <View style={[styles.restaurantImage, styles.restaurantImageFallback]}>
                    <Text style={styles.restaurantFallbackEmoji}>🍴</Text>
                  </View>
                )}
                <View style={styles.openBadge}><View style={styles.openDot} /><Text style={styles.openText}>Taking orders</Text></View>
              </View>
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantTitleRow}>
                  <Text numberOfLines={1} style={styles.restaurantName}>{item.name}</Text>
                  <Ionicons name="checkmark-circle" size={15} color="#3677D5" />
                </View>
                <Text numberOfLines={1} style={styles.restaurantMeta}>{item.cuisineType} · {item.city}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  promo: { height: 166, borderRadius: 17, marginHorizontal: theme.spacing.md, overflow: "hidden", padding: 15, justifyContent: "center" },
  promoCopy: { width: "63%", zIndex: 1 },
  promoEyebrow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  promoEyebrowText: { color: "#FFC76A", fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  promoTitle: { color: "#FFFFFF", fontSize: 21, lineHeight: 24, fontWeight: "800" },
  promoSubtitle: { color: "#F2E9E2", fontSize: 10, lineHeight: 14, marginTop: 5 },
  promoButton: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: theme.colors.brand.primary, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, marginTop: 9 },
  promoButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  promoImage: { position: "absolute", width: 184, height: 184, right: -9, bottom: -17 },
  categoryList: { paddingHorizontal: theme.spacing.md, gap: 15 },
  categoryItem: { width: 60, alignItems: "center", gap: 6 },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.card,
  },
  categoryCircleActive: {
    borderColor: theme.colors.brand.primary,
    borderWidth: 2,
    backgroundColor: "#FFF1E8",
    transform: [{ scale: 1.04 }],
  },
  categoryEmoji: { fontSize: 25 },
  categoryLabel: { ...theme.typography.captionMedium, color: theme.colors.text.primary, fontSize: 12 },
  section: { marginTop: theme.spacing.lg },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.spacing.md, marginBottom: 9 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text.primary, fontSize: 15 },
  seeAll: { ...theme.typography.captionMedium, color: theme.colors.brand.primary },
  foodList: { paddingHorizontal: theme.spacing.md, gap: 10 },
  restaurantCard: { borderRadius: 12, overflow: "hidden", backgroundColor: theme.colors.background.surface, borderWidth: 1, borderColor: "#F1F1F1" },
  restaurantImageWrap: { height: 115, position: "relative" },
  restaurantImage: { width: "100%", height: "100%" },
  restaurantImageFallback: { backgroundColor: "#E5F0E5", alignItems: "center", justifyContent: "center" },
  restaurantFallbackEmoji: { fontSize: 38 },
  openBadge: { position: "absolute", left: 8, top: 8, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, backgroundColor: "rgba(23,46,34,0.88)", paddingHorizontal: 8, paddingVertical: 5 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8BE2A0" },
  openText: { color: "#FFFFFF", fontSize: 9, fontWeight: "600" },
  restaurantInfo: { paddingHorizontal: 10, paddingVertical: 8 },
  restaurantTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  restaurantName: { ...theme.typography.bodyMedium, color: theme.colors.text.primary, flexShrink: 1 },
  restaurantMeta: { ...theme.typography.caption, color: theme.colors.text.secondary, marginTop: 3 },
  emptyText: { ...theme.typography.body, color: theme.colors.text.secondary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
}));
