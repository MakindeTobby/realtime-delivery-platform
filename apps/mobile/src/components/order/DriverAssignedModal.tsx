import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { makeStyles } from "@/theme";
import { DriverCard } from "./DriverCard";
import { Button } from "@/components/ui/Button";
import type { Driver } from "@/types/order";

type Props = {
  visible: boolean;
  driver: Driver | null;
  onDismiss: () => void;
};

export function DriverAssignedModal({ visible, driver, onDismiss }: Props) {
  const styles = useStyles();

  if (!driver) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Your driver is on the way</Text>
        <Text style={styles.subtitle}>
          {driver.name} has picked up your order and is heading your way.
        </Text>

        <View style={styles.cardWrap}>
          <DriverCard driver={driver} />
        </View>

        <Button label="Got it" onPress={onDismiss} />
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((theme) => ({
  backdrop: { flex: 1, backgroundColor: theme.colors.overlay },
  sheet: {
    backgroundColor: theme.colors.background.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: { ...theme.typography.h1, color: theme.colors.text.primary },
  subtitle: { ...theme.typography.body, color: theme.colors.text.secondary },
  cardWrap: { marginVertical: theme.spacing.sm },
}));
