import { getMenu } from '@/data/menu';
import { MidnightMenu } from '@/features/menu/components/MidnightMenu';
import { ContextHeader } from '@/features/menu/components/ContextHeader';
import { BottomNav } from '@/components/layout/BottomNav';
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
  const { restaurantId, tableId } = params;

  if (!restaurantId || !tableId) {
    notFound();
  }

  const categories = await getMenu(restaurantId);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto shadow-2xl bg-[#121212]">
       {/* Sticky Header */}
        <header className="sticky top-0 z-30 glass-nav px-4 pt-4 pb-4 border-b-0">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-primary/80 mb-0.5">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-xs font-medium uppercase tracking-wider">Restaurant</span>
                    </div>
                    <h2 className="text-white text-xl font-bold leading-tight tracking-tight">Table {tableId}</h2>
                </div>
                <button className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white border border-white/5">
                    <span className="material-symbols-outlined">search</span>
                </button>
            </div>
        </header>

       {/* Context Header (Smart Greeting) */}
       <ContextHeader tableId={tableId} />

       {/* Midnight Menu Engine */}
       <MidnightMenu categories={categories} />

       {/* Cart & Navigation */}
       <BottomNav restaurantId={restaurantId} tableId={tableId} />
    </div>
  );
}
