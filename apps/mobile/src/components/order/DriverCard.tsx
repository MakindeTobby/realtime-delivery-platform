import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import type { Driver } from "@/types/order";

type Props = { driver: Driver };

export function DriverCard({ driver }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: driver.avatarColor }]}>
        <Ionicons name="person" size={24} color={colors.text.inverse} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.meta}>
          {driver.vehicleType} · {driver.plateNumber}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.rating} />
          <Text style={styles.ratingText}>{driver.rating}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => Linking.openURL(`tel:${driver.phone}`)}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={`Call ${driver.name}`}
        >
          <Ionicons name="call" size={18} color={colors.brand.onPrimary} />
        </Pressable>
        {/* No chat/messaging screen exists yet — stub for now. */}
        <Pressable
          style={[styles.actionButton, styles.actionButtonOutline]}
          accessibilityRole="button"
          accessibilityLabel={`Message ${driver.name}`}
        >
          <Ionicons name="chatbubble" size={16} color={colors.brand.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    padding: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  actions: { flexDirection: "row", gap: theme.spacing.xs },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonOutline: {
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
  },
}));
