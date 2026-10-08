import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  SectionList,
  StatusBar,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomerRestaurantQuery } from "@/hooks/use-customer-home";
import { CollapsingHeaderBar } from "@/components/restaurant/CollapsingHeaderBar";
import { RestaurantInfoCard, type RestaurantStat } from "@/components/restaurant/RestaurantInfoCard";
import { CategoryTabsBar } from "@/components/restaurant/CategoryTabsBar";
import { MenuItemCardGrid } from "@/components/restaurant/MenuItemCardGrid";
import { MenuItemCardRow } from "@/components/restaurant/MenuItemCardRow";
import { CartSummaryBar } from "@/components/restaurant/CartSummaryBar";
import type {
  MenuItem,
  MenuListEntry,
  MenuSection,
} from "@/components/restaurant/restaurantMockData";
import { makeStyles, theme } from "@/theme";
import { BrandLoader } from "@/components/ui/BrandLoader";

const HERO_HEIGHT = 240;
const COLLAPSE_DISTANCE = 180;
const TABS_BAR_HEIGHT = 44;
const IMAGE_COLORS = [
  theme.colors.dish.topPicks,
  theme.colors.dish.desserts,
  theme.colors.dish.beverages,
  theme.colors.dish.fastFood,
];

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<MenuListEntry>,
);

