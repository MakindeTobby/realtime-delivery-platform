import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/auth";

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Customer",
  RESTAURANT_OWNER: "Restaurant Owner",
  DRIVER: "Driver",
};

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
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
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "—";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
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
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{roleLabel}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#C1493D" />
        ) : (
          <Text style={styles.logoutButtonText}>Log out</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#B57EDC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#B57EDC",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: "#F6EBFB",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E4FC7",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: "#8E8299",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5EEFA",
  },
  logoutButton: {
    backgroundColor: "#FDEDEA",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F6D5CE",
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    color: "#C1493D",
    fontSize: 15,
    fontWeight: "700",
  },
});
