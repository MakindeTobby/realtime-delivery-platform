/**
 * Color tokens.
 * `palette` = raw values, never used directly in components.
 * `colors`  = semantic aliases — this is what screens/components import.
 */

export const palette = {
    // Brand red/pink (header, FAB, "weekly deals" card, active tab)
    red50: '#FFE9EC',
    red100: '#FFC2CC',
    red400: '#FF6B7A',
    red500: '#FF4B6E', // primary
    red600: '#E5305C', // gradient end / pressed state

    // Orange (today's deals, top picks, free-delivery chip)
    orange100: '#FFE3C2',
    orange400: '#FFA53E',
    orange500: '#FF8A3D',
    orange600: '#FF6B35',

    // Gold (ratings, "Popular" quick-access icon)
    gold400: '#FFC93E',
    gold600: '#E5A400',

    // Purple (discount icon)
    purple400: '#9C8CF2',
    purple500: '#8C7AE6',

    // Blue (24-hours icon, "Extra discount" chip, fast-food card)
    blue100: '#E3EEFF',
    blue500: '#4A6CF7',
    indigo500: '#5B4FCF',

    // Cyan (desserts card)
    cyan400: '#57C7E3',
    cyan500: '#2FB6D9',

    // Neutrals
    ink900: '#1A1A2E', // headings
    ink700: '#33334D',
    gray600: '#6B6B80',
    gray500: '#8A8A9E', // subtext
    gray300: '#C9C9D6',
    gray100: '#F0F0F3', // "Near Me" screen background
    gray50: '#F7F7FA',
    white: '#FFFFFF',
    black: '#000000',
} as const;

export const gradients = {
    header: [palette.red400, palette.red600] as const,
    dealsOrange: [palette.orange400, palette.orange600] as const,
    dealsPink: ['#F857A6', palette.red600] as const,
    fab: [palette.red500, palette.red600] as const,
};

export const colors = {
    background: {
        default: palette.gray100,
        surface: palette.white,
        subtle: palette.gray50,
    },
    text: {
        primary: palette.ink900,
        secondary: palette.gray500,
        tertiary: palette.gray300,
        inverse: palette.white,
        link: palette.blue500,
    },
    border: {
        default: palette.gray300,
        subtle: palette.gray100,
    },
    brand: {
        primary: palette.red500,
        primaryDark: palette.red600,
        onPrimary: palette.white,
    },
    icon: {
        nearMe: palette.red500,
        popular: palette.gold400,
        discount: palette.purple500,
        hours24: palette.blue500,
        quickOrder: '#F0506B',
    },
    dish: {
        topPicks: palette.orange500,
        beverages: '#F0506B',
        fastFood: palette.indigo500,
        desserts: palette.cyan400,
    },
    chip: {
        discountBg: palette.blue100,
        discountText: palette.blue500,
        deliveryBg: palette.orange100,
        deliveryText: palette.orange500,
    },
    rating: palette.gold400,
    nav: {
        active: palette.red500,
        inactive: palette.gray500,
    },
    overlay: 'rgba(26,26,46,0.4)',
} as const;

export type Colors = typeof colors;