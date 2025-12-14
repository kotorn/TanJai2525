import { getMenuData } from "@/features/menu/actions";
import CategoryList from "@/features/menu/components/CategoryList";
import MenuItemList from "@/features/menu/components/MenuItemList";

export default async function MenuPage() {
    const { categories, items } = await getMenuData();

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 p-4 md:flex-row md:space-x-8 md:space-y-0">
            {/* Category Management */}
            <div className="w-full md:w-1/3 lg:w-1/4">
                <CategoryList categories={categories} />
            </div>

            {/* Menu Items Management */}
            <div className="flex-1">
                <MenuItemList categories={categories} items={items} />
            </div>
        </div>
    );
}
