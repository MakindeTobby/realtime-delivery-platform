import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { UserRole } from "@food-delivery/types";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { StatusBar } from "react-native";
import { View } from "react-native";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { theme } from "@/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const [fontLoaded, fontLoadError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  useEffect(() => {
    if ((fontLoaded || fontLoadError) && !isHydrating) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontLoadError, isHydrating]);
  useEffect(() => {
    const hydrateSession = () => {
      void useAuthStore.getState().finishHydration();
    };

    if (useAuthStore.persist.hasHydrated()) {
      hydrateSession();
      return;
    }

    return useAuthStore.persist.onFinishHydration(hydrateSession);
  }, []);

  if (isHydrating || (!fontLoaded && !fontLoadError)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.surface }}>
        <BrandLoader label="Loading SwiftBite…" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="health" />

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected guard={!!user && !user.emailVerified}>
        <Stack.Screen name="verify-email" />
      </Stack.Protected>

      <Stack.Protected guard={!!user && user.emailVerified}>
        <Stack.Screen name="choose-role" />
        <Stack.Screen name="unsupported-role" />
      </Stack.Protected>

      <Stack.Protected
        guard={
          !!user &&
          user.emailVerified &&
          user.roles?.includes(UserRole.CUSTOMER)
        }
      >
        <Stack.Screen name="(customer)" />
      </Stack.Protected>

      <Stack.Protected
        guard={
          !!user &&
          user.emailVerified &&
          user.roles?.includes(UserRole.RESTAURANT_OWNER)
        }
      >
        <Stack.Screen name="(owner)" />
      </Stack.Protected>

      <Stack.Protected
        guard={
          !!user && user.emailVerified && user.roles?.includes(UserRole.DRIVER)
        }
      >
        <Stack.Screen name="(driver)" />
      </Stack.Protected>
    </Stack>
  );
}
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      >
        <AnimatedSplashOverlay />

        <RootNavigator />
      </StripeProvider>
    </QueryClientProvider>
  );
}
