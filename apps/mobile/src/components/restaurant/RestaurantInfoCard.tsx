import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

export type RestaurantStat = {
  value?: string;
  label: string;
  status?: "open" | "closed";
};

type Props = {
  name: string;
  cuisine: string;
  address: string;
  stats: RestaurantStat[];
  distanceKm?: number;
  deliveryFeeLabel?: string;
  deliveryMinutes?: number;
  statusLabel?: string;
  isOpen?: boolean;
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
  statusLabel,
  isOpen,
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
        <View style={styles.addressLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <Pressable onPress={onPressSeeOnMaps} hitSlop={6} style={styles.rowAction}>
          <Text style={styles.link}>See on maps</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={styles.statValueSlot}>
              {stat.status ? (
                <View
                  accessibilityLabel={stat.status === "open" ? "Open" : "Closed"}
                  style={[
                    styles.statusDot,
                    stat.status === "closed" && styles.statusDotClosed,
                  ]}
                />
              ) : (
                <Text style={styles.statValue}>{stat.value}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.distanceRow}>
        <View style={styles.statusCopy}>
          {typeof distanceKm === "number" ? (
            <Text style={styles.distanceText}>{distanceKm}Km distance</Text>
          ) : statusLabel ? (
            <View style={styles.availabilityRow}>
              <View style={[styles.statusDot, isOpen === false && styles.statusDotClosed]} />
              <Text style={styles.distanceText}>{statusLabel}</Text>
            </View>
          ) : null}
          {deliveryFeeLabel && typeof deliveryMinutes === "number" ? (
            <Text style={styles.deliveryText}>
              Est. delivery fee {deliveryFeeLabel} · Delivery in {deliveryMinutes} min
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onPressChangeLocation} hitSlop={6} style={styles.rowAction}>
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
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  addressLocation: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flexShrink: 1,
  },
  link: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
  rowAction: { flexShrink: 0, alignItems: "flex-end" },
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
  statValueSlot: { height: 22, justifyContent: "center" },
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
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  statusCopy: { flex: 1, minWidth: 0 },
  availabilityRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#28A745" },
  statusDotClosed: { backgroundColor: theme.colors.text.tertiary },
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
