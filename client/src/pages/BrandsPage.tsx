import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Crown,
  ChevronRight,
  Loader,
  ShoppingBag,
  TrendingUp,
  Star,
  Heart,
  Grid3X3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ui/product-card';

const easeInOutQuart = [0.76, 0, 0.24, 1];

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

interface BrandWithProducts {
  name: string;
  logo: string;
  url: string;
  description: string;
  totalProducts: number;
  products: BrandProduct[];
  isLoading: boolean;
  provider?: string;
}

// Popular brands data
const popularBrands = [
  {
    name: 'Nike',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
    url: '/brand/nike',
    description: 'სპორტული ტანსაცმელი და ფეხსაცმელი',
  },
  {
    name: 'Adidas',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
    url: '/brand/adidas',
    description: 'სპორტული ბრენდი მსოფლიოს მასშტაბით',
  },
  {
    name: 'Zara',
    logo: 'https://brandlogos.net/wp-content/uploads/2022/04/zara-logo-brandlogos.net_.png',
    url: '/brand/zara',
    description: 'ფასტ ფეშნის წამყვანი ბრენდი',
  },
  {
    name: 'H&M',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png',
    url: '/brand/hm',
    description: 'ხელმისაწვდომი მოდური ტანსაცმელი',
  },
  {
    name: 'Bershka',
    logo: 'https://logos-world.net/wp-content/uploads/2020/12/Bershka-Logo.png',
    url: '/brand/bershka',
    description: 'მოდური ტანსაცმელი ახალგაზრდებისთვის',
  },
  {
    name: 'Stradivarius',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/Stradivarius-Logo.png',
    url: '/brand/stradivarius',
    description: 'ახალგაზრდული და მოდური ბრენდი',
  },
  {
    name: 'Pull & Bear',
    logo: 'https://download.logo.wine/logo/Pull%26Bear/Pull%26Bear-Logo.wine.png',
    url: '/brand/pullbear',
    description: 'კაზუალური ბრენდი ახალგაზრდებისთვის',
  },
  {
    name: 'Mango',
    logo: 'https://download.logo.wine/logo/Mango_(retailer)/Mango_(retailer)-Logo.wine.png',
    url: '/brand/mango',
    description: 'ქალის მოდური ტანსაცმელი',
  },
];

