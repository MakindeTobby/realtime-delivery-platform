import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";
import type { ApiOrder } from "@/api/orders";

type Props = {
  order: ApiOrder;
  restaurantName?: string;
};

/** Pickup/in-transit order view. Location art stays neutral until the API
 * supplies live driver coordinates; labels and order details use API data. */
export function PickupOrderTracking({ order, restaurantName }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const itemCount = order.items.reduce((count, item) => count + item.quantity, 0);
  const total = Number(order.totalAmount);
  const updatedAt = new Date(order.updatedAt);
  const updatedLabel = Number.isNaN(updatedAt.getTime())
    ? ""
    : updatedAt.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

  return (
    <View style={styles.screen}>
      <View style={styles.mapPanel}>
        <MapArtwork />
        <View style={[styles.mapHeader, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.mapTitlePill}>
            <Text style={styles.mapTitle}>Track order</Text>
          </View>
          <View style={styles.iconButtonSpacer} />
        </View>

        <View style={styles.locationNotice}>
          <Ionicons name="navigate-circle" size={17} color={colors.brand.primary} />
          <Text style={styles.locationNoticeText}>Rider location updates will appear here</Text>
        </View>

        <View style={styles.destinationPin}>
          <Ionicons
            name="location"
            size={22}
            color={colors.brand.onPrimary}
            style={styles.pinGlyph}
          />
        </View>
        <View style={styles.mapAttribution}>
          <Text style={styles.attributionText}>Map preview</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusBanner}>
            <View style={styles.statusIcon}>
              <Ionicons name="bicycle" size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>Your order is on the way</Text>
              <Text style={styles.statusSubtitle}>The rider has picked it up from the restaurant</Text>
            </View>
            <View style={styles.liveDot} />
          </View>

          <View style={styles.riderCard}>
            <View style={styles.riderAvatar}>
              <Ionicons name="person" size={20} color={colors.text.secondary} />
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>Your rider</Text>
              <Text style={styles.riderMeta}>{order.driverId ? "Assigned to your order" : "Waiting for rider assignment"}</Text>
            </View>
            <View style={styles.riderBadge}>
              <Text style={styles.riderBadgeText}>On the way</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Delivery progress</Text>
            {updatedLabel ? <Text style={styles.updatedText}>Updated {updatedLabel}</Text> : null}
          </View>

          <View style={styles.progressCard}>
            <ProgressRow
              icon="restaurant"
              title={restaurantName || "Restaurant"}
              subtitle="Order picked up"
              complete
              last={false}
            />
            <ProgressRow
              icon="bicycle"
              title="On the way"
              subtitle="Your rider is heading to you"
              active
              last={false}
            />
            <ProgressRow
              icon="home"
              title={order.deliveryAddress}
              subtitle={order.deliveryCity}
              last
            />
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.summaryTop}>
              <Text style={styles.sectionTitle}>Order details</Text>
              <Text style={styles.orderNumber}>#{order.id.slice(-6).toUpperCase()}</Text>
            </View>
            <Text style={styles.itemsText} numberOfLines={2}>
              {order.items.map((item) => `${item.quantity}× ${item.itemName}`).join("  ·  ") || `${itemCount} items`}
            </Text>
            <View style={styles.summaryBottom}>
              <Text style={styles.itemsCount}>{itemCount} {itemCount === 1 ? "item" : "items"}</Text>
              <Text style={styles.total}>₦{Number.isFinite(total) ? total.toLocaleString("en-NG") : order.totalAmount}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.replace("/")}
            style={styles.homeButton}
            accessibilityRole="button"
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
            <Ionicons name="arrow-forward" size={17} color={colors.brand.onPrimary} />
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function ProgressRow({
  icon,
  title,
  subtitle,
  complete = false,
  active = false,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  complete?: boolean;
  active?: boolean;
  last: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressRail}>
        <View style={[styles.progressIcon, (complete || active) && styles.progressIconActive]}>
          <Ionicons name={icon} size={14} color={complete || active ? colors.brand.primary : colors.text.secondary} />
        </View>
        {!last && <View style={[styles.progressLine, complete && styles.progressLineActive]} />}
      </View>
      <View style={styles.progressText}>
        <Text numberOfLines={1} style={[styles.progressTitle, active && styles.progressTitleActive]}>{title}</Text>
        <Text numberOfLines={1} style={styles.progressSubtitle}>{subtitle}</Text>
      </View>
      {active && <View style={styles.currentPill}><Text style={styles.currentPillText}>Now</Text></View>}
    </View>
  );
}

