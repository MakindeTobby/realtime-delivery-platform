import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address");

// Keep the restaurant fields aligned with RestaurantOnboardingDto.
export const onboardingSchema = z.object({
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  restaurantName: z.string().trim().min(2, "Restaurant name is required"),
  cuisineType: z.string().trim().min(1, "Select a cuisine type"),
  description: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters so customers know what to expect")
    .max(500, "Keep the description under 500 characters"),
  address: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  imageUrl: z.string().optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const RESTAURANT_FIELDS = [
  "restaurantName",
  "cuisineType",
  "description",
  "address",
  "city",
  "imageUrl",
] as const satisfies readonly (keyof OnboardingFormValues)[];

export const CUISINE_TYPES = [
  "Italian",
  "Indonesian",
  "Japanese",
  "Chinese",
  "Indian",
  "Mexican",
  "Thai",
  "Middle Eastern",
  "Western / American",
  "Other",
] as const;

export const DEFAULT_ONBOARDING_VALUES: OnboardingFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  restaurantName: "",
  cuisineType: "",
  description: "",
  address: "",
  city: "",
  imageUrl: "",
};
