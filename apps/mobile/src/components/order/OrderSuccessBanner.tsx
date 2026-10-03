import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  etaMinutes: number;
  onDismiss: () => void;
  durationMs?: number;
};

export function OrderSuccessBanner({
  etaMinutes,
  onDismiss,
  durationMs = 2200,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={36} color={colors.brand.onPrimary} />
      </View>
      <Text style={styles.title}>Order successful</Text>
      <Text style={styles.subtitle}>
        Cool down, your food will arrive in {etaMinutes} minutes.
      </Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.shadows.modal,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: theme.colors.background.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.fab,
  },
  title: { ...theme.typography.display, color: theme.colors.text.primary },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
}));
