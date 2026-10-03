import React from "react";
import { router } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";

export function EmptyCartState() {
  return (
    <EmptyState
      icon="bag-handle-outline"
      title="Your cart is empty"
      subtitle="Looks like you haven't added anything yet. Browse restaurants and find something good to eat."
      actionLabel="Browse restaurants"
      onPressAction={() => router.push("/")}
    />
  );
}
