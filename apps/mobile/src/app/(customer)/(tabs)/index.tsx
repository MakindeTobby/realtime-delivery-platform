import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { HomeHeader } from "../../../components/home/HomeHeader";
import {
  HomeCategoryRow,
  HomeFoodSection,
  HomePromoBanner,
  HomeRestaurantSection,
  type HomeCategory,
} from "../../../components/home/CustomerHomeSections";
import { useCustomerHomeQuery } from "@/hooks/use-customer-home";
import { useMyAddressesQuery } from "@/hooks/use-addresses";
import type { CustomerAddress } from "@/api/addresses";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import type { HomeMenuItem } from "@/api/customer";
import { makeStyles, theme } from "../../../theme";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function HomeScreen() {
  const styles = useStyles();
  const [selectedCategory, setSelectedCategory] = useState<HomeCategory>("All");
  const homeQuery = useCustomerHomeQuery();
  const firstName = useAuthStore((state) => state.user?.firstName);
  const cartCount = useCartStore((state) => state.totalItems());
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const deliveryCity = useCartStore((state) => state.deliveryCity);
  const setDeliveryAddress = useCartStore((state) => state.setDeliveryAddress);
  const setDeliveryCity = useCartStore((state) => state.setDeliveryCity);
  const setDeliveryAddressId = useCartStore((state) => state.setDeliveryAddressId);
  const setDeliveryCoordinates = useCartStore((state) => state.setDeliveryCoordinates);
  const addressesQuery = useMyAddressesQuery();
  const savedAddresses = (addressesQuery.data ?? []) as CustomerAddress[];
  const data = homeQuery.data;

  const restaurants = data?.restaurants ?? [];

  useEffect(() => {
    if (deliveryAddress || !savedAddresses.length) return;
    const address = savedAddresses.find((entry) => entry.isDefault) ?? savedAddresses[0];
    setDeliveryAddress(address.address);
    setDeliveryCity(address.city);
    setDeliveryAddressId(address.id);
    setDeliveryCoordinates(
      address.latitude === null ? null : Number(address.latitude),
      address.longitude === null ? null : Number(address.longitude),
    );
  }, [
    savedAddresses,
    deliveryAddress,
    setDeliveryAddress,
    setDeliveryCity,
    setDeliveryAddressId,
    setDeliveryCoordinates,
  ]);

  const menuItems = useMemo(() => {
    let items: HomeMenuItem[] = data?.menuItems ?? [];
    if (selectedCategory !== "All") {
      items = items.filter((item) => matchesCategory(item, selectedCategory));
    }
    return items;
  }, [data?.menuItems, selectedCategory]);

  return (
    <>
      <HomeHeader
        address={deliveryAddress ? `${deliveryAddress}${deliveryCity ? `, ${deliveryCity}` : ""}` : "Choose delivery location"}
        firstName={firstName}
        cartCount={cartCount}
        onPressAddress={() => router.push({ pathname: "/profile/addresses", params: { mode: "select" } })}
        onPressNotifications={() => router.push("/(customer)/(tabs)/order")}
        onPressCart={() => router.push("/(customer)/cart")}
        onPressSearch={() => router.push("/(customer)/(tabs)/discover")}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promoSection}><HomePromoBanner /></View>
        <View style={styles.categoriesSection}>
          <HomeCategoryRow selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        {homeQuery.isLoading ? (
          <View style={styles.status}><BrandLoader label="Finding local favourites…" /></View>
        ) : homeQuery.isError ? (
          <View style={styles.status}>
            <Text style={styles.errorText}>We couldn’t load restaurants right now.</Text>
            <Text accessibilityRole="link" onPress={() => void homeQuery.refetch()} style={styles.retry}>Tap to try again</Text>
          </View>
        ) : (
          <>
            <HomeFoodSection items={menuItems} />
            <HomeRestaurantSection restaurants={restaurants} />
          </>
        )}
        <View style={styles.footerSpace} />
      </ScrollView>
    </>
  );
}

function matchesCategory(item: HomeMenuItem, category: Exclude<HomeCategory, "All">) {
  const text = `${item.name} ${item.description ?? ""}`.toLowerCase();
  if (category === "Drinks") return /drink|juice|smoothie|soda|water|coffee|tea|zobo|shake/.test(text);
  if (category === "Snacks") return /snack|fries|chips|samosa|puff|pastry|spring roll/.test(text);
  if (category === "Burger") return /burger/.test(text);
  return !/drink|juice|smoothie|soda|water|coffee|tea|zobo|shake|burger/.test(text);
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.default },
  content: { paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxxl },
  promoSection: { marginTop: theme.spacing.xs },
  categoriesSection: { marginTop: theme.spacing.lg },
  status: { alignItems: "center", justifyContent: "center", gap: theme.spacing.sm, minHeight: 130, paddingHorizontal: theme.spacing.lg },
  statusText: { ...theme.typography.body, color: theme.colors.text.secondary },
  errorText: { ...theme.typography.body, color: theme.colors.text.primary, textAlign: "center" },
  retry: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  footerSpace: { height: theme.spacing.md },
}));
