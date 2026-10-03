import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../theme";

type Props = {
  walletBalance: string;
  coinsBalance: string;
  onPressWallet?: () => void;
  onPressCoins?: () => void;
};

export function WalletCoinsCard({
  walletBalance,
  coinsBalance,
  onPressWallet,
  onPressCoins,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPressWallet}
        style={styles.item}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.chip.deliveryBg },
          ]}
        >
          <MaterialCommunityIcons
            name="wallet-outline"
            size={20}
            color={colors.brand.primary}
          />
        </View>
        <View>
          <Text style={styles.label}>Your Wallet</Text>
          <Text style={styles.value}>{walletBalance}</Text>
        </View>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={onPressCoins}
        style={styles.item}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.chip.deliveryBg },
          ]}
        >
          <MaterialCommunityIcons
            name="circle-multiple-outline"
            size={20}
            color={colors.icon.popular}
          />
        </View>
        <View>
          <Text style={styles.label}>Your Coins</Text>
          <Text style={styles.value}>{coinsBalance}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...theme.typography.caption, color: theme.colors.text.secondary },
  value: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border.default,
    marginHorizontal: theme.spacing.sm,
  },
}));
