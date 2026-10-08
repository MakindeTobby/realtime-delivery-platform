import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AxiosError } from "axios";
import { makeStyles, useTheme } from "@/theme";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { AuthApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth";

export default function LoginScreen() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please fill in your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const session = await AuthApi.login(email, password);
      await setAuth(session);
      router.replace("/");
    } catch (error) {
      const message = error instanceof AxiosError
        ? error.response?.status === 429
          ? "Too many sign-in attempts. Please wait a little and try again."
          : error.response?.status === 401
            ? "Email or password is incorrect."
            : typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : "We couldn't sign you in. Check your connection and try again."
        : "We couldn't sign you in. Please try again.";
      Alert.alert("Login failed", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}
          >
            <Ionicons name="fast-food" size={34} color={colors.text.inverse} />
          </LinearGradient>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Let's get you fed</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <Button label="Log In" onPress={handleLogin} loading={isLoading} />

          <Pressable
            style={styles.registerRow}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerLink}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background.default },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  logoWrap: { alignItems: "center", marginBottom: theme.spacing.xxl },
  badge: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    ...theme.shadows.fab,
  },
  title: { ...theme.typography.display, color: theme.colors.text.primary },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  form: { gap: theme.spacing.md },
  registerRow: { alignItems: "center", marginTop: theme.spacing.xxs },
  registerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  registerLink: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
}));
