import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { AxiosError } from "axios";
import { AuthApi, type VerificationDeliveryStatus } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { makeStyles } from "@/theme";
import { useAuthStore } from "@/store/auth";

function deliveryMessage(status: VerificationDeliveryStatus | null) {
  switch (status) {
    case "sent":
      return "We sent a six-digit code to your email. The code expires in 10 minutes.";
    case "development":
      return "Email delivery is not configured. In development, check the API server log for the code.";
    case "cooldown":
      return "A code was sent recently. Check your inbox or wait a minute before requesting another.";
    case "already-verified":
      return "This email is already verified. Continue to your Swiftbite workspace.";
    case "unavailable":
      return "We could not deliver a code right now. Check your email service or try again later.";
    default:
      return "Enter the code we sent to your email. If you cannot find it, request another code.";
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

export default function VerifyEmailScreen() {
  const styles = useStyles();
  const user = useAuthStore((state) => state.user);
  const verificationDelivery = useAuthStore((state) => state.verificationDelivery);
  const setVerificationDelivery = useAuthStore((state) => state.setVerificationDelivery);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function verify() {
    if (!user?.email) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setError(undefined);
    setIsVerifying(true);
    try {
      await AuthApi.verifyEmail(user.email, code);
      setUser(await AuthApi.getCurrentUser());
      setVerificationDelivery(null);
      router.replace("/");
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't verify that code. Check it and try again."));
    } finally {
      setIsVerifying(false);
    }
  }

  async function resend() {
    if (!user?.email) return;
    setError(undefined);
    setIsResending(true);
    try {
      const result = await AuthApi.resendVerification(user.email);
      setVerificationDelivery(result.status);
    } catch (cause) {
      setError(getErrorMessage(cause, "We couldn't request another code. Please try again."));
    } finally {
      setIsResending(false);
    }
  }

  function signOut() {
    Alert.alert("Sign out", "You can sign back in after verifying your email.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthApi.logout();
          } finally {
            await clearAuth();
            router.replace("/login");
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.icon}><Text style={styles.iconText}>✉</Text></View>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          Confirm your email address to keep your Swiftbite account secure.
        </Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>{deliveryMessage(verificationDelivery)}</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Six-digit verification code"
            icon="keypad-outline"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            editable={!isVerifying && !isResending}
            placeholder="000000"
          />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Button label="Verify email" onPress={() => void verify()} loading={isVerifying} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void resend()}
          disabled={isVerifying || isResending}
          style={styles.resend}
        >
          <Text style={styles.resendText}>{isResending ? "Requesting code…" : "Resend code"}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.default,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.background.surface,
    gap: theme.spacing.md,
  },
  icon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.subtle,
    alignSelf: "center",
  },
  iconText: { fontSize: 28, color: theme.colors.brand.primary },
  title: { ...theme.typography.display, color: theme.colors.text.primary, textAlign: "center" },
  description: { ...theme.typography.body, color: theme.colors.text.secondary, textAlign: "center" },
  email: { ...theme.typography.bodyMedium, color: theme.colors.text.primary, textAlign: "center" },
  notice: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.subtle },
  noticeText: { ...theme.typography.caption, color: theme.colors.text.secondary, textAlign: "center" },
  form: { gap: theme.spacing.md, marginTop: theme.spacing.xs },
  error: { ...theme.typography.caption, color: "#C1493D" },
  resend: { alignSelf: "center", padding: theme.spacing.sm },
  resendText: { ...theme.typography.bodyMedium, color: theme.colors.brand.primary },
  signOut: { alignSelf: "center", padding: theme.spacing.sm },
  signOutText: { ...theme.typography.caption, color: theme.colors.text.secondary },
}));
