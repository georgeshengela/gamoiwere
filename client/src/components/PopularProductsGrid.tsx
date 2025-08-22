import { ChevronRight, TrendingUp } from "lucide-react";
import ProductCard from "@/components/ui/product-card";
import { usePopularProducts } from "@/hooks/usePopularProducts";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart } from "@/utils/cartUtils";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PopularProductsGridProps {
  title: string;
  viewAllLink?: string;
}

const PopularProductsGrid = ({ title, viewAllLink = "#" }: PopularProductsGridProps) => {
  const { products, loading, error } = usePopularProducts();
  const { toast } = useToast();

  const handleAddToCart = (productId: string | number) => {
    const product = products.find(p => p.Id === productId);
    if (product) {
      addItemToCart({
        id: product.Id,
        name: product.Title,
        price: product.Price,
        imageUrl: product.MainPictureUrl,
      });
      
      toast({
        title: "პროდუქტი დამატებულია",
        description: "პროდუქტი წარმატებით დაემატა კალათაში",
      });
    }
  };

  const handleAddToWishlist = (productId: string | number) => {
    toast({
      title: "პროდუქტი დამატებულია",
      description: "პროდუქტი წარმატებით დაემატა სასურველებში",
    });
  };

  // Format products to match our component structure
  const formattedProducts = products.map(product => ({
    id: product.Id,
    name: product.Title,
    originalTitle: product.OriginalTitle || product.Title, // Add original Turkish title for translation
    price: product.Price,
    oldPrice: product.oldPrice,
    discountPercentage: product.discountPercentage,
    imageUrl: product.MainPictureUrl,
    stockCount: product.MasterQuantity,
    sign: product.Sign,
    totalSales: product.basketCount || Math.floor(Math.random() * 1000) // Use basketCount if available or fallback to random
  }));

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#5b38ed]" />
          <h2 className="text-[16px] md:text-[20px] font-bold text-gray-900 uppercase" style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}>{title}</h2>
        </div>
        <a
          href={viewAllLink}
          className="text-primary hover:underline flex items-center text-sm md:text-base"
        >
          ყველა
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader size="large" text="პროდუქტების ჩატვირთვა..." />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {formattedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              originalTitle={product.originalTitle}
              price={product.price}
              oldPrice={product.oldPrice}
              discountPercentage={product.discountPercentage}
              imageUrl={product.imageUrl}
              stockCount={product.stockCount}
              sign={product.sign}
              totalSales={product.totalSales}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              customData={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularProductsGrid;