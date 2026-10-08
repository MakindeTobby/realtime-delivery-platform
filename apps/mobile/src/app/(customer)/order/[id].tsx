import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { useOrderTracking } from "@/hooks/use-order-tracking";
import { OrderStatus } from "@/types/order";
import { OrderProcessingState } from "@/components/order/OrderProcessingState";
import { OrderSuccessBanner } from "@/components/order/OrderSuccessBanner";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { DriverCard } from "@/components/order/DriverCard";
import { DriverAssignedModal } from "@/components/order/DriverAssignedModal";
import { OrderCancelledState } from "@/components/order/OrderCancelledState";
import { PickupOrderTracking } from "@/components/order/PickupOrderTracking";

export default function OrderTrackingScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    id: string;
    restaurantName?: string;
    totalPayment?: string;
  }>();
  const orderId = params.id ?? "";

  const { order, status, driver, etaMinutes, isConnecting, connectionError, refetch } =
    useOrderTracking(orderId);

  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const hasShownSuccessRef = useRef(false);
  const prevStatusRef = useRef(status);

  // Fire the success banner exactly once, the first time we leave PENDING.
  useEffect(() => {
    if (
      !hasShownSuccessRef.current &&
      !isConnecting &&
      status !== OrderStatus.PENDING
    ) {
      hasShownSuccessRef.current = true;
      setShowSuccessBanner(true);
    }
  }, [status, isConnecting]);

  // Open the driver modal exactly on the PENDING/etc -> PICKED_UP transition,
  // not on every render while status === PICKED_UP.
  useEffect(() => {
    if (
      prevStatusRef.current !== OrderStatus.PICKED_UP &&
      status === OrderStatus.PICKED_UP
    ) {
      setDriverModalVisible(true);
    }
    prevStatusRef.current = status;
  }, [status]);

  if (isConnecting) {
    return (
      <View style={styles.screen}>
        <OrderProcessingState />
      </View>
    );
  }

  if (connectionError) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorState}>
          <Text style={styles.headerTitle}>{connectionError}</Text>
          <Pressable onPress={() => void refetch()}><Text style={styles.retry}>Try again</Text></Pressable>
        </View>
      </View>
    );
  }

  if (status === OrderStatus.CANCELLED) {
    return (
      <View style={styles.screen}>
        <OrderCancelledState />
      </View>
    );
  }

  if (status === OrderStatus.PICKED_UP && order) {
    return (
      <PickupOrderTracking
        order={order}
        restaurantName={params.restaurantName ?? order.restaurant?.name}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/")}
          style={styles.backButton}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.brand.primary}
          />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Track order</Text>
          {!!params.restaurantName && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {params.restaurantName}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OrderStatusTimeline currentStatus={status} />

        {driver && (
          <View style={styles.driverWrap}>
            <Text style={styles.sectionLabel}>Your driver</Text>
            <DriverCard driver={driver} />
          </View>
        )}

        {!!params.totalPayment && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Order #{orderId.slice(-6)}</Text>
            <Text style={styles.summaryValue}>
              ₦{Number(params.totalPayment).toLocaleString("en-NG")}
            </Text>
          </View>
        )}
      </ScrollView>

      {showSuccessBanner && (
        <OrderSuccessBanner
          etaMinutes={etaMinutes ?? 25}
          onDismiss={() => setShowSuccessBanner(false)}
        />
      )}

      <DriverAssignedModal
        visible={driverModalVisible}
        driver={driver}
        onDismiss={() => setDriverModalVisible(false)}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: { marginLeft: theme.spacing.xs },
  headerTitle: { ...theme.typography.h2, color: theme.colors.text.primary },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  content: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxxl },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.xl, gap: theme.spacing.md },
  retry: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  sectionLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  driverWrap: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.md,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
}));
