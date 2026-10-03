import { colors, gradients } from "../../theme";
import type { Deal } from "./DealsCarousel";
import type { QuickAccessItem } from "./QuickAccessRow";
import type { DishCategory } from "./DailyDishesGrid";

// Swap these for real API data once the endpoints exist — shape matches
// what each component expects.

export const MOCK_DEALS: Deal[] = [
    {
        id: "today",
        title: "Today's Best Deals",
        subtitle: "Off up to 75%",
        gradient: gradients.dealsOrange,
    },
    {
        id: "weekly",
        title: "Weekly Best Deals",
        subtitle: "Off up to 50%",
        gradient: gradients.dealsPink,
    },
];

export const MOCK_QUICK_ACCESS: Omit<QuickAccessItem, "onPress">[] = [
    { id: "near-me", label: "Near Me", icon: "location", color: colors.icon.nearMe },
    { id: "popular", label: "Popular", icon: "star", color: colors.icon.popular },
    { id: "discount", label: "Discount", icon: "pricetag", color: colors.icon.discount },
    { id: "24-hours", label: "24 Hours", icon: "time", color: colors.icon.hours24 },
    { id: "quick-order", label: "Quick Order", icon: "flash", color: colors.icon.quickOrder },
];

// The Figma label read "Bevergaes" — treating that as a typo for "Beverages".
export const MOCK_DISH_CATEGORIES: Omit<DishCategory, "onPress">[] = [
    { id: "top-picks", title: "Customer Top Picks", restaurantCount: 321, color: colors.dish.topPicks },
    { id: "beverages", title: "Beverages", restaurantCount: 189, color: colors.dish.beverages },
    { id: "fast-food", title: "Fast Food", restaurantCount: 526, color: colors.dish.fastFood },
    { id: "desserts", title: "Desserts", restaurantCount: 891, color: colors.dish.desserts },
];