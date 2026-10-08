import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { FilterChips, type FilterChip } from "@/components/near-me/FilterChips";
import { RestaurantCard, type Restaurant } from "@/components/near-me/RestaurantCard";
import { HomeFoodSection } from "@/components/home/CustomerHomeSections";
import { useCustomerHomeQuery, useCustomerRestaurantsQuery } from "@/hooks/use-customer-home";
import { makeStyles, theme } from "@/theme";
import { BrandLoader } from "@/components/ui/BrandLoader";

const RECENT_SEARCHES_KEY = "swiftbite.customer.recent-searches";
const MAX_RECENT_SEARCHES = 7;
const IMAGE_COLORS = [
  theme.colors.dish.topPicks,
  theme.colors.dish.desserts,
  theme.colors.dish.beverages,
  theme.colors.dish.fastFood,
];

export default function DiscoverScreen() {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const homeQuery = useCustomerHomeQuery();
  const restaurantsQuery = useCustomerRestaurantsQuery(debouncedSearch, selectedCuisine);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(RECENT_SEARCHES_KEY)
      .then((value) => {
        if (!active || !value) return;
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) setRecentSearches(parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT_SEARCHES));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const cuisineChips = useMemo<FilterChip[]>(() => {
    const cuisines = [...new Set((homeQuery.data?.restaurants ?? []).map((item) => item.cuisineType.trim()).filter(Boolean))].sort();
    return [{ id: "", label: "All" }, ...cuisines.map((cuisine) => ({ id: cuisine, label: cuisine }))];
  }, [homeQuery.data?.restaurants]);

  const foods = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return (homeQuery.data?.menuItems ?? []).filter((item) => {
      const cuisineMatch = !selectedCuisine || item.restaurantCuisineType.toLowerCase().includes(selectedCuisine.toLowerCase());
      const searchMatch = !term || `${item.name} ${item.description ?? ""} ${item.restaurantName} ${item.restaurantCity}`.toLowerCase().includes(term);
      return cuisineMatch && searchMatch;
    });
  }, [homeQuery.data?.menuItems, debouncedSearch, selectedCuisine]);

  const restaurants = useMemo(() => (restaurantsQuery.data ?? []).map((restaurant, index): Restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    description: `${restaurant.cuisineType} · ${restaurant.city}`,
    rating: 0,
    reviewCount: 0,
    priceFrom: "",
    distanceKm: 0,
    deliveryMinutes: 0,
    tags: [],
    imageColor: IMAGE_COLORS[index % IMAGE_COLORS.length],
    imageUrl: restaurant.imageUrl,
    isOpenNow: restaurant.isOpen,
  })), [restaurantsQuery.data]);

  async function rememberSearch(value = search) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(next);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)).catch(() => undefined);
  }

  async function removeRecent(value: string) {
    const next = recentSearches.filter((item) => item !== value);
    setRecentSearches(next);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)).catch(() => undefined);
  }

  async function clearRecent() {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY).catch(() => undefined);
  }

  const showingSearch = Boolean(debouncedSearch || selectedCuisine);
  const title = debouncedSearch ? "Food results" : selectedCuisine ? `${selectedCuisine} picks` : "Recommended for you";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <DiscoverHeader
          searchValue={search}
          onChangeSearch={setSearch}
          onPressFilters={() => setFiltersVisible((visible) => !visible)}
          filtersActive={filtersVisible || Boolean(selectedCuisine)}
          onSubmitSearch={() => void rememberSearch()}
        />

        {filtersVisible && (
          <View style={styles.filterSection}>
            <Text style={styles.subheading}>Browse by cuisine</Text>
            <FilterChips chips={cuisineChips} selectedId={selectedCuisine} onSelect={setSelectedCuisine} />
          </View>
        )}

        {!search && !selectedCuisine && recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.subheading}>Recent searches</Text>
              <Pressable onPress={() => void clearRecent()} hitSlop={8}><Text style={styles.actionText}>Clear all</Text></Pressable>
            </View>
            <View style={styles.recentChips}>
              {recentSearches.map((item) => (
                <View key={item} style={styles.recentChip}>
                  <Pressable onPress={() => { setSearch(item); void rememberSearch(item); }} accessibilityRole="button">
                    <Text style={styles.recentText}>{item}</Text>
                  </Pressable>
                  <Pressable onPress={() => void removeRecent(item)} hitSlop={7} accessibilityLabel={`Remove ${item} from recent searches`}>
                    <Ionicons name="close" size={15} color={theme.colors.text.secondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {search.length > 0 && debouncedSearch === search.trim() && (
          <Pressable onPress={() => void rememberSearch()} style={styles.searchSave}>
            <Text style={styles.actionText}>Save “{debouncedSearch}” to recent searches</Text>
          </Pressable>
        )}

        {homeQuery.isLoading ? (
          <View style={styles.state}><BrandLoader label="Finding food near you…" /></View>
        ) : homeQuery.isError ? (
          <View style={styles.state}><Text style={styles.stateText}>We couldn’t load food right now.</Text><Text onPress={() => void homeQuery.refetch()} style={styles.retry}>Try again</Text></View>
        ) : (
          <>
            <HomeFoodSection
              items={foods}
              title={title}
              showSeeAll={false}
              emptyMessage={showingSearch ? "No matching meals in the menus currently available to Discover." : undefined}
            />
            <View style={styles.restaurantSection}>
              <View style={styles.restaurantHeading}>
                <Text style={styles.subheading}>{debouncedSearch ? "Restaurants" : "Restaurants near you"}</Text>
                {restaurantsQuery.isFetching && <ActivityIndicator size="small" color={theme.colors.brand.primary} />}
              </View>
              {restaurantsQuery.isError ? (
                <View style={styles.state}><Text style={styles.stateText}>We couldn’t load restaurants.</Text><Text onPress={() => void restaurantsQuery.refetch()} style={styles.retry}>Try again</Text></View>
              ) : restaurants.length ? restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => router.push(`/restaurant/${restaurant.id}`)} />
              )) : (
                <Text style={styles.emptyText}>{debouncedSearch ? `No restaurants match “${debouncedSearch}”.` : "No open restaurants yet. Check back soon."}</Text>
              )}
            </View>
          </>
        )}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  content: { paddingBottom: theme.spacing.xxxl },
  filterSection: { marginTop: theme.spacing.xs, gap: theme.spacing.xs },
  recentSection: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  subheading: { ...theme.typography.h3, color: theme.colors.text.primary, fontSize: 16 },
  actionText: { ...theme.typography.captionMedium, color: theme.colors.brand.primary },
  recentChips: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  recentChip: { borderWidth: 1, borderColor: theme.colors.border.default, borderRadius: theme.radius.md, minHeight: 38, paddingHorizontal: theme.spacing.sm, flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  recentText: { ...theme.typography.caption, color: theme.colors.text.secondary },
  searchSave: { alignSelf: "flex-end", paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  restaurantSection: { marginTop: theme.spacing.lg },
  restaurantHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  state: { alignItems: "center", justifyContent: "center", gap: theme.spacing.sm, minHeight: 120, paddingHorizontal: theme.spacing.lg },
  stateText: { ...theme.typography.body, color: theme.colors.text.secondary, textAlign: "center" },
  retry: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  emptyText: { ...theme.typography.body, color: theme.colors.text.secondary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
  footerSpace: { height: theme.spacing.md },
}));
