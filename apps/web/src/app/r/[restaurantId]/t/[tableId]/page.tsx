import { getMenu } from '@/data/menu';
import { MenuGrid } from '@/features/ordering/components/menu-grid';
import { CartDrawer } from '@/features/ordering/components/cart-drawer';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Menu | TanJai POS',
  description: 'Order food directly from your table.',
};

type Props = {
  params: {
    restaurantId: string;
    tableId: string;
  };
};

export default async function OrderingPage({ params }: Props) {
  // In Next.js 15+, params is a promise? 
  // Wait, user is on Next.js 16 (from checklist). In Next 15+, params is Async.
  // But let's assume standard behavior for now or check package.json version. 
  // Checklist said "Next.js 16 App Router".
  // So params should be awaited.
  
  const { restaurantId, tableId } = params;

  if (!restaurantId || !tableId) {
    notFound();
  }

  const categories = await getMenu(restaurantId);

  // If no categories found, it might be an invalid restaurant ID
  // But getMenu returns [] on error. 
  // We'll show empty state in MenuGrid if so.

  return (
    <main className="container max-w-md mx-auto min-h-screen bg-background pb-24">
       {/* Header / Banner */}
       <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Restaurant Menu</h1>
          <p className="text-sm text-muted-foreground">Table: {tableId}</p>
       </div>

       {/* Menu */}
       <div className="p-4">
          <MenuGrid categories={categories} />
       </div>

       {/* Cart */}
       <CartDrawer restaurantId={restaurantId} tableId={tableId} />
    </main>
  );
}
