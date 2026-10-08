import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { makeStyles, useTheme } from "@/theme";
import { useCartStore } from "@/store/cart";

type Props = {
  onPressChangeLocation?: () => void;
};

export function DeliveryLocationCard({ onPressChangeLocation }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryCity = useCartStore((s) => s.deliveryCity);
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress);
  const setDeliveryCity = useCartStore((s) => s.setDeliveryCity);
  const deliveryLatitude = useCartStore((s) => s.deliveryLatitude);
  const deliveryLongitude = useCartStore((s) => s.deliveryLongitude);
  const setDeliveryCoordinates = useCartStore((s) => s.setDeliveryCoordinates);
  const deliveryNote = useCartStore((s) => s.deliveryNote);
  const setDeliveryNote = useCartStore((s) => s.setDeliveryNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  async function useCurrentLocation() {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow SwiftBite to access your location while using the app, or enter your delivery address manually.",
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync(current.coords);
      const street = [place?.streetNumber, place?.street].filter(Boolean).join(" ");
      const address = street || place?.name || place?.district || "";
      const city = place?.city || place?.subregion || place?.region || "";

      if (!address || !city) {
        Alert.alert(
          "Add your delivery details",
          "We couldn’t read a complete street address and city. Enter those details below, then try again if you still want to attach your location.",
        );
        return;
      }

      setDeliveryAddress(address);
      setDeliveryCity(city);
      setDeliveryCoordinates(current.coords.latitude, current.coords.longitude);
    } catch {
      Alert.alert(
        "Couldn’t get your location",
        "Check that location services are enabled, or enter your delivery address manually.",
      );
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery location</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.distanceText}>Delivery details</Text>
          <Pressable onPress={onPressChangeLocation} hitSlop={6}>
            <Text style={styles.link}>
              {deliveryAddress.trim() && deliveryCity.trim() ? "Change" : "Choose address"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.deliveryText} numberOfLines={2}>
          {deliveryAddress.trim() && deliveryCity.trim()
            ? `${deliveryAddress}, ${deliveryCity}`
            : "Choose a saved address or enter your delivery details below."}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => setNoteOpen((o) => !o)}
          style={styles.actionChip}
        >
          <Text style={styles.actionChipText}>Add note</Text>
        </Pressable>
        <Pressable
          onPress={() => void useCurrentLocation()}
          style={[styles.actionChip, styles.locationChip]}
          disabled={isLocating}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
        >
          <Ionicons
            name={isLocating ? "time-outline" : "navigate-outline"}
            size={15}
            color={colors.brand.primary}
          />
          <Text style={styles.locationChipText}>
            {isLocating ? "Getting location…" : "Use current location"}
          </Text>
        </Pressable>
      </View>

      {deliveryLatitude !== null && deliveryLongitude !== null && (
        <View style={styles.locationStatus}>
          <Ionicons name="checkmark-circle" size={16} color={colors.brand.primary} />
          <Text style={styles.locationStatusText}>Delivery pin saved with this address</Text>
        </View>
      )}

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

      <TextInput
        style={styles.addressInput}
        placeholder="Delivery address (street and building)"
        placeholderTextColor={colors.text.tertiary}
        value={deliveryAddress}
        onChangeText={setDeliveryAddress}
        accessibilityLabel="Delivery address"
      />
      <TextInput
        style={styles.addressInput}
        placeholder="City"
        placeholderTextColor={colors.text.tertiary}
        value={deliveryCity}
        onChangeText={setDeliveryCity}
        accessibilityLabel="Delivery city"
      />
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
  locationChip: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs },
  locationChipText: { ...theme.typography.captionMedium, color: theme.colors.brand.primary },
  locationStatus: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, marginTop: theme.spacing.sm },
  locationStatusText: { ...theme.typography.caption, color: theme.colors.text.secondary },
  noteInput: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  addressInput: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    minHeight: 44,
  },
}));
