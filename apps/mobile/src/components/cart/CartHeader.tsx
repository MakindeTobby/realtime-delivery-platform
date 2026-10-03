import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  title: string;
  subtitle: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function CartHeader({
  title,
  subtitle,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.iconButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={20} color={colors.brand.primary} />
      </Pressable>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onToggleFavorite}
        style={styles.iconButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite ? "Remove from favorites" : "Add to favorites"
        }
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={colors.brand.primary}
        />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1, marginLeft: theme.spacing.xs },
  title: { ...theme.typography.h2, color: theme.colors.text.primary },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
}));
