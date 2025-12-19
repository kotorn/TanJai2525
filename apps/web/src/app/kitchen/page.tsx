import { KitchenDisplay } from "@/components/kitchen/KitchenDisplay";

export default function KitchenPage() {
  // TODO: Get restaurant_id from auth session
  const restaurantId = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_ID || "demo-restaurant";

  return <KitchenDisplay restaurantId={restaurantId} />;
}
