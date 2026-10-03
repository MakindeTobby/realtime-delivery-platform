import { StyleSheet } from 'react-native';
import { useTheme, type Theme } from './theme';

/**
 * Wraps StyleSheet.create so styles can read theme tokens without every
 * component re-deriving colors/spacing by hand.
 *
 * Usage:
 *   const useStyles = makeStyles((theme) => ({
 *     card: {
 *       backgroundColor: theme.colors.background.surface,
 *       borderRadius: theme.radius.lg,
 *       padding: theme.spacing.md,
 *       ...theme.shadows.card,
 *     },
 *   }));
 *
 *   function DishCard() {
 *     const styles = useStyles();
 *     return <View style={styles.card} />;
 *   }
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
    factory: (theme: Theme) => T
) {
    return function useStyles(): T {
        const theme = useTheme();
        return useMemoizedStyles(factory, theme);
    };
}

// Small internal memo so styles aren't rebuilt every render.
import { useMemo } from 'react';
function useMemoizedStyles<T extends StyleSheet.NamedStyles<T>>(
    factory: (theme: Theme) => T,
    theme: Theme
): T {
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}