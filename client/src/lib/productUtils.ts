/**
 * Transforms API product data into a consistent format for our application
 */
export function transformApiProduct(apiProduct: any) {
  // Processing product data
  
  // Extract price information based on the actual API response structure
  let price = 0;
  let oldPrice = undefined;
  let discountPercentage = undefined;
  let currencySign = "₾";
  
  if (apiProduct.Price && apiProduct.Price.ConvertedPriceList && 
      apiProduct.Price.ConvertedPriceList.DisplayedMoneys && 
      apiProduct.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
    
    const priceInfo = apiProduct.Price.ConvertedPriceList.DisplayedMoneys[0];
    price = priceInfo.Price || 0;
    
    // Check if there's a discount
    if (apiProduct.Price.OriginalPrice && apiProduct.Price.OriginalPrice > price) {
      oldPrice = apiProduct.Price.OriginalPrice;
      discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    
    // Get currency sign
    currencySign = priceInfo.Sign || "₾";
  }
  
  // Get image URL from MainPictureUrl or the first item in Pictures array
  let imageUrl = '';
  if (apiProduct.MainPictureUrl) {
    imageUrl = apiProduct.MainPictureUrl;
  } else if (apiProduct.Pictures && apiProduct.Pictures.length > 0) {
    imageUrl = apiProduct.Pictures[0].Url;
  }
  
  // Get product ratings and reviews from FeaturedValues
  let rating = 0;
  let reviewCount = 0;
  let sales = 0;
  
  if (apiProduct.FeaturedValues && Array.isArray(apiProduct.FeaturedValues)) {
    const ratingItem = apiProduct.FeaturedValues.find((item: any) => item.Name === "rating");
    const reviewsItem = apiProduct.FeaturedValues.find((item: any) => item.Name === "reviews");
    const basketCountItem = apiProduct.FeaturedValues.find((item: any) => item.Name === "basketCount");
    
    if (ratingItem) {
      rating = parseFloat(ratingItem.Value) || 0;
    }
    
    if (reviewsItem) {
      reviewCount = parseInt(reviewsItem.Value) || 0;
    }
    
    // Use basketCount as a proxy for sales if available
    if (basketCountItem) {
      sales = parseInt(basketCountItem.Value) || 0;
    }
  }
  
  // Get quantity
  const quantity = apiProduct.MasterQuantity || 0;
  
  // Product processing completed
  
  return {
    id: apiProduct.Id,
    name: apiProduct.Title,
    originalTitle: apiProduct.OriginalTitle || apiProduct.Title, // Include original title for translation
    price: price,
    oldPrice: oldPrice,
    imageUrl: imageUrl,
    discountPercentage: discountPercentage,
    quantity: quantity,
    sales: sales,
    rating: rating,
    reviewCount: reviewCount,
    sign: currencySign,
    isSellAllowed: apiProduct.IsSellAllowed !== false, // Default to true if not specified
    customData: true
  };
}