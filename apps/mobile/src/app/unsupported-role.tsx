import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { AuthApi } from "@/api/auth";
import { makeStyles } from "@/theme";
import { useAuthStore } from "@/store/auth";

export default function UnsupportedRoleScreen() {
  const styles = useStyles();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await AuthApi.logout();
    } finally {
      await clearAuth();
      router.replace("/login");
      setIsSigningOut(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.icon}><Text style={styles.iconText}>!</Text></View>
      <Text style={styles.title}>No mobile workspace found</Text>
      <Text style={styles.description}>
        We signed you in, but this account does not have a customer, restaurant, or driver workspace in the app. Sign out and try another account, or contact support if you think this is a mistake.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        disabled={isSigningOut}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        {isSigningOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign out</Text>}
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background.default,
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: "#FDEDEA",
  },
  iconText: { fontSize: 30, fontWeight: "800", color: theme.colors.brand.primary },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginTop: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  button: {
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    marginTop: theme.spacing.xl,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { ...theme.typography.bodyMedium, color: theme.colors.text.inverse },
}));
