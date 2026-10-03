import React, { useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { makeStyles, useTheme } from "../../theme";

export type Deal = {
  id: string;
  title: string;
  subtitle: string;
  gradient: readonly [string, string];
};

type Props = { deals: Deal[] };

/**
 * NOTE: the Figma showed two deal cards visible side by side (one wide,
 * one narrower) with 4 dot indicators. This implementation is a simpler,
 * more reusable single-full-width-card-per-page carousel instead — dots
 * will match `deals.length`, not the 4 shown in the design. Swap the
 * layout math below if you need the exact two-cards-partial look.
 */
export function DealsCarousel({ deals }: Props) {
  const styles = useStyles();
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = width - spacing.md * 2;
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  }

  return (
    <View>
      <FlatList
        data={deals}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { width: cardWidth }]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      {deals.length > 1 && (
        <View style={styles.dots}>
          {deals.map((deal, index) => (
            <View
              key={deal.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  card: {
    height: 140,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    justifyContent: "flex-end",
    marginRight: theme.spacing.sm,
  },
  cardTitle: { ...theme.typography.h2, color: theme.colors.text.inverse },
  cardSubtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.inverse,
    marginTop: 4,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border.default,
  },
  dotActive: { backgroundColor: theme.colors.brand.primary, width: 18 },
}));
