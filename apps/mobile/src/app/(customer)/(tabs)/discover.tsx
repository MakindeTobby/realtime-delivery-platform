import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import { makeStyles } from "@/theme";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { FilterChips, type FilterChip } from "@/components/near-me/FilterChips";
import { RestaurantCard } from "@/components/near-me/RestaurantCard";
import { MOCK_RESTAURANTS } from "@/components/near-me/nearMeMockData";

const SORT_CHIPS: FilterChip[] = [
  { id: "all", label: "All" },
  { id: "top-rated", label: "Top rated" },
  { id: "nearby", label: "Nearby" },
  { id: "open-now", label: "Open now" },
];

export default function DiscoverScreen() {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [sortId, setSortId] = useState("all");

  const restaurants = useMemo(() => {
    let list = MOCK_RESTAURANTS;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(query));
    }

    if (sortId === "top-rated") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortId === "nearby") {
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortId === "open-now") {
      list = list.filter((r) => r.isOpenNow);
    }

    return list;
  }, [search, sortId]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <DiscoverHeader searchValue={search} onChangeSearch={setSearch} />
            <View style={styles.chipsWrap}>
              <FilterChips
                chips={SORT_CHIPS}
                selectedId={sortId}
                onSelect={setSortId}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.surface },
  chipsWrap: { paddingVertical: theme.spacing.sm },
  listContent: { paddingBottom: theme.spacing.xxxl },
}));
