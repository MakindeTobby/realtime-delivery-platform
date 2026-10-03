import { Stack } from "expo-router";

export default function OwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-restaurant" />
      <Stack.Screen name="edit-restaurant" />
    </Stack>
  );
}
