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
import { router } from "expo-router";
import { useAuth } from "@/context/auth-context";

type MenuLink = {
  id: string;
  label: string;
  emoji: string;
  route: string;
};

const MENU_LINKS: MenuLink[] = [
  {
    id: "1",
    label: "Earnings & payouts",
    emoji: "💰",
    route: "/profile/earnings",
  },
  { id: "2", label: "Vehicle details", emoji: "🛵", route: "/profile/vehicle" },
  { id: "3", label: "Documents", emoji: "📄", route: "/profile/documents" },
  { id: "4", label: "Help & support", emoji: "💬", route: "/profile/support" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeText}>⭐ 4.9 Driver Rating</Text>
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
          <Text style={styles.infoLabel}>Account type</Text>
          <Text style={styles.infoValue}>Driver</Text>
        </View>
      </View>

      <View style={styles.linksCard}>
        {MENU_LINKS.map((link, index) => (
          <View key={link.id}>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push(link.route)}
            >
              <View style={styles.linkLeft}>
                <Text style={styles.linkEmoji}>{link.emoji}</Text>
                <Text style={styles.linkLabel}>{link.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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
  ratingBadge: {
    marginTop: 8,
    backgroundColor: "#F6EBFB",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingBadgeText: {
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
    marginBottom: 16,
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
  linksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkEmoji: {
    fontSize: 16,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  chevron: {
    fontSize: 18,
    color: "#B0A9C9",
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
