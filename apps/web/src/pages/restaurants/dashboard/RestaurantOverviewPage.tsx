import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, Banknote, ClipboardList, Clock3, Plus, Store, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantOrdersQuery } from "@/hooks/restaurants/useRestaurantDashboard";
import { cn } from "@/lib/utils";
import type { RestaurantDashboardContext } from "./RestaurantDashboardLayout";

export default function RestaurantOverviewPage() {
  const { restaurant, restaurants } = useOutletContext<RestaurantDashboardContext>();
  const ordersQuery = useRestaurantOrdersQuery(true);
  const orders = (ordersQuery.data ?? []).filter((order) => order.restaurantId === restaurant.id);
  const activeOrders = orders.filter((order) => ["CONFIRMED", "PREPARING", "READY"].includes(order.status));
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
  const revenue = paidOrders.reduce((total, order) => total + Number(order.totalAmount), 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[24px] bg-[#211c19] text-white shadow-sm">
        {restaurant.imageUrl && <img src={restaurant.imageUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-25" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211c19] via-[#211c19]/95 to-[#211c19]/55" />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-9">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs text-white/80"><span className={cn("size-1.5 rounded-full", restaurant.isOpen ? "bg-emerald-400" : "bg-white/40")} />{restaurant.isOpen ? "You’re open for orders" : "Your restaurant is closed"}</div>
            <p className="text-sm text-white/55">Welcome back to your restaurant</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{restaurant.name}</h1>
            <p className="mt-2 text-sm text-white/65">{restaurant.cuisineType} <span className="px-1.5 text-white/30">·</span> {restaurant.city}</p>
          </div>
          <Button asChild variant="secondary" className="w-fit rounded-xl border border-white/15 bg-white text-foreground hover:bg-white/90"><Link to="/restaurant/profile">Manage restaurant <ArrowRight className="size-4" /></Link></Button>
        </div>
      </section>

      {ordersQuery.isError && <div role="alert" className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-4 text-sm text-destructive">We couldn’t load order metrics right now. Try refreshing the page.</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Restaurant performance">
        <MetricCard label="Active orders" value={ordersQuery.isLoading ? "—" : activeOrders.length} detail="Orders being prepared" icon={ClipboardList} tone="orange" />
        <MetricCard label="Paid orders" value={ordersQuery.isLoading ? "—" : paidOrders.length} detail="All time" icon={Banknote} tone="green" />
        <MetricCard label="Sales volume" value={ordersQuery.isLoading ? "—" : formatNaira(revenue)} detail="From paid orders" icon={Store} tone="purple" />
        <MetricCard label="Restaurant status" value={restaurant.isOpen ? "Open" : "Closed"} detail={restaurant.isOpen ? "Ready to receive orders" : "Not accepting orders"} icon={Clock3} tone={restaurant.isOpen ? "green" : "stone"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <Card className="overflow-hidden rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-5 sm:px-6">
              <div><h2 className="font-semibold tracking-tight">Recent orders</h2><p className="mt-1 text-xs text-muted-foreground">A quick look at your latest activity</p></div>
              <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary"><Link to="/restaurant/orders">All orders <ArrowRight className="size-4" /></Link></Button>
            </div>
            {ordersQuery.isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((row) => <div key={row} className="h-14 animate-pulse rounded-xl bg-muted/60" />)}</div> : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#fff3ed] text-primary"><ClipboardList className="size-5" /></span>
                <h3 className="mt-4 text-sm font-semibold">Your first order will show up here</h3>
                <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">Once a customer places an order, you can follow its progress from this workspace.</p>
                <Button asChild variant="outline" className="mt-4 rounded-xl"><Link to="/restaurant/menu">Review your menu <ArrowRight className="size-4" /></Link></Button>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {recentOrders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f7f7f5] text-muted-foreground"><ClipboardList className="size-[18px]" /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-medium">Order #{order.id.slice(0, 8)}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5"><span className={statusClass(order.status)}>{humanize(order.status)}</span><span className="min-w-[72px] text-right text-sm font-semibold">{formatNaira(Number(order.totalAmount))}</span></div>
                </div>)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div><h2 className="font-semibold tracking-tight">Quick actions</h2><p className="mt-1 text-xs text-muted-foreground">Keep your restaurant running smoothly</p></div>
            <QuickAction to="/restaurant/orders" icon={ClipboardList} title="Review orders" detail="Accept paid orders and update progress" />
            <QuickAction to="/restaurant/menu" icon={UtensilsCrossed} title="Update your menu" detail="Edit dishes, prices, and availability" />
            <QuickAction to="/restaurant/profile" icon={Store} title="Restaurant details" detail="Update what customers see" />
            {restaurants.length > 1 && <Button asChild variant="outline" className="w-full rounded-xl"><Link to="/partner/restaurants"><Plus className="size-4" />Add another restaurant</Link></Button>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: typeof ClipboardList; tone: "orange" | "green" | "purple" | "stone" }) {
  const tones = { orange: "bg-[#fff2e9] text-[#d85b27]", green: "bg-emerald-50 text-emerald-700", purple: "bg-violet-50 text-violet-700", stone: "bg-stone-100 text-stone-600" };
  return <Card className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]"><CardContent className="p-5">
    <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><span className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}><Icon className="size-[18px]" /></span></div>
    <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p>
  </CardContent></Card>;
}

function QuickAction({ to, icon: Icon, title, detail }: { to: string; icon: typeof ClipboardList; title: string; detail: string }) {
  return <Link to={to} className="group flex items-center gap-3 rounded-xl border border-black/[0.06] p-3 transition hover:border-primary/20 hover:bg-[#fffaf7]">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff2e9] text-primary"><Icon className="size-[18px]" /></span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span></span>
    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
  </Link>;
}

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  const tone = status === "READY" || status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return cn("rounded-full px-2.5 py-1 text-[11px] font-medium", tone);
}
