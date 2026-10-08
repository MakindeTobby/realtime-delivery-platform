import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "../../theme";

type Props = {
  address: string;
  firstName?: string;
  cartCount: number;
  onPressAddress?: () => void;
  onPressCart?: () => void;
  onPressNotifications?: () => void;
  onPressSearch: () => void;
};

export function HomeHeader({
  address,
  firstName,
  cartCount,
  onPressAddress,
  onPressCart,
  onPressNotifications,
  onPressSearch,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onPressAddress}
          style={styles.addressBlock}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
        >
          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color={colors.brand.primary} />
            <Text style={styles.addressValue} numberOfLines={1}>
              {address}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.brand.primary}
            />
          </View>
          <Text style={styles.greeting}>Good {getGreeting()}, {firstName || "there"}</Text>
        </Pressable>

        <View style={styles.iconRow}>
          <Pressable
            onPress={onPressNotifications}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Favorites"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text.primary}
            />
          </Pressable>
          <Pressable
            onPress={onPressCart}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons
              name="bag-handle-outline"
              size={20}
              color={colors.text.primary}
            />
            {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text></View>}
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.searchBar}
        onPress={onPressSearch}
        accessibilityRole="button"
        accessibilityLabel="Search for food or restaurants. Opens Discover."
      >
        <Ionicons name="search" size={18} color={colors.text.secondary} />
        <Text style={styles.searchPlaceholder}>Search for food or restaurants</Text>
        <Ionicons name="options-outline" size={19} color={colors.text.secondary} />
      </Pressable>
    </View>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressBlock: { flexShrink: 1, paddingRight: theme.spacing.sm },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressValue: {
    ...theme.typography.tiny,
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  greeting: {
    ...theme.typography.bodyMedium,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  iconRow: { flexDirection: "row", gap: theme.spacing.xs },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: { position: "absolute", right: -3, top: -4, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: theme.colors.brand.primary, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: theme.colors.text.inverse, fontSize: 9, fontWeight: "700" },
  searchBar: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    height: 44,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.subtle,
  },
  searchPlaceholder: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
}));
