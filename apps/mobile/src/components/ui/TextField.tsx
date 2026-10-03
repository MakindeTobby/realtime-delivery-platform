import React, { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

type Props = Omit<TextInputProps, "style" | "placeholderTextColor"> & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

/**
 * Handles its own focus ring and, when secureTextEntry is set, its own
 * show/hide password toggle — screens just render it and read value/
 * onChangeText, same as a plain TextInput.
 */
export function TextField({
  label,
  icon,
  secureTextEntry,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused]}>
        <Ionicons name={icon} size={18} color={colors.text.secondary} />
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isPassword && !revealed}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {isPassword && (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.text.secondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  group: { gap: theme.spacing.xxs },
  label: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing.md,
  },
  rowFocused: { borderColor: theme.colors.brand.primary },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    ...theme.typography.bodyLg,
    color: theme.colors.text.primary,
  },
}));
