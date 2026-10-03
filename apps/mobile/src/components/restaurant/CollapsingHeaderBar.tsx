import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  scrollY: SharedValue<number>;
  title: string;
  subtitle: string;
  collapseDistance?: number;
  onBack: () => void;
  onPressSearch?: () => void;
  onPressFavorite?: () => void;
  isFavorite?: boolean;
};

/**
 * One always-mounted overlay bar, not two separate headers. At scrollY=0
 * its background is transparent (so the hero photo shows through) and only
 * the icon buttons (which carry their own opaque white circle + shadow) are
 * visible, matching the floating-icons-over-photo look. As scrollY passes
 * `collapseDistance`, the background fades to solid white and the title
 * fades in — matching the collapsed-bar look once scrolled past the hero.
 */
export function CollapsingHeaderBar({
  scrollY,
  title,
  subtitle,
  collapseDistance = 180,
  onBack,
  onPressSearch,
  onPressFavorite,
  isFavorite,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const barHeight = insets.top + 56;

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [collapseDistance - 40, collapseDistance],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [collapseDistance - 20, collapseDistance + 10],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View
      style={[styles.container, { height: barHeight, paddingTop: insets.top }]}
    >
      <Animated.View style={[styles.background, backgroundStyle]} />

      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          style={styles.iconButton}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.brand.primary}
          />
        </Pressable>

        <Animated.View style={[styles.titleBlock, titleStyle]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </Animated.View>

        <View style={styles.iconsRow}>
          <Pressable
            onPress={onPressSearch}
            style={styles.iconButton}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Search menu"
          >
            <Ionicons name="search" size={18} color={colors.brand.primary} />
          </Pressable>
          <Pressable
            onPress={onPressFavorite}
            style={styles.iconButton}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={colors.brand.primary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.surface,
    ...theme.shadows.card,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.card,
  },
  titleBlock: { flex: 1, alignItems: "center" },
  title: { ...theme.typography.h3, color: theme.colors.text.primary },
  subtitle: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  iconsRow: { flexDirection: "row", gap: theme.spacing.xs },
}));