function MapArtwork() {
  const styles = useStyles();
  return (
    <View pointerEvents="none" style={styles.mapArtwork}>
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={[styles.road, styles.roadFour]} />
      <View style={[styles.road, styles.roadFive]} />
      <View style={[styles.road, styles.roadSix]} />
      <View style={styles.parkOne} />
      <View style={styles.parkTwo} />
      <View style={styles.routeLine} />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.default },
  mapPanel: { height: "46%", minHeight: 300, backgroundColor: "#EEF1EA", overflow: "hidden" },
  mapArtwork: { ...({ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as const), backgroundColor: "#EEF1EA" },
  road: { position: "absolute", height: 8, borderRadius: theme.radius.full, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E0E3DA" },
  roadOne: { width: "140%", top: "37%", left: "-16%", transform: [{ rotate: "-17deg" }] },
  roadTwo: { width: "130%", top: "71%", left: "-12%", transform: [{ rotate: "13deg" }] },
  roadThree: { width: "120%", top: "18%", left: "-10%", transform: [{ rotate: "46deg" }] },
  roadFour: { width: "110%", top: "43%", left: "-4%", transform: [{ rotate: "-55deg" }] },
  roadFive: { width: "90%", top: "58%", left: "34%", transform: [{ rotate: "68deg" }] },
  roadSix: { width: "80%", top: "82%", left: "-20%", transform: [{ rotate: "-62deg" }] },
  parkOne: { position: "absolute", width: 112, height: 78, borderRadius: 28, backgroundColor: "#DCE9D4", top: "19%", left: "8%", transform: [{ rotate: "-18deg" }] },
  parkTwo: { position: "absolute", width: 82, height: 58, borderRadius: 24, backgroundColor: "#DFEBD7", top: "57%", right: "9%", transform: [{ rotate: "24deg" }] },
  routeLine: { position: "absolute", width: 3, height: 148, top: "37%", left: "53%", backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.full, transform: [{ rotate: "-24deg" }] },
  mapHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, paddingHorizontal: theme.spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 40, height: 40, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.surface, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  iconButtonSpacer: { width: 40, height: 40 },
  mapTitlePill: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.surface },
  mapTitle: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  locationNotice: { position: "absolute", zIndex: 2, top: "31%", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.surface, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  locationNoticeText: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  destinationPin: { position: "absolute", zIndex: 2, left: "49%", top: "72%", width: 38, height: 38, borderRadius: 19, borderBottomLeftRadius: 4, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.brand.primary, transform: [{ rotate: "-45deg" }] },
  pinGlyph: { transform: [{ rotate: "45deg" }] },
  mapAttribution: { position: "absolute", right: theme.spacing.md, bottom: theme.spacing.md, paddingHorizontal: theme.spacing.xs, paddingVertical: 3, borderRadius: theme.radius.xs, backgroundColor: "rgba(255,255,255,0.84)" },
  attributionText: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  sheet: { flex: 1, marginTop: -20, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, backgroundColor: theme.colors.background.surface, overflow: "hidden" },
  sheetHandle: { alignSelf: "center", width: 36, height: 4, marginTop: 9, marginBottom: 5, borderRadius: theme.radius.full, backgroundColor: theme.colors.border.default },
  sheetContent: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, padding: theme.spacing.sm, borderRadius: theme.radius.lg, backgroundColor: theme.colors.chip.discountBg },
  statusIcon: { width: 40, height: 40, borderRadius: theme.radius.full, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.surface },
  statusCopy: { flex: 1 },
  statusTitle: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  statusSubtitle: { ...theme.typography.tiny, color: theme.colors.text.secondary, marginTop: 2 },
  liveDot: { width: 8, height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.brand.primary },
  riderCard: { flexDirection: "row", alignItems: "center", paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  riderAvatar: { width: 42, height: 42, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.subtle, alignItems: "center", justifyContent: "center" },
  riderInfo: { flex: 1, marginLeft: theme.spacing.sm },
  riderName: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  riderMeta: { ...theme.typography.caption, color: theme.colors.text.secondary, marginTop: 2 },
  riderBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.chip.deliveryBg },
  riderBadgeText: { ...theme.typography.tiny, color: theme.colors.chip.deliveryText },
  sectionHeading: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xs, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  updatedText: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  progressCard: { padding: theme.spacing.sm, borderRadius: theme.radius.lg, backgroundColor: theme.colors.background.subtle },
  progressRow: { minHeight: 54, flexDirection: "row", alignItems: "center" },
  progressRail: { width: 28, alignItems: "center", alignSelf: "stretch" },
  progressIcon: { width: 24, height: 24, borderRadius: theme.radius.full, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.surface },
  progressIconActive: { backgroundColor: theme.colors.chip.deliveryBg },
  progressLine: { position: "absolute", top: 25, bottom: -2, width: 2, backgroundColor: theme.colors.border.default },
  progressLineActive: { backgroundColor: theme.colors.brand.primary },
  progressText: { flex: 1, marginLeft: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  progressTitle: { ...theme.typography.captionMedium, color: theme.colors.text.primary },
  progressTitleActive: { color: theme.colors.brand.primary },
  progressSubtitle: { ...theme.typography.tiny, color: theme.colors.text.secondary, marginTop: 1 },
  currentPill: { paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.radius.full, backgroundColor: theme.colors.brand.primary },
  currentPillText: { ...theme.typography.tiny, color: theme.colors.brand.onPrimary },
  orderSummary: { marginTop: theme.spacing.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.lg },
  summaryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderNumber: { ...theme.typography.captionMedium, color: theme.colors.text.secondary },
  itemsText: { ...theme.typography.caption, color: theme.colors.text.secondary, marginTop: theme.spacing.xs },
  summaryBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle },
  itemsCount: { ...theme.typography.caption, color: theme.colors.text.secondary },
  total: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  homeButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.xs, marginTop: theme.spacing.md, borderRadius: theme.radius.full, backgroundColor: theme.colors.brand.primary },
  homeButtonText: { ...theme.typography.bodyMedium, color: theme.colors.brand.onPrimary },
}));
