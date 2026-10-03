import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { makeStyles } from "@/theme";

export type MenuCategory = { id: string; label: string };

type Props = {
  categories: MenuCategory[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryTabsBar({ categories, activeId, onSelect }: Props) {
  const styles = useStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const active = category.id === activeId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {category.label}
            </Text>
            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.lg,
    alignItems: "center",
  },
  label: { ...theme.typography.bodyMedium, color: theme.colors.text.secondary },
  labelActive: {
    color: theme.colors.brand.primary,
    fontFamily: theme.fontFamily.bold,
  },
  indicator: {
    marginTop: 6,
    height: 2,
    width: "100%",
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.radius.xs,
  },
}));
