import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/product-card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/components/cart/CartContext";
import { useLocation } from "wouter";

interface Product {
  id: number;
  name: string;
  originalTitle?: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  discountPercentage?: number;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductGrid = ({ title, products, viewAllLink = "#" }: ProductGridProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleBuyClick = (productId: string | number) => {
    const id = typeof productId === 'string' ? productId : productId.toString();
    setLocation(`/product/${id}`);
  };

  const handleAddToWishlist = (productId: string | number) => {
    toast({
      title: "პროდუქტი დამატებულია",
      description: "პროდუქტი წარმატებით დაემატა სასურველებში",
    });
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold caps">{title}</h2>
        <a
          href={viewAllLink}
          className="text-primary hover:underline flex items-center text-sm md:text-base"
        >
          ყველას ნახვა
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            originalTitle={product.originalTitle}
            price={product.price}
            oldPrice={product.oldPrice}
            imageUrl={product.imageUrl}
            discountPercentage={product.discountPercentage}
            onAddToCart={handleBuyClick}
            onAddToWishlist={handleAddToWishlist}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
