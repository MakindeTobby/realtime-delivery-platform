import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { makeStyles, useTheme } from "@/theme";
import { OrderStatus, type OrderStatusValue } from "@/types/order";

const STEPS: {
  status: OrderStatusValue;
  title: string;
  description: string;
}[] = [
  {
    status: OrderStatus.PENDING,
    title: "Order received",
    description: "Waiting for the restaurant to confirm your order.",
  },
  {
    status: OrderStatus.CONFIRMED,
    title: "Order confirmed",
    description: "The restaurant has accepted your order.",
  },
  {
    status: OrderStatus.PREPARING,
    title: "Preparing your food",
    description: "The kitchen is working on it.",
  },
  {
    status: OrderStatus.READY,
    title: "Ready for pickup",
    description: "Waiting for a driver to pick it up.",
  },
  {
    status: OrderStatus.PICKED_UP,
    title: "On the way",
    description: "Your driver has your order.",
  },
  {
    status: OrderStatus.DELIVERED,
    title: "Delivered",
    description: "Enjoy your meal!",
  },
];

type Props = { currentStatus: OrderStatusValue };

export function OrderStatusTimeline({ currentStatus }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const state: "done" | "active" | "upcoming" =
          index < currentIndex
            ? "done"
            : index === currentIndex
              ? "active"
              : "upcoming";
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.indicatorColumn}>
              <StepDot state={state} />
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    state === "done" && styles.connectorDone,
                  ]}
                />
              )}
            </View>

            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.title,
                  state === "upcoming" && styles.titleUpcoming,
                ]}
              >
                {step.title}
              </Text>
              {state === "active" && (
                <Text style={styles.description}>{step.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StepDot({ state }: { state: "done" | "active" | "upcoming" }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === "active") {
      pulse.value = withRepeat(withTiming(1.5, { duration: 700 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [state, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: state === "active" ? 1 - (pulse.value - 1) : 0,
  }));

  if (state === "done") {
    return (
      <View style={[styles.dot, styles.dotDone]}>
        <Ionicons name="checkmark" size={12} color={colors.brand.onPrimary} />
      </View>
    );
  }

  if (state === "active") {
    return (
      <View style={styles.dotActiveWrap}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>
    );
  }

  return <View style={[styles.dot, styles.dotUpcoming]} />;
}

const useStyles = makeStyles((theme) => ({
  container: { paddingHorizontal: theme.spacing.md },
  row: { flexDirection: "row" },
  indicatorColumn: { alignItems: "center", width: 28 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: theme.colors.brand.primary },
  dotActive: { backgroundColor: theme.colors.brand.primary },
  dotActiveWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
  },
  pulseRing: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
  },
  dotUpcoming: {
    backgroundColor: theme.colors.background.surface,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 32,
    backgroundColor: theme.colors.border.default,
    marginVertical: 2,
  },
  connectorDone: { backgroundColor: theme.colors.brand.primary },
  textColumn: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.sm,
  },
  title: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  titleUpcoming: { color: theme.colors.text.tertiary },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
}));