export default function RestaurantScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const restaurantId = typeof id === "string" ? id : "";
  const restaurantQuery = useCustomerRestaurantQuery(restaurantId);
  const restaurant = restaurantQuery.data?.restaurant;
  const categories = restaurantQuery.data?.categories ?? [];
  const menuItems = restaurantQuery.data?.menuItems ?? [];

  const sections = useMemo(() => {
    const mappedItems = menuItems.map(
      (item, index): MenuItem => ({
        id: item.id,
        name: item.name,
        description: item.description ?? undefined,
        price: Number(item.price),
        imageColor: IMAGE_COLORS[index % IMAGE_COLORS.length],
        imageUrl: item.imageUrl,
        soldOut: !item.isAvailable,
      }),
    );

    const categorySections: MenuSection[] = categories
      .map((category, categoryIndex) => {
        const items = mappedItems.filter(
          (item) =>
            menuItems.find((source) => source.id === item.id)?.categoryId ===
            category.id,
        );
        if (items.length === 0) return null;
        const data: MenuListEntry[] =
          categoryIndex === 0
            ? [{ kind: "grid", id: `${category.id}-grid`, items }]
            : items.map((item) => ({ kind: "item", id: item.id, item }));
        return { id: category.id, title: category.name, data };
      })
      .filter((section): section is MenuSection => section !== null);

    const uncategorized = mappedItems.filter(
      (item) =>
        !categories.some(
          (category) =>
            menuItems.find((source) => source.id === item.id)?.categoryId ===
            category.id,
        ),
    );
    if (uncategorized.length) {
      categorySections.push({
        id: "uncategorized",
        title: "Other items",
        data: uncategorized.map((item) => ({
          kind: "item",
          id: item.id,
          item,
        })),
      });
    }
    return categorySections;
  }, [categories, menuItems]);

  const listRef = useAnimatedRef<SectionList<MenuListEntry>>();
  const scrollY = useSharedValue(0);
  const tabsOffsetY = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const sectionIds = sections.map((section) => section.id);
  const sectionOffsetsY = useSharedValue<number[]>(sections.map(() => 0));
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [pinnedTabsVisible, setPinnedTabsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const barHeight = insets.top + 56;

  useEffect(() => {
    sectionOffsetsY.value = sections.map(() => 0);
    activeIndex.value = 0;
    setActiveCategoryId(sections[0]?.id ?? "");
  }, [sections, activeIndex, sectionOffsetsY]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const offsets = sectionOffsetsY.value;
      let newActiveIndex = 0;
      for (let index = 0; index < offsets.length; index++) {
        if (offsets[index] - barHeight - TABS_BAR_HEIGHT <= scrollY.value) {
          newActiveIndex = index;
        }
      }
      if (sectionIds[newActiveIndex] && newActiveIndex !== activeIndex.value) {
        activeIndex.value = newActiveIndex;
        runOnJS(setActiveCategoryId)(sectionIds[newActiveIndex]);
      }
    },
  });

  useAnimatedReaction(
    () =>
      sectionIds.length > 0 && scrollY.value >= tabsOffsetY.value - barHeight,
    (isPinned, wasPinned) => {
      if (isPinned !== wasPinned) runOnJS(setPinnedTabsVisible)(isPinned);
    },
  );

  const pinnedTabsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [tabsOffsetY.value - barHeight - 20, tabsOffsetY.value - barHeight],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  function handleSelectCategory(categoryId: string) {
    const index = sections.findIndex((section) => section.id === categoryId);
    if (index === -1) return;
    setActiveCategoryId(categoryId);
    listRef.current?.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      viewOffset: -(barHeight + TABS_BAR_HEIGHT),
      animated: true,
    });
  }

  if (restaurantQuery.isLoading) {
    return (
      <View style={styles.state}>
        <BrandLoader label="Loading restaurant…" />
      </View>
    );
  }

  if (restaurantQuery.isError || !restaurant) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>We couldn’t load this restaurant</Text>
        <Text style={styles.stateText}>
          It may have closed or is temporarily unavailable.
        </Text>
        <Text
          onPress={() => void restaurantQuery.refetch()}
          style={styles.retry}
        >
          Try again
        </Text>
        <Text onPress={() => router.back()} style={styles.retry}>
          Go back
        </Text>
      </View>
    );
  }

  const prices = menuItems
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const priceRange = prices.length
    ? `${formatNaira(Math.min(...prices))}–${formatNaira(Math.max(...prices))}`
    : "—";
  const stats: RestaurantStat[] = [
    { value: String(menuItems.length), label: "Menu items" },
    { value: String(categories.length), label: "Categories" },
    { value: priceRange, label: "Price range" },
    { label: "Status", status: restaurant.isOpen ? "open" : "closed" },
  ];
  const tabCategories = sections.map((section) => ({
    id: section.id,
    label: section.title,
  }));

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <CollapsingHeaderBar
        scrollY={scrollY}
        title={restaurant.name}
        subtitle={`${restaurant.cuisineType} · ${restaurant.city}`}
        collapseDistance={COLLAPSE_DISTANCE}
        onBack={() => router.back()}
        isFavorite={isFavorite}
        onPressFavorite={() => setIsFavorite((favorite) => !favorite)}
      />

      {tabCategories.length > 0 && (
        <Animated.View
          pointerEvents={pinnedTabsVisible ? "auto" : "none"}
          style={[styles.pinnedTabs, { top: barHeight }, pinnedTabsStyle]}
        >
          <CategoryTabsBar
            categories={tabCategories}
            activeId={activeCategoryId}
            onSelect={handleSelectCategory}
          />
        </Animated.View>
      )}

      <AnimatedSectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(entry) => entry.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        initialNumToRender={50}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.hero,
                { backgroundColor: theme.colors.dish.topPicks },
              ]}
            >
              {restaurant.imageUrl ? (
                <Image
                  source={{ uri: restaurant.imageUrl }}
                  resizeMode="cover"
                  style={styles.heroImage}
                />
              ) : null}
            </View>
            <RestaurantInfoCard
              name={restaurant.name}
              cuisine={restaurant.cuisineType}
              address={`${restaurant.address}, ${restaurant.city}`}
              stats={stats}
              statusLabel={
                restaurant.isOpen
                  ? "Open and accepting orders"
                  : "Currently closed"
              }
              isOpen={restaurant.isOpen}
              onPressSeeOnMaps={() => {
                const query = encodeURIComponent(
                  `${restaurant.address}, ${restaurant.city}`,
                );
                void Linking.openURL(`https://maps.google.com/?q=${query}`);
              }}
              onPressChangeLocation={() =>
                router.push({ pathname: "/profile/addresses", params: { mode: "select" } })
              }
            />
            {/* Promotions are intentionally omitted until the API exposes restaurant offers. */}
            {tabCategories.length > 0 && (
              <View
                onLayout={(event) => {
                  tabsOffsetY.value = event.nativeEvent.layout.y;
                }}
              >
                <CategoryTabsBar
                  categories={tabCategories}
                  activeId={activeCategoryId}
                  onSelect={handleSelectCategory}
                />
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={styles.sectionHeader}
            onLayout={(event) => {
              const index = sectionIds.indexOf(section.id);
              if (index === -1) return;
              const offsets = [...sectionOffsetsY.value];
              offsets[index] = event.nativeEvent.layout.y;
              sectionOffsetsY.value = offsets;
            }}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item: entry }) =>
          entry.kind === "grid" ? (
            <View style={styles.gridWrap}>
              {entry.items.map((menuItem) => (
                <MenuItemCardGrid
                  key={menuItem.id}
                  item={menuItem}
                  restaurantId={restaurant.id}
                />
              ))}
            </View>
          ) : (
            <MenuItemCardRow item={entry.item} restaurantId={restaurant.id} />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyMenu}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <Text style={styles.stateText}>
              This restaurant hasn’t added menu items yet.
            </Text>
          </View>
        }
      />

      <CartSummaryBar />
    </View>
  );
}

function formatNaira(value: number) {
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  hero: { width: "100%", height: HERO_HEIGHT, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  listContent: { paddingBottom: 120 },
  pinnedTabs: { position: "absolute", left: 0, right: 0, zIndex: 9 },
  sectionHeader: {
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text.primary },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.surface,
  },
  stateTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  stateText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  retry: {
    ...theme.typography.bodyMedium,
    color: theme.colors.brand.primary,
    padding: theme.spacing.xs,
  },
  emptyMenu: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
}));
