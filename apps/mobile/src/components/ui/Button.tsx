import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, loading, disabled }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isDisabled = !!disabled || !!loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={colors.brand.onPrimary} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.card,
  },
  buttonPressed: {
    backgroundColor: theme.colors.brand.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: { opacity: 0.7 },
  label: { ...theme.typography.h3, color: theme.colors.brand.onPrimary },
}));
