import { Pressable, ScrollView, Text, View } from "react-native";
import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { UserRole, type UserRole as UserRoleType } from "@food-delivery/types";
import { AuthApi } from "@/api/auth";
import { makeStyles, useTheme } from "@/theme";
import { useAuthStore } from "@/store/auth";

const ROLE_OPTIONS: {
  role: UserRoleType;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}[] = [
  {
    role: UserRole.CUSTOMER,
    title: "Order food",
    description: "Discover restaurants and follow your orders.",
    icon: "fast-food-outline",
  },
  {
    role: UserRole.RESTAURANT_OWNER,
    title: "Manage a restaurant",
    description: "Manage your restaurant, menu, and incoming orders.",
    icon: "storefront-outline",
  },
  {
    role: UserRole.DRIVER,
    title: "Deliver with Swiftbite",
    description: "Open your driver workspace and delivery tools.",
    icon: "bicycle-outline",
  },
];

const ROLE_ROUTES: Partial<Record<UserRoleType, "/(customer)/(tabs)" | "/(owner)/(tabs)" | "/(driver)">> = {
  [UserRole.CUSTOMER]: "/(customer)/(tabs)",
  [UserRole.RESTAURANT_OWNER]: "/(owner)/(tabs)",
  [UserRole.DRIVER]: "/(driver)",
};

export default function ChooseRoleScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const roles = user?.roles ?? [];
  const options = ROLE_OPTIONS.filter((option) => roles.includes(option.role));

  async function signOut() {
    try {
      await AuthApi.logout();
    } finally {
      await clearAuth();
      router.replace("/login");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-circle-outline" size={30} color={colors.brand.primary} />
        </View>
        <Text style={styles.eyebrow}>Welcome to Swiftbite</Text>
        <Text style={styles.title}>Where would you like to go?</Text>
        <Text style={styles.subtitle}>
          Your account has more than one workspace. Choose one to continue.
        </Text>
      </View>

      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.role}
            accessibilityRole="button"
            accessibilityState={{ selected: activeRole === option.role }}
            onPress={() => {
              setActiveRole(option.role);
              const route = ROLE_ROUTES[option.role];
              if (route) router.replace(route);
            }}
            style={({ pressed }) => [
              styles.option,
              activeRole === option.role && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon} size={24} color={colors.brand.primary} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  header: { alignItems: "center", marginBottom: theme.spacing.xxl },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.subtle,
    marginBottom: theme.spacing.md,
  },
  eyebrow: {
    ...theme.typography.captionMedium,
    color: theme.colors.brand.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  options: { gap: theme.spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  optionSelected: { borderColor: theme.colors.brand.primary },
  optionPressed: { opacity: 0.8 },
  optionIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.subtle,
  },
  optionCopy: { flex: 1 },
  optionTitle: { ...theme.typography.bodyMedium, color: theme.colors.text.primary },
  optionDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  signOut: { alignSelf: "center", padding: theme.spacing.lg, marginTop: theme.spacing.md },
  signOutText: { ...theme.typography.bodyMedium, color: theme.colors.text.secondary },
}));
