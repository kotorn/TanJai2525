import { ProductCard, ProductCardProps } from './ProductCard';

interface MenuGridProps {
  items: ProductCardProps[];
}

export const MenuGrid = ({ items }: MenuGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ProductCard key={item.id} {...item} />
      ))}
    </div>
  );
};
