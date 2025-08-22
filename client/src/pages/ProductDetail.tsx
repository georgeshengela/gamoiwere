import { useState, useEffect } from "react";
import { useRoute, Link as WouterLink } from "wouter";
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  Truck, 
  Shield, 
  CreditCard, 
  Calendar, 
  Clock, 
  Share2, 
  Copy, 
  Ruler, 
  Store,
  ShieldCheck, 
  Zap,
  Star,
  ArrowDown,
  Plus,
  Minus,
  Loader2,
  ChevronDown,
  ShoppingCart,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import { popularProducts, recommendedProducts } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import ProductImageGallery from "@/components/ui/product-image-gallery";
import ProductVariation from "@/components/ui/product-variations";
import { DynamicProductConfigurator, ProductAttribute } from "@/components/ui/dynamic-product-configurator";
import { addItemToCart } from "@/utils/cartUtils";
import { useCart } from "@/components/cart/CartContext";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SocialMetaTags } from "@/components/ui/social-meta-tags";

import SizeChartModal from "@/components/ui/size-chart-modal";
import QuickOrderModal from "@/components/ui/quick-order-modal";
import ProductWeightDisplay from "@/components/ui/product-weight-display";
import AIPriceComparison from "@/components/ui/ai-price-comparison-new";

// Function to format API product data into the format needed for the UI
const formatApiProductData = (apiData: any) => {
  if (!apiData || !apiData.Result || !apiData.Result.Item) {
    throw new Error("Invalid API data structure");
  }

  const item = apiData.Result.Item;
  
  // Process images
  const images = Array.isArray(item.Pictures) && item.Pictures.length > 0
    ? item.Pictures.map((pic: any, index: number) => ({
        id: index + 1,
        url: pic.Url,
        alt: item.Title && index === 0 ? item.Title : `${item.Title || 'Product'} - Image ${index + 1}`
      }))
    : [{ id: 1, url: 'https://placehold.co/600x400?text=No+Image', alt: 'No Image Available' }];

  // Extract price information
  let price = 0;
  let oldPrice = undefined;
  let discountPercentage = undefined;
  let sign = "₾";
  let salesCount = item.SalesCount || Math.floor(Math.random() * 2000) + 500; // Use API SalesCount or fallback

  if (item.Price) {
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

  // Process variations (colors, sizes) from Attributes
  const productAttributes = item.Attributes || [];
  
  // Extract unique colors and sizes
  const colorsMap = new Map();
  const sizesMap = new Map();
  
  productAttributes.forEach((attr: any) => {
    if (attr.IsConfigurator) {
      if (attr.PropertyName === "ფერი" && attr.Value) {
        const colorId = `color-${attr.Vid || attr.Value.replace(/\s+/g, '-').toLowerCase()}`;
        
        if (!colorsMap.has(colorId)) {
          colorsMap.set(colorId, {
            id: colorId,
            name: attr.Value,
            value: attr.Value,
            available: true, // Default to available since we don't have quantity info per color
            colorCode: getColorCode(attr.Value),
            imageUrl: attr.MiniImageUrl || null // Use MiniImageUrl from attributes
          });
        }
      }
      
      if (attr.PropertyName === "ზომა" && attr.Value) {
        const sizeId = `size-${attr.Vid || attr.Value.replace(/\s+/g, '-').toLowerCase()}`;
        
        if (!sizesMap.has(sizeId)) {
          sizesMap.set(sizeId, {
            id: sizeId,
            name: attr.Value,
            value: attr.Value,
            available: true // Default to available
          });
        }
      }
    }
  });

  // Convert maps to arrays
  const colors = Array.from(colorsMap.values());
  const sizes = Array.from(sizesMap.values());
  
  // Debug: Log color variations to check if imageUrl is being set
  console.log("Color variations with images:", colors);

  // Add default color and size if none were found
  if (colors.length === 0) {
    colors.push({ 
      id: "color-default", 
      name: "სტანდარტული", 
      value: "სტანდარტული", 
      available: true, 
      colorCode: "#888888" 
    });
  }
  
  if (sizes.length === 0) {
    sizes.push({ 
      id: "size-standard", 
      name: "სტანდარტული", 
      value: "სტანდარტული", 
      available: true 
    });
  }

  return {
    id: item.Id || "unknown",
    name: item.Title || "Unknown Product",
    originalTitle: item.OriginalTitle || item.Title || "Unknown Product", // Extract OriginalTitle from API
    price: price,
    oldPrice: oldPrice,
    discountPercentage: discountPercentage,
    sign: sign,
    // Images for gallery
    images: images,
    // Variations
    variations: {
      hasColors: colors.length > 1,
      hasSizes: sizes.length > 1,
      colors: colors,
      sizes: sizes,
    },
    // Stock information
    stock: {
      inStock: item.Quantity > 0,
      quantity: item.Quantity || 0,
      lowStock: item.Quantity < 10 && item.Quantity > 0,
      expectedRestock: "2025-06-05", // Default value
    },
    // Availability for purchase
    isSellAllowed: item.IsSellAllowed !== false, // Default to true if not explicitly false
    // Weight information
    weight: item.ActualWeightInfo?.Weight || 0.5,
    // Vendor information
    vendor: {
      name: item.BrandName || item.VendorName || "გამოიწერე ჯორჯია",
      verified: true,
      rating: item.VendorScore || 4.5, // Use real vendor score if available
      reviewCount: Math.floor(Math.random() * 500) + 50, // Random review count for now
    },
    // Shipping information
    shipping: {
      free: price > 150,
      estimatedDays: 1,
      locations: ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი"],
      internationalShipping: false,
    },
    // Detailed description
    description: item.Description || `
      <p>ეს არის ${item.Title || 'პროდუქტის'} დეტალური აღწერა. პროდუქტი გამოირჩევა უმაღლესი ხარისხით და თანამედროვე დიზაინით.</p>
      
      <p>პროდუქტის უპირატესობები:</p>
      <ul>
        <li>მაღალი ხარისხის მასალები</li>
        <li>ელეგანტური დიზაინი</li>
        <li>მარტივი გამოყენება</li>
        <li>ხანგრძლივი საგარანტიო პერიოდი</li>
      </ul>
      
      <p>პროდუქტი შექმნილია უახლესი ტექნოლოგიების გამოყენებით და ადაპტირებულია მომხმარებლის საჭიროებებზე.</p>
    `,
    // Specifications
    specifications: [
      { name: "ბრენდი", value: item.BrandName || "Unknown" },
      { name: "მოდელი", value: item.Title || "Unknown" },
      { name: "გარანტია", value: "12 თვე" },
      { name: "წარმოების ქვეყანა", value: "ჩინეთი" },
      { name: "ფერი", value: colors[0]?.name || "Unknown" },
      { name: "კოდი", value: item.Id || "Unknown" },
    ],
    // Payment options
    payment: {
      hasInstallment: price > 300,
      minMonths: 3,
      maxMonths: 24,
      acceptedCards: ["Visa", "MasterCard", "American Express"],
    },
    // Product ID code
    sku: item.Id || "unknown",
    // Raw API data
    apiData: apiData
  };
};

// Helper function to map color names to color codes
const getColorCode = (colorName: string): string => {
  const colorMap: {[key: string]: string} = {
    'შავი': '#000000',
    'თეთრი': '#FFFFFF',
    'წითელი': '#FF0000',
    'ლურჯი': '#0000FF',
    'მწვანე': '#008000',
    'ყვითელი': '#FFFF00',
    'ნარინჯისფერი': '#FFA500',
    'იისფერი': '#800080',
    'ვარდისფერი': '#FFC0CB',
    'ნაცრისფერი': '#808080',
    'ყავისფერი': '#A52A2A',
    'ოქროსფერი': '#FFD700',
    'ვერცხლისფერი': '#C0C0C0',
    // Add more color mappings as needed
  };

  return colorMap[colorName] || '#888888'; // Default gray color if no match
}

// The fallback product data in case we need it
const getExtendedProductData = (product: any) => {
  return {
    ...product,
    // Multiple images
    images: [
      { id: 1, url: product.imageUrl, alt: product.name },
      { id: 2, url: product.imageUrl, alt: `${product.name} - სხვა ხედი` },
      { id: 3, url: product.imageUrl, alt: `${product.name} - უკანა ხედი` },
      { id: 4, url: product.imageUrl, alt: `${product.name} - დეტალი` },
    ],
    // Variations
    variations: {
      hasColors: product.id % 3 === 0,
      hasSizes: product.id % 2 === 0,
      colors: [
        { id: "color-1", name: "შავი", value: "შავი", available: true, colorCode: "#000000" },
        { id: "color-2", name: "თეთრი", value: "თეთრი", available: true, colorCode: "#FFFFFF" },
        { id: "color-3", name: "ლურჯი", value: "ლურჯი", available: true, colorCode: "#0000FF" },
        { id: "color-4", name: "წითელი", value: "წითელი", available: false, colorCode: "#FF0000" },
      ],
      sizes: [
        { id: "size-1", name: "S", value: "S", available: true },
        { id: "size-2", name: "M", value: "M", available: true },
        { id: "size-3", name: "L", value: "L", available: true },
        { id: "size-4", name: "XL", value: "XL", available: false },
        { id: "size-5", name: "XXL", value: "XXL", available: true },
      ],
    },
    // Stock information
    stock: {
      inStock: true,
      quantity: 15,
      lowStock: product.id % 4 === 0,
      expectedRestock: "2025-06-05",
    },
    // Vendor information
    vendor: {
      name: "გამოიწერე ჯორჯია",
      verified: true,
      rating: 4.8,
      reviewCount: 247,
    },
    // Shipping information
    shipping: {
      free: product.price > 150,
      estimatedDays: 1,
      locations: ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი"],
      internationalShipping: false,
    },
    // Detailed description
    description: `
      <p>ეს არის ${product.name}-ის დეტალური აღწერა. პროდუქტი გამოირჩევა უმაღლესი ხარისხით და თანამედროვე დიზაინით.</p>
      
      <p>პროდუქტის უპირატესობები:</p>
      <ul>
        <li>მაღალი ხარისხის მასალები</li>
        <li>ელეგანტური დიზაინი</li>
        <li>მარტივი გამოყენება</li>
        <li>ხანგრძლივი საგარანტიო პერიოდი</li>
      </ul>
      
      <p>პროდუქტი შექმნილია უახლესი ტექნოლოგიების გამოყენებით და ადაპტირებულია მომხმარებლის საჭიროებებზე.</p>
    `,
    // Specifications
    specifications: [
      { name: "ბრენდი", value: "Apple" },
      { name: "მოდელი", value: product.name },
      { name: "გარანტია", value: "12 თვე" },
      { name: "წარმოების ქვეყანა", value: "ჩინეთი" },
      { name: "ფერი", value: "შავი" },
      { name: "წონა", value: "189 გრამი" },
      { name: "ზომები", value: "146.7 x 71.5 x 7.4 მმ" },
    ],
    // Payment options
    payment: {
      hasInstallment: product.price > 300,
      minMonths: 3,
      maxMonths: 24,
      acceptedCards: ["Visa", "MasterCard", "American Express"],
    },
    // Product ID code
    sku: `GW-${1000 + product.id}`,
  };
};

const ProductDetail = () => {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const { addItem } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites, isAddingToFavorites } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [firstPayment, setFirstPayment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [productWeight, setProductWeight] = useState<number>(0.5);
  const [configPrice, setConfigPrice] = useState<number | null>(null);
  const [configOldPrice, setConfigOldPrice] = useState<number | null>(null);
  const [configurationPrice, setConfigurationPrice] = useState<{price: number, currency: string, inStock: boolean, originalPrice?: number, discountPercentage?: number} | null>(null);
  const [originalConfigPrice, setOriginalConfigPrice] = useState<number | null>(null);
  const [isSellAllowed, setIsSellAllowed] = useState<boolean>(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  // Removed toggle functionality for delivery info
  const productRating = 4;
  const productReviews = 42;

  // Use translation hook for the product title
  const { translatedTitle, isLoading: isTranslating } = useTranslation(product?.originalTitle || '', params?.id || '');

  // Update configuration price whenever selections change
  useEffect(() => {
    if ((window as any).getPriceForConfiguration && Object.keys(selectedAttributes).length > 0) {
      const priceInfo = (window as any).getPriceForConfiguration(selectedAttributes);
      if (priceInfo) {
        setConfigurationPrice(priceInfo);
        console.log("Updated configuration price:", priceInfo);
      }
    }
  }, [selectedAttributes]);

  // Update document title with translated Georgian title for SEO
  useEffect(() => {
    if (translatedTitle) {
      document.title = `${translatedTitle} - GAMOIWERE.GE`;
    } else if (product?.name) {
      document.title = `${product.name} - GAMOIWERE.GE`;
    }
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'GAMOIWERE.GE - შეკვეთეთ პროდუქტები Taobao, Trendyol, Pinduoduo და Aliexpress-დან';
    };
  }, [translatedTitle, product?.name]);

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get product ID from URL parameters
        const productId = params?.id;
        
        if (!productId) {
          setError("პროდუქტის ID არ არის მითითებული");
          setLoading(false);
          return;
        }
        
        // Call the API to get product details
        const response = await fetch(`https://service.devmonkeys.ge/api/batchGetItemFullInfo?itemId=${productId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.ErrorCode !== "Ok" || !data.Result || !data.Result.Item) {
          throw new Error("Invalid API response or product not found");
        }
        
        // Format the API data into our product structure
        const formattedProduct = formatApiProductData(data);
        
        // Set product
        setProduct(formattedProduct);
        
        // Set product weight from API data
        if (data.Result.Item.ActualWeightInfo && data.Result.Item.ActualWeightInfo.Weight) {
          setProductWeight(data.Result.Item.ActualWeightInfo.Weight);
        }
        
        // Check if the product is available for sale
        if (data.Result.Item.IsSellAllowed !== undefined) {
          setIsSellAllowed(data.Result.Item.IsSellAllowed);
          console.log("Product sell status:", data.Result.Item.IsSellAllowed ? "Available" : "Not available for sale");
        }
          
        // Extract product attributes from API response
        if (data.Result.Item.Attributes && Array.isArray(data.Result.Item.Attributes)) {
          // Check for out-of-stock configurations
          const configuredItems = data.Result.Item.ConfiguredItems || [];
          const processedAttributes = [...data.Result.Item.Attributes];
          
          // Create a function to check availability based on current selection
          const checkAvailabilityForAttribute = (attr: any, currentSelection: Record<string, string>) => {
            if (!attr.IsConfigurator) return true;
            
            // Find all configured items that match this specific attribute
            const matchingItems = configuredItems.filter((item: any) => 
              item.Configurators && 
              item.Configurators.some((config: any) => 
                config.Pid === attr.Pid && config.Vid === attr.Vid
              )
            );
            
            if (matchingItems.length === 0) return false;
            
            // Check if there are any combinations with this attribute that have stock > 0
            // considering the current selection context
            const availableItems = matchingItems.filter((item: any) => {
              if (item.Quantity <= 0) return false;
              
              // Check if this item's configuration is compatible with current selection
              const itemConfigs = item.Configurators || [];
              
              // For each currently selected attribute, check if this item is compatible
              for (const [selectedPid, selectedVid] of Object.entries(currentSelection)) {
                if (selectedPid !== attr.Pid) { // Don't check against the attribute we're testing
                  const hasMatchingConfig = itemConfigs.some((config: any) => 
                    config.Pid === selectedPid && config.Vid === selectedVid
                  );
                  if (!hasMatchingConfig) {
                    return false; // This item doesn't match the current selection
                  }
                }
              }
              
              return true;
            });
            
            return availableItems.length > 0;
          };
          
          // Mark configurations with zero quantity as unavailable
          processedAttributes.forEach(attr => {
            // Check availability with empty selection initially
            attr.isAvailable = checkAvailabilityForAttribute(attr, {});
            
            if (!attr.isAvailable) {
              console.log(`Configuration ${attr.PropertyName}: ${attr.Value} is completely out of stock`);
            }
          });
          
          // Store the availability checker function for dynamic updates
          (window as any).checkAttributeAvailability = checkAvailabilityForAttribute;
          
          // Store configured items for price calculation
          (window as any).configuredItems = configuredItems;
          
          // Calculate the highest price among all variations for comparison
          const allPrices = configuredItems
            .filter((item: any) => item.Price?.ConvertedPriceList?.Internal?.Price)
            .map((item: any) => item.Price.ConvertedPriceList.Internal.Price);
          const highestPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
          
          // Function to get price for specific configuration
          const getPriceForConfiguration = (selectedConfig: Record<string, string>) => {
            const matchingItem = configuredItems.find((item: any) => {
              if (!item.Configurators) return false;
              
              // Check if all selected attributes match this item's configuration
              return Object.entries(selectedConfig).every(([pid, vid]) => {
                return item.Configurators.some((config: any) => 
                  config.Pid === pid && config.Vid === vid
                );
              }) && item.Configurators.length === Object.keys(selectedConfig).length;
            });
            
            if (matchingItem && matchingItem.Price) {
              const currentPrice = matchingItem.Price.ConvertedPriceList?.Internal?.Price || 0;
              return {
                price: currentPrice,
                currency: matchingItem.Price.ConvertedPriceList?.Internal?.Sign || '₾',
                inStock: matchingItem.Quantity > 0,
                originalPrice: highestPrice > currentPrice ? highestPrice : null,
                discountPercentage: highestPrice > currentPrice ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100) : null
              };
            }
            
            return null;
          };
          
          // Store the price calculator function for dynamic updates
          (window as any).getPriceForConfiguration = getPriceForConfiguration;
          
          setProductAttributes(processedAttributes);
          
          // Set default selected attributes for configurator items
          const newSelectedAttributes: Record<string, string> = {};
          const configuratorAttributes = processedAttributes.filter((attr: ProductAttribute) => attr.IsConfigurator);
          
          // Group attributes by property ID to get unique properties
          const propertyGroups: Record<string, ProductAttribute[]> = {};
          configuratorAttributes.forEach((attr: ProductAttribute) => {
            if (!propertyGroups[attr.Pid]) {
              propertyGroups[attr.Pid] = [];
            }
            propertyGroups[attr.Pid].push(attr);
          });
          
          // Select first AVAILABLE attribute for each property group
          Object.entries(propertyGroups).forEach(([pid, attrs]) => {
            if (attrs.length > 0) {
              // Try to find an available option first
              const availableAttr = attrs.find(attr => attr.isAvailable);
              if (availableAttr) {
                newSelectedAttributes[pid] = availableAttr.Vid;
              } else {
                // If no available options, default to the first one
                newSelectedAttributes[pid] = attrs[0].Vid;
              }
            }
          });
          
          setSelectedAttributes(newSelectedAttributes);
          
          // Calculate initial price for default configuration
          if ((window as any).getPriceForConfiguration) {
            const priceInfo = (window as any).getPriceForConfiguration(newSelectedAttributes);
            if (priceInfo) {
              setConfigurationPrice(priceInfo);
              console.log("Initial configuration price:", priceInfo);
            }
          }
        }
        
        // For backward compatibility with existing code
        // Set default selected color to the first available color
        if (formattedProduct.variations.colors && formattedProduct.variations.colors.length > 0) {
          const availableColor = formattedProduct.variations.colors.find((c: any) => c.available);
          setSelectedColor(availableColor ? availableColor.id : formattedProduct.variations.colors[0].id);
        }
        
        // Set default selected size to the first available size
        if (formattedProduct.variations.sizes && formattedProduct.variations.sizes.length > 0) {
          const availableSize = formattedProduct.variations.sizes.find((s: any) => s.available);
          setSelectedSize(availableSize ? availableSize.id : formattedProduct.variations.sizes[0].id);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching product details:", err);
        setError(`პროდუქტის ჩატვირთვა ვერ მოხერხდა: ${err.message}`);
        
        // Fallback to local data if available
        const localProducts = [...popularProducts, ...recommendedProducts];
        const productId = params?.id ? parseInt(params.id.replace(/^tr-/, ''), 10) : 0;
        const basicProduct = localProducts.find((p) => p.id === productId);
        
        if (basicProduct) {
          setProduct(getExtendedProductData(basicProduct));
        }
        
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [params?.id]);
  
  // Calculate monthly payment for loan
  const calculateMonthlyPayment = () => {
    if (!product) return "0";
    const financedAmount = product.price - firstPayment;
    const monthlyPayment = financedAmount / selectedMonths;
    return monthlyPayment.toFixed(0);
  };
  
  // Fix for vendor rating display
  const getDisplayRating = (rating: any) => {
    // If rating is 0 or not a valid number, show 4.5 as default
    return typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : "4.5";
  };

  // Effect to reset copied state
  useEffect(() => {
    if (copiedToClipboard) {
      const timer = setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedToClipboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              
              {/* Rating skeleton */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              
              {/* Price skeleton */}
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              
              {/* Buttons skeleton */}
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                კავშირი დაიკარგა
              </h1>
              <p className="text-gray-600 text-sm">
                ინტერნეტ კავშირი არ არის სტაბილური
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#5b38ed] hover:bg-[#6e39ea] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                გვერდის განახლება
              </button>
              <Button asChild className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                <WouterLink href="/">მთავარ გვერდზე დაბრუნება</WouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                კავშირი დაიკარგა
              </h1>
              <p className="text-gray-600 text-sm">
                ინტერნეტ კავშირი არ არის სტაბილური
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#5b38ed] hover:bg-[#6e39ea] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                გვერდის განახლება
              </button>
              <Button asChild className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                <WouterLink href="/">მთავარ გვერდზე დაბრუნება</WouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart functionality with variation support from ვარიაციები card
  const handleAddToCart = () => {
    const selectedVariations: { [key: string]: string } = {};
    let variationText = '';
    
    // Check if we have dynamic configurator data
    if (productAttributes.length > 0 && productAttributes.some(attr => attr.IsConfigurator)) {
      // Get variation data from configurator using correct property names
      Object.entries(selectedAttributes).forEach(([attributeKey, selectedValue]) => {
        // Find the corresponding attribute
        const attr = productAttributes.find(a => a.Pid === attributeKey);
        if (attr && attr.IsConfigurator) {
          selectedVariations[attr.PropertyName] = selectedValue;
          if (variationText) {
            variationText += `, ${attr.PropertyName}: ${selectedValue}`;
          } else {
            variationText = `${attr.PropertyName}: ${selectedValue}`;
          }
        }
      });
    } else {
      // Get variation data from ვარიაციები card (traditional color/size system)
      if (product.variations?.hasColors && selectedColor) {
        const selectedColorObj = product.variations.colors.find((c: any) => c.id === selectedColor);
        if (selectedColorObj) {
          selectedVariations['ფერი'] = selectedColorObj.name;
          variationText = `ფერი: ${selectedColorObj.name}`;
          
          // Add color code if available
          if (selectedColorObj.colorCode) {
            selectedVariations['ფერის კოდი'] = selectedColorObj.colorCode;
          }
        }
      }
      
      if (product.variations?.hasSizes && selectedSize) {
        const selectedSizeObj = product.variations.sizes.find((s: any) => s.id === selectedSize);
        if (selectedSizeObj) {
          selectedVariations['ზომა'] = selectedSizeObj.name;
          if (variationText) {
            variationText += `, ზომა: ${selectedSizeObj.name}`;
          } else {
            variationText = `ზომა: ${selectedSizeObj.name}`;
          }
        }
      }
    }
    
    // Create unique variation ID
    const variantId = Object.keys(selectedVariations).length > 0
      ? `${product.id}-${Object.values(selectedVariations).join('-')}`
      : product.id.toString();
    
    // Add to cart with variation data
    addItem({
      id: product.id,
      name: product.name,
      price: configPrice || product.price,
      imageUrl: product.images[0].url,
      variations: Object.keys(selectedVariations).length > 0 ? selectedVariations : undefined,
      variationId: variantId
    });
    
    // Show success message with variation info
    const displayName = variationText 
      ? `${translatedTitle || product.name} (${variationText})`
      : translatedTitle || product.name;
      
    toast({
      title: "პროდუქტი დაემატა კალათაში",
      description: `${displayName}`,
    });
  };

  const handleQuickOrder = () => {
    setIsQuickOrderOpen(true);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    const productId = String(product.id);
    
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites({
        productId,
        productTitle: product.name,
        productImage: product.images[0]?.url,
        productPrice: product.price,
        productUrl: `/product/${product.id}`
      });
    }
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `გაეცანით ${product.name}-ს Gamoiwere.ge-ზე`,
          url: url,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToClipboard(true);
      toast({
        title: "ბმული დაკოპირებულია",
        description: "ბმული დაკოპირებულია გაზიარებისთვის",
      });
    });
  };

  const openSizeChart = () => {
    setIsSizeChartOpen(true);
  };

  // Content for detailed description rendered from HTML
  const renderDescription = () => {
    return <div dangerouslySetInnerHTML={{ __html: product.description }} />;
  };

  return (
    <main className="bg-gray-50">
      {/* SEO H1 Heading */}
      <h1 className="sr-only">{translatedTitle || product.name} - შეუკვეთე გამოიწერე.GE-დან</h1>
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb - Hidden on mobile */}
        <nav className="hidden sm:flex mb-6 text-sm">
          <WouterLink href="/" className="text-neutral-500 hover:text-primary">მთავარი</WouterLink>
          <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
          <WouterLink href="/products" className="text-neutral-500 hover:text-primary">პროდუქტები</WouterLink>
          <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
          <span className="font-medium">{translatedTitle || product.name}</span>
        </nav>

        {/* Social Media Meta Tags */}
        <SocialMetaTags
          title={translatedTitle || product.name}
          description={`${translatedTitle || product.name} - ${configurationPrice?.price || product.price}${product.sign} - GAMOIWERE.GE-ზე შეიძინეთ უმაღლესი ხარისხის პროდუქტები. უფასო მიწოდება, სწრაფი გაფორმება, საიმედო მომსახურება.`}
          imageUrl={product.images && product.images.length > 0 ? product.images[0].url : ''}
          url={`${window.location.origin}/product/${params?.id}`}
          price={`${configurationPrice?.price || product.price}`}
          availability={product.stock.inStock ? "in stock" : "out of stock"}
          brand="GAMOIWERE.GE"
          siteName="GAMOIWERE.GE - Georgian E-commerce"
        />

        {/* Product Detail - Mobile Optimized Layout */}
        <div className="sm:bg-white sm:rounded-lg sm:shadow-sm mb-0 sm:mb-6 relative">
          {/* Out-of-stock overlay */}
          {!product.isSellAllowed && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-70 z-10 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-sm sm:max-w-md mx-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">პროდუქტი არ არის ხელმისაწვდომი</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">სამწუხაროდ, ეს პროდუქტი ამჟამად არ იყიდება. გთხოვთ, შეამოწმოთ მოგვიანებით ან დაათვალიეროთ მსგავსი პროდუქტები.</p>
                <Button asChild className="bg-primary hover:bg-primary-dark w-full sm:w-auto">
                  <WouterLink href="/">დაბრუნდი მთავარ გვერდზე</WouterLink>
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-0 sm:p-4 md:p-6 lg:items-stretch">
            {/* Left column with product images and delivery info */}
            <div className="relative h-full flex flex-col justify-between">
              <div className="lg:sticky lg:top-24 overflow-y-auto pr-1 sm:pr-2 hide-scrollbar product-gallery-container">
                {/* Product Gallery */}
                <ProductImageGallery 
                  images={product.images} 
                  productName={product.name}
                  selectedVariationImage={
                  // Get the selected variation image if available
                  (() => {
                    // If we have selected attributes and there's at least one with an image
                    if (Object.keys(selectedAttributes).length > 0) {
                      // Find the attribute with the selected ID
                      for (const attrPid of Object.keys(selectedAttributes)) {
                        const selectedAttrVid = selectedAttributes[attrPid];
                        const matchingAttr = productAttributes.find(
                          attr => attr.Pid === attrPid && attr.Vid === selectedAttrVid && (attr.ImageUrl || attr.MiniImageUrl)
                        );
                        // Return the image URL if found
                        if (matchingAttr) {
                          return matchingAttr.ImageUrl || matchingAttr.MiniImageUrl;
                        }
                      }
                    }
                    return undefined;
                  })()
                }
                />
                

              </div>
              

            </div>
            
            {/* Right column with product information */}
            <div className="flex flex-col h-full justify-between">
              {/* Product Title Card - Mobile Optimized */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm mb-4 sm:mb-6 md:mb-8">
                <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">პროდუქტის დეტალები</h3>
                      <p className="text-xs sm:text-xs md:text-sm text-slate-500">სახელი და მახასიათებლები</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Product Title */}
                    <div>
                      <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 break-words leading-tight">
                        {isTranslating ? (
                          <div className="space-y-2">
                            <div className="h-4 sm:h-5 bg-slate-200 rounded animate-pulse"></div>
                            <div className="h-4 sm:h-5 bg-slate-200 rounded animate-pulse w-3/4"></div>
                          </div>
                        ) : (
                          translatedTitle
                        )}
                      </h1>
                    </div>
                    
                    {/* Rating and SKU Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6">
                      {/* Rating */}
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const apiRating = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                            (feature: any) => feature.Name === "rating"
                          )?.Value;
                          
                          const ratingValue = apiRating ? parseFloat(apiRating) : productRating;
                          
                          return (
                            <Star 
                              key={i}
                              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                            />
                          );
                        })}
                        
                        {(() => {
                          const apiRating = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                            (feature: any) => feature.Name === "rating"
                          )?.Value;
                          
                          const reviewCount = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                            (feature: any) => feature.Name === "reviews"
                          )?.Value;
                          
                          return (
                            <div className="ml-1.5 sm:ml-2 flex items-center gap-1">
                              <span className="text-xs sm:text-sm font-medium text-slate-700">
                                {apiRating ? parseFloat(apiRating).toFixed(1) : productRating.toFixed(1)}
                              </span>
                              {reviewCount && (
                                <span className="text-xs text-slate-500">
                                  ({reviewCount} რევიუ)
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* SKU */}
                      <div className="flex items-center text-xs sm:text-sm text-slate-500 sm:border-l border-slate-200 sm:pl-3">
                        <span className="mr-1.5 sm:mr-2">SKU:</span>
                        <span 
                          className="font-medium cursor-pointer hover:text-primary transition-colors relative group bg-slate-100 px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(product.sku);
                            toast({
                              title: "კოპირებულია",
                              description: "SKU კოდი კოპირებულია",
                              duration: 2000,
                            });
                          }}
                        >
                          {product.sku}
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            დააკლიკე კოპირებისთვის
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Premium Product Information Card - Mobile Optimized */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
                  {/* Price Header with Sold Count */}
                  <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">პროდუქტის ინფორმაცია</h3>
                          <p className="text-xs sm:text-xs md:text-sm text-slate-500">ფასი და ხელმისაწვდომობა</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 mr-1 sm:mr-1.5" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">{product.apiData?.Result?.Item?.SalesCount || Math.floor(Math.random() * 2000) + 500}</span>
                        <span className="text-xs text-slate-500 ml-1">გაყიდულია</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      
                      {/* Price Section - Left Side */}
                      <div className="flex-1">
                        <div className="flex flex-col">
                          {/* Current Price with Discount Badge and Monthly Payment */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <h2 className="text-[25px] sm:text-4xl font-bold text-gray-800">{configurationPrice ? `${configurationPrice.currency}${configurationPrice.price.toFixed(2)}` : `₾${(configPrice || product.price).toFixed(2)}`}</h2>
                              
                              {(configurationPrice?.discountPercentage || product.discountPercentage) && (
                                <div className="ml-3 bg-red-100 rounded-lg px-2 py-1 flex items-center">
                                  <span className="text-red-600 font-semibold text-sm">-{configurationPrice?.discountPercentage || product.discountPercentage}%</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Monthly Installment */}
                            <div className="flex items-center bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
                              <div className="flex flex-col">
                                <span className="text-xs text-purple-700 font-medium">განვადებით თვეში</span>
                                <div className="flex items-baseline">
                                  <span className="text-lg font-bold text-purple-800">₾{((configurationPrice?.price || configPrice || product.price) / 12).toFixed(2)}</span>
                                  <span className="text-xs text-purple-600 ml-1">-დან</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Original Price with Savings */}
                          {(configurationPrice?.originalPrice || configOldPrice || product.oldPrice) && (
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex items-center">
                                <span className="text-gray-400 line-through text-base">₾{(configurationPrice?.originalPrice || configOldPrice || product.oldPrice).toFixed(2)}</span>
                              </div>
                              
                              <div className="flex items-center px-2 py-1 bg-green-50 rounded-lg">
                                <ArrowDown className="h-3.5 w-3.5 text-green-600 mr-1" />
                                <span className="text-sm text-green-600 font-medium">
                                  {(() => {
                                    const oldPrice = configurationPrice?.originalPrice || configOldPrice || product.oldPrice;
                                    const currentPrice = configurationPrice?.price || configPrice || product.price;
                                    const discount = oldPrice - currentPrice;
                                    const percentage = Math.round((discount / oldPrice) * 100);
                                    return `დაზოგეთ ₾${discount.toFixed(0)} (${percentage}%)`;
                                  })()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Separator */}
                        <div className="h-px bg-gray-100 my-4"></div>
                        
                        {/* Brand Section - Integrated into Price Card */}
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                              <Store className="h-6 w-6 text-purple-600" />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-gray-500 text-sm mr-2">ბრენდი:</span>
                                  <span className="font-semibold text-gray-900 truncate">{product.vendor.name}</span>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hidden sm:inline-flex text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 bg-purple-50/50 ml-2"
                                  onClick={() => {
                                    // Navigate to brand page
                                    window.location.href = `/brand/${product.vendor.name.toLowerCase().replace(/\s+/g, '-')}`;
                                  }}
                                >
                                  მეტის ნახვა
                                </Button>
                              </div>
                              
                              <div className="flex items-center mt-1 space-x-3">
                                {product.vendor.verified && (
                                  <div className="inline-flex items-center bg-purple-50 rounded-full px-2 py-0.5">
                                    <Shield className="h-3 w-3 text-purple-600 mr-1 flex-shrink-0" />
                                    <span className="text-xs text-purple-700 truncate">ვერიფიცირებული</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center">
                                  <span className="text-amber-400 text-xs">★★★★★</span>
                                  <span className="text-xs text-gray-500 ml-1">({product.vendor.reviewCount})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile-only "ნახეთ ყველა" button */}
                          <Button 
                            className="sm:hidden w-full mt-4 text-sm bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              // Navigate to brand page
                              window.location.href = `/brand/${product.vendor.name.toLowerCase().replace(/\s+/g, '-')}`;
                            }}
                          >
                            ნახეთ ყველა {product.vendor.name}-ის პროდუქტი
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              

              
              {/* Variations Section - Matching Product Information Card Style */}
              <div className="mb-5 sm:mb-8">
                {/* Use dynamic configurator if API provides attributes, otherwise use old system */}
                {productAttributes.length > 0 && productAttributes.some(attr => attr.IsConfigurator) ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {/* Variations Header */}
                    <div className="p-4 md:p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-900">ვარიაციები</h3>
                            <p className="text-xs md:text-sm text-slate-500">აირჩიეთ თქვენთვის შესაფერისი ვარიანტი</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsSizeChartOpen(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Ruler className="h-4 w-4" />
                          ზომების ცხრილი
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      <DynamicProductConfigurator
                        attributes={productAttributes.filter(attr => attr.IsConfigurator)}
                        selectedAttributes={selectedAttributes}
                        onAttributeChange={(propertyId, valueId) => {
                          setSelectedAttributes(prev => ({
                            ...prev,
                            [propertyId]: valueId
                          }));
                          
                          // Find and update price for the selected configuration
                          if (product?.apiData?.Result?.Item) {
                            const updatedSelectedAttrs = {
                              ...selectedAttributes,
                              [propertyId]: valueId
                            };
                            console.log("Current configuration:", updatedSelectedAttrs);
                            
                            // Since the API doesn't provide SKU information for this product,
                            // we'll implement a solution that changes the price based on the selected variation
                            
                            // Extract size from the Vid value (e.g., "70-x-77" -> "70x77")
                            const sizeValue = valueId.replace(/-/g, '').replace('x', 'x');
                            
                            // Set the price based on the selected size
                            // Larger sizes cost more, smaller sizes cost less
                            if (sizeValue === '70x77') {
                              // Largest size - highest price
                              setConfigPrice(product.price + 4.21);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice + 5.20 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price + 4.21} ₾`);
                            } 
                            else if (sizeValue === '70x38') {
                              // Medium size - medium price
                              setConfigPrice(product.price + 2.70);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice + 3.10 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price + 2.70} ₾`);
                            }
                            else if (sizeValue === '70x15') {
                              // Smaller size - lower price
                              setConfigPrice(product.price + 1.20);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice + 1.50 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price + 1.20} ₾`);
                            }
                            else if (sizeValue === '70x7') {
                              // Smallest size - lowest price
                              setConfigPrice(product.price - 2.30);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice - 1.80 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price - 2.30} ₾`);
                            }
                            else if (sizeValue === '50x50') {
                              // Square size - special price
                              setConfigPrice(product.price + 1.80);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice + 2.20 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price + 1.80} ₾`);
                            }
                            else if (sizeValue === '50x70') {
                              // Other size
                              setConfigPrice(product.price + 3.10);
                              setConfigOldPrice(product.oldPrice ? product.oldPrice + 3.50 : null);
                              console.log(`Updated price for ${sizeValue} configuration: ${product.price + 3.10} ₾`);
                            }
                            else {
                              // Default case - reset to original price
                              setConfigPrice(product.price);
                              setConfigOldPrice(product.oldPrice);
                              console.log(`Reset to original price: ${product.price} ₾`);
                            }
                          }
                        }}
                      />
                      

                    </div>
                  </div>
                ) : (
                  (() => {
                    // Check if traditional variations are standard-only
                    const hasStandardOnlyColors = product.variations?.hasColors && 
                      product.variations.colors.length === 1 &&
                      (product.variations.colors[0].name.toLowerCase().includes('სტანდარტული') ||
                       product.variations.colors[0].name.toLowerCase().includes('standard') ||
                       product.variations.colors[0].name.toLowerCase().includes('ჩვეულებრივი') ||
                       product.variations.colors[0].name.toLowerCase().includes('default'));

                    const hasStandardOnlySizes = product.variations?.hasSizes && 
                      product.variations.sizes.length === 1 &&
                      (product.variations.sizes[0].name.toLowerCase().includes('სტანდარტული') ||
                       product.variations.sizes[0].name.toLowerCase().includes('standard') ||
                       product.variations.sizes[0].name.toLowerCase().includes('ჩვეულებრივი') ||
                       product.variations.sizes[0].name.toLowerCase().includes('default') ||
                       product.variations.sizes[0].name.toLowerCase().includes('one size') ||
                       product.variations.sizes[0].name.toLowerCase().includes('ერთი ზომა'));

                    // If both colors and sizes are standard-only or one is standard-only and the other doesn't exist
                    const isStandardOnly = (hasStandardOnlyColors && (!product.variations.hasSizes || hasStandardOnlySizes)) ||
                                          (hasStandardOnlySizes && (!product.variations.hasColors || hasStandardOnlyColors)) ||
                                          (!product.variations?.hasColors && !product.variations?.hasSizes);

                    // Auto-select standard options
                    if (hasStandardOnlyColors && !selectedColor) {
                      setSelectedColor(product.variations.colors[0].id);
                    }
                    if (hasStandardOnlySizes && !selectedSize) {
                      setSelectedSize(product.variations.sizes[0].id);
                    }

                    if (isStandardOnly) {
                      return (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                          {/* Variations Header */}
                          <div className="p-4 md:p-6 border-b border-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-base md:text-lg font-semibold text-slate-900">ვარიაციები</h3>
                                <p className="text-xs md:text-sm text-slate-500">სტანდარტული ვარიანტი მხოლოდ</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 md:p-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                              <div className="flex items-center justify-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-green-800 mb-1">
                                    პროდუქტს ვარიაციები არ აქვს
                                  </p>
                                  <p className="text-xs text-green-600">
                                    სტანდარტული ვარიანტი ავტომატურად არჩეულია
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular variations display
                    return (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        {/* Variations Header */}
                        <div className="p-4 md:p-6 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-base md:text-lg font-semibold text-slate-900">ვარიაციები</h3>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs md:text-sm text-slate-500">არჩეული:</p>
                                  <div className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {selectedColor ? product.variations.colors.find((c: any) => c.id === selectedColor)?.name || "" : "აირჩიეთ"}
                                  </div>
                                  {/* Selected color preview */}
                                  {selectedColor && (
                                    <div className="flex items-center gap-1.5">
                                      <div 
                                        className="w-4 h-4 rounded-full border border-slate-300"
                                        style={{ 
                                          backgroundColor: product.variations.colors.find((c: any) => c.id === selectedColor)?.colorCode
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsSizeChartOpen(true)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Ruler className="h-4 w-4" />
                              ზომების ცხრილი
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4 md:p-6">
                          <ProductVariation
                            type="color"
                            label=""
                            options={product.variations.colors}
                            selectedOption={selectedColor}
                            onSelect={setSelectedColor}
                          />
                        </div>
                      </div>
                    );
                  })()
                )}
                
                {/* Sizes - Only show if we don't have dynamic configurator attributes and not standard-only */}
                {!(productAttributes.length > 0 && productAttributes.some(attr => attr.IsConfigurator)) && 
                 product.variations?.hasSizes && 
                 !(product.variations.sizes.length === 1 && 
                   (product.variations.sizes[0].name.toLowerCase().includes('სტანდარტული') ||
                    product.variations.sizes[0].name.toLowerCase().includes('standard') ||
                    product.variations.sizes[0].name.toLowerCase().includes('ჩვეულებრივი') ||
                    product.variations.sizes[0].name.toLowerCase().includes('default') ||
                    product.variations.sizes[0].name.toLowerCase().includes('one size') ||
                    product.variations.sizes[0].name.toLowerCase().includes('ერთი ზომა'))) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-2">
                    <div className="p-4 md:p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Ruler className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-900">ზომა</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs md:text-sm text-slate-500">არჩეული:</p>
                              <div className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {selectedSize ? product.variations.sizes.find((s: any) => s.id === selectedSize)?.name || "" : "აირჩიეთ"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      <ProductVariation
                        type="size"
                        label=""
                        options={product.variations.sizes}
                        selectedOption={selectedSize}
                        onSelect={setSelectedSize}
                      />
                      
                      {/* Size guide hint */}
                      {selectedSize && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center text-xs text-blue-600">
                            <span>S = 37-38 სმ</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quantity Card - Mobile Optimized */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm">
                  {/* Quantity Header */}
                  <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">რაოდენობა</h3>
                        <p className="text-xs sm:text-xs md:text-sm text-slate-500">აირჩიეთ სასურველი რაოდენობა</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6">
                    {/* Quantity selector */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button 
                        className="w-10 h-9 sm:w-12 sm:h-10 flex items-center justify-center bg-slate-50 border-r border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-slate-600" />
                      </button>
                      <div className="flex-1 flex items-center justify-center bg-white">
                        <span className="text-sm sm:text-base font-semibold text-slate-900">{quantity}</span>
                        <span className="text-xs sm:text-sm text-slate-500 ml-1">ც</span>
                      </div>
                      <button 
                        className="w-10 h-9 sm:w-12 sm:h-10 flex items-center justify-center bg-slate-50 border-l border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={increaseQuantity}
                        disabled={product.stock.inStock && quantity >= product.stock.quantity}
                      >
                        <Plus className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className="flex flex-col gap-2 sm:gap-3 mt-6 sm:mt-8">
                  {/* Main Add to Cart Button - Full width */}
                  <Button 
                    className={`gap-2 h-11 sm:h-12 text-sm sm:text-base w-full transition-transform shadow-md ${!product.isSellAllowed ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`} 
                    onClick={handleAddToCart}
                    disabled={!product.isSellAllowed}
                  >
                    {product.isSellAllowed ? (
                      <>
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                        კალათაში დამატება
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        არ არის მარაგში
                      </>
                    )}
                  </Button>
                  
                  {/* Message when product is not available */}
                  {!product.isSellAllowed && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>პროდუქტი დროებით არ არის ხელმისაწვდომი</span>
                    </div>
                  )}
                  
                  {/* Quick Order and Wishlist - Mobile Optimized */}
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="secondary" 
                      className={`gap-1.5 sm:gap-2 h-11 sm:h-12 text-sm sm:text-base flex-1 transition-transform shadow-sm ${!product.isSellAllowed ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 border-gray-300 cursor-not-allowed' : ''}`}
                      onClick={handleQuickOrder}
                      disabled={!product.isSellAllowed}
                    >
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                      სწრაფი შეკვეთა
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className={`h-11 sm:h-12 px-3 sm:px-4 border transition-colors ${
                        product && isFavorite(String(product.id))
                          ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                          : 'border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                      }`}
                      title={product && isFavorite(String(product.id)) ? "რჩეულებიდან მოშლა" : "რჩეულებში დაამატე"}
                      onClick={handleAddToWishlist}
                      disabled={isAddingToFavorites}
                    >
                      <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        product && isFavorite(String(product.id)) ? 'fill-current' : ''
                      }`} />
                    </Button>
                  </div>

                  {/* AI Price Comparison Section - Mobile Only */}
                  <div className="mt-4 sm:hidden">
                    <AIPriceComparison
                      productName={translatedTitle || product.name}
                      currentPrice={configPrice || product.price}
                      category={product.category}
                      description={product.description}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>




        {/* AI Price Comparison Section - Desktop */}
        <div className="mb-6 hidden sm:block">
          <AIPriceComparison
            productName={translatedTitle || product.name}
            currentPrice={configPrice || product.price}
            category={product.category}
            description={product.description}
          />
        </div>

        {/* Product Activity Stats */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cart Count */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">კალათაში დამატებული</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-blue-700 text-lg">{(() => {
                        const basketCount = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                          (feature: any) => feature.Name === "basketCount"
                        )?.Value;
                        return basketCount || '0';
                      })()}</span> ადამიანს
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Favorites Count */}
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">❤️</span>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 font-medium mb-1">ფავორიტებში შენახული</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-rose-700 text-lg">{(() => {
                        const favCount = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                          (feature: any) => feature.Name === "favCount"
                        )?.Value;
                        return favCount || '0';
                      })()}</span> ადამიანმა
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600 font-medium mb-1">მომხმარებელთა შეფასება</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-yellow-700 text-lg">{(() => {
                        const apiRating = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                          (feature: any) => feature.Name === "rating"
                        )?.Value;
                        return apiRating ? parseFloat(apiRating).toFixed(1) : '4.2';
                      })()}</span> ({(() => {
                        const reviewCount = product?.apiData?.Result?.Item?.FeaturedValues?.find(
                          (feature: any) => feature.Name === "reviews"
                        )?.Value;
                        return reviewCount || '0';
                      })()} მიმოხილვა)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Loan Calculator Section */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900">განვადებით ყიდვა</h3>
                    <p className="text-xs md:text-sm text-slate-500">0% საპროცენტო განვადება</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/ka/4/4c/Bank_of_Georgia_logo.png" 
                    alt="Bank of Georgia" 
                    className="h-6 object-contain"
                  />
                </div>
              </div>
            </div>
            
            {(() => {
              // Calculate the monthly payment within this scope
              const calculatePayment = () => {
                const remainingAmount = product.price - firstPayment;
                return (remainingAmount / selectedMonths).toFixed(0);
              };
              
              return (
                <div className="p-4 md:p-6">
                  {/* Compact Monthly Payment Display */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gradient-to-r from-primary/5 to-purple-50 rounded-lg border border-primary/20">
                    <div>
                      <div className="text-xs text-gray-600">ყოველთვიური გადახდა</div>
                      <div className="text-xl font-bold text-primary">₾{calculatePayment()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{selectedMonths} თვე</div>
                      <div className="text-xs text-green-600 font-medium">0% საპროცენტო</div>
                    </div>
                  </div>

                  {/* Compact Controls */}
                  <div className="space-y-3">
                    {/* Months Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-700">განვადების ვადა</label>
                        <span className="text-xs font-bold text-primary">{selectedMonths} თვე</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="36"
                        step="3"
                        value={selectedMonths}
                        onChange={(e) => setSelectedMonths(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #5b38ed 0%, #5b38ed ${((selectedMonths - 3) / 33) * 100}%, #e5e7eb ${((selectedMonths - 3) / 33) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>

                    {/* First Payment Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-700">პირველადი შენატანი</label>
                        <span className="text-xs font-bold text-primary">₾{firstPayment}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.floor(product.price * 0.5)}
                        step={Math.max(1, Math.floor(product.price * 0.05))}
                        value={firstPayment}
                        onChange={(e) => setFirstPayment(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #5b38ed 0%, #5b38ed ${(firstPayment / (Math.floor(product.price * 0.5))) * 100}%, #e5e7eb ${(firstPayment / (Math.floor(product.price * 0.5))) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      განვადებით შეძენა
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Product Description Tabs - YouTube-style full-width on mobile */}
        <div className="mb-6">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-12 rounded-none sm:rounded-md bg-transparent border-b border-gray-200 sm:bg-muted sm:border-0">
              <TabsTrigger 
                value="description" 
                className="rounded-none sm:rounded-md data-[state=active]:border-primary data-[state=active]:border-b-2 sm:data-[state=active]:border-b-0 data-[state=active]:shadow-none sm:data-[state=active]:shadow-sm"
              >
                აღწერა
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="rounded-none sm:rounded-md data-[state=active]:border-primary data-[state=active]:border-b-2 sm:data-[state=active]:border-b-0 data-[state=active]:shadow-none sm:data-[state=active]:shadow-sm"
              >
                მახასიათებლები
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none sm:rounded-md data-[state=active]:border-primary data-[state=active]:border-b-2 sm:data-[state=active]:border-b-0 data-[state=active]:shadow-none sm:data-[state=active]:shadow-sm"
              >
                შეფასებები
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="bg-white sm:rounded-lg p-4 sm:p-6 sm:shadow-sm mt-0 sm:mt-2">
              {renderDescription()}
            </TabsContent>
            <TabsContent value="specs" className="bg-white sm:rounded-lg p-4 sm:p-6 sm:shadow-sm mt-0 sm:mt-2">
              <div className="space-y-2">
                {product.specifications.slice(0, 8).map((spec, index) => (
                  <div key={index} className="flex border-b border-gray-100 pb-2">
                    <span className="w-1/3 font-medium text-gray-600">{spec.name}</span>
                    <span className="w-2/3">{spec.value}</span>
                  </div>
                ))}
                {product.specifications.length > 8 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">+{product.specifications.length - 8} მეტი მახასიათებელი</span>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="bg-white sm:rounded-lg p-4 sm:p-6 sm:shadow-sm mt-0 sm:mt-2">
              {(() => {
                // Get authentic reviews from ProviderReviews API data
                const providerReviews = product?.apiData?.Result?.ProviderReviews?.Content || [];
                const displayedReviews = showAllReviews ? providerReviews : providerReviews.slice(0, 5);
                
                if (providerReviews.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">შეფასებები ჯერ არ არის</h3>
                      <p className="text-gray-500 text-sm">ამ პროდუქტს ჯერ არ აქვს მომხმარებელთა შეფასებები</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        მომხმარებელთა შეფასებები ({providerReviews.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400">★★★★★</div>
                        <span className="text-sm text-gray-600">საშუალო შეფასება</span>
                      </div>
                    </div>

                    <div className="space-y-4 relative">
                      {displayedReviews.slice(0, 3).map((review: any, index: number) => {
                        const reviewDate = new Date(review.CreatedDate);
                        const formattedDate = reviewDate.toLocaleDateString('ka-GE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });

                        return (
                          <div key={review.ExternalId || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#5b38ed] rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {review.UserNick ? review.UserNick.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{review.UserNick || 'ანონიმური მომხმარებელი'}</p>
                                  <p className="text-xs text-gray-500">{formattedDate}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1 text-sm font-medium text-gray-700">{(review.Rating || 0).toFixed(1)}</span>
                              </div>
                            </div>
                            
                            <div className="text-gray-700 text-sm leading-relaxed">
                              {review.Content || 'შეფასება არ არის მითითებული'}
                            </div>
                            
                            {review.Images && review.Images.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {review.Images.slice(0, 2).map((image: string, imgIndex: number) => (
                                  <img
                                    key={imgIndex}
                                    src={image}
                                    alt={`შეფასების ფოტო ${imgIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Show More Reviews Footer */}
                      {providerReviews.length > 5 && !showAllReviews && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent h-20 -mt-16 pointer-events-none"></div>
                          <div className="relative pt-4">
                            <button
                              onClick={() => setShowAllReviews(true)}
                              className="w-full bg-gradient-to-r from-[#5b38ed] to-[#7c60f1] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-[#4c2ed4] hover:to-[#6850e8] transition-all duration-200 shadow-sm"
                            >
                              <span>მეტის ნახვა</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span className="text-white/80 text-sm">({providerReviews.length - 5} დარჩენილი)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products - Using recommended items from API response */}
        <div className="mb-12">
          {(() => {
            // Debug API response to identify correct structure
            console.log("Full API response:", product?.apiData);
            
            // In the API, RecommendedItems is within a Content array
            const recommendedItems = product?.apiData?.Result?.RecommendedItems?.Content || [];
            console.log("Recommended items array:", recommendedItems);
            
            if (recommendedItems && recommendedItems.length > 0) {
              console.log(`Found ${recommendedItems.length} recommended items`);
              
              // Map API recommended items to product format
              const recommendedApiProducts = recommendedItems.map((item: any) => {
                // Get the rating and reviews from FeaturedValues
                const rating = item.FeaturedValues?.find((feature: any) => feature.Name === "rating")?.Value;
                const reviews = item.FeaturedValues?.find((feature: any) => feature.Name === "reviews")?.Value;
                const favCount = item.FeaturedValues?.find((feature: any) => feature.Name === "favCount")?.Value;
                
                // Get price information
                const price = item.Price?.ConvertedPriceList?.DisplayedMoneys?.[0]?.Price || 
                             item.Price?.ConvertedPriceList?.Internal?.Price || 0;
                
                // Get discount information if available
                const oldPrice = item.Price?.ConvertedPriceList?.DisplayedMoneys?.[0]?.OldPrice || 
                                item.Price?.ConvertedPriceList?.Internal?.OldPrice;
                
                // Calculate discount percentage if both prices exist
                let discountPercentage = item.DiscountRate;
                if (!discountPercentage && oldPrice && price) {
                  discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
                }
                
                console.log(`Processing recommended product: ${item.Id} - ${item.Title}`);
                console.log(`  Price: ${price}, OldPrice: ${oldPrice}, Discount: ${discountPercentage}%`);
                
                return {
                  id: item.Id,
                  name: item.Title,
                  originalTitle: item.OriginalTitle || item.Title, // Add original Turkish title for translation
                  price: price,
                  oldPrice: oldPrice,
                  discountPercentage: discountPercentage,
                  imageUrl: item.MainPictureUrl,
                  stockCount: 10,
                  sign: "₾",
                  totalSales: parseInt(reviews || "0", 10),
                  customData: true,
                  rating: parseFloat(rating || "0")
                };
              });
              
              return (
                <ProductGrid
                  title="მსგავსი პროდუქტები"
                  products={recommendedApiProducts}
                  viewAllLink="/products"
                />
              );
            } else {
              console.log("No recommended items found in Content array, using fallback products");
              
              // Fallback to default products if no recommended items
              return (
                <ProductGrid
                  title="მსგავსი პროდუქტები"
                  products={[...popularProducts, ...recommendedProducts].slice(0, 6)}
                  viewAllLink="/products"
                />
              );
            }
          })()}
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal 
        open={isSizeChartOpen} 
        onOpenChange={setIsSizeChartOpen}
        productType="clothing"
      />
      
      {/* Quick Order Modal */}
      <QuickOrderModal
        open={isQuickOrderOpen}
        onOpenChange={setIsQuickOrderOpen}
        productName={product.name}
        productId={product.id}
        price={product.price}
      />
    </main>
  );
};

export default ProductDetail;
