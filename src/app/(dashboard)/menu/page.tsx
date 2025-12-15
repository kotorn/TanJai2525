import { getMenuData } from "@/features/menu/actions";
import { MenuPageClient } from "@/features/menu/components/MenuPageClient";

export const metadata = {
  title: "จัดการเมนู | Tanjai POS",
  description: "จัดการรายการอาหารและหมวดหมู่",
};

export default async function MenuPage() {
  const { categories, items } = await getMenuData();

  return (
    <MenuPageClient 
      initialCategories={categories}
      initialItems={items} 
    />
  );
}
