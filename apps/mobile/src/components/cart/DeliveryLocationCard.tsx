import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { useCartStore } from "@/store/cart";

type Props = {
  distanceKm: number;
  deliveryFeeLabel: string;
  deliveryMinutes: number;
  onPressChangeLocation?: () => void;
  onPressEditAddress?: () => void;
};

export function DeliveryLocationCard({
  distanceKm,
  deliveryFeeLabel,
  deliveryMinutes,
  onPressChangeLocation,
  onPressEditAddress,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryNote = useCartStore((s) => s.deliveryNote);
  const setDeliveryNote = useCartStore((s) => s.setDeliveryNote);
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery location</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.distanceText}>{distanceKm}Km distance</Text>
          <Pressable onPress={onPressChangeLocation} hitSlop={6}>
            <Text style={styles.link}>Change location</Text>
          </Pressable>
        </View>
        <Text style={styles.deliveryText}>
          Est. delivery fee {deliveryFeeLabel} · Delivery in {deliveryMinutes}{" "}
          min
        </Text>
      </View>

      <View style={styles.actionsRow}>
        {/*
          No address-editing or geocoding flow exists yet — this just opens
          up the caller's onPressEditAddress stub for now. Build a real
          address-picker screen before wiring this up for production.
        */}
        <Pressable onPress={onPressEditAddress} style={styles.actionChip}>
          <Text style={styles.actionChipText}>Edit address details</Text>
        </Pressable>
        <Pressable
          onPress={() => setNoteOpen((o) => !o)}
          style={styles.actionChip}
        >
          <Text style={styles.actionChipText}>Add note</Text>
        </Pressable>
      </View>

      {noteOpen && (
        <TextInput
          style={styles.noteInput}
          placeholder="e.g. leave at the door, call on arrival"
          placeholderTextColor={colors.text.tertiary}
          value={deliveryNote}
          onChangeText={setDeliveryNote}
          multiline
        />
      )}

      <View style={styles.addressBox}>
        <Text style={styles.addressText}>{deliveryAddress}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  summaryCard: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  link: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
  deliveryText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  actionChip: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  actionChipText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
  },
  noteInput: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  addressBox: {
    backgroundColor: theme.colors.chip.deliveryBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  addressText: {
    ...theme.typography.caption,
    color: theme.colors.chip.deliveryText,
  },
}));
