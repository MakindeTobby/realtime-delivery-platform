import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Clock3, PackageCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantOrdersQuery, useUpdateOrderStatusMutation } from "@/hooks/restaurants/useRestaurantDashboard";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RestaurantDashboardContext } from "./RestaurantDashboardLayout";

export default function RestaurantOrdersPage() {
  const { restaurant } = useOutletContext<RestaurantDashboardContext>();
  const ordersQuery = useRestaurantOrdersQuery(true);
  const updateMutation = useUpdateOrderStatusMutation();
  const [error, setError] = useState<string>();
  const orders = (ordersQuery.data ?? []).filter((order) => order.restaurantId === restaurant.id);
  const needsAction = orders.filter((order) => order.status === "CONFIRMED" && order.paymentStatus === "PAID").length;
  const preparing = orders.filter((order) => order.status === "PREPARING").length;

  async function updateStatus(id: string, status: "PREPARING" | "READY") {
    setError(undefined);
    try {
      await updateMutation.mutateAsync({ id, status });
    } catch (cause) {
      setError(getApiErrorMessage(cause, "We couldn’t update this order. Refresh and try again."));
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">SERVICE DESK</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Orders</h1><p className="mt-2 text-sm text-muted-foreground">Review incoming orders and keep customers updated as you prepare them.</p></div><div className="flex gap-2"><div className="rounded-xl border border-black/[0.06] bg-white px-4 py-2.5"><p className="text-[11px] text-muted-foreground">Needs attention</p><p className="mt-0.5 text-lg font-semibold">{ordersQuery.isLoading ? "—" : needsAction}</p></div><div className="rounded-xl border border-black/[0.06] bg-white px-4 py-2.5"><p className="text-[11px] text-muted-foreground">In preparation</p><p className="mt-0.5 text-lg font-semibold">{ordersQuery.isLoading ? "—" : preparing}</p></div></div></div>
      {error && <p role="alert" className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3 text-sm text-destructive">{error}</p>}
      {ordersQuery.isLoading && <Card className="rounded-2xl border-black/[0.06]"><CardContent className="p-6 text-sm text-muted-foreground">Loading orders…</CardContent></Card>}
      {ordersQuery.isError && <Card className="rounded-2xl border-black/[0.06]"><CardContent className="p-6 text-sm text-destructive">Couldn’t load orders. Please refresh.</CardContent></Card>}
      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && <Card className="rounded-2xl border-black/[0.06]"><CardContent className="flex flex-col items-center p-10 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-[#fff3ed] text-primary"><ShoppingBag className="size-5" /></span><h2 className="mt-4 font-semibold">No orders just yet</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">New customer orders will appear here. Keep your menu up to date and your restaurant open to get started.</p></CardContent></Card>}
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff3ed] text-primary"><ShoppingBag className="size-[18px]" /></span><div><h2 className="font-semibold tracking-tight">Order #{order.id.slice(0, 8)}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{new Date(order.createdAt).toLocaleString()}</p></div></div>
              <div className="flex flex-wrap gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 font-medium ${order.status === "READY" ? "bg-emerald-50 text-emerald-700" : order.status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{order.status.toLowerCase().replaceAll("_", " ")}</span><span className={`rounded-full px-2.5 py-1 font-medium ${order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>Payment {order.paymentStatus.toLowerCase()}</span></div>
            </div>
            <ul className="space-y-2 rounded-xl bg-[#f8f8f6] p-4 text-sm">
              {order.items.map((item) => <li key={item.id} className="flex justify-between gap-4"><span>{item.quantity} × {item.itemName}</span><span>{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span></li>)}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
              <div className="text-sm"><p className="text-xs text-muted-foreground">Delivery to {order.deliveryCity}</p><p className="mt-1 font-semibold">Total <span className="ml-1">₦{Number(order.totalAmount).toLocaleString("en-NG", { maximumFractionDigits: 0 })}</span></p></div>
              {order.status === "CONFIRMED" && order.paymentStatus === "PAID" && <Button className="rounded-xl" onClick={() => void updateStatus(order.id, "PREPARING")} disabled={updateMutation.isPending}><Check className="size-4" />Accept order</Button>}
              {order.status === "PREPARING" && <Button className="rounded-xl" onClick={() => void updateStatus(order.id, "READY")} disabled={updateMutation.isPending}><PackageCheck className="size-4" />Mark ready</Button>}
              {order.status === "PENDING" && order.paymentStatus === "PENDING" && <span className="text-sm text-muted-foreground">Waiting for customer payment</span>}
              {order.status === "READY" && <span className="text-sm font-medium text-emerald-700">Ready for driver pickup</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
