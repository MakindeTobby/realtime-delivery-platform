import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";

export function OrderProcessingState() {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="bag-handle" size={34} color={colors.brand.onPrimary} />
      </View>
      <Text style={styles.title}>Order process..</Text>
      <Text style={styles.subtitle}>
        Wait a moment, Your order is being processed!
      </Text>
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
