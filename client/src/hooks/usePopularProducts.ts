import { useState, useEffect } from 'react';

// Sample data to use while developing - these will only show if the API call fails
const fallbackProducts = [
  {
    Id: 1,
    Title: "Apple iPhone 15 Pro Max - 256GB, Titanium Gray",
    Price: 3599,
    Sign: "₾",
    MainPictureUrl: "https://cdn.shopify.com/s/files/1/0083/6380/2720/products/PM_1_a95e78da-7d06-48c9-8a4a-1e34ccda1f75.jpg",
    MasterQuantity: 15
  },
  {
    Id: 2,
    Title: "Samsung Galaxy S24 Ultra - 512GB, Titanium Black",
    Price: 2999,
    Sign: "₾",
    MainPictureUrl: "https://images.samsung.com/is/image/samsung/p6pim/ge/2401/gallery/ge-galaxy-s24-ultra-s928-sm-s928bzkgcau-539972042",
    MasterQuantity: 23
  },
  {
    Id: 3,
    Title: "MacBook Pro 16\" - M3 Pro, 32GB RAM, 1TB SSD",
    Price: 6199,
    Sign: "₾",
    MainPictureUrl: "https://www.apple.com/v/macbook-pro-14-and-16/e/images/overview/hero/hero_intro__cww8m2vra4uq_large.jpg",
    MasterQuantity: 8
  },
  {
    Id: 4,
    Title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    Price: 749,
    Sign: "₾",
    MainPictureUrl: "https://www.sony.com/image/bc1b37bafa5a9a3f322bcf4c131d33bd?fmt=png-alpha&wid=720",
    MasterQuantity: 42
  },
  {
    Id: 5,
    Title: "iPad Air (5th Generation) - 256GB, Wi-Fi, Space Grey",
    Price: 1899,
    Sign: "₾",
    MainPictureUrl: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-spacegray-202203?wid=940&hei=1112&fmt=png-alpha&.v=1645066742664",
    MasterQuantity: 16
  },
  {
    Id: 6,
    Title: "PlayStation 5 Digital Edition Console",
    Price: 1499,
    Sign: "₾",
    MainPictureUrl: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21",
    MasterQuantity: 5
  }
];

interface PopularProduct {
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

export const usePopularProducts = () => {
  const [products, setProducts] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://service.devmonkeys.ge/api/searchRatingListItemsPopular');
        
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
        
        const formattedProducts = apiProducts.map(item => {
          // Find the main picture or use the first one
          const mainPicture = item.Pictures?.find((pic: any) => pic.IsMain === true) || 
                             (item.Pictures && item.Pictures.length > 0 ? item.Pictures[0] : null);
          
          // Access price directly from the Price object structure
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
          if (price === 0) {
            if (item.Price?.OneItemPriceWithoutDelivery?.ConvertedPriceList?.DisplayedMoneys && 
                Array.isArray(item.Price.OneItemPriceWithoutDelivery.ConvertedPriceList.DisplayedMoneys) && 
                item.Price.OneItemPriceWithoutDelivery.ConvertedPriceList.DisplayedMoneys.length > 0) {
              
              const originalPriceData = item.Price.OneItemPriceWithoutDelivery.ConvertedPriceList.DisplayedMoneys[0];
              price = originalPriceData.Price;
              sign = originalPriceData.Sign || "₾";
            } else if (item.Price?.ConvertedPriceList?.DisplayedMoneys && 
                Array.isArray(item.Price.ConvertedPriceList.DisplayedMoneys) && 
                item.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
              // Get price from DisplayedMoneys
              const priceData = item.Price.ConvertedPriceList.DisplayedMoneys[0];
              price = priceData.Price;
              sign = priceData.Sign || "₾";
            } else if (item.Price?.ConvertedPriceWithoutSign) {
              // Fallback to ConvertedPriceWithoutSign
              price = parseFloat(item.Price.ConvertedPriceWithoutSign);
              sign = item.Price.CurrencySign || "₾";
            }
          }
          
          // Get basketCount (sold items count) from FeaturedValues if available
          if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
            const basketCountValue = item.FeaturedValues.find((feature: any) => feature.Name === "basketCount");
            if (basketCountValue && basketCountValue.Value) {
              item.basketCount = parseInt(basketCountValue.Value, 10);
              if (isNaN(item.basketCount)) {
                item.basketCount = 0;
              }
            }
          }
          
          // If we have the same value for price and oldPrice, nullify oldPrice to avoid showing duplicate prices
          if (oldPrice && price === oldPrice) {
            oldPrice = undefined;
          }
          
          console.log(`Product ${item.Id}: Price = ${price}, OldPrice = ${oldPrice}, Discount = ${discountPercentage}%, Sign = ${sign}`);
          
          return {
            Id: item.Id || 0,
            Title: item.Title || "Unknown Product",
            OriginalTitle: item.OriginalTitle || item.Title, // Use OriginalTitle from API or fallback to Title
            Price: price,
            Sign: sign,
            oldPrice: oldPrice,
            discountPercentage: discountPercentage,
            MainPictureUrl: item.MainPictureUrl || (mainPicture?.Url || ""),
            MasterQuantity: item.MasterQuantity || 0
          };
        });
        
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching popular products:', err);
        // Use fallback products for development
        setProducts(fallbackProducts);
        setError('პროდუქტების ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  return { products, loading, error };
};