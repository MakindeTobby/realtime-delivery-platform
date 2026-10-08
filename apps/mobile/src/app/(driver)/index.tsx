import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
} from "react-native";

type DeliveryRequest = {
  id: string;
  restaurantName: string;
  pickupDistance: string;
  dropoffDistance: string;
  payout: string;
  items: string;
};

// Mock data — swap for a real requests hook when it's ready
const AVAILABLE_REQUESTS: DeliveryRequest[] = [
  {
    id: "1",
    restaurantName: "Mama's Kitchen",
    pickupDistance: "0.8 km",
    dropoffDistance: "3.2 km",
    payout: "$6.50",
    items: "3 items",
  },
  {
    id: "2",
    restaurantName: "Grill House",
    pickupDistance: "1.4 km",
    dropoffDistance: "2.1 km",
    payout: "$5.20",
    items: "1 item",
  },
];

export default function DriverHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [isOnline, setIsOnline] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.firstName ?? "there"} 👋</Text>
        <Text style={styles.subGreeting}>
          {isOnline ? "You're online and ready" : "You're currently offline"}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusLeft}>
          <View
            style={[styles.statusDot, isOnline && styles.statusDotOnline]}
          />
          <View>
            <Text style={styles.statusTitle}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isOnline
                ? "Accepting delivery requests"
                : "Go online to start earning"}
            </Text>
          </View>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          trackColor={{ false: "#EBE4F0", true: "#D9BFF0" }}
          thumbColor={isOnline ? "#B57EDC" : "#FFFFFF"}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Deliveries Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$32.40</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {isOnline ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available requests</Text>
          </View>

          <View style={styles.requestsList}>
            {AVAILABLE_REQUESTS.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Text style={styles.requestRestaurant}>
                    {req.restaurantName}
                  </Text>
                  <Text style={styles.requestPayout}>{req.payout}</Text>
                </View>

                <View style={styles.requestMeta}>
                  <Text style={styles.requestMetaText}>📦 {req.items}</Text>
                </View>

                <View style={styles.routeRow}>
                  <View style={styles.routeItem}>
                    <View style={styles.routeDotPickup} />
                    <Text style={styles.routeText}>
                      Pickup • {req.pickupDistance}
                    </Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routeItem}>
                    <View style={styles.routeDotDropoff} />
                    <Text style={styles.routeText}>
                      Dropoff • {req.dropoffDistance}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Pressable style={styles.declineButton}>
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </Pressable>
                  <Pressable style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {AVAILABLE_REQUESTS.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔎</Text>
                <Text style={styles.emptyText}>
                  Looking for requests nearby...
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.offlineState}>
          <Text style={styles.offlineEmoji}>😴</Text>
          <Text style={styles.offlineText}>
            Go online to see delivery requests
          </Text>
        </View>
      )}
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
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  subGreeting: {
    fontSize: 14,
    color: "#8E8299",
    marginTop: 2,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    marginBottom: 20,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D9D2E0",
  },
  statusDotOnline: {
    backgroundColor: "#2E9A54",
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  statusSubtitle: {
    fontSize: 12,
    color: "#8E8299",
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E5F5",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8299",
    marginTop: 4,
    textAlign: "center",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    gap: 10,
  },
  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestRestaurant: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  requestPayout: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E9A54",
  },
  requestMeta: {
    flexDirection: "row",
  },
  requestMetaText: {
    fontSize: 12,
    color: "#8E8299",
  },
  routeRow: {
    gap: 4,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeDotPickup: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B57EDC",
  },
  routeDotDropoff: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A63C7",
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: "#E5D9EF",
    marginLeft: 3.5,
  },
  routeText: {
    fontSize: 12,
    color: "#5C4B6B",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5EEFA",
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8299",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#B57EDC",
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#8E8299",
  },
  offlineState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  offlineEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  offlineText: {
    fontSize: 14,
    color: "#8E8299",
  },
});
