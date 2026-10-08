import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUserQuery } from "@/hooks/auth/useAuth";
import { getAccessToken } from "@/lib/auth-session";

export function RestaurantAreaGuard() {
  const location = useLocation();
  const hasToken = Boolean(getAccessToken());
  const userQuery = useCurrentUserQuery(hasToken);

  if (!hasToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (userQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Card><CardContent className="p-8">Checking your account…</CardContent></Card>
      </main>
    );
  }
  if (userQuery.isError || !userQuery.data) return <Navigate to="/login" replace />;
  if (!userQuery.data.emailVerified) return <Navigate to="/partner/restaurants" replace />;
  if (!userQuery.data.roles.includes("RESTAURANT_OWNER")) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
