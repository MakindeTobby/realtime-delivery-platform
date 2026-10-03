import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  SectionList,
} from "react-native";
import { router } from "expo-router";

type PastDelivery = {
  id: string;
  restaurantName: string;
  customerAddress: string;
  payout: string;
  date: string; // ISO-ish grouping key, e.g. "Today", "Yesterday", "Mon, Sep 14"
  time: string;
  rating: number;
};

// Mock data — swap for a real delivery-history hook when it's ready
const PAST_DELIVERIES: PastDelivery[] = [
  {
    id: "1",
    restaurantName: "Grill House",
    customerAddress: "Lekki Phase 1",
    payout: "$5.20",
    date: "Today",
    time: "1:02 PM",
    rating: 5,
  },
  {
    id: "2",
    restaurantName: "Mama's Kitchen",
    customerAddress: "Victoria Island",
    payout: "$6.50",
    date: "Today",
    time: "11:20 AM",
    rating: 5,
  },
  {
    id: "3",
    restaurantName: "Sweet Spot",
    customerAddress: "Ikoyi",
    payout: "$4.10",
    date: "Yesterday",
    time: "6:45 PM",
    rating: 4,
  },
  {
    id: "4",
    restaurantName: "Shawarma King",
    customerAddress: "Ajah",
    payout: "$7.00",
    date: "Yesterday",
    time: "2:15 PM",
    rating: 5,
  },
  {
    id: "5",
    restaurantName: "Zobo Corner",
    customerAddress: "Yaba",
    payout: "$3.80",
    date: "Mon, Sep 14",
    time: "5:30 PM",
    rating: 5,
  },
];

export default function HistoryScreen() {
  const sections = useMemo(() => {
    const groups: Record<string, PastDelivery[]> = {};
    PAST_DELIVERIES.forEach((d) => {
      if (!groups[d.date]) groups[d.date] = [];
      groups[d.date].push(d);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, []);

  const totalEarnings = PAST_DELIVERIES.reduce(
    (sum, d) => sum + parseFloat(d.payout.replace("$", "")),
    0,
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Delivery History</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {PAST_DELIVERIES.length}
                </Text>
                <Text style={styles.summaryLabel}>Deliveries</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  ${totalEarnings.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Earned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>4.9</Text>
                <Text style={styles.summaryLabel}>Avg Rating</Text>
              </View>
            </View>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={styles.deliveryCard}
            onPress={() => router.push(`/history/${item.id}`)}
          >
            <View style={styles.deliveryLeft}>
              <Text style={styles.deliveryRestaurant}>
                {item.restaurantName}
              </Text>
              <Text style={styles.deliveryAddress}>{item.customerAddress}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.deliveryTime}>{item.time}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.deliveryRating}>⭐ {item.rating}</Text>
              </View>
            </View>
            <Text style={styles.deliveryPayout}>{item.payout}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No deliveries yet</Text>
          </View>
        }
      />
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E5F5",
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#8E8299",
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8299",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  deliveryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    marginBottom: 10,
  },
  deliveryLeft: {
    flex: 1,
    gap: 2,
  },
  deliveryRestaurant: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  deliveryAddress: {
    fontSize: 12,
    color: "#8E8299",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  deliveryTime: {
    fontSize: 11,
    color: "#B0A9C9",
  },
  dot: {
    fontSize: 11,
    color: "#B0A9C9",
  },
  deliveryRating: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  deliveryPayout: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E9A54",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8299",
  },
});
