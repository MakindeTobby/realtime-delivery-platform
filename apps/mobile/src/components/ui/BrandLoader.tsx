import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { makeStyles, useTheme } from "@/theme";

type LoaderSize = "small" | "medium" | "large";

type Props = {
  size?: LoaderSize;
  label?: string;
};

const DIMENSIONS: Record<LoaderSize, { diameter: number; dot: number; radius: number }> = {
  small: { diameter: 28, dot: 4, radius: 10 },
  medium: { diameter: 44, dot: 6, radius: 17 },
  large: { diameter: 56, dot: 7, radius: 22 },
};

const TRAIL_OPACITY = [1, 0.88, 0.76, 0.64, 0.52, 0.4, 0.3, 0.22];

export function BrandLoader({ size = "medium", label }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const dimensions = DIMENSIONS[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1300, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? "Loading"}
    >
      <Animated.View
        style={[
          styles.orbit,
          { width: dimensions.diameter, height: dimensions.diameter },
          spinStyle,
        ]}
      >
        {TRAIL_OPACITY.map((opacity, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              left: (dimensions.diameter - dimensions.dot) / 2 +
                Math.sin((index * Math.PI) / 4) * dimensions.radius,
              top: (dimensions.diameter - dimensions.dot) / 2 -
                Math.cos((index * Math.PI) / 4) * dimensions.radius,
              width: dimensions.dot,
              height: dimensions.dot,
              borderRadius: dimensions.dot / 2,
              backgroundColor: colors.brand.primary,
              opacity,
            }}
          />
        ))}
      </Animated.View>
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { alignItems: "center", justifyContent: "center", gap: theme.spacing.sm },
  orbit: { alignItems: "center", justifyContent: "center" },
  label: { ...theme.typography.caption, color: theme.colors.text.secondary, textAlign: "center" },
}));
