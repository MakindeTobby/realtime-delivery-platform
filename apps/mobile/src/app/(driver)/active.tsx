import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
} from "react-native";

type DeliveryStage =
  | "HEADING_TO_PICKUP"
  | "AT_RESTAURANT"
  | "HEADING_TO_DROPOFF"
  | "DELIVERED";

type ActiveDelivery = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: string;
  payout: string;
  stage: DeliveryStage;
};

// Mock data — swap for a real active-delivery hook when it's ready
const ACTIVE_DELIVERY: ActiveDelivery | null = {
  id: "1",
  restaurantName: "Mama's Kitchen",
  restaurantAddress: "12 Adeola Odeku St, Victoria Island",
  customerName: "Ada L.",
  customerAddress: "45 Admiralty Way, Lekki Phase 1",
  customerPhone: "+2348012345678",
  items: "2x Jollof Rice, 1x Suya",
  payout: "$6.50",
  stage: "HEADING_TO_PICKUP",
};

const STAGE_ORDER: DeliveryStage[] = [
  "HEADING_TO_PICKUP",
  "AT_RESTAURANT",
  "HEADING_TO_DROPOFF",
  "DELIVERED",
];

const STAGE_LABELS: Record<DeliveryStage, string> = {
  HEADING_TO_PICKUP: "Heading to restaurant",
  AT_RESTAURANT: "At restaurant",
  HEADING_TO_DROPOFF: "Heading to customer",
  DELIVERED: "Delivered",
};

const STAGE_ACTION_LABELS: Record<DeliveryStage, string> = {
  HEADING_TO_PICKUP: "I've arrived at restaurant",
  AT_RESTAURANT: "I've picked up the order",
  HEADING_TO_DROPOFF: "I've delivered the order",
  DELIVERED: "Delivered",
};

export default function ActiveScreen() {
  const [delivery, setDelivery] = useState<ActiveDelivery | null>(
    ACTIVE_DELIVERY,
  );

  function advanceStage() {
    if (!delivery) return;
    const currentIndex = STAGE_ORDER.indexOf(delivery.stage);
    const nextStage = STAGE_ORDER[currentIndex + 1];
    if (!nextStage) return;

    if (nextStage === "DELIVERED") {
      setDelivery(null); // delivery complete, clear active state
    } else {
      setDelivery({ ...delivery, stage: nextStage });
    }
  }

  if (!delivery) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>No active delivery</Text>
        <Text style={styles.emptySubtitle}>
          Go online from Home to start receiving requests
        </Text>
      </View>
    );
  }

  const stageIndex = STAGE_ORDER.indexOf(delivery.stage);
  const destination =
    delivery.stage === "HEADING_TO_PICKUP" || delivery.stage === "AT_RESTAURANT"
      ? {
          label: "Pickup",
          name: delivery.restaurantName,
          address: delivery.restaurantAddress,
        }
      : {
          label: "Dropoff",
          name: delivery.customerName,
          address: delivery.customerAddress,
        };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapText}>Live map view</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>{STAGE_LABELS[delivery.stage]}</Text>
        <View style={styles.progressTrack}>
          {STAGE_ORDER.slice(0, 3).map((stage, index) => (
            <View
              key={stage}
              style={[
                styles.progressSegment,
                index <= stageIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.destinationCard}>
        <View style={styles.destinationBadge}>
          <Text style={styles.destinationBadgeText}>{destination.label}</Text>
        </View>
        <Text style={styles.destinationName}>{destination.name}</Text>
        <Text style={styles.destinationAddress}>{destination.address}</Text>

        <View style={styles.destinationActions}>
          <Pressable style={styles.navigateButton}>
            <Text style={styles.navigateButtonText}>🧭 Navigate</Text>
          </Pressable>
          <Pressable
            style={styles.callButton}
            onPress={() => Linking.openURL(`tel:${delivery.customerPhone}`)}
          >
            <Text style={styles.callButtonText}>📞</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.orderCard}>
        <Text style={styles.orderCardTitle}>Order details</Text>
        <Text style={styles.orderItems}>{delivery.items}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderFooterLabel}>Your payout</Text>
          <Text style={styles.orderFooterValue}>{delivery.payout}</Text>
        </View>
      </View>

      <Pressable style={styles.advanceButton} onPress={advanceStage}>
        <Text style={styles.advanceButtonText}>
          {STAGE_ACTION_LABELS[delivery.stage]}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "#F0E5F5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mapEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  mapText: {
    fontSize: 13,
    color: "#8E4FC7",
    fontWeight: "600",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D2C4E",
    marginBottom: 12,
  },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0E5F5",
  },
  progressSegmentActive: {
    backgroundColor: "#B57EDC",
  },
  destinationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    marginBottom: 16,
    gap: 6,
  },
  destinationBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F6EBFB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  destinationBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  destinationAddress: {
    fontSize: 13,
    color: "#8E8299",
  },
  destinationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: "#F5EEFA",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  navigateButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  callButton: {
    width: 44,
    backgroundColor: "#F5EEFA",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    marginBottom: 20,
    gap: 8,
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  orderItems: {
    fontSize: 13,
    color: "#8E8299",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5EEFA",
  },
  orderFooterLabel: {
    fontSize: 13,
    color: "#8E8299",
  },
  orderFooterValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E9A54",
  },
  advanceButton: {
    backgroundColor: "#B57EDC",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#B57EDC",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  advanceButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D2C4E",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#8E8299",
    textAlign: "center",
  },
});
