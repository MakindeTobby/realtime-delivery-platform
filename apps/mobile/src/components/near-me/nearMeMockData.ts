import { colors } from "../../theme";
import type { FilterChip } from "./FilterChips";
import type { Restaurant } from "./RestaurantCard";

export const FILTER_CHIPS: FilterChip[] = [
    { id: "filter", label: "Filter", icon: "options-outline" },
    { id: "discount-promo", label: "Discount promo" },
    { id: "recommended", label: "Recommended" },
    // The Figma crops this chip's label to "Hi.." — best guess, confirm the
    // real copy before shipping.
    { id: "highly-rated", label: "Highly rated" },
];

export const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: "bottega",
        name: "Bottega Restorante",
        description: "Italian restaurant with various dishes",
        rating: 4.6,
        reviewCount: 456,
        priceFrom: "49rb",
        distanceKm: 4.6,
        deliveryMinutes: 15,
        tags: ["discount", "delivery"],
        imageColor: colors.dish.topPicks,
    },
    {
        id: "soulfood",
        name: "SOULFOOD Jakarta",
        description: "Indonesian comfort eats served..",
        rating: 4.7,
        reviewCount: 346,
        priceFrom: "35rb",
        distanceKm: 3.2,
        deliveryMinutes: 10,
        tags: ["discount"],
        imageColor: colors.dish.desserts,
    },
    {
        id: "greyhound",
        name: "Greyhound Cafe",
        description: "Hip, industrial-style eatery with..",
        rating: 4.2,
        reviewCount: 354,
        priceFrom: "39rb",
        distanceKm: 2.6,
        deliveryMinutes: 10,
        tags: ["delivery"],
        imageColor: colors.dish.beverages,
    },
    {
        id: "le-quartier",
        name: "Le Quartier",
        description: "Classic French-influenced brasseri..",
        rating: 4.8,
        reviewCount: 548,
        priceFrom: "79rb",
        distanceKm: 5.4,
        deliveryMinutes: 15,
        tags: ["discount", "delivery"],
        imageColor: colors.dish.fastFood,
    },
    {
        // Cropped almost entirely off the bottom of the Figma screenshot — name
        // is a guess ("Sofia" + "Gunawarman" visible), and price/distance/
        // delivery time/description weren't visible at all. Replace this
        // whole entry once you have the real data or the full screenshot.
        id: "sofia",
        name: "Sofia Gunawarman",
        description: "",
        rating: 4.6,
        reviewCount: 456,
        priceFrom: "",
        distanceKm: 0,
        deliveryMinutes: 0,
        tags: [],
        imageColor: colors.icon.nearMe,
    },
];