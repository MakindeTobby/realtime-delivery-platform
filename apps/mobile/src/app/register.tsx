import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { makeStyles, useTheme } from "@/theme";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type FieldName = keyof RegisterForm;

export default function RegisterScreen() {
  const { register } = useAuth();
  const styles = useStyles();
  const { colors, gradients } = useTheme();

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: FieldName, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await register(form);
    } catch (error) {
      Alert.alert(
        "Registration failed",
        "Please check your details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}
          >
            <Ionicons name="person-add" size={32} color={colors.text.inverse} />
          </LinearGradient>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Create a customer account to order from local restaurants
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <TextField
                label="First name"
                icon="person-outline"
                placeholder="Ada"
                value={form.firstName}
                onChangeText={(v) => updateField("firstName", v)}
                editable={!isLoading}
              />
            </View>
            <View style={styles.flex1}>
              <TextField
                label="Last name"
                icon="person-outline"
                placeholder="Lovelace"
                value={form.lastName}
                onChangeText={(v) => updateField("lastName", v)}
                editable={!isLoading}
              />
            </View>
          </View>

          <TextField
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <TextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => updateField("password", v)}
            secureTextEntry
            editable={!isLoading}
          />

          <Button
            label="Create account"
            onPress={handleRegister}
            loading={isLoading}
          />

          <Pressable
            style={styles.loginRow}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background.default },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  logoWrap: { alignItems: "center", marginBottom: theme.spacing.xxl },
  badge: {
    width: 80,
    height: 80,
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
    textAlign: "center",
  },
  form: { gap: theme.spacing.md },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  flex1: { flex: 1 },
  loginRow: { alignItems: "center", marginTop: theme.spacing.xxs },
  loginText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  loginLink: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
  },
}));
