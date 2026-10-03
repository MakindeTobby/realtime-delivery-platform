import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Image,
} from "react-native";
import { router } from "expo-router";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  emoji: string;
};

// Mock data — swap for your real menu-fetching hook when it's ready
const MOCK_MENU: MenuItem[] = [
  {
    id: "1",
    name: "Jollof Rice",
    description: "Smoky rice with grilled chicken",
    price: "$9.50",
    category: "Mains",
    available: true,
    emoji: "🍛",
  },
  {
    id: "2",
    name: "Suya Skewers",
    description: "Spiced grilled beef skewers",
    price: "$6.00",
    category: "Mains",
    available: true,
    emoji: "🍢",
  },
  {
    id: "3",
    name: "Shawarma Wrap",
    description: "Chicken, garlic sauce, pickles",
    price: "$8.00",
    category: "Mains",
    available: false,
    emoji: "🌯",
  },
  {
    id: "4",
    name: "Puff Puff",
    description: "Sweet fried dough bites (6pcs)",
    price: "$4.00",
    category: "Snacks",
    available: true,
    emoji: "🍩",
  },
  {
    id: "5",
    name: "Zobo",
    description: "Chilled hibiscus drink",
    price: "$3.50",
    category: "Drinks",
    available: true,
    emoji: "🥤",
  },
];

export default function MenuScreen() {
  const [menu, setMenu] = useState<MenuItem[]>(MOCK_MENU);

  function toggleAvailability(id: string) {
    setMenu((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  }

  const categories = Array.from(new Set(menu.map((item) => item.category)));
  const availableCount = menu.filter((i) => i.available).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Menu</Text>
          <Text style={styles.subtitle}>
            {availableCount} of {menu.length} items available
          </Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/menu/new")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {categories.map((category) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>

          <View style={styles.itemsList}>
            {menu
              .filter((item) => item.category === category)
              .map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.itemCard,
                    !item.available && styles.itemCardDisabled,
                  ]}
                  onPress={() => router.push(`/menu/${item.id}`)}
                >
                  <View style={styles.itemEmojiWrap}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        !item.available && styles.itemNameDisabled,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.itemDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                  </View>

                  <Switch
                    value={item.available}
                    onValueChange={() => toggleAvailability(item.id)}
                    trackColor={{ false: "#EBE4F0", true: "#D9BFF0" }}
                    thumbColor={item.available ? "#B57EDC" : "#FFFFFF"}
                  />
                </Pressable>
              ))}
          </View>
        </View>
      ))}

      {menu.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyText}>No menu items yet</Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/menu/new")}
          >
            <Text style={styles.emptyButtonText}>Add your first item</Text>
          </Pressable>
        </View>
      )}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D2C4E",
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8299",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#B57EDC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  categorySection: {
    marginBottom: 22,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E4FC7",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0E5F5",
    gap: 12,
  },
  itemCardDisabled: {
    opacity: 0.55,
  },
  itemEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FBF3FE",
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D2C4E",
  },
  itemNameDisabled: {
    color: "#B0A9C9",
  },
  itemDescription: {
    fontSize: 12,
    color: "#8E8299",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E4FC7",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8299",
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#B57EDC",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
