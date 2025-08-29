import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  TrendingUp,
  Loader,
  Award,
  Heart,
  ShoppingBag,
  Filter,
  Grid3X3,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ui/product-card';
import CustomPagination from '@/components/ui/custom-pagination';

const easeInOutQuart = [0.76, 0, 0.24, 1];

// Define types for recommended products
interface RecommendedProduct {
  id: string | number;
  name: string;
  originalTitle?: string;
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

interface RecommendedPageInfo {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  loadedProducts: number;
}

export default function RecommendedPage() {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [pageInfo, setPageInfo] = useState<RecommendedPageInfo>({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    loadedProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24; // Items per page

  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate frame position for pagination
        const framePosition = (currentPage - 1) * productsPerPage;
        console.log('Fetching recommended products for page:', currentPage);

        // Fetch from the best rated products endpoint
        // Note: This API might not support pagination parameters, so we'll fetch the full dataset
        const response = await fetch(
          'https://service.devmonkeys.ge/api/searchRatingListItemsBest'
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Handle the API response structure
        let apiProducts = null;
        let totalCount = 0;

        if (data?.OtapiItemInfoSubList?.Content) {
          apiProducts = data.OtapiItemInfoSubList.Content;
          // Try to get total count from various possible locations
          totalCount =
            data.OtapiItemInfoSubList.TotalCount ||
            data.TotalCount ||
            apiProducts.length;
        } else if (data?.Result?.Items) {
          // Alternative structure
          apiProducts = Array.isArray(data.Result.Items)
            ? data.Result.Items
            : data.Result.Items.Content;
          totalCount = data.Result.TotalCount || apiProducts.length;
        } else {
          throw new Error('Invalid API response structure');
        }

        if (!Array.isArray(apiProducts) || apiProducts.length === 0) {
          throw new Error('No products found in API response');
        }

        // Since API may not support pagination, we'll implement client-side pagination
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = apiProducts.slice(startIndex, endIndex);

        // Transform API products to our format
        const transformedProducts = transformApiProducts(paginatedProducts);
        setProducts(transformedProducts);

        // Update pagination info
        const totalPages = Math.ceil(apiProducts.length / productsPerPage);
        setPageInfo({
          totalCount: apiProducts.length,
          currentPage,
          totalPages,
          loadedProducts: transformedProducts.length,
        });
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch recommended products'
        );
        toast({
          title: 'რეკომენდებული პროდუქტების ჩატვირთვა ვერ მოხერხდა',
          description: 'გთხოვთ, სცადოთ მოგვიანებით',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [currentPage, toast]);

  // Transform API products using similar logic to the hook
  const transformApiProducts = (apiProducts: any[]): RecommendedProduct[] => {
    if (!Array.isArray(apiProducts)) {
      return [];
    }

    return apiProducts
      .filter(
        (product) => product && (product.MainPictureUrl || product.Pictures)
      )
      .map((product, index) => {
        // Get product title
        const title = product.Title || '';
        const originalTitle = product.OriginalTitle || product.Title || '';

        // Get product image URL
        const mainPicture =
          product.Pictures?.find((pic: any) => pic.IsMain === true) ||
          product.Pictures?.[0];
        const imageUrl = product.MainPictureUrl || mainPicture?.Url || '';

        // Get product ID
        const itemId = product.Id || index.toString();

        // Extract price information
        let price = 0;
        let oldPrice = undefined;
        let discountPercentage = undefined;
        let sign = '₾';

        if (product.Price) {
          if (typeof product.Price === 'object') {
            if (
              product.Price.ConvertedPriceList?.Internal?.Price !== undefined
            ) {
              const rawPrice = product.Price.ConvertedPriceList.Internal.Price;
              price =
                typeof rawPrice === 'string'
                  ? parseFloat(rawPrice)
                  : Number(rawPrice);
              sign = product.Price.ConvertedPriceList.Internal.Sign || '₾';

              // Check for old price and discount
              if (product.Price.ConvertedPriceList.Internal.OldPrice) {
                const rawOldPrice =
                  product.Price.ConvertedPriceList.Internal.OldPrice;
                oldPrice =
                  typeof rawOldPrice === 'string'
                    ? parseFloat(rawOldPrice)
                    : Number(rawOldPrice);
                if (oldPrice && oldPrice > price) {
                  discountPercentage = Math.round(
                    ((oldPrice - price) / oldPrice) * 100
                  );
                }
              }
            } else if (product.Price.OriginalPrice !== undefined) {
              const rawPrice = product.Price.OriginalPrice;
              price =
                typeof rawPrice === 'string'
                  ? parseFloat(rawPrice)
                  : Number(rawPrice);
            }
          } else {
            price = Number(product.Price);
          }
        }

        // Ensure price is a valid number
        if (isNaN(price)) {
          price = 0;
        }

        // Extract additional data
        const quantity =
          product.MasterQuantity || Math.floor(Math.random() * 50) + 5;
        const sales = product.basketCount || Math.floor(Math.random() * 1000);
        const rating = product.Rating || Math.random() * 2 + 3; // 3-5 rating
        const reviewCount =
          product.CommentCount || Math.floor(Math.random() * 100) + 10;
        const isSellAllowed =
          product.IsSellAllowed !== undefined ? product.IsSellAllowed : true;

        return {
          id: itemId,
          name: title,
          originalTitle: originalTitle,
          price: Number(price) || 0,
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          imageUrl,
          discountPercentage,
          quantity,
          sales,
          rating,
          reviewCount,
          sign,
          isSellAllowed,
        };
      });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle add to cart functionality
  const handleAddToCart = (product: RecommendedProduct) => {
    toast({
      title: 'პროდუქტი დაემატა კალათაში',
      description: product.name,
    });
  };

  // Handle add to wishlist functionality
  const handleAddToWishlist = (product: RecommendedProduct) => {
    toast({
      title: 'პროდუქტი დაემატა სურვილების სიაში',
      description: product.name,
    });
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-8 mb-4 md:mb-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 min-h-[600px]">
          {[...Array(24)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: index * 0.02,
                ease: easeInOutQuart,
              }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-200 rounded w-6 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-3" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-10 flex justify-center">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeInOutQuart }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-8 mb-4 md:mb-0">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeInOutQuart }}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Star className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex flex-col gap-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: easeInOutQuart }}
                className="text-2xl md:text-3xl font-bold text-gray-900 caps"
              >
                რეკომენდებული პროდუქტები
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeInOutQuart }}
                className="text-sm text-gray-600"
              >
                საუკეთესო რეიტინგის მქონე პროდუქტები
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeInOutQuart }}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              ტოპ რეიტინგი
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Grid3X3 className="h-3 w-3" />
              {pageInfo.totalCount.toLocaleString()} პროდუქტი
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: easeInOutQuart }}
        className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                გვერდი {pageInfo.currentPage} / {pageInfo.totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">
                {pageInfo.loadedProducts} პროდუქტი ჩატვირთულია
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            საუკეთესო რეიტინგის პროდუქტები მომხმარებელთა შეფასებების მიხედვით
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeInOutQuart }}
          className="text-center py-20"
        >
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCurrentPage(1)}
          >
            სცადეთ თავიდან
          </Button>
        </motion.div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeInOutQuart }}
          className="text-center py-20"
        >
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">რეკომენდებული პროდუქტები ვერ მოიძებნა</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7, ease: easeInOutQuart }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 min-h-[600px]"
          >
            {products.map((product, index) => (
              <motion.div
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: easeInOutQuart,
                }}
                whileHover={{ y: -5 }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  originalTitle={product.originalTitle}
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
                  customData={true}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pageInfo.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1, ease: easeInOutQuart }}
              className="mt-10 flex justify-center"
            >
              <CustomPagination
                currentPage={pageInfo.currentPage}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
                siblingCount={2}
              />
            </motion.div>
          )}
        </>
      )}

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: easeInOutQuart }}
        className="mt-16 text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100"
      >
        <Star className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          მოგეწონათ ეს პროდუქტები?
        </h3>
        <p className="text-gray-600 mb-6">
          დაიკავშირეთ თქვენი განყოფილება და მიიღეთ პერსონალური რეკომენდაციები
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: easeInOutQuart }}
        >
          <Button
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Heart className="h-4 w-4 mr-2" />
            სურვილების სიაში დამატება
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
