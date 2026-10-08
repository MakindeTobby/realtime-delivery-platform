import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUserQuery, useLogoutMutation } from "@/hooks/auth/useAuth";
import { useMyRestaurantsQuery } from "@/hooks/restaurants/useRestaurantDashboard";
import { getAccessToken } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import type { RestaurantRecord } from "@/api/restaurants.api";
import { RestaurantStatusPanel } from "./RestaurantStatusPanel";

export type RestaurantDashboardContext = {
  restaurant: RestaurantRecord;
  restaurants: RestaurantRecord[];
};

const navigation = [
  { to: "/restaurant/dashboard", label: "Overview", end: true, icon: LayoutDashboard },
  { to: "/restaurant/orders", label: "Orders", icon: ClipboardList },
  { to: "/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/restaurant/profile", label: "Restaurant profile", icon: Store },
];

export function RestaurantDashboardLayout() {
  const userQuery = useCurrentUserQuery(Boolean(getAccessToken()));
  const restaurantsQuery = useMyRestaurantsQuery(Boolean(userQuery.data?.roles.includes("RESTAURANT_OWNER")));
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const restaurants = restaurantsQuery.data ?? [];
  const approvedRestaurants = restaurants.filter((restaurant) => restaurant.verificationStatus === "APPROVED");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!approvedRestaurants.length) return;
    if (!approvedRestaurants.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(approvedRestaurants[0].id);
    }
  }, [approvedRestaurants, selectedId]);

  const signOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (userQuery.isLoading || restaurantsQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] p-4">
        <Card className="rounded-2xl border-black/[0.06] shadow-sm"><CardContent className="p-8 text-sm text-muted-foreground">Loading restaurant workspace…</CardContent></Card>
      </main>
    );
  }

  if (userQuery.isError || restaurantsQuery.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] p-4">
        <Card className="w-full max-w-md rounded-2xl border-black/[0.06] shadow-sm"><CardContent className="space-y-3 p-8">
          <h1 className="text-xl font-semibold tracking-tight">We couldn’t load your workspace</h1>
          <p className="text-sm text-muted-foreground">Refresh the page or sign in again.</p>
          <Button onClick={() => navigate("/login", { replace: true })}>Sign in again</Button>
        </CardContent></Card>
      </main>
    );
  }

  if (!restaurants.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] p-4">
        <Card className="w-full max-w-md rounded-2xl border-black/[0.06] shadow-sm"><CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Store className="size-6" /></div>
          <div><h1 className="text-xl font-semibold tracking-tight">Your restaurant workspace starts here</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Submit your restaurant details and we’ll guide you through the next steps.</p></div>
          <Button asChild className="rounded-xl"><Link to="/partner/restaurants">Start restaurant onboarding</Link></Button>
        </CardContent></Card>
      </main>
    );
  }

  if (!approvedRestaurants.length) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="flex items-center justify-between">
            <Link to="/restaurant/dashboard" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><UtensilsCrossed className="size-5" /></span>SwiftBite <span className="font-normal text-muted-foreground">Partners</span></Link>
            <Button variant="outline" className="rounded-xl" onClick={() => void signOut()} disabled={logoutMutation.isPending}><LogOut className="size-4" />{logoutMutation.isPending ? "Signing out…" : "Sign out"}</Button>
          </header>
          <div className="rounded-3xl border border-black/[0.06] bg-white p-7 shadow-sm sm:p-10"><p className="text-sm font-medium text-primary">PARTNER ONBOARDING</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Application status</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">We’ll let you know when your restaurant is ready to start receiving orders.</p></div>
          <RestaurantStatusPanel restaurants={restaurants} />
        </div>
      </main>
    );
  }

  const restaurant = approvedRestaurants.find((item) => item.id === selectedId) ?? approvedRestaurants[0];
  const initials = userQuery.data?.firstName?.slice(0, 1).toUpperCase() ?? "P";

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-black/[0.06] bg-[#191817] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col">
          <Link to="/restaurant/dashboard" className="flex items-center gap-3 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><UtensilsCrossed className="size-5" /></span>
            <span><span className="block text-[15px] font-semibold tracking-tight">SwiftBite</span><span className="block text-xs text-white/45">Restaurant partner</span></span>
          </Link>

          <div className="mx-3 mb-5 rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Your restaurant</p>
            {approvedRestaurants.length > 1 ? (
              <select aria-label="Select restaurant" className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#242321] px-2.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-primary" value={restaurant.id} onChange={(event) => setSelectedId(event.target.value)}>
                {approvedRestaurants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : <p className="mt-2 truncate px-1 text-sm font-medium">{restaurant.name}</p>}
            <p className="mt-1 truncate px-1 text-xs text-white/45">{restaurant.city}</p>
          </div>

          <nav aria-label="Restaurant navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            <p className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 lg:block">Workspace</p>
            {navigation.map(({ to, label, end, icon: Icon }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white",
                isActive && "bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/[0.07]",
              )}>
                {({ isActive }) => <><Icon className={cn("size-[18px]", isActive && "text-primary")} /><span>{label}</span></>}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden p-3 lg:block">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-medium">Need a hand?</p><p className="mt-1 text-xs leading-5 text-white/45">We’re here to help you run your restaurant.</p>
              <Link to="/partner" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white">Partner support <ArrowUpRight className="size-3.5" /></Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
            <div><p className="text-xs text-muted-foreground">Restaurant workspace</p><p className="mt-0.5 max-w-[55vw] truncate text-sm font-semibold sm:max-w-none">{restaurant.name}</p></div>
            <div className="flex items-center gap-3">
              <span className={cn("hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex", restaurant.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600")}><span className={cn("size-1.5 rounded-full", restaurant.isOpen ? "bg-emerald-500" : "bg-stone-400")} />{restaurant.isOpen ? "Accepting orders" : "Currently closed"}</span>
              <span className="grid size-9 place-items-center rounded-full border border-black/[0.08] bg-[#f7f7f5] text-xs font-semibold text-foreground">{initials}</span>
              <Button variant="ghost" size="sm" className="hidden rounded-xl text-muted-foreground sm:inline-flex" onClick={() => void signOut()} disabled={logoutMutation.isPending}><LogOut className="size-4" />Sign out</Button>
            </div>
          </div>
        </header>
        <main className="mx-auto min-w-0 max-w-[1440px] space-y-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
          {restaurants.some((item) => item.verificationStatus !== "APPROVED") && <RestaurantStatusPanel restaurants={restaurants.filter((item) => item.verificationStatus !== "APPROVED")} compact />}
          <Outlet context={{ restaurant, restaurants } satisfies RestaurantDashboardContext} />
        </main>
      </div>
    </div>
  );
}
