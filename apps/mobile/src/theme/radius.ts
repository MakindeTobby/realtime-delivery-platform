
// Radius · TS
/** Border radius scale — the deal/dish cards read as ~16-20, the search bar and FAB as fully round. */
export const radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
} as const;

export type Radius = typeof radius;

