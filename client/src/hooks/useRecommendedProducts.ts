import { useState, useEffect } from 'react';

// Define the product interface
interface RecommendedProduct {
  Id: number;
  Title: string;
  OriginalTitle?: string; // Add original Turkish title for translation
  Price: number;
  MainPictureUrl: string;
  Sign: string;
  MasterQuantity: number;
  oldPrice?: number;
  discountPercentage?: number;
  basketCount?: number;
}

export const useRecommendedProducts = () => {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        // Use the best rated products endpoint as specified
        const response = await fetch('https://service.devmonkeys.ge/api/searchRatingListItemsBest');
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.OtapiItemInfoSubList || !data.OtapiItemInfoSubList.Content) {
          throw new Error('Invalid API response structure');
        }
        
        const apiProducts = data.OtapiItemInfoSubList.Content;
        
        if (!Array.isArray(apiProducts) || apiProducts.length === 0) {
          throw new Error('No products found in API response');
        }
        
        // Process the API products
        const processedProducts = apiProducts.slice(0, 12).map(item => {
          // Find the main picture or use the first one
          const mainPicture = item.Pictures?.find((pic: any) => pic.IsMain === true) || 
                             (item.Pictures && item.Pictures.length > 0 ? item.Pictures[0] : null);
          
          // Extract price information
          let price = 0;
          let sign = "₾";
          let discountPercentage: number | undefined = undefined;
          let oldPrice: number | undefined = undefined;
          
          // Check for promotion pricing first (discount information)
          if (item.PromotionPrice && item.PromotionPricePercent && item.PromotionPricePercent.length > 0) {
            // Use promotion price as the discounted price
            if (item.PromotionPrice.ConvertedPriceList?.Internal) {
              price = item.PromotionPrice.ConvertedPriceList.Internal.Price || 0;
              sign = item.PromotionPrice.ConvertedPriceList.Internal.Sign || "₾";
            }
            
            // Get discount percentage
            const discountInfo = item.PromotionPricePercent.find((p: any) => p.CurrencyCode === "GEL");
            if (discountInfo) {
              discountPercentage = discountInfo.Percent;
              
              // Calculate original price from discount percentage
              if (price > 0 && discountPercentage && discountPercentage > 0) {
                oldPrice = Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
              }
            }
          }
          
          // If no price was found from configured items, try fallback pricing
          if (price === 0 && item.Price) {
            // Get the current price
            if (item.Price.ConvertedPriceWithoutSign) {
              price = parseFloat(item.Price.ConvertedPriceWithoutSign) || 0;
            } else if (item.Price.ConvertedPriceList && item.Price.ConvertedPriceList.Internal) {
              price = item.Price.ConvertedPriceList.Internal.Price || 0;
            } else if (item.Price.OriginalPrice) {
              // Fallback to original price if needed
              price = item.Price.OriginalPrice || 0;
            }
            
            // Get the currency sign
            if (item.Price.CurrencySign) {
              sign = item.Price.CurrencySign;
            } else if (item.Price.ConvertedPriceList && item.Price.ConvertedPriceList.Internal) {
              sign = item.Price.ConvertedPriceList.Internal.Sign || "₾";
            }
            
            // Check for discount/old price
            if (item.Price.HasSaleDiscount && item.Price.OldPrice) {
              oldPrice = parseFloat(item.Price.OldConvertedPriceWithoutSign) || 0;
            } else if (item.Price.OriginalPrice && item.Price.MarginPrice && item.Price.OriginalPrice !== item.Price.MarginPrice) {
              // Alternative way to detect a possible old price
              oldPrice = item.Price.OriginalPrice;
            }
            
            // Calculate discount percentage if we have both prices
            if (oldPrice && oldPrice > price) {
              discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
            }
          }
          
          // Calculate a random basket count if not provided
          const basketCount = Math.floor(Math.random() * 10000) + 1000;
          
          // Log each product's price details for debugging
          console.log(`Product ${item.Id}: Price = ${price}, OldPrice = ${oldPrice}, Discount = ${discountPercentage}%, Sign = ${sign}`);
          
          return {
            Id: item.Id,
            Title: item.Title || 'Unknown Product',
            OriginalTitle: item.OriginalTitle || item.Title, // Use OriginalTitle from API or fallback to Title
            Price: price,
            MainPictureUrl: mainPicture?.Url || 'https://placehold.co/600x400?text=No+Image',
            Sign: sign,
            MasterQuantity: Math.floor(Math.random() * 50) + 5, // Random stock count
            oldPrice: oldPrice,
            discountPercentage: discountPercentage,
            basketCount: basketCount
          };
        });
        
        setProducts(processedProducts);
        setError(null);
      } catch (err) {
        console.error('Error loading recommended products:', err);
        setError('პროდუქტების ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  return { products, loading, error };
};