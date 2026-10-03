import React from "react";
import { Pressable, Text, View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import type { ChatThread } from "./chatMockData";

type Props = {
  thread: ChatThread;
  onPress: () => void;
};

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ChatThreadRow({ thread, onPress }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const hasUnread = thread.unreadCount > 0;

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.avatar, { backgroundColor: thread.avatarColor }]}>
        <Text style={styles.avatarText}>{thread.name[0]?.toUpperCase()}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {thread.name}
          </Text>
          <Text style={styles.time}>
            {formatRelativeTime(thread.timestamp)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {thread.lastMessage}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{thread.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.roleBadge}>{thread.role}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...theme.typography.h3, color: theme.colors.text.inverse },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  time: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: theme.spacing.xs,
  },
  lastMessage: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  lastMessageUnread: {
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { ...theme.typography.tiny, color: theme.colors.brand.onPrimary },
  roleBadge: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
}));
