import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "@/theme";
import { Button } from "./Button";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={colors.brand.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {!!actionLabel && (
        <View style={styles.buttonWrap}>
          <Button label={actionLabel} onPress={onPressAction ?? (() => {})} />
        </View>
      )}
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
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.chip.deliveryBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  buttonWrap: { width: "100%" },
}));
