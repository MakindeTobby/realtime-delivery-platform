import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import {
  FILTER_CHIPS,
  MOCK_RESTAURANTS,
} from "@/components/near-me/nearMeMockData";
import { makeStyles } from "@/theme";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FilterChips } from "@/components/near-me/FilterChips";
import { RestaurantCard } from "@/components/near-me/RestaurantCard";

// This is a pushed screen (has a back chevron), not a tab — it lives at
// app/near-me.tsx, outside the (tabs) group. Make sure the enclosing root
// Stack sets headerShown: false for this route, e.g.:
//   <Stack.Screen name="near-me" options={{ headerShown: false }} />

export default function NearMeScreen() {
  const styles = useStyles();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Near Me" />

      <FlatList
        data={MOCK_RESTAURANTS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.introBlock}>
              <Text style={styles.heading}>Dishes near me</Text>
              <Text style={styles.subheading}>
                Catch delicious eats near you
              </Text>
            </View>
            <FilterChips
              chips={FILTER_CHIPS}
              selectedId={selectedFilter}
              onSelect={setSelectedFilter}
            />
            <View style={styles.listSpacer} />
          </View>
        }
        renderItem={({ item }) => (
          // /restaurant/[id] doesn't exist yet — build that route before
          // wiring this up, or swap the destination.
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  introBlock: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  heading: { ...theme.typography.display, color: theme.colors.text.primary },
  subheading: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  listSpacer: { height: theme.spacing.xs },
  listContent: { paddingBottom: theme.spacing.xxxl },
}));
