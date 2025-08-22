import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  Loader,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ui/product-card";
import CustomPagination from "@/components/ui/custom-pagination";

// Define types for brand products
interface BrandProduct {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  discountPercentage?: number;
  quantity: number;
  sales: number;
  rating: number;
  reviewCount: number;
  sign: string;
  isSellAllowed: boolean;
}

interface BrandInfo {
  translatedTitle: string;
  provider: string;
  totalCount: number;
  brandName: string;
}

export default function BrandPage() {
  const [, params] = useRoute("/brand/:brandName");
  const brandName = params?.brandName || '';
  const decodedBrandName = decodeURIComponent(brandName);
  
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 19; // Items per page from API
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrandProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const framePosition = (currentPage - 1) * productsPerPage;
        console.log("Fetching brand products for:", decodedBrandName, "page:", currentPage);
        const response = await fetch(`https://service.devmonkeys.ge/api/batchSearchItemsFrameBrand?brandName=${encodeURIComponent(decodedBrandName)}&framePosition=${framePosition}&frameSize=${productsPerPage}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        // Handle different possible response structures
        let searchItems = null;
        let totalCount = 0;
        let provider = '';
        let translatedTitle = decodedBrandName;
        
        // Check for the deeply nested structure from the API response
        if (data?.Result?.Items?.Items?.Content && Array.isArray(data.Result.Items.Items.Content)) {
          // This is the structure we're seeing in the actual response
          searchItems = data.Result.Items.Items.Content;
          
          // Let's log the response structure to identify where total count is stored
          console.log("API Response keys:", Object.keys(data.Result));
          
          // Look for total count in various possible locations
          if (data.Result.Items && typeof data.Result.Items.TotalCount === 'number') {
            totalCount = data.Result.Items.TotalCount;
            console.log("Found total count at Items.TotalCount:", totalCount);
          } else if (data.Result.TotalCount !== undefined) {
            totalCount = data.Result.TotalCount;
            console.log("Found total count at Result.TotalCount:", totalCount);
          } else {
            // Try to extract TotalCount from the response text
            const responseText = JSON.stringify(data);
            const match = responseText.match(/"TotalCount":(\d+)/);
            if (match && match[1]) {
              totalCount = parseInt(match[1], 10);
              console.log("Extracted total count from response text:", totalCount);
            } else {
              // If we still can't find it, set a reasonable default
              totalCount = 100;
              console.log("Using default total count:", totalCount);
            }
          }
          
          // Log the total count for debugging
          console.log("Total products count from API:", totalCount);
          
          provider = data.Result.Provider || '';
          translatedTitle = data.Result.TranslatedItemTitle || data.Result.BrandName || decodedBrandName;
        } else if (data?.Result?.Items?.SearchItems) {
          // Standard response structure
          searchItems = data.Result.Items.SearchItems;
          totalCount = data.Result.TotalCount || 0;
          provider = data.Result.Provider || '';
          translatedTitle = data.Result.TranslatedItemTitle || decodedBrandName;
        } else if (data?.Result?.SearchItems) {
          // Alternative response structure
          searchItems = data.Result.SearchItems;
          totalCount = data.Result.TotalCount || 0;
          provider = data.Result.Provider || '';
          translatedTitle = data.Result.TranslatedItemTitle || decodedBrandName;
        } else if (Array.isArray(data?.Result?.Items)) {
          // Another possible structure
          searchItems = data.Result.Items;
          totalCount = data.Result.TotalCount || 0;
          provider = data.Result.Provider || '';
          translatedTitle = data.Result.TranslatedItemTitle || decodedBrandName;
        } else {
          console.error("Unexpected API response structure:", data);
          throw new Error("Invalid response format from API");
        }
        
        // Extract brand info
        const brandInfo = {
          translatedTitle: translatedTitle,
          provider: provider,
          totalCount: totalCount,
          brandName: decodedBrandName
        };
        
        setBrandInfo(brandInfo);
        setTotalProducts(totalCount);
        
        // Transform API products to our format
        const transformedProducts = transformApiProducts(searchItems);
        setProducts(transformedProducts);
      } catch (err) {
        console.error("Error fetching brand products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch brand products");
        toast({
          title: "ბრენდის პროდუქტების ჩატვირთვა ვერ მოხერხდა",
          description: "გთხოვთ, სცადოთ მოგვიანებით",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedBrandName) {
      fetchBrandProducts();
    }
  }, [decodedBrandName, currentPage, toast]);

  // Transform API products to our format
  const transformApiProducts = (apiProducts: any[]): BrandProduct[] => {
    if (!Array.isArray(apiProducts)) {
      console.error("API products is not an array:", apiProducts);
      return [];
    }

    return apiProducts
      .filter(product => {
        // Filter out invalid products
        return product && (product.MainPictureUrl || product.Pictures);
      })
      .map((product, index) => {
        // Get product title
        const title = product.Title || "";
        
        // Get product image URL
        const imageUrl = product.MainPictureUrl || 
                        (product.Pictures && product.Pictures.length > 0 ? 
                         product.Pictures[0].Url : "");
        
        // Get product ID
        const itemId = product.Id || index.toString();
        
        // Extract price information (handle different structures)
        let price = 0;
        let oldPrice = undefined;
        let sign = "₾";
        
        if (product.Price) {
          // Handle the nested price object structure
          if (typeof product.Price === 'object') {
            // Use ConvertedPriceList.Internal.Price if available
            if (product.Price.ConvertedPriceList?.Internal?.Price !== undefined) {
              // Convert to number explicitly
              const rawPrice = product.Price.ConvertedPriceList.Internal.Price;
              price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
              sign = product.Price.ConvertedPriceList.Internal.Sign || "₾";
            } 
            // Fallback to OriginalPrice
            else if (product.Price.OriginalPrice !== undefined) {
              const rawPrice = product.Price.OriginalPrice;
              price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
            }
          } else {
            // Direct price value
            price = Number(product.Price);
          }
        }
        
        // Ensure price is a valid number
        if (isNaN(price)) {
          price = 0;
        }
        
        // Extract sales count from FeaturedValues or directly from product
        let sales = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const basketCountFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === "basketCount"
          );
          if (basketCountFeature) {
            sales = parseInt(basketCountFeature.Value) || 0;
          }
        } else {
          sales = product.BasketCount || 0;
        }
        
        // Extract rating from FeaturedValues or directly from product
        let rating = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const ratingFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === "rating"
          );
          if (ratingFeature) {
            rating = parseFloat(ratingFeature.Value) || 0;
          }
        } else {
          rating = product.Rating || 0;
        }
        
        // Extract review count from FeaturedValues or directly from product
        let reviewCount = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const reviewsFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === "reviews"
          );
          if (reviewsFeature) {
            reviewCount = parseInt(reviewsFeature.Value) || 0;
          }
        } else {
          reviewCount = product.CommentCount || 0;
        }
        
        // Get stock quantity
        const quantity = product.MasterQuantity || 0;
        
        // Get sell allowed status
        const isSellAllowed = product.IsSellAllowed !== undefined ? product.IsSellAllowed : true;
        
        return {
          id: itemId,
          name: title,
          price: Number(price) || 0, // Convert to number, default to 0 if NaN
          oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
          imageUrl,
          discountPercentage: undefined, // We'll calculate this in the product card if needed
          quantity,
          sales,
          rating,
          reviewCount,
          sign,
          isSellAllowed
        };
      });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle add to cart functionality
  const handleAddToCart = (product: BrandProduct) => {
    toast({
      title: "პროდუქტი დაემატა კალათაში",
      description: product.name,
    });
  };

  // Handle add to wishlist functionality
  const handleAddToWishlist = (product: BrandProduct) => {
    toast({
      title: "პროდუქტი დაემატა სურვილების სიაში",
      description: product.name,
    });
  };

  // Calculate total pages - ensure we have at least 2 pages for pagination to show
  const totalPages = Math.max(2, Math.ceil(totalProducts / productsPerPage));

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 uppercase">
                {brandInfo?.translatedTitle || decodedBrandName}
              </h1>
              {brandInfo?.provider && (
                <p className="text-sm text-gray-500">
                  მომწოდებელი: {brandInfo.provider}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 md:mt-0">
            <div className="inline-flex items-center bg-neutral-50 px-3 py-1.5 rounded-full text-sm text-neutral-700">
              <span className="font-medium mr-1.5">{totalProducts.toLocaleString()}</span> 
              <span>სულ პროდუქტები</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh] py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCurrentPage(1)}
          >
            სცადეთ თავიდან
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">ამ ბრენდის პროდუქტები ვერ მოიძებნა</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                imageUrl={product.imageUrl}
                discountPercentage={product.discountPercentage}
                stockCount={product.quantity}
                sign={product.sign}
                totalSales={product.sales}
                rating={product.rating}
                reviewCount={product.reviewCount}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
              />
            ))}
          </div>
          
          {/* Pagination - always show for brand pages */}
          <div className="mt-10 flex justify-center">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        </>
      )}
    </main>
  );
}