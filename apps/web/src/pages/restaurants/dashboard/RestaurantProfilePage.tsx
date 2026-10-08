import { useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/custom/TextField";
import { ImageUploadField } from "@/components/custom/ImageUploadField";
import { useRestaurantProfileMutation } from "@/hooks/restaurants/useRestaurantDashboard";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RestaurantDashboardContext } from "./RestaurantDashboardLayout";

export default function RestaurantProfilePage() {
  const { restaurant } = useOutletContext<RestaurantDashboardContext>();
  const updateMutation = useRestaurantProfileMutation();
  const [name, setName] = useState(restaurant.name);
  const [cuisineType, setCuisineType] = useState(restaurant.cuisineType);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [address, setAddress] = useState(restaurant.address);
  const [city, setCity] = useState(restaurant.city);
  const [imageUrl, setImageUrl] = useState<string | undefined>(restaurant.imageUrl ?? undefined);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(restaurant.name);
    setCuisineType(restaurant.cuisineType);
    setDescription(restaurant.description ?? "");
    setAddress(restaurant.address);
    setCity(restaurant.city);
    setImageUrl(restaurant.imageUrl ?? undefined);
    setIsOpen(restaurant.isOpen);
  }, [restaurant]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSaved(false);
    try {
      await updateMutation.mutateAsync({
        id: restaurant.id,
        input: { name: name.trim(), cuisineType: cuisineType.trim(), description: description.trim(), address: address.trim(), city: city.trim(), imageUrl, isOpen },
      });
      setSaved(true);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "We couldn’t update your restaurant profile."));
    }
  }

  return (
    <div className="space-y-7">
      <div><p className="text-sm font-medium text-primary">YOUR PUBLIC PRESENCE</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Restaurant profile</h1><p className="mt-2 text-sm text-muted-foreground">Manage how your restaurant appears to customers on SwiftBite.</p></div>
      <Card className="max-w-4xl rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]"><CardContent className="p-5 sm:p-7">
        <form onSubmit={(event) => void handleSave(event)} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-black/[0.06] pb-5"><span className="grid size-11 place-items-center rounded-xl bg-[#fff2e9] text-primary"><Store className="size-5" /></span><div><h2 className="font-semibold tracking-tight">Restaurant information</h2><p className="mt-1 text-xs text-muted-foreground">These details appear on your customer-facing page.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Restaurant name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
            <TextField label="Cuisine type" value={cuisineType} onChange={(event) => setCuisineType(event.target.value)} required />
          </div>
          <label className="block space-y-2 text-sm font-medium">Description
            <textarea className="min-h-28 w-full rounded-xl border border-black/[0.1] bg-white p-3 font-normal outline-none transition focus:ring-2 focus:ring-primary/20" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Tell customers what makes your restaurant special." />
            <span className="block text-right text-xs font-normal text-muted-foreground">{description.length}/500</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Address" value={address} onChange={(event) => setAddress(event.target.value)} required />
            <TextField label="City" value={city} onChange={(event) => setCity(event.target.value)} required />
          </div>
          <ImageUploadField
            endpoint="restaurantImage"
            label="Restaurant image"
            value={imageUrl}
            onChange={setImageUrl}
            disabled={updateMutation.isPending}
          />
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/[0.07] bg-[#fafaf8] p-4">
            <span><span className="block text-sm font-medium">Accepting orders</span><span className="mt-1 block text-xs text-muted-foreground">Customers can order while your restaurant is open and approved.</span></span>
            <input type="checkbox" className="size-4 accent-primary" checked={isOpen} onChange={(event) => setIsOpen(event.target.checked)} />
          </label>
          {error && <p role="alert" className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3 text-sm text-destructive">{error}</p>}
          {saved && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-700/10 bg-emerald-50 p-3 text-sm text-emerald-800"><Check className="size-4" />Restaurant profile saved.</p>}
          <div className="flex justify-end border-t border-black/[0.06] pt-5"><Button type="submit" className="rounded-xl" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving…" : "Save changes"}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
