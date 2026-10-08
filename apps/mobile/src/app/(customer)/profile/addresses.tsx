import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useMyAddressesQuery,
  useUpdateAddressMutation,
} from "@/hooks/use-addresses";
import type { CustomerAddress } from "@/api/addresses";
import { useCartStore } from "@/store/cart";
import { makeStyles, useTheme } from "@/theme";

export default function AddressesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const addressesQuery = useMyAddressesQuery();
  const addresses = (addressesQuery.data ?? []) as CustomerAddress[];
  const createAddress = useCreateAddressMutation();
  const updateAddress = useUpdateAddressMutation();
  const deleteAddress = useDeleteAddressMutation();
  const selectedAddressId = useCartStore((state) => state.deliveryAddressId);
  const setDeliveryAddress = useCartStore((state) => state.setDeliveryAddress);
  const setDeliveryCity = useCartStore((state) => state.setDeliveryCity);
  const setDeliveryAddressId = useCartStore((state) => state.setDeliveryAddressId);
  const setDeliveryCoordinates = useCartStore((state) => state.setDeliveryCoordinates);

  const [formVisible, setFormVisible] = useState(false);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [makeDefault, setMakeDefault] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  function selectAddress(entry: CustomerAddress) {
    setDeliveryAddress(entry.address);
    setDeliveryCity(entry.city);
    setDeliveryAddressId(entry.id);
    setDeliveryCoordinates(
      entry.latitude === null ? null : Number(entry.latitude),
      entry.longitude === null ? null : Number(entry.longitude),
    );
    if (mode === "select") {
      router.back();
      return;
    }
    Alert.alert("Delivery address updated", `${entry.label} is now selected for delivery.`);
  }

  function confirmDelete(id: string, entryLabel: string) {
    Alert.alert("Remove address?", `Remove “${entryLabel}” from your saved addresses?`, [
      { text: "Keep address", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteAddress.mutate(id, {
            onSuccess: () => {
              if (selectedAddressId === id) {
                setDeliveryAddress("");
                setDeliveryCity("");
              }
            },
            onError: () => Alert.alert("Couldn’t remove address", "Please try again."),
          });
        },
      },
    ]);
  }

  async function fillFromCurrentLocation() {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "You can enter the address manually or allow location access while using SwiftBite.",
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync(current.coords);
      const street = [place?.streetNumber, place?.street].filter(Boolean).join(" ");
      const resolvedAddress = street || place?.name || place?.district || "";
      const resolvedCity = place?.city || place?.subregion || place?.region || "";

      if (!resolvedAddress || !resolvedCity) {
        Alert.alert(
          "Complete the address",
          "We couldn’t identify a street and city. Enter them manually, then save your address.",
        );
        return;
      }

      setAddress(resolvedAddress);
      setCity(resolvedCity);
      setLatitude(current.coords.latitude);
      setLongitude(current.coords.longitude);
    } catch {
      Alert.alert("Couldn’t get your location", "Check location services or enter your address manually.");
    } finally {
      setIsLocating(false);
    }
  }

  function saveAddress() {
    if (!label.trim() || !address.trim() || !city.trim()) {
      Alert.alert("Address details required", "Add a label, street address, and city.");
      return;
    }

    createAddress.mutate(
      {
        label: label.trim(),
        address: address.trim(),
        city: city.trim(),
        ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}),
        ...(makeDefault ? { isDefault: true } : {}),
      },
      {
        onSuccess: (created: CustomerAddress) => {
          setFormVisible(false);
          setLabel("Home");
          setAddress("");
          setCity("");
          setLatitude(null);
          setLongitude(null);
          setMakeDefault(false);
          selectAddress(created);
        },
        onError: () => Alert.alert("Couldn’t save address", "Please check your connection and try again."),
      },
    );
  }

  function openAddressForm() {
    setMakeDefault(addresses.length === 0);
    setFormVisible(true);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Delivery addresses" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Where should we deliver?</Text>
          <Text style={styles.subtitle}>Save places you order from and choose one for your next delivery.</Text>
        </View>

        {addressesQuery.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand.primary} />
            <Text style={styles.helperText}>Loading your addresses…</Text>
          </View>
        ) : addressesQuery.isError ? (
          <Pressable style={styles.errorCard} onPress={() => void addressesQuery.refetch()}>
            <Text style={styles.errorText}>We couldn’t load your saved addresses. Tap to retry.</Text>
          </Pressable>
        ) : addresses.length ? (
          <View style={styles.addressList}>
            {addresses.map((entry) => {
              const isSelected = selectedAddressId === entry.id;
              return (
                <View key={entry.id} style={[styles.addressCard, isSelected && styles.addressCardSelected]}>
                  <Pressable
                    style={styles.addressMain}
                    onPress={() => selectAddress(entry)}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${entry.label} delivery address`}
                  >
                    <View style={styles.addressIcon}>
                      <Ionicons
                        name={entry.label.toLowerCase() === "work" ? "briefcase-outline" : "location-outline"}
                        size={20}
                        color={colors.brand.primary}
                      />
                    </View>
                    <View style={styles.addressCopy}>
                      <View style={styles.addressTitleRow}>
                        <Text style={styles.addressLabel} numberOfLines={1}>{entry.label}</Text>
                        {entry.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.brand.primary} />}
                      </View>
                      <Text style={styles.addressLine} numberOfLines={2}>{entry.address}</Text>
                      <Text style={styles.cityLine} numberOfLines={1}>{entry.city}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.addressActions}>
                    {!entry.isDefault && (
                      <Pressable
                        style={styles.textAction}
                        onPress={() => updateAddress.mutate(
                          { id: entry.id, payload: { isDefault: true } },
                          {
                            onSuccess: () => selectAddress(entry),
                            onError: () => Alert.alert("Couldn’t update default", "Please try again."),
                          },
                        )}
                        disabled={updateAddress.isPending}
                      >
                        <Text style={styles.makeDefaultText}>Make default</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={styles.iconAction}
                      onPress={() => confirmDelete(entry.id, entry.label)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${entry.label} address`}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.text.secondary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location-outline" size={28} color={colors.brand.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses yet</Text>
            <Text style={styles.helperText}>Add a home, work, or other delivery location to get started.</Text>
          </View>
        )}

        <Pressable style={styles.addButton} onPress={openAddressForm}>
          <Ionicons name="add-circle-outline" size={21} color={colors.brand.primary} />
          <Text style={styles.addButtonText}>Add a new address</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add delivery address</Text>
              <Pressable onPress={() => setFormVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Label</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="Home, Work, or another label"
                placeholderTextColor={colors.text.tertiary}
                maxLength={40}
              />
              <Text style={styles.fieldLabel}>Street and building</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={(value) => { setAddress(value); setLatitude(null); setLongitude(null); }}
                placeholder="Street address"
                placeholderTextColor={colors.text.tertiary}
                maxLength={300}
              />
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={(value) => { setCity(value); setLatitude(null); setLongitude(null); }}
                placeholder="City"
                placeholderTextColor={colors.text.tertiary}
                maxLength={100}
              />

              <Pressable
                style={styles.locationButton}
                onPress={() => void fillFromCurrentLocation()}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={colors.brand.primary} />
                ) : (
                  <Ionicons name="navigate-outline" size={17} color={colors.brand.primary} />
                )}
                <Text style={styles.locationButtonText}>{isLocating ? "Getting location…" : "Use current location"}</Text>
              </Pressable>
              {latitude !== null && longitude !== null && (
                <Text style={styles.coordinateHint}>Precise location will be saved with this address.</Text>
              )}

              <Pressable style={styles.defaultToggle} onPress={() => setMakeDefault((value) => !value)}>
                <Ionicons
                  name={makeDefault ? "checkbox" : "square-outline"}
                  size={21}
                  color={makeDefault ? colors.brand.primary : colors.text.secondary}
                />
                <Text style={styles.defaultToggleText}>Set as my default address</Text>
              </Pressable>
              <View style={styles.saveButton}>
                <Button
                  label="Save address"
                  onPress={saveAddress}
                  loading={createAddress.isPending}
                  disabled={createAddress.isPending}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.subtle },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  intro: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { ...theme.typography.h1, color: theme.colors.text.primary },
  subtitle: { ...theme.typography.body, color: theme.colors.text.secondary, marginTop: theme.spacing.xs },
  loading: { minHeight: 150, alignItems: "center", justifyContent: "center", gap: theme.spacing.sm },
  helperText: { ...theme.typography.caption, color: theme.colors.text.secondary, textAlign: "center" },
  errorCard: { padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.background.surface },
  errorText: { ...theme.typography.body, color: theme.colors.text.primary, textAlign: "center" },
  addressList: { gap: theme.spacing.sm },
  addressCard: { padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.background.surface, borderWidth: 1, borderColor: theme.colors.border.subtle },
  addressCardSelected: { borderColor: theme.colors.brand.primary },
  addressMain: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm },
  addressIcon: { width: 40, height: 40, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.default, alignItems: "center", justifyContent: "center" },
  addressCopy: { flex: 1 },
  addressTitleRow: { minHeight: 22, flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  addressLabel: { ...theme.typography.bodyMedium, color: theme.colors.text.primary, flexShrink: 1 },
  defaultBadge: { paddingHorizontal: theme.spacing.xs, paddingVertical: 2, borderRadius: theme.radius.full, backgroundColor: theme.colors.chip.deliveryBg },
  defaultBadgeText: { ...theme.typography.tiny, color: theme.colors.chip.deliveryText },
  addressLine: { ...theme.typography.body, color: theme.colors.text.secondary, marginTop: 3 },
  cityLine: { ...theme.typography.caption, color: theme.colors.text.secondary, marginTop: 1 },
  addressActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: theme.spacing.sm, marginTop: theme.spacing.sm, paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle },
  textAction: { minHeight: 32, justifyContent: "center", paddingHorizontal: theme.spacing.xs },
  makeDefaultText: { ...theme.typography.captionMedium, color: theme.colors.brand.primary },
  iconAction: { width: 36, height: 32, alignItems: "center", justifyContent: "center" },
  emptyCard: { alignItems: "center", padding: theme.spacing.xl, borderRadius: theme.radius.lg, backgroundColor: theme.colors.background.surface },
  emptyIcon: { width: 56, height: 56, borderRadius: theme.radius.full, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.default, marginBottom: theme.spacing.sm },
  emptyTitle: { ...theme.typography.h3, color: theme.colors.text.primary, marginBottom: theme.spacing.xs },
  addButton: { minHeight: 52, marginTop: theme.spacing.md, borderRadius: theme.radius.lg, borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.background.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.xs },
  addButtonText: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: theme.colors.overlay },
  modalCard: { maxHeight: "88%", paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, backgroundColor: theme.colors.background.surface },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  modalTitle: { ...theme.typography.h2, color: theme.colors.text.primary },
  fieldLabel: { ...theme.typography.captionMedium, color: theme.colors.text.primary, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs },
  input: { minHeight: 48, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border.default, color: theme.colors.text.primary, backgroundColor: theme.colors.background.subtle, ...theme.typography.body },
  locationButton: { minHeight: 44, marginTop: theme.spacing.md, paddingHorizontal: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.chip.discountBg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.xs },
  locationButtonText: { ...theme.typography.captionMedium, color: theme.colors.brand.primary },
  coordinateHint: { ...theme.typography.tiny, color: theme.colors.text.secondary, marginTop: theme.spacing.xs },
  defaultToggle: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, minHeight: 46, marginTop: theme.spacing.sm },
  defaultToggleText: { ...theme.typography.body, color: theme.colors.text.primary },
  saveButton: { marginTop: theme.spacing.md },
}));
