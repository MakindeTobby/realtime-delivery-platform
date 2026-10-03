import React from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { MOCK_CHAT_THREADS } from "@/components/chat/chatMockData";
import { ChatThreadRow } from "@/components/chat/ChatThreadRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ChatScreen() {
  const styles = useStyles();
  const threads = MOCK_CHAT_THREADS;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      {threads.length === 0 ? (
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="No conversations yet"
          subtitle="Once you place an order, you'll be able to message the restaurant or your driver here."
          actionLabel="Browse restaurants"
          onPressAction={() => router.push("/")}
        />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // /chat/[threadId] doesn't exist yet — this is a stub
            // destination until a real message-thread screen is built.
            <ChatThreadRow
              thread={item}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.sm,
  },
  title: { ...theme.typography.display, color: theme.colors.text.primary },
  listContent: { paddingBottom: theme.spacing.xxxl },
}));
