import React from "react";
import { Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  searchValue: string;
  onChangeSearch: (value: string) => void;
};

export function DiscoverHeader({ searchValue, onChangeSearch }: Props) {
  const styles = useStyles();
  const { gradients, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Find top-rated places near you</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Search restaurants or cuisines"
          placeholderTextColor={colors.text.secondary}
          returnKeyType="search"
        />
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  title: { ...theme.typography.display, color: theme.colors.text.inverse },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginTop: 2,
  },
  searchBar: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    height: 48,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
}));
