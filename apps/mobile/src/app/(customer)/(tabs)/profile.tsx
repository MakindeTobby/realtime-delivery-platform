import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { makeStyles, useTheme } from "@/theme";
import { useAuthStore } from "@/store/auth";

type MenuLink = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: string;
};

const MENU_LINKS: MenuLink[] = [
  {
    id: "1",
    label: "Saved addresses",
    icon: "location-outline",
    route: "/profile/addresses",
  },
  {
    id: "2",
    label: "Payment methods",
    icon: "card-outline",
    route: "/profile/payments",
  },
  {
    id: "3",
    label: "Favorites",
    icon: "heart-outline",
    route: "/profile/favorites",
  },
  {
    id: "4",
    label: "Help & support",
    icon: "help-circle-outline",
    route: "/profile/support",
  },
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);

          try {
            await clearAuth();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }

  const initials = user?.firstName?.[0]?.toUpperCase() ?? "?";
  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Unknown user";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.email}>{user?.email ?? "—"}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{fullName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email ?? "—"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account type</Text>
          <Text style={styles.infoValue}>Customer</Text>
        </View>
      </View>

      <View style={styles.linksCard}>
        {MENU_LINKS.map((link, index) => (
          <View key={link.id}>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push(link.route)}
              accessibilityRole="button"
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconCircle}>
                  <Ionicons
                    name={link.icon}
                    size={18}
                    color={colors.brand.primary}
                  />
                </View>
                <Text style={styles.linkLabel}>{link.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.text.tertiary}
              />
            </Pressable>
            {index < MENU_LINKS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
        disabled={isLoggingOut}
        accessibilityRole="button"
      >
        {isLoggingOut ? (
          <ActivityIndicator color={colors.brand.primary} />
        ) : (
          <Text style={styles.logoutButtonText}>Log out</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background.subtle },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
  },
  header: { alignItems: "center", marginBottom: theme.spacing.xl },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    ...theme.shadows.fab,
  },
  avatarText: { ...theme.typography.display, color: theme.colors.text.inverse },
  name: { ...theme.typography.h1, color: theme.colors.text.primary },
  email: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm + 2,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle },
  linksCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm + 2,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  linkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.default,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
  },
  // No "soft danger" token exists in the system yet, so this reaches into
  // the raw palette (red50/red100) rather than the semantic brand colors —
  // worth promoting to a real `colors.danger` token if more destructive
  // actions show up elsewhere (delete account, remove address, etc).
  logoutButton: {
    backgroundColor: theme.palette.red50,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.palette.red100,
  },
  logoutButtonPressed: { opacity: 0.8 },
  logoutButtonText: {
    ...theme.typography.h3,
    color: theme.colors.brand.primary,
  },
}));
