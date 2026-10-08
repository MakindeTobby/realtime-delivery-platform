import { Stack } from "expo-router";

export default function OwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" />
      <Stack.Screen name="near-me" />
      <Stack.Screen name="profile/addresses" />
    </Stack>
  );
}
