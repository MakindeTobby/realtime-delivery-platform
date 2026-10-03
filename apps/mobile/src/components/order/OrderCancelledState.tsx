import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { makeStyles, useTheme } from "@/theme";
import { Button } from "@/components/ui/Button";

export function OrderCancelledState() {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="close" size={34} color={colors.brand.onPrimary} />
      </View>
      <Text style={styles.title}>Order cancelled</Text>
      <Text style={styles.subtitle}>
        This order was cancelled. If you were charged, your refund will be
        processed automatically.
      </Text>
      <View style={styles.buttonWrap}>
        {/* No support/contact screen exists yet. */}
        <Button label="Back to home" onPress={() => router.replace("/")} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.text.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  title: { ...theme.typography.display, color: theme.colors.text.primary },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  buttonWrap: { width: "100%" },
}));
