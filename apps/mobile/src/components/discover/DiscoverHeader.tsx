import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  searchValue: string;
  onChangeSearch: (value: string) => void;
  onPressFilters: () => void;
  filtersActive: boolean;
  onSubmitSearch: () => void;
};

export function DiscoverHeader({
  searchValue,
  onChangeSearch,
  onPressFilters,
  filtersActive,
  onSubmitSearch,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
      <Text style={styles.title}>What are you</Text>
      <Text style={styles.title}><Text style={styles.accent}>craving</Text> today?</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={19} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Search for food or restaurants"
          placeholderTextColor={colors.text.secondary}
          returnKeyType="search"
          onSubmitEditing={onSubmitSearch}
          accessibilityLabel="Search for food or restaurants"
        />
        {searchValue.length > 0 && (
          <Pressable onPress={() => onChangeSearch("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
          </Pressable>
        )}
        <View style={styles.divider} />
        <Pressable
          onPress={onPressFilters}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toggle cuisine filters"
          accessibilityState={{ selected: filtersActive }}
        >
          <Ionicons name="options-outline" size={19} color={filtersActive ? colors.brand.primary : colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text.primary,
    fontSize: 29,
    lineHeight: 35,
  },
  accent: { color: theme.colors.brand.primary },
  searchBar: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderColor: theme.colors.border.default,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    height: 52,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  divider: { width: 1, height: 21, backgroundColor: theme.colors.border.subtle },
}));
