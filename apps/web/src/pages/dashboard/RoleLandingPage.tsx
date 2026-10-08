import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getAccessToken } from "@/lib/auth-session";
import { useCurrentUserQuery } from "@/hooks/auth/useAuth";
import { useMyRestaurantsQuery } from "@/hooks/restaurants/useRestaurantDashboard";

export default function RoleLandingPage() {
  const token = Boolean(getAccessToken());
  const userQuery = useCurrentUserQuery(token);
  const user = userQuery.data;
  const isRestaurantOwner = user?.roles.includes("RESTAURANT_OWNER") ?? false;
  const restaurantsQuery = useMyRestaurantsQuery(isRestaurantOwner);

  if (!token || userQuery.isError) return <Navigate to="/login" replace />;
  if (userQuery.isLoading || (isRestaurantOwner && restaurantsQuery.isLoading)) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Card><CardContent className="p-8">Loading your workspace…</CardContent></Card>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.includes("ADMIN")) return <Navigate to="/admin/dashboard" replace />;
  if (!user.emailVerified) return <Navigate to="/partner/restaurants" replace />;

  if (isRestaurantOwner) {
    return restaurantsQuery.data?.length
      ? <Navigate to="/restaurant/dashboard" replace />
      : <Navigate to="/partner/restaurants" replace />;
  }
  if (user.roles.includes("DRIVER")) return <Navigate to="/partner/drivers" replace />;
  if (user.roles.includes("CUSTOMER")) return <Navigate to="/customer" replace />;
  return <Navigate to="/403" replace />;
}
