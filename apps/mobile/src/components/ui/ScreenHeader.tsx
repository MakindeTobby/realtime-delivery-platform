import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "../../theme";

type Props = {
  title: string;
  onBack?: () => void;
};

/**
 * Custom header for any screen pushed on top of the tabs (Near Me,
 * restaurant details, filters, etc). Requires headerShown: false for
 * this route in the enclosing Stack, since it replaces the default one.
 */
export function ScreenHeader({ title, onBack }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        style={styles.backButton}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={colors.brand.primary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginRight: 36, // balances the back button so the title is truly centered
  },
}));
