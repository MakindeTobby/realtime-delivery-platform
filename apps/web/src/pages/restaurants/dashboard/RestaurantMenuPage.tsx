import { useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { ImagePlus, ListPlus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/custom/TextField";
import { ImageUploadField } from "@/components/custom/ImageUploadField";
import {
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useDeleteCategoryMutation,
  useDeleteMenuItemMutation,
  useRestaurantCategoriesQuery,
  useRestaurantItemsQuery,
  useUpdateMenuItemMutation,
} from "@/hooks/restaurants/useRestaurantDashboard";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RestaurantDashboardContext } from "./RestaurantDashboardLayout";

export default function RestaurantMenuPage() {
  const { restaurant } = useOutletContext<RestaurantDashboardContext>();
  const categoriesQuery = useRestaurantCategoriesQuery(restaurant.id);
  const itemsQuery = useRestaurantItemsQuery(restaurant.id);
  const createCategory = useCreateCategoryMutation(restaurant.id);
  const deleteCategory = useDeleteCategoryMutation(restaurant.id);
  const createItem = useCreateMenuItemMutation(restaurant.id);
  const updateItem = useUpdateMenuItemMutation(restaurant.id);
  const deleteItem = useDeleteMenuItemMutation(restaurant.id);
  const [categoryName, setCategoryName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState<string>();
  const [feedback, setFeedback] = useState<string>();
  const [error, setError] = useState<string>();

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setFeedback(undefined);
    try {
      await createCategory.mutateAsync({ name: categoryName.trim() });
      setCategoryName("");
      setFeedback("Menu category created.");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not create the category."));
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setFeedback(undefined);
    if (!itemCategoryId) {
      setError("Create a menu category before adding an item.");
      return;
    }
    if (!Number.isFinite(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setError("Enter a valid item price.");
      return;
    }
    try {
      await createItem.mutateAsync({
        categoryId: itemCategoryId,
        name: itemName.trim(),
        description: itemDescription.trim() || undefined,
        price: itemPrice,
        imageUrl: itemImageUrl,
      });
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemImageUrl(undefined);
      setFeedback("Menu item added.");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not add the menu item."));
    }
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    setError(undefined);
    try {
      await updateItem.mutateAsync({ id, input: { isAvailable: !isAvailable } });
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not update item availability."));
    }
  }

  async function removeItem(id: string) {
    setError(undefined);
    try {
      await deleteItem.mutateAsync({ id });
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not delete the menu item."));
    }
  }

  async function removeCategory(id: string) {
    setError(undefined);
    try {
      await deleteCategory.mutateAsync({ id });
      setFeedback("Category and its menu items were removed.");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not delete the category."));
    }
  }

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">YOUR OFFERING</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Menu</h1><p className="mt-2 text-sm text-muted-foreground">Create categories and keep each menu item’s availability current.</p></div><div className="rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-sm"><span className="font-semibold">{items.length}</span><span className="ml-1.5 text-muted-foreground">menu items</span></div></div>
      {error && <p role="alert" className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3 text-sm text-destructive">{error}</p>}
      {feedback && <p role="status" className="rounded-xl border border-emerald-700/10 bg-emerald-50 p-3 text-sm text-emerald-800">{feedback}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff2e9] text-primary"><ListPlus className="size-[18px]" /></span><div><h2 className="font-semibold tracking-tight">Categories</h2><p className="mt-1 text-sm text-muted-foreground">Group items so customers can browse the menu.</p></div></div>
            <form onSubmit={(event) => void handleCreateCategory(event)} className="flex gap-2">
              <TextField aria-label="New category name" placeholder="e.g. Main dishes" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required minLength={2} />
              <Button type="submit" disabled={createCategory.isPending}>{createCategory.isPending ? "Adding…" : "Add"}</Button>
            </form>
            {categoriesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading categories…</p> : categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : (
              <ul className="divide-y divide-black/[0.05] rounded-xl border border-black/[0.06] bg-[#fcfcfb]">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span>{category.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => void removeCategory(category.id)} disabled={deleteCategory.isPending}>Delete</Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff2e9] text-primary"><ImagePlus className="size-[18px]" /></span><div><h2 className="font-semibold tracking-tight">Add menu item</h2><p className="mt-1 text-sm text-muted-foreground">Share a dish with customers, including a photo.</p></div></div>
            <form onSubmit={(event) => void handleCreateItem(event)} className="space-y-3">
              <label className="block space-y-1 text-sm font-medium">Category
                  <select className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-primary/20" value={itemCategoryId} onChange={(event) => setItemCategoryId(event.target.value)} required>
                  <option value="">Choose a category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <TextField label="Item name" value={itemName} onChange={(event) => setItemName(event.target.value)} required />
              <TextField label="Description (optional)" value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} />
              <TextField label="Price" inputMode="decimal" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} required />
              <ImageUploadField
                endpoint="menuItemImage"
                label="Menu item image (optional)"
                value={itemImageUrl}
                onChange={setItemImageUrl}
              />
              <Button type="submit" className="rounded-xl" disabled={createItem.isPending || categories.length === 0}>{createItem.isPending ? "Saving…" : "Add item"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><UtensilsCrossed className="size-[18px]" /></span><div><h2 className="font-semibold tracking-tight">Menu items</h2><p className="mt-1 text-sm text-muted-foreground">Unavailable items stay on your menu but can’t be ordered.</p></div></div>
          {itemsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading items…</p> : items.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : (
            <div className="divide-y divide-black/[0.05] rounded-xl border border-black/[0.06] bg-white">
              {items.map((item) => {
                const category = categories.find((entry) => entry.id === item.categoryId)?.name ?? "Uncategorized";
                return (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-[#fcfcfb]">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-14 rounded-xl object-cover" /> : <span className="grid size-14 place-items-center rounded-xl bg-[#f7f7f5] text-muted-foreground"><UtensilsCrossed className="size-5" /></span>}
                      <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{category} · {item.price}{item.description ? ` · ${item.description}` : ""}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => void toggleAvailability(item.id, item.isAvailable)} disabled={updateItem.isPending}>{item.isAvailable ? "Mark unavailable" : "Make available"}</Button>
                      <Button variant="ghost" size="sm" onClick={() => void removeItem(item.id)} disabled={deleteItem.isPending}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
