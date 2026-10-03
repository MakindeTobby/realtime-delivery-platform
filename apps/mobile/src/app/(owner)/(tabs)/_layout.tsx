import { theme } from "@/theme";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function OwnerLayout() {
  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      backgroundColor={theme.colors.background.surface}
      tintColor={theme.colors.nav.active}
      indicatorColor={theme.colors.border.subtle}
      iconColor={{
        default: theme.colors.nav.inactive,
        selected: theme.colors.nav.active,
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="shippingbox.fill" md="local_shipping" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="menu">
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="menucard.fill" md="restaurant_menu" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analytics">
        <NativeTabs.Trigger.Label>Analytics</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.xaxis" md="bar_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
