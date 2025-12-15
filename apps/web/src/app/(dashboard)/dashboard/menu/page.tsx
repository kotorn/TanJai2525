export const dynamic = 'force-dynamic';

import { MenuManager } from '@/features/menu/components/MenuManager';

export const metadata = {
  title: 'Menu Management',
  description: 'Manage restaurant menu categories and items',
};

export default function MenuPage() {
  return <MenuManager />;
}
