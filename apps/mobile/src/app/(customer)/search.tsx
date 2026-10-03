import { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta: string;
  emoji: string;
};

// Mock data — swap for a real search/restaurants hook when it's ready
const ALL_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Mama's Kitchen",
    cuisine: "Nigerian • Local",
    rating: 4.8,
    eta: "20-30 min",
    emoji: "🍲",
  },
  {
    id: "2",
    name: "Grill House",
    cuisine: "Suya • Grills",
    rating: 4.6,
    eta: "15-25 min",
    emoji: "🍢",
  },
  {
    id: "3",
    name: "Sweet Spot",
    cuisine: "Desserts • Drinks",
    rating: 4.9,
    eta: "10-20 min",
    emoji: "🍰",
  },
  {
    id: "4",
    name: "Shawarma King",
    cuisine: "Middle Eastern",
    rating: 4.5,
    eta: "18-28 min",
    emoji: "🌯",
  },
  {
    id: "5",
    name: "Zobo Corner",
    cuisine: "Drinks",
    rating: 4.7,
    eta: "10-15 min",
    emoji: "🥤",
  },
];

const RECENT_SEARCHES = ["Jollof rice", "Suya", "Shawarma", "Smoothies"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { q } = useLocalSearchParams<{ q?: string }>();

  useEffect(() => {
    if (typeof q === "string") setQuery(q);
  }, [q]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q),
    );
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, food..."
          placeholderTextColor="#B0A9C9"
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {hasQuery && (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {!hasQuery ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Recent searches</Text>
          <View style={styles.recentList}>
            {RECENT_SEARCHES.map((term) => (
              <Pressable
                key={term}
                style={styles.recentChip}
                onPress={() => setQuery(term)}
              >
                <Text style={styles.recentIcon}>🕘</Text>
                <Text style={styles.recentText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultCard}
              onPress={() => router.push(`/restaurant/${item.id}`)}
            >
              <View style={styles.resultEmojiWrap}>
                <Text style={styles.resultEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCuisine}>{item.cuisine}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}>⭐ {item.rating}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.eta}>{item.eta}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#3D2C4E",
  },
  clearIcon: {
    fontSize: 14,
    color: "#B0A9C9",
    paddingLeft: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8299",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  recentList: {
    gap: 10,
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F0E5F5",
  },
  recentIcon: {
    fontSize: 14,
  },
  recentText: {
    fontSize: 14,
    color: "#3D2C4E",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    gap: 12,
    marginBottom: 12,
  },
  resultEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#FBF3FE",
    alignItems: "center",
    justifyContent: "center",
  },
  resultEmoji: {
    fontSize: 26,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  resultCuisine: {
    fontSize: 12,
    color: "#8E8299",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  dot: {
    fontSize: 12,
    color: "#B0A9C9",
  },
  eta: {
    fontSize: 12,
    color: "#8E8299",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8299",
  },
});
