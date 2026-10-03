import { Redirect } from "expo-router";
import { UserRole } from "@food-delivery/types";
import { useAuthStore } from "@/store/auth";

export default function Index() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role === UserRole.CUSTOMER) {
    return <Redirect href="/(customer)/(tabs)" />;
  }

  if (user.role === UserRole.RESTAURANT_OWNER) {
    return <Redirect href="/(owner)/(tabs)" />;
  }

  if (user.role === UserRole.DRIVER) {
    return <Redirect href="/(driver)" />;
  }

  return <Redirect href="/login" />;
}