export default function BrandsPage() {
  const [brandsWithProducts, setBrandsWithProducts] = useState<
    BrandWithProducts[]
  >([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeBrands = async () => {
      const initialBrands = popularBrands.map((brand) => ({
        ...brand,
        totalProducts: 0,
        products: [] as BrandProduct[],
        isLoading: true,
      }));

      setBrandsWithProducts(initialBrands);
      setIsInitialLoading(false);

      // Fetch products for each brand with staggered loading
      for (let i = 0; i < initialBrands.length; i++) {
        const brand = initialBrands[i];
        setTimeout(() => {
          fetchBrandProducts(brand.name, i);
        }, i * 200); // Stagger requests by 200ms
      }
    };

    initializeBrands();
  }, []);

  const fetchBrandProducts = async (brandName: string, brandIndex: number) => {
    try {
      const encodedBrandName = encodeURIComponent(brandName);
      const response = await fetch(
        `https://service.devmonkeys.ge/api/batchSearchItemsFrameBrand?brandName=${encodedBrandName}&framePosition=0&frameSize=6`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Parse the response using the same logic as BrandPage
      let searchItems = null;
      let totalCount = 0;

      if (
        data?.Result?.Items?.Items?.Content &&
        Array.isArray(data.Result.Items.Items.Content)
      ) {
        searchItems = data.Result.Items.Items.Content;

        if (
          data.Result.Items &&
          typeof data.Result.Items.TotalCount === 'number'
        ) {
          totalCount = data.Result.Items.TotalCount;
        } else if (data.Result.TotalCount !== undefined) {
          totalCount = data.Result.TotalCount;
        } else {
          const responseText = JSON.stringify(data);
          const match = responseText.match(/"TotalCount":(\d+)/);
          if (match && match[1]) {
            totalCount = parseInt(match[1], 10);
          } else {
            totalCount = 100; // Default fallback
          }
        }
      } else if (data?.Result?.Items?.SearchItems) {
        searchItems = data.Result.Items.SearchItems;
        totalCount = data.Result.TotalCount || 0;
      } else if (data?.Result?.SearchItems) {
        searchItems = data.Result.SearchItems;
        totalCount = data.Result.TotalCount || 0;
      } else if (Array.isArray(data?.Result?.Items)) {
        searchItems = data.Result.Items;
        totalCount = data.Result.TotalCount || 0;
      }

      const transformedProducts = transformApiProducts(searchItems || []);

      setBrandsWithProducts((prev) =>
        prev.map((brand, index) =>
          index === brandIndex
            ? {
                ...brand,
                products: transformedProducts.slice(0, 6), // Show first 6 products
                totalProducts: totalCount,
                isLoading: false,
              }
            : brand
        )
      );
    } catch (error) {
      console.error(`Error fetching products for ${brandName}:`, error);
      setBrandsWithProducts((prev) =>
        prev.map((brand, index) =>
          index === brandIndex
            ? { ...brand, isLoading: false, products: [] }
            : brand
        )
      );
    }
  };

  // Transform API products using the same logic as BrandPage
  const transformApiProducts = (apiProducts: any[]): BrandProduct[] => {
    if (!Array.isArray(apiProducts)) {
      return [];
    }

    return apiProducts
      .filter(
        (product) => product && (product.MainPictureUrl || product.Pictures)
      )
      .map((product, index) => {
        const title = product.Title || '';
        const imageUrl =
          product.MainPictureUrl ||
          (product.Pictures && product.Pictures.length > 0
            ? product.Pictures[0].Url
            : '');
        const itemId = product.Id || index.toString();

        let price = 0;
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

        if (isNaN(price)) {
          price = 0;
        }

        let sales = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const basketCountFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === 'basketCount'
          );
          if (basketCountFeature) {
            sales = parseInt(basketCountFeature.Value) || 0;
          }
        } else {
          sales = product.BasketCount || 0;
        }

        let rating = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const ratingFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === 'rating'
          );
          if (ratingFeature) {
            rating = parseFloat(ratingFeature.Value) || 0;
          }
        } else {
          rating = product.Rating || 0;
        }

        let reviewCount = 0;
        if (product.FeaturedValues && Array.isArray(product.FeaturedValues)) {
          const reviewsFeature = product.FeaturedValues.find(
            (feature: any) => feature.Name === 'reviews'
          );
          if (reviewsFeature) {
            reviewCount = parseInt(reviewsFeature.Value) || 0;
          }
        } else {
          reviewCount = product.CommentCount || 0;
        }

        const quantity = product.MasterQuantity || 0;
        const isSellAllowed =
          product.IsSellAllowed !== undefined ? product.IsSellAllowed : true;

        return {
          id: itemId,
          name: title,
          price: Number(price) || 0,
          oldPrice: undefined,
          imageUrl,
          discountPercentage: undefined,
          quantity,
          sales,
          rating,
          reviewCount,
          sign,
          isSellAllowed,
        };
      });
  };

  const handleAddToCart = (product: BrandProduct) => {
    toast({
      title: 'პროდუქტი დაემატა კალათაში',
      description: product.name,
    });
  };

  const handleAddToWishlist = (product: BrandProduct) => {
    toast({
      title: 'პროდუქტი დაემატა სურვილების სიაში',
      description: product.name,
    });
  };

  if (isInitialLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-8 mb-4 md:mb-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Brands Grid Skeleton */}
        <div className="space-y-12">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: easeInOutQuart,
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Brand Header Skeleton */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              </div>

              {/* Products Grid Skeleton */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[280px]">
                  {[...Array(6)].map((_, productIndex) => (
                    <div
                      key={productIndex}
                      className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square bg-gray-200 animate-pulse" />
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeInOutQuart }}
              className="flex-shrink-0  w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Crown className="h-6 w-6 text-primary" />
            </motion.div>
            <div className="flex flex-col gap-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: easeInOutQuart }}
                className="text-2xl md:text-3xl font-bold text-gray-900 caps"
              >
                ყველა ბრენდი
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeInOutQuart }}
                className="text-sm text-gray-600"
              >
                აღმოაჩინეთ მსოფლიოს საუკეთესო ბრენდები
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
              <TrendingUp className="h-3 w-3" />
              პოპულარული ბრენდები
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Brands Grid */}
      <div className="space-y-12">
        {brandsWithProducts.map((brand, brandIndex) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: brandIndex * 0.1,
              ease: easeInOutQuart,
            }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden"
          >
            {/* Brand Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: easeInOutQuart }}
                    className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-xl p-2 flex items-center justify-center"
                  >
                    <img
                      src={brand.logo}
                      alt={`${brand.name} ლოგო`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg text-primary font-bold text-lg">${brand.name.charAt(
                            0
                          )}</div>`;
                        }
                      }}
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {brand.name}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {brand.description}
                    </p>
                    {brand.totalProducts > 0 && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Grid3X3 className="h-3 w-3" />
                          {brand.totalProducts.toLocaleString()} პროდუქტი
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3, ease: easeInOutQuart }}
                >
                  <Link href={brand.url}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      ყველას ნახვა
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[280px]">
                {brand.isLoading ? (
                  <>
                    {[...Array(6)].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.1,
                          ease: easeInOutQuart,
                        }}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                      >
                        {/* Image skeleton */}
                        <div className="aspect-square bg-gray-100 animate-pulse" />

                        {/* Content skeleton */}
                        <div className="p-3 space-y-2">
                          {/* Title skeleton */}
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                          </div>

                          {/* Price skeleton */}
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
                          </div>

                          {/* Stats skeleton */}
                          <div className="flex items-center gap-2">
                            <div className="h-3 bg-gray-200 rounded w-6 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
                          </div>

                          {/* Button skeleton */}
                          <div className="h-8 bg-gray-200 rounded animate-pulse mt-3" />
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : brand.products.length > 0 ? (
                  <>
                    {brand.products.map((product, productIndex) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: productIndex * 0.1,
                          ease: easeInOutQuart,
                        }}
                      >
                        <ProductCard
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
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: easeInOutQuart }}
                    className="col-span-full text-center py-8 text-gray-500"
                  >
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>ამ ბრენდის პროდუქტები ვერ მოიძებნა</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1, ease: easeInOutQuart }}
        className="mt-16 text-center bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ვერ იპოვეთ თქვენი საყვარელი ბრენდი?
        </h3>
        <p className="text-gray-600 mb-6">
          დაგვიკავშირდით და ჩვენ დაგეხმარებით ნებისმიერი ბრენდის პროდუქტების
          მოძიებაში
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: easeInOutQuart }}
        >
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              დაგვიკავშირდით
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
