import { Redirect } from "expo-router";
import { UserRole, type UserRole as UserRoleType } from "@food-delivery/types";
import { useAuthStore } from "@/store/auth";

const ROLE_ROUTES: Partial<Record<UserRoleType, "/(customer)/(tabs)" | "/(owner)/(tabs)" | "/(driver)">> = {
  [UserRole.CUSTOMER]: "/(customer)/(tabs)",
  [UserRole.RESTAURANT_OWNER]: "/(owner)/(tabs)",
  [UserRole.DRIVER]: "/(driver)",
};

const MOBILE_ROLES: UserRoleType[] = [
  UserRole.CUSTOMER,
  UserRole.RESTAURANT_OWNER,
  UserRole.DRIVER,
];

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  if (!user) return <Redirect href="/login" />;
  if (!user.emailVerified) return <Redirect href="/verify-email" />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const supportedRoles = MOBILE_ROLES.filter((role) => roles.includes(role));

  if (supportedRoles.length === 0) {
    return <Redirect href="/unsupported-role" />;
  }

  if (supportedRoles.length > 1 && !supportedRoles.includes(activeRole as UserRoleType)) {
    return <Redirect href="/choose-role" />;
  }

  const role = supportedRoles.length === 1 ? supportedRoles[0] : activeRole;
  const route = ROLE_ROUTES[role as UserRoleType];

  return route ? <Redirect href={route} /> : <Redirect href="/unsupported-role" />;
}
