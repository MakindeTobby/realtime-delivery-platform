import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { makeStyles, theme } from "@/theme";
import { useCartStore } from "@/store/cart";
import { CartHeader } from "@/components/cart/CartHeader";
import { DeliveryLocationCard } from "@/components/cart/DeliveryLocationCard";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { PaymentSummaryCard } from "@/components/cart/PaymentSummaryCard";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { Button } from "@/components/ui/Button";
import { useCustomerRestaurantQuery } from "@/hooks/use-customer-home";
import { useCreateOrderMutation } from "@/hooks/use-orders";
import { useCreateAddressMutation } from "@/hooks/use-addresses";

export default function CartScreen() {
  const styles = useStyles();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const restaurantId = useCartStore((s) => s.restaurantId);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryCity = useCartStore((s) => s.deliveryCity);
  const deliveryAddressId = useCartStore((s) => s.deliveryAddressId);
  const deliveryLatitude = useCartStore((s) => s.deliveryLatitude);
  const deliveryLongitude = useCartStore((s) => s.deliveryLongitude);
  const setDeliveryAddressId = useCartStore((s) => s.setDeliveryAddressId);
  const clearCart = useCartStore((s) => s.clearCart);
  const restaurantQuery = useCustomerRestaurantQuery(restaurantId ?? "");
  const createOrder = useCreateOrderMutation();
  const createAddress = useCreateAddressMutation();
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const restaurantName = restaurantQuery.data?.restaurant.name ?? "Restaurant";

  async function handlePlaceOrder() {
    if (isPreparingOrder || createOrder.isPending) return;
    if (!restaurantId || items.length === 0) {
      Alert.alert("Your cart is empty", "Add a menu item before placing an order.");
      return;
    }
    if (!deliveryAddress.trim() || !deliveryCity.trim()) {
      Alert.alert("Delivery details required", "Enter your delivery address and city to continue.");
      return;
    }

    setIsPreparingOrder(true);
    try {
      let addressId = deliveryAddressId;
      if (!addressId && deliveryLatitude !== null && deliveryLongitude !== null) {
        const savedAddress = await createAddress.mutateAsync({
          label: "Delivery",
          address: deliveryAddress.trim(),
          city: deliveryCity.trim(),
          latitude: deliveryLatitude,
          longitude: deliveryLongitude,
        });
        addressId = savedAddress.id;
        setDeliveryAddressId(addressId);
      }

      const itemsForOrder = items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));
      const payload = addressId
        ? { restaurantId, addressId, items: itemsForOrder }
        : {
            restaurantId,
            deliveryAddress: deliveryAddress.trim(),
            deliveryCity: deliveryCity.trim(),
            items: itemsForOrder,
          };
      const order = await createOrder.mutateAsync(payload);

      clearCart();
      router.replace({
        pathname: "/order/[id]",
        params: {
          id: order.id,
          restaurantName,
          totalPayment: order.totalAmount,
        },
      });
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join("\n")
        : responseMessage ?? "We couldn’t place your order. Check your connection and try again.";
      Alert.alert("Order wasn’t placed", message);
    } finally {
      setIsPreparingOrder(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <CartHeader />
        <EmptyCartState />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CartHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <DeliveryLocationCard
          onPressChangeLocation={() =>
            router.push({ pathname: "/profile/addresses", params: { mode: "select" } })
          }
        />
        {items.map((item) => <CartItemRow key={item.id} item={item} />)}
        <View style={styles.pricingNote}>
          <Text style={styles.pricingNoteText}>Delivery fee and payment collection are not configured yet. The restaurant will receive the menu subtotal.</Text>
        </View>
        <PaymentSummaryCard subtotal={totalPrice} />
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label="Place order"
          onPress={handlePlaceOrder}
          loading={isPreparingOrder || createOrder.isPending}
          disabled={isPreparingOrder || createOrder.isPending}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  content: { paddingBottom: theme.spacing.xl },
  pricingNote: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
  pricingNoteText: { ...theme.typography.caption, color: theme.colors.text.secondary },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.surface,
  },
}));
