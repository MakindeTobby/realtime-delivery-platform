import React, { useMemo, useState } from "react";
import { SectionList, Text, View } from "react-native";
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
import { makeStyles } from "@/theme";
import { CollapsingHeaderBar } from "@/components/restaurant/CollapsingHeaderBar";
import { RestaurantInfoCard } from "@/components/restaurant/RestaurantInfoCard";
import { DiscountBannersRow } from "@/components/restaurant/DiscountBannersRow";
import { CategoryTabsBar } from "@/components/restaurant/CategoryTabsBar";
import { MenuItemCardGrid } from "@/components/restaurant/MenuItemCardGrid";
import { MenuItemCardRow } from "@/components/restaurant/MenuItemCardRow";
import { CartSummaryBar } from "@/components/restaurant/CartSummaryBar";
import {
  RESTAURANT,
  MENU_SECTIONS,
  type MenuListEntry,
} from "@/components/restaurant/restaurantMockData";

const HERO_HEIGHT = 240;
const COLLAPSE_DISTANCE = 180; // scrollY at which the header bar is fully solid
const TABS_BAR_HEIGHT = 44;

// Wrapping SectionList, not just ScrollView/FlatList, so scrollToLocation
// (tap-a-tab-to-jump) and section-aware layout (scrollspy) come from RN
// itself instead of hand-rolled offset math.
const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<MenuListEntry>,
);

export default function RestaurantScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  useLocalSearchParams<{ id?: string }>(); // only one mock restaurant for now — wire this to real data later

  const listRef = useAnimatedRef<SectionList<MenuListEntry>>();
  const scrollY = useSharedValue(0);
  const tabsOffsetY = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const sectionOffsetsY = useSharedValue<number[]>(MENU_SECTIONS.map(() => 0));

  const [activeCategoryId, setActiveCategoryId] = useState(MENU_SECTIONS[0].id);
  const [pinnedTabsVisible, setPinnedTabsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const barHeight = insets.top + 56;

  const categories = useMemo(
    () => MENU_SECTIONS.map((s) => ({ id: s.id, label: s.title })),
    [],
  );

  // Drives both the collapsing header (via scrollY) and the active-tab
  // scrollspy: compares scrollY against each section header's measured
  // offset (see renderSectionHeader's onLayout below) and picks the
  // last one we've scrolled past.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      const offsets = sectionOffsetsY.value;
      let newActiveIndex = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (offsets[i] - barHeight - TABS_BAR_HEIGHT <= scrollY.value) {
          newActiveIndex = i;
        }
      }
      if (newActiveIndex !== activeIndex.value) {
        activeIndex.value = newActiveIndex;
        runOnJS(setActiveCategoryId)(MENU_SECTIONS[newActiveIndex].id);
      }
    },
  });

  // pointerEvents can't be driven by an Animated style, so this is the one
  // piece of JS state in the whole scroll pipeline — flips only when the
  // pinned/unpinned boundary is actually crossed.
  useAnimatedReaction(
    () => scrollY.value >= tabsOffsetY.value - barHeight,
    (isPinned, wasPinned) => {
      if (isPinned !== wasPinned) {
        runOnJS(setPinnedTabsVisible)(isPinned);
      }
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
    const index = MENU_SECTIONS.findIndex((s) => s.id === categoryId);
    if (index === -1) return;
    setActiveCategoryId(categoryId);
    // viewOffset compensates for the pinned header + tabs so the section
    // title doesn't land hidden underneath them. The sign/value here is a
    // starting estimate — tune it once you can see it scroll on-device.
    listRef.current?.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      viewOffset: -(barHeight + TABS_BAR_HEIGHT),
      animated: true,
    });
  }

  return (
    <View style={styles.screen}>
      <CollapsingHeaderBar
        scrollY={scrollY}
        title={RESTAURANT.name}
        subtitle={RESTAURANT.cuisine}
        collapseDistance={COLLAPSE_DISTANCE}
        onBack={() => router.back()}
        isFavorite={isFavorite}
        onPressFavorite={() => setIsFavorite((f) => !f)}
      />

      {/* Pinned duplicate of the tabs bar. The real one lives inline inside
          ListHeaderComponent below (for correct scroll layout); this one
          fades in once scrollY passes its measured offset (tabsOffsetY). */}
      <Animated.View
        pointerEvents={pinnedTabsVisible ? "auto" : "none"}
        style={[styles.pinnedTabs, { top: barHeight }, pinnedTabsStyle]}
      >
        <CategoryTabsBar
          categories={categories}
          activeId={activeCategoryId}
          onSelect={handleSelectCategory}
        />
      </Animated.View>

      <AnimatedSectionList
        ref={listRef}
        sections={MENU_SECTIONS}
        keyExtractor={(entry) => entry.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        // Small dataset — render it all upfront so the onLayout
        // measurements scrollspy depends on aren't delayed by virtualization.
        initialNumToRender={50}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.hero,
                { backgroundColor: RESTAURANT.heroImageColor },
              ]}
            />

            <RestaurantInfoCard
              name={RESTAURANT.name}
              cuisine={RESTAURANT.cuisine}
              address={RESTAURANT.address}
              stats={RESTAURANT.stats}
              distanceKm={RESTAURANT.distanceKm}
              deliveryFeeLabel={RESTAURANT.deliveryFeeLabel}
              deliveryMinutes={RESTAURANT.deliveryMinutes}
            />

            <DiscountBannersRow
              fbDiscountLabel={RESTAURANT.fbDiscountLabel}
              fbDiscountSubtitle={RESTAURANT.fbDiscountSubtitle}
              shippingDiscountLabel={RESTAURANT.shippingDiscountLabel}
              shippingDiscountSubtitle={RESTAURANT.shippingDiscountSubtitle}
            />

            <View
              onLayout={(e) => {
                tabsOffsetY.value = e.nativeEvent.layout.y;
              }}
            >
              <CategoryTabsBar
                categories={categories}
                activeId={activeCategoryId}
                onSelect={handleSelectCategory}
              />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={styles.sectionHeader}
            onLayout={(e) => {
              const index = MENU_SECTIONS.findIndex((s) => s.id === section.id);
              if (index === -1) return;
              const updated = [...sectionOffsetsY.value];
              updated[index] = e.nativeEvent.layout.y;
              sectionOffsetsY.value = updated;
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
                  restaurantId={RESTAURANT.id}
                />
              ))}
            </View>
          ) : (
            <MenuItemCardRow item={entry.item} restaurantId={RESTAURANT.id} />
          )
        }
      />

      <CartSummaryBar />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  hero: { width: "100%", height: HERO_HEIGHT },
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
}));
