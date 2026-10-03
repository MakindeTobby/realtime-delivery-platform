import { PlatformPressable } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import { GestureResponderEvent } from "react-native";
import type { BottomTabBarButtonProps } from "expo-router/js-tabs";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
