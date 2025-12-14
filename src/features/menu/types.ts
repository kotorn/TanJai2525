export interface MenuOption {
    id: string;
    name: string;
    price: number;
    is_default: boolean;
}

export interface OptionGroup {
    id: string;
    name: string;
    required: boolean;
    min_selection: number;
    max_selection: number; // 1 for single select
    options: MenuOption[];
}
