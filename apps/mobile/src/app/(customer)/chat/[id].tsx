import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";
import { MOCK_CHAT_THREADS } from "@/components/chat/chatMockData";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: number;
};

const now = Date.now();

// Keyed by thread id so each conversation reads naturally; falls back to a
// generic exchange for any thread id not in this mock set.
const MOCK_MESSAGES_BY_THREAD: Record<string, Message[]> = {
  "thread-bottega": [
    {
      id: "m1",
      sender: "them",
      text: "Hi! Thanks for your order 😊",
      timestamp: now - 1000 * 60 * 20,
    },
    {
      id: "m2",
      sender: "them",
      text: "We've started preparing your Bottega's Fried Rice.",
      timestamp: now - 1000 * 60 * 18,
    },
    {
      id: "m3",
      sender: "me",
      text: "Great, how long will it take?",
      timestamp: now - 1000 * 60 * 16,
    },
    {
      id: "m4",
      sender: "them",
      text: "About 15 minutes — we'll let you know when it's ready.",
      timestamp: now - 1000 * 60 * 15,
    },
    {
      id: "m5",
      sender: "them",
      text: "Your order is being prepared now!",
      timestamp: now - 1000 * 60 * 12,
    },
  ],
  "thread-driver": [
    {
      id: "m1",
      sender: "them",
      text: "Hey, I've picked up your order.",
      timestamp: now - 1000 * 60 * 6,
    },
    {
      id: "m2",
      sender: "me",
      text: "Awesome, thank you!",
      timestamp: now - 1000 * 60 * 5,
    },
    {
      id: "m3",
      sender: "them",
      text: "I'm on my way, about 10 minutes out.",
      timestamp: now - 1000 * 60 * 2,
    },
  ],
};

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "them",
    text: "Hi there! How can I help you with your order?",
    timestamp: now - 1000 * 60 * 5,
  },
];

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThreadScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  const thread = MOCK_CHAT_THREADS.find((t) => t.id === threadId);
  const [messages, setMessages] = useState<Message[]>(
    () => MOCK_MESSAGES_BY_THREAD[threadId ?? ""] ?? DEFAULT_MESSAGES,
  );
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // No animation needed — this only has to land at the bottom, not look nice getting there.
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, sender: "me", text, timestamp: Date.now() },
    ]);
    setInputText("");
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <View style={[styles.header]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.brand.primary}
          />
        </Pressable>

        <View
          style={[
            styles.avatar,
            { backgroundColor: thread?.avatarColor ?? colors.brand.primary },
          ]}
        >
          <Text style={styles.avatarText}>
            {(thread?.name ?? "?")[0]?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerName} numberOfLines={1}>
            {thread?.name ?? "Conversation"}
          </Text>
          {!!thread?.role && (
            <Text style={styles.headerRole}>{thread.role}</Text>
          )}
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
        style={styles.screen}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const isMe = message.sender === "me";
            return (
              <View
                key={message.id}
                style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}
              >
                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={[styles.bubbleText, isMe && styles.bubbleTextMe]}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message"
            placeholderTextColor={colors.text.tertiary}
            multiline
          />
          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={colors.brand.onPrimary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.inverse,
  },
  headerTextBlock: { flex: 1 },
  headerName: { ...theme.typography.h3, color: theme.colors.text.primary },
  headerRole: { ...theme.typography.tiny, color: theme.colors.text.secondary },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    justifyContent: "flex-end",
  },
  bubbleRow: {
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
    maxWidth: "80%",
  },
  bubbleRowMe: { alignItems: "flex-end", alignSelf: "flex-end" },
  bubble: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  bubbleThem: {
    backgroundColor: theme.colors.background.default,
    borderBottomLeftRadius: theme.radius.xs,
  },
  bubbleMe: {
    backgroundColor: theme.colors.brand.primary,
    borderBottomRightRadius: theme.radius.xs,
  },
  bubbleText: { ...theme.typography.body, color: theme.colors.text.primary },
  bubbleTextMe: { color: theme.colors.brand.onPrimary },
  timestamp: {
    ...theme.typography.tiny,
    color: theme.colors.text.tertiary,
    marginTop: 2,
    marginLeft: theme.spacing.xs,
  },
  timestampMe: { marginLeft: 0, marginRight: theme.spacing.xs },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.surface,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.4 },
}));
