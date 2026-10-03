import { ScrollView, StyleSheet, Text, View } from "react-native";

type DayStat = {
  label: string;
  value: number;
};

type TopItem = {
  name: string;
  sold: number;
  revenue: string;
};

// Mock data — swap for a real analytics hook when it's ready
const WEEKLY_SALES: DayStat[] = [
  { label: "Mon", value: 32 },
  { label: "Tue", value: 45 },
  { label: "Wed", value: 28 },
  { label: "Thu", value: 60 },
  { label: "Fri", value: 78 },
  { label: "Sat", value: 90 },
  { label: "Sun", value: 54 },
];

const TOP_ITEMS: TopItem[] = [
  { name: "Jollof Rice", sold: 128, revenue: "$1,216.00" },
  { name: "Suya Skewers", sold: 96, revenue: "$576.00" },
  { name: "Shawarma Wrap", sold: 74, revenue: "$592.00" },
];

export default function AnalyticsScreen() {
  const maxValue = Math.max(...WEEKLY_SALES.map((d) => d.value));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Last 7 days</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$3,184</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>387</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$8.23</Text>
          <Text style={styles.statLabel}>Avg Order</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sales this week</Text>
        <View style={styles.chartRow}>
          {WEEKLY_SALES.map((day) => (
            <View key={day.label} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${(day.value / maxValue) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top items</Text>
        <View style={styles.topItemsList}>
          {TOP_ITEMS.map((item, index) => (
            <View key={item.name} style={styles.topItemRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemSold}>{item.sold} sold</Text>
              </View>
              <Text style={styles.topItemRevenue}>{item.revenue}</Text>
            </View>
          ))}
        </View>
      </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8299",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D2C4E",
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    width: 18,
    height: "85%",
    backgroundColor: "#F5EEFA",
    borderRadius: 9,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#B57EDC",
    borderRadius: 9,
  },
  barLabel: {
    fontSize: 11,
    color: "#8E8299",
    marginTop: 8,
  },
  topItemsList: {
    gap: 14,
  },
  topItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F6EBFB",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  topItemSold: {
    fontSize: 12,
    color: "#8E8299",
    marginTop: 1,
  },
  topItemRevenue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E4FC7",
  },
});
