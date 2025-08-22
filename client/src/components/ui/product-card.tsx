import { Link, useLocation } from "wouter";
import { Heart, ShoppingBag, Truck, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";

export interface ProductCardProps {
  id: string | number;
  name: string;
  originalTitle?: string; // Add original Turkish title for translation
  price: number;
  oldPrice?: number;
  imageUrl: string;
  discountPercentage?: number;
  stockCount?: number;
  sign?: string;
  currencySign?: string; // New field for displaying the currency sign from API
  totalSales?: number;
  rating?: number;    // Add rating for product review stars
  reviewCount?: number; // Number of reviews
  customData?: boolean;
  onAddToCart: (id: string | number) => void;
  onAddToWishlist: (id: string | number) => void;
}

const ProductCard = ({
  id,
  name,
  originalTitle,
  price,
  oldPrice,
  imageUrl,
  discountPercentage,
  stockCount,
  sign = "₾",
  currencySign,
  totalSales,
  rating,
  reviewCount,
  customData = false,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  
  // Use translation hook for Turkish titles
  const { translatedTitle, isLoading: isTranslating } = useTranslation(originalTitle || "", String(id));
  
  // Only display translated title, never show Turkish original
  const displayTitle = translatedTitle;
  
  // Authentication check removed to prevent console errors

  const { isFavorite, addToFavorites, removeFromFavorites, isAddingToFavorites } = useFavorites();
  
  // Use the currency sign from API if available, otherwise fallback to sign or default "₾"
  const displaySign = currencySign || sign || "₾";
  
  // Use provided totalSales or generate random if not provided
  const salesCount = totalSales !== undefined ? totalSales : (customData ? 0 : Math.floor(Math.random() * 1000));
  
  // Show if product has free shipping (random for demo) - only if not using custom data
  const hasFreeShipping = customData ? false : Math.random() > 0.3;
  
  // Determine stock status
  const inStock = customData ? (stockCount !== undefined && stockCount > 0) : (Math.random() > 0.1);
  const stockQuantity = customData ? (stockCount || 0) : (inStock ? Math.floor(Math.random() * 50) + 1 : 0);
  
  // Format the product rating to show (out of 5 stars)
  const displayRating = rating || 0;
  
  return (
    <div className={`product-card group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:border-primary ${!inStock ? 'opacity-75' : ''}`}>
      <div className="relative overflow-hidden">
        {inStock ? (
          <Link href={`/product/${id}`}>
            <div className="bg-gray-50 h-40 sm:h-48 md:h-52 overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        ) : (
          // Non-clickable out-of-stock version
          <div className="relative">
            <div className="bg-gray-50 h-40 sm:h-48 md:h-52 overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover filter grayscale"
              />
            </div>
            {/* Out of stock overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
              <div className="bg-red-100 text-red-800 font-medium px-3 py-1.5 rounded-full text-sm border border-red-200 transform -rotate-12">
                არ არის მარაგში
              </div>
            </div>
          </div>
        )}
        
        {/* Discount badge */}
        {discountPercentage && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md px-2 py-1">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
        
        {/* Loan badge */}
        {inStock && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-2 py-1 text-xs">
              თვეში {Math.ceil(price / 12)}₾-დან
            </Badge>
          </div>
        )}
        
        {/* Quick action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            className={`bg-white p-2 rounded-full shadow-md transition-all ${
              inStock 
                ? `hover:text-red-500 ${isFavorite(String(id)) ? 'text-red-500' : 'text-neutral-500'}` 
                : 'opacity-50 cursor-not-allowed text-neutral-500'
            }`}
            onClick={() => {
              if (!inStock) return;
              
              const productId = String(id);
              if (isFavorite(productId)) {
                removeFromFavorites(productId);
              } else {
                addToFavorites({
                  productId,
                  productTitle: displayTitle,
                  productImage: imageUrl,
                  productPrice: price,
                  productUrl: `/product/${id}`
                });
              }
            }}
            title={isFavorite(String(id)) ? "რჩეულებიდან მოშლა" : "დაამატე რჩეულებში"}
            disabled={!inStock || isAddingToFavorites}
          >
            <Heart className={`h-4 w-4 ${isFavorite(String(id)) ? 'fill-current' : ''}`} />
          </button>
          <button
            className={`bg-white text-neutral-500 p-2 rounded-full shadow-md transition-all ${inStock ? 'hover:text-primary' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => inStock && onAddToCart(id)}
            title="დაამატე კალათაში"
            disabled={!inStock}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Product Name - clickable only if in stock */}
        {isTranslating ? (
          <div className="mb-2 sm:mb-3 h-8 sm:h-10 flex items-center">
            <div className="w-full space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : inStock ? (
          <Link href={`/product/${id}`}>
            <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 truncate hover:text-primary transition-colors h-8 sm:h-10 leading-4 sm:leading-5">
              {displayTitle}
            </h3>
          </Link>
        ) : (
          <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 truncate text-gray-500 h-8 sm:h-10 leading-4 sm:leading-5">
            {displayTitle}
          </h3>
        )}
        
        {/* Price section - modern design with better visibility on mobile */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg sm:text-xl text-primary">
                {displaySign}{typeof price === 'number' ? price.toFixed(2) : '0.00'}
              </span>
              {oldPrice && (
                <span className="text-neutral-400 text-sm line-through">
                  {displaySign}{typeof oldPrice === 'number' ? oldPrice.toFixed(2) : '0.00'}
                </span>
              )}
            </div>
            
            {/* Rating info (if available) */}
            {displayRating > 0 && (
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-3 h-3 ${star <= Math.round(displayRating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {reviewCount !== undefined && reviewCount > 0 && (
                  <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
                )}
              </div>
            )}
            
            {/* Total sales info - visible only on non-mobile screens */}
            <div className="hidden sm:flex items-center mt-0.5">
              <ShoppingBag className="h-3 w-3 text-neutral-400 mr-1" />
              <span className="text-xs text-neutral-500">{salesCount} გაყიდულია</span>
            </div>
          </div>
        </div>
        
        {/* Stock status - visible only on non-mobile screens */}
        <div className="hidden sm:flex justify-between items-center text-xs text-neutral-500 mb-3">
          {inStock ? (
            <>
              <div className="flex items-center">
                <Check className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-700">მარაგშია</span>
              </div>
              <div>
                მარაგი: <span className="text-neutral-700">{stockQuantity}{customData ? "ც" : "ც"}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <Clock className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-amber-700">არ არის მარაგში</span>
            </div>
          )}
        </div>
        
        {/* Buy button (visible on mobile) - disabled for out-of-stock items */}
        <Button
          className={`w-full mt-3 text-sm rounded-md ${
            inStock 
              ? "bg-primary/10 text-primary hover:bg-[#6e39ea] hover:text-white transition-colors" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => inStock && setLocation(`/product/${id}`)}
          disabled={!inStock}
        >
          {inStock ? (
            <>
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span>ყიდვა</span>
            </>
          ) : (
            <span>არ არის მარაგში</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
