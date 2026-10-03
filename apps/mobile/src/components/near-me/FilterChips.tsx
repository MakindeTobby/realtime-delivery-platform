import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../theme";

export type FilterChip = {
  id: string;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
};

type Props = {
  chips: FilterChip[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function FilterChips({ chips, selectedId, onSelect }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const active = chip.id === selectedId;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect?.(chip.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            {chip.icon && (
              <Ionicons
                name={chip.icon}
                size={14}
                color={active ? colors.text.inverse : colors.text.secondary}
                style={styles.chipIcon}
              />
            )}
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.xs },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  chipActive: {
    backgroundColor: theme.colors.text.primary,
    borderColor: theme.colors.text.primary,
  },
  chipIcon: { marginRight: 4 },
  chipLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  chipLabelActive: { color: theme.colors.text.inverse },
}));
