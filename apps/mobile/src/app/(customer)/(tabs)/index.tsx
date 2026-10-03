import React, { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { HomeHeader } from "../../../components/home/HomeHeader";
import { DealsCarousel } from "../../../components/home/DealsCarousel";
import { WalletCoinsCard } from "../../../components/home/WalletCoinsCard";
import { QuickAccessRow } from "../../../components/home/QuickAccessRow";
import { DailyDishesGrid } from "../../../components/home/DailyDishesGrid";
import {
  MOCK_DEALS,
  MOCK_QUICK_ACCESS,
  MOCK_DISH_CATEGORIES,
} from "../../../components/home/homeMockData";
import { makeStyles, theme } from "../../../theme";

export default function HomeScreen() {
  const styles = useStyles();
  const [search, setSearch] = useState("");

  return (
    <>
      {/* <StatusBar
        backgroundColor={theme.colors.brand.primary}
        barStyle="light-content"
      /> */}
      <HomeHeader
        address="Gunawarman street No. 14"
        searchValue={search}
        onChangeSearch={setSearch}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <DealsCarousel deals={MOCK_DEALS} />
        </View>

        <View style={styles.walletSection}>
          <WalletCoinsCard walletBalance="Rp699.000" coinsBalance="1.200" />
        </View>

        <View style={styles.section}>
          <QuickAccessRow items={MOCK_QUICK_ACCESS} />
        </View>

        <DailyDishesGrid categories={MOCK_DISH_CATEGORIES} />
      </ScrollView>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background.default },
  content: { paddingBottom: theme.spacing.xxxl },
  section: { marginTop: theme.spacing.lg },
  walletSection: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
}));
