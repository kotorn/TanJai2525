// DEV-0003: Station Routing Algorithm
// Owner: Dev Core

export type StationID = 'BAR' | 'HOT_KITCHEN' | 'COLD_KITCHEN' | 'EXPO';

interface MenuItem {
    id: string;
    category: string; // e.g., 'Drinks', 'Appetizers', 'Main Course'
    tags?: string[]; // e.g., ['soup', 'wok', 'salad']
}

export function routeToStation(item: MenuItem): StationID {
    const category = item.category.toUpperCase();
    const tags = item.tags?.map(t => t.toUpperCase()) || [];

    // 1. Bar Station Rule
    if (
        category.includes('DRINK') || 
        category.includes('BEVERAGE') || 
        category.includes('ALCOHOL')
    ) {
        return 'BAR';
    }

    // 2. Cold Kitchen Rule
    if (
        category.includes('SALAD') || 
        category.includes('DESSERT') || 
        tags.includes('COLD')
    ) {
        return 'COLD_KITCHEN';
    }

    // 3. Hot Kitchen Rule
    // Default for most Main Courses, Soups, Appetizers
    if (
        category.includes('MAIN') || 
        category.includes('APPETIZER') || 
        category.includes('SOUP') || 
        tags.includes('WOK') ||
        tags.includes('FRIED')
    ) {
        return 'HOT_KITCHEN';
    }

    // 4. Default Fallback
    return 'EXPO';
}
