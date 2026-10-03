import React from "react";
import { Pressable, Text, View } from "react-native";
import { makeStyles } from "../../theme";

export type DishCategory = {
  id: string;
  title: string;
  restaurantCount: number;
  color: string;
  onPress?: () => void;
};

type Props = {
  categories: DishCategory[];
  onPressSeeAll?: () => void;
};

export function DailyDishesGrid({ categories, onPressSeeAll }: Props) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Daily Dishes</Text>
        <Pressable
          onPress={onPressSeeAll}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={category.onPress}
            style={[styles.card, { backgroundColor: category.color }]}
            accessibilityRole="button"
            accessibilityLabel={category.title}
          >
            <Text style={styles.cardTitle}>{category.title}</Text>
            <Text style={styles.cardSubtitle}>
              {category.restaurantCount} Restaurant Already
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  heading: { ...theme.typography.h2, color: theme.colors.text.primary },
  seeAll: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  card: {
    width: "47%",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    minHeight: 84,
    justifyContent: "flex-end",
  },
  cardTitle: { ...theme.typography.h3, color: theme.colors.text.inverse },
  cardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginTop: 4,
  },
}));
