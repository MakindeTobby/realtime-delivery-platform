import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUserQuery } from "@/hooks/auth/useAuth";
import { getAccessToken } from "@/lib/auth-session";

export function AdminAreaGuard() {
  const location = useLocation();
  const hasToken = Boolean(getAccessToken());
  const userQuery = useCurrentUserQuery(hasToken);

  if (!hasToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (userQuery.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f7f5]"><Card className="rounded-2xl"><CardContent className="p-8 text-sm text-muted-foreground">Checking administrator access…</CardContent></Card></main>;
  }
  if (userQuery.isError || !userQuery.data) return <Navigate to="/login" replace />;
  if (!userQuery.data.roles.includes("ADMIN")) return <Navigate to="/403" replace />;

  return <Outlet />;
}
