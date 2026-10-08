"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUISINE_TYPES, type OnboardingFormValues } from "../lib/onboarding";
import { TextField } from "@/components/custom/TextField";
import { TextareaField } from "@/components/custom/TextareaField";
import { ImageUploadField } from "@/components/custom/ImageUploadField";

export function RestaurantDetailsSection() {
  const { register, formState, control } =
    useFormContext<OnboardingFormValues>();
  const { errors } = formState;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Restaurant details</h2>
        <p className="text-sm text-muted-foreground">
          This is what customers will see on your restaurant page.
        </p>
      </div>

      <FormField
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ImageUploadField
                endpoint="restaurantImage"
                label="Restaurant image (optional)"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TextField
        label="Restaurant name"
        error={errors.restaurantName?.message}
        {...register("restaurantName")}
        placeholder="Bottega Ristorante"
      />

      <FormField
        control={control}
        name="cuisineType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cuisine type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cuisine type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CUISINE_TYPES.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <TextareaField
        label="Description"
        error={errors.description?.message}
        {...register("description")}
        placeholder="Tell customers what makes your restaurant worth ordering from..."
      />
      <TextField
        label="Address"
        error={errors.address?.message}
        {...register("address")}
        placeholder="123 Main Street"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="City"
          error={errors.city?.message}
          {...register("city")}
          placeholder="Lagos"
        />
      </div>
    </div>
  );
}
