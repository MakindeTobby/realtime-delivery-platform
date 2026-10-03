import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "../../theme";

type Props = {
  address: string;
  onPressAddress?: () => void;
  onPressFavorites?: () => void;
  onPressNotifications?: () => void;
  searchValue: string;
  onChangeSearch: (value: string) => void;
};

export function HomeHeader({
  address,
  onPressAddress,
  onPressFavorites,
  onPressNotifications,
  searchValue,
  onChangeSearch,
}: Props) {
  const styles = useStyles();
  const { gradients, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.topRow}>
        <Pressable
          onPress={onPressAddress}
          style={styles.addressBlock}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
        >
          <Text style={styles.addressLabel}>Your current address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressValue} numberOfLines={1}>
              {address}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.text.inverse}
            />
          </View>
        </Pressable>

        <View style={styles.iconRow}>
          <Pressable
            onPress={onPressFavorites}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Favorites"
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={colors.text.inverse}
            />
          </Pressable>
          <Pressable
            onPress={onPressNotifications}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text.inverse}
            />
          </Pressable>
        </View>
      </View>

      {/* <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="What would you like to eat?"
          placeholderTextColor={colors.text.secondary}
          returnKeyType="search"
        />
      </View> */}
    </LinearGradient>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addressBlock: { flexShrink: 1, paddingRight: theme.spacing.sm },
  addressLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
    opacity: 0.85,
  },
  addressRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  addressValue: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    marginRight: 4,
  },
  iconRow: { flexDirection: "row", gap: theme.spacing.xs },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    height: 48,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
}));
