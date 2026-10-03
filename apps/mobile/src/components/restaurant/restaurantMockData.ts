import { colors } from "@/theme";

export type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    imageColor: string; // placeholder swatch until real photos are wired up
    hasExtraDiscount?: boolean;
    soldOut?: boolean;
};

export type MenuListEntry =
    | { kind: "grid"; id: string; items: MenuItem[] }
    | { kind: "item"; id: string; item: MenuItem };

export type MenuSection = {
    id: string;
    title: string;
    data: MenuListEntry[];
};

export const RESTAURANT = {
    id: "bottega",
    name: "Bottega Ristorante",
    cuisine: "Italian Resto",
    address: "Fairgrounds, SCBD, Jakarta",
    heroImageColor: colors.dish.topPicks,
    distanceKm: 4.6,
    deliveryFeeLabel: "12rb",
    deliveryMinutes: 15,
    stats: [
        { value: "4.8", label: "99+ Reviews" },
        { value: "6", label: "Menu variants" },
        { value: "49-890rb", label: "Price range" },
        { value: "8AM-8PM", label: "Opening hours" },
    ],
    fbDiscountLabel: "F&B discount 75%",
    fbDiscountSubtitle: "Discounts for all menus",
    shippingDiscountLabel: "Shipping discount 50%",
    shippingDiscountSubtitle: "Applicable for all merchants",
};

// A dish that shows up in both "Popular" and its real category (e.g. Salmon
// appears in Popular AND Main Courses) shares the same id on purpose, so
// adding it from either place updates the same cart line. Where the Figma
// itself showed two different prices for what reads as the same dish name
// (Bottega's Fried Rice: Rp98.000 in the Popular grid vs Rp129.000 in Main
// Courses), they're kept as separate ids/entries rather than silently
// picking one price — worth reconciling once you have real menu data.
export const MENU_SECTIONS: MenuSection[] = [
    {
        id: "popular",
        title: "Popular",
        data: [
            {
                kind: "grid",
                id: "popular-grid",
                items: [
                    {
                        id: "fried-rice-popular",
                        name: "Bottega's Fried Rice",
                        price: 98000,
                        originalPrice: 120000,
                        imageColor: colors.dish.topPicks,
                        hasExtraDiscount: true,
                    },
                    {
                        id: "salmon",
                        name: "Salmon with Beurre Blanc",
                        price: 320000,
                        imageColor: colors.dish.desserts,
                    },
                    {
                        id: "calamari-popular",
                        name: "Calamari",
                        price: 129500,
                        imageColor: colors.dish.beverages,
                    },
                    {
                        id: "chicken-parmigiana",
                        name: "Chicken Parmigiana",
                        price: 198000,
                        imageColor: colors.dish.fastFood,
                    },
                ],
            },
        ],
    },
    {
        id: "main-courses",
        title: "Main Courses",
        data: [
            {
                kind: "item",
                id: "salmon",
                item: {
                    id: "salmon",
                    name: "Salmon with Beurre Blanc",
                    description: "Soared salmon served with butter sauce & seasonal vegetables.",
                    price: 320000,
                    imageColor: colors.dish.desserts,
                },
            },
            {
                kind: "item",
                id: "fried-rice-main",
                item: {
                    id: "fried-rice-main",
                    name: "Bottegea's Fried Rice",
                    description: "Orange leaves, chicken, tempeh, sambal, singkong, egg, crackers.",
                    price: 129000,
                    originalPrice: 134000,
                    imageColor: colors.dish.topPicks,
                    hasExtraDiscount: true,
                },
            },
            {
                kind: "item",
                id: "bakmi-olio",
                item: {
                    id: "bakmi-olio",
                    name: "Bakmi Olio With Sambal Matah",
                    description: "Sambal matah, olive oil, garlic, grilled chicken thigh",
                    price: 119000,
                    imageColor: colors.icon.discount,
                    soldOut: true,
                },
            },
            {
                kind: "item",
                id: "chicken-parmigiana",
                item: {
                    id: "chicken-parmigiana",
                    name: "Chicken Parmigiana",
                    description: "Breaded chicken cutlet topped with tomato sauce",
                    price: 198000,
                    imageColor: colors.dish.fastFood,
                },
            },
        ],
    },
    {
        id: "appetizer",
        title: "Appetizer",
        data: [
            {
                kind: "item",
                id: "chicken-lollipop",
                item: {
                    id: "chicken-lollipop",
                    name: "Chicken Lollipop",
                    description: "Lollipop shaped chicken served with house made hot sauce",
                    price: 189000,
                    originalPrice: 220000,
                    imageColor: colors.icon.nearMe,
                    hasExtraDiscount: true,
                },
            },
            {
                kind: "item",
                id: "calamari-appetizer",
                item: {
                    id: "calamari-appetizer",
                    name: "Calamari",
                    description: "Battered calamari, house made marinara sauce",
                    price: 89000,
                    imageColor: colors.dish.beverages,
                },
            },
            {
                kind: "item",
                id: "french-fries",
                item: {
                    id: "french-fries",
                    name: "French Fries with Grated Parmesan",
                    description: "French fries with grated parmesan & truffle oil",
                    price: 79000,
                    imageColor: colors.icon.hours24,
                    soldOut: true,
                },
            },
            {
                kind: "item",
                id: "nachos",
                // Cropped off the bottom of the Figma screenshot — no visible
                // price or description. Placeholder until the real data exists.
                item: {
                    id: "nachos",
                    name: "Nachos Chilli Con Carne",
                    price: 0,
                    imageColor: colors.icon.popular,
                },
            },
        ],
    },
    {
        id: "pizza-pasta",
        title: "Pizza & Pasta",
        data: [
            {
                kind: "item",
                id: "spaghetti-aglio-olio",
                item: {
                    id: "spaghetti-aglio-olio",
                    name: "Spaghetti Aglio Olio with Chicken",
                    description: "Garlic, dried chili flakes, parmesan bread crumbs.",
                    price: 39000,
                    originalPrice: 70000,
                    imageColor: colors.dish.topPicks,
                    hasExtraDiscount: true,
                },
            },
            {
                kind: "item",
                id: "bacon-mac-cheese",
                item: {
                    id: "bacon-mac-cheese",
                    name: "Bacon Mac & Cheese",
                    description: "Macaroni tossed in cheese and choice of bacon.",
                    price: 89000,
                    imageColor: colors.dish.desserts,
                },
            },
            {
                kind: "item",
                id: "beef-pepperoni-pizza",
                item: {
                    id: "beef-pepperoni-pizza",
                    name: "Beef Pepperoni Pizza",
                    description: "Beef pepperoni, mozzarella, basil, house made marinara sauce.",
                    price: 120000,
                    imageColor: colors.dish.fastFood,
                },
            },
        ],
    },
];