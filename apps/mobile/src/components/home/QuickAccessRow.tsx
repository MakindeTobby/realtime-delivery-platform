import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../theme";
import { router } from "expo-router";

export type QuickAccessItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress?: () => void;
};

type Props = { items: QuickAccessItem[] };

export function QuickAccessRow({ items }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/(customer)/near-me`)}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={22} color={colors.text.inverse} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.md },
  item: { alignItems: "center", width: 64 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xxs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
}));
