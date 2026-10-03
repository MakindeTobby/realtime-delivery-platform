import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { useCartStore } from "@/store/cart";
import { useOrdersStore } from "@/store/orders";
import { OrderStatus } from "@/types/order";
import { CartHeader } from "@/components/cart/CartHeader";
import { DeliveryLocationCard } from "@/components/cart/DeliveryLocationCard";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { UpsellDishesRow } from "@/components/cart/UpsellDishesRow";
import { PaymentSummaryCard } from "@/components/cart/PaymentSummaryCard";
import { PaymentMethodRow } from "@/components/cart/PaymentMethodRow";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { Button } from "@/components/ui/Button";
import {
  RESTAURANT,
  MENU_SECTIONS,
} from "@/components/restaurant/restaurantMockData";

// Mock, static numbers below (delivery fee discount, wallet balance,
// discount count) stand in for real pricing/wallet logic that doesn't
// exist yet — swap these for real values once checkout has a backend.
const MOCK_ORIGINAL_DELIVERY_FEE = 20000;
const MOCK_FINAL_DELIVERY_FEE = 0; // "Free", per the Figma
const MOCK_DISCOUNTS_APPLIED = 3;
const MOCK_WALLET_LABEL = "My wallet";

const popularDishes =
  MENU_SECTIONS.find((s) => s.id === "popular")?.data.flatMap((entry) =>
    entry.kind === "grid" ? entry.items : [entry.item],
  ) ?? [];

export default function CartScreen() {
  const styles = useStyles();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalOriginalPrice = useCartStore((s) => s.totalOriginalPrice());
  const restaurantId = useCartStore((s) => s.restaurantId);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const [isFavorite, setIsFavorite] = useState(false);

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <CartHeader
          title={RESTAURANT.name}
          subtitle={RESTAURANT.cuisine}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((f) => !f)}
        />
        <EmptyCartState />
      </View>
    );
  }

  const totalPayment = totalPrice + MOCK_FINAL_DELIVERY_FEE;
  const savedAmount =
    totalOriginalPrice -
    totalPrice +
    (MOCK_ORIGINAL_DELIVERY_FEE - MOCK_FINAL_DELIVERY_FEE);

  // No real order-creation API exists yet — this generates a local id,
  // records it in the orders store (so the order tab has something to
  // list), and navigates straight into tracking. Swap for a real
  // "create order" call (and use the id/record it returns) once the
  // backend exists.
  function handlePlaceOrder() {
    const orderId = `order-${Date.now()}`;
    const itemsSummary =
      items.length > 1
        ? `${items[0].name} +${items.length - 1} more`
        : items[0].name;

    addOrder({
      id: orderId,
      restaurantId: restaurantId ?? RESTAURANT.id,
      restaurantName: RESTAURANT.name,
      itemsSummary,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPayment,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
    });

    clearCart();
    router.replace({
      pathname: "/order/[orderId]",
      params: {
        orderId,
        restaurantName: RESTAURANT.name,
        totalPayment: String(totalPayment),
      },
    });
  }

  return (
    <View style={styles.screen}>
      <CartHeader
        title={RESTAURANT.name}
        subtitle={RESTAURANT.cuisine}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((f) => !f)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <DeliveryLocationCard
          distanceKm={RESTAURANT.distanceKm}
          deliveryFeeLabel={RESTAURANT.deliveryFeeLabel}
          deliveryMinutes={RESTAURANT.deliveryMinutes}
        />

        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}

        <UpsellDishesRow
          restaurantId={restaurantId ?? RESTAURANT.id}
          dishes={popularDishes}
          excludeIds={items.map((i) => i.id)}
        />

        <View style={styles.addMoreRow}>
          <Button
            label="Add more"
            onPress={() =>
              router.push(`/restaurant/${restaurantId ?? RESTAURANT.id}`)
            }
          />
        </View>

        <PaymentSummaryCard
          discountsAppliedCount={MOCK_DISCOUNTS_APPLIED}
          originalPrice={totalOriginalPrice}
          finalPrice={totalPrice}
          originalDeliveryFee={MOCK_ORIGINAL_DELIVERY_FEE}
          finalDeliveryFee={MOCK_FINAL_DELIVERY_FEE}
        />

        <PaymentMethodRow
          methodLabel={MOCK_WALLET_LABEL}
          amount={totalPayment}
          savedAmount={savedAmount > 0 ? savedAmount : undefined}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Place order" onPress={handlePlaceOrder} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  content: { paddingBottom: theme.spacing.xl },
  addMoreRow: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.surface,
  },
}));
