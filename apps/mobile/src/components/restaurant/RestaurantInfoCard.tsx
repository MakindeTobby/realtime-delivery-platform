import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

export type RestaurantStat = { value: string; label: string };

type Props = {
  name: string;
  cuisine: string;
  address: string;
  stats: RestaurantStat[];
  distanceKm: number;
  deliveryFeeLabel: string;
  deliveryMinutes: number;
  onPressSeeOnMaps?: () => void;
  onPressChangeLocation?: () => void;
};

export function RestaurantInfoCard({
  name,
  cuisine,
  address,
  stats,
  distanceKm,
  deliveryFeeLabel,
  deliveryMinutes,
  onPressSeeOnMaps,
  onPressChangeLocation,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.cuisine}>{cuisine}</Text>

      <View style={styles.addressRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={colors.text.secondary}
        />
        <Text style={styles.addressText} numberOfLines={1}>
          {address}
        </Text>
        <Pressable onPress={onPressSeeOnMaps} hitSlop={6}>
          <Text style={styles.link}>See on maps</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.distanceRow}>
        <View style={styles.flexShrink}>
          <Text style={styles.distanceText}>{distanceKm}Km distance</Text>
          <Text style={styles.deliveryText}>
            Est. delivery fee {deliveryFeeLabel} · Delivery in {deliveryMinutes}{" "}
            min
          </Text>
        </View>
        <Pressable onPress={onPressChangeLocation} hitSlop={6}>
          <Text style={styles.link}>Change location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  name: { ...theme.typography.display, color: theme.colors.text.primary },
  cuisine: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: theme.spacing.sm,
  },
  addressText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flexShrink: 1,
  },
  link: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
    marginLeft: "auto",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  statItem: { alignItems: "flex-start" },
  statValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  statLabel: {
    ...theme.typography.tiny,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  flexShrink: { flexShrink: 1 },
  distanceText: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  deliveryText: {
    ...theme.typography.tiny,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
}));
