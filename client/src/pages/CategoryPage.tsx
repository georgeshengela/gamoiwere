import { useState, useEffect } from 'react';
import { useRoute, Link as WouterLink } from 'wouter';
import {
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  Sliders,
  Check,
  Loader,
  Grid3X3,
  ShoppingBag,
  Store,
  TagIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomPagination from '@/components/ui/custom-pagination';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { capitalizeGeorgian, normalizeGeorgian } from '@/utils/georgian-utils';
import { popularProducts, recommendedProducts } from '@/lib/data';
import {
  useCategoryProducts,
  CategoryProduct,
} from '@/hooks/useCategoryProducts';
import {
  useCategories,
  CategoryItem,
  useSidebarCategories,
} from '@/hooks/useCategories';
import ProductCard from '@/components/ui/product-card';
import CategorySidebarPanel from '@/components/ui/category-sidebar-panel';

// Define the categories
const categories = {
  smartphones: {
    id: 'smartphones',
    name: 'სმარტფონები',
    icon: 'Smartphone',
    brands: [
      'Apple',
      'Samsung',
      'Google',
      'Xiaomi',
      'OnePlus',
      'Huawei',
      'Sony',
      'Nokia',
    ],
    colors: [
      'შავი',
      'თეთრი',
      'ლურჯი',
      'წითელი',
      'მწვანე',
      'ოქროსფერი',
      'ვერცხლისფერი',
    ],
    priceRange: [300, 5000],
    features: [
      '5G მხარდაჭერა',
      'წყალგაუმტარი',
      'უკაბელო დატენვა',
      'სწრაფი დატენვა',
      'სახის ამოცნობა',
      'თითის ანაბეჭდის სკანერი',
    ],
  },
  laptops: {
    id: 'laptops',
    name: 'ლეპტოპები',
    icon: 'Laptop',
    brands: [
      'Apple',
      'Dell',
      'HP',
      'Lenovo',
      'Asus',
      'Acer',
      'MSI',
      'Microsoft',
    ],
    colors: ['შავი', 'თეთრი', 'ვერცხლისფერი', 'ნაცრისფერი'],
    priceRange: [500, 8000],
    features: [
      'სენსორული ეკრანი',
      'გრაფიკული პროცესორი',
      'SSD მეხსიერება',
      'ბიომეტრიული ავთენტიფიკაცია',
    ],
  },
  audio: {
    id: 'audio',
    name: 'აუდიო',
    icon: 'Headphones',
    brands: [
      'Sony',
      'Bose',
      'JBL',
      'Apple',
      'Samsung',
      'Sennheiser',
      'Audio-Technica',
    ],
    colors: ['შავი', 'თეთრი', 'ლურჯი', 'წითელი', 'ვარდისფერი'],
    priceRange: [50, 2000],
    features: ['ხმაურის გაუქმება', 'უკაბელო', 'მიკროფონი', 'წყალგაუმტარი'],
  },
  tvs: {
    id: 'tvs',
    name: 'ტელევიზორები',
    icon: 'Tv',
    brands: ['Samsung', 'LG', 'Sony', 'Philips', 'TCL', 'Hisense'],
    colors: ['შავი'],
    priceRange: [400, 10000],
    features: ['4K', '8K', 'HDR', 'Smart TV', 'OLED', 'QLED'],
  },
  smartwatches: {
    id: 'smartwatches',
    name: 'სმარტ საათები',
    icon: 'Watch',
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Xiaomi'],
    colors: ['შავი', 'თეთრი', 'ლურჯი', 'წითელი', 'ვარდისფერი', 'მწვანე'],
    priceRange: [100, 2000],
    features: [
      'პულსის მონიტორინგი',
      'GPS',
      'ფიზიკური აქტივობის თვალყურის დევნება',
      'ECG',
      'წყალგაუმტარი',
    ],
  },
  gaming: {
    id: 'gaming',
    name: 'გეიმინგი',
    icon: 'Gamepad',
    brands: [
      'Sony',
      'Microsoft',
      'Nintendo',
      'Razer',
      'Logitech',
      'SteelSeries',
    ],
    colors: ['შავი', 'თეთრი', 'ლურჯი', 'წითელი', 'მწვანე'],
    priceRange: [50, 3000],
    features: [
      'უკაბელო',
      'RGB განათება',
      'პროგრამირებადი ღილაკები',
      'საუკეთესო ერგონომიკა',
    ],
  },
  tablets: {
    id: 'tablets',
    name: 'ტაბლეტები',
    icon: 'Tablet',
    brands: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Huawei'],
    colors: ['შავი', 'თეთრი', 'ვერცხლისფერი', 'ოქროსფერი', 'ნაცრისფერი'],
    priceRange: [200, 3000],
    features: [
      'სტილუსის მხარდაჭერა',
      'კლავიატურის მხარდაჭერა',
      'კოსმოსური მეხსიერება',
      'LTE მხარდაჭერა',
    ],
  },
  cameras: {
    id: 'cameras',
    name: 'კამერები',
    icon: 'Camera',
    brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus'],
    colors: ['შავი', 'ვერცხლისფერი'],
    priceRange: [300, 8000],
    features: [
      '4K ვიდეო',
      'Wi-Fi კავშირი',
      'სტაბილიზაცია',
      'ცვალებადი ობიექტივები',
      'შორი ზუმი',
    ],
  },
  sales: {
    id: 'sales',
    name: 'ფასდაკლებები',
    icon: 'TagIcon',
    brands: [],
    colors: [],
    priceRange: [0, 0],
    features: [],
  },
};

type SortOption =
  | 'newest'
  | 'price-low-high'
  | 'price-high-low'
  | 'discount'
  | 'popular';

// Helper function to find category name from category ID in the nested structure
const findCategoryName = (
  categoryId: string,
  categories: CategoryItem[]
): string | null => {
  // Direct match at first level
  const directMatch = categories.find((cat) => cat.Id === categoryId);
  if (directMatch) return directMatch.Name;

  // Search in children recursively
  for (const category of categories) {
    if (category.Children && Array.isArray(category.Children)) {
      const childMatch = findCategoryName(categoryId, category.Children);
      if (childMatch) return childMatch;
    }
  }

  return null;
};

const CategoryPage = () => {
  const [, params] = useRoute('/category/:id');
  const { toast } = useToast();
  const categoryId = params?.id || 'smartphones';
  // Create a minimal default category without hardcoded name
  const category = categories[categoryId as keyof typeof categories] || {
    id: categoryId,
    name: '', // Empty name to prevent showing placeholder
    icon: 'Grid3X3',
    brands: [],
    colors: [],
    priceRange: [0, 10000],
    features: [],
  };

  // State for current page
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories from API to get real category names
  const { categories: apiCategories, isLoading: categoriesLoading } =
    useCategories();

  // State to store the real category name
  const [realCategoryName, setRealCategoryName] = useState<string | null>(null);

  // Find and set the real category name when categories or category ID changes
  useEffect(() => {
    if (apiCategories && apiCategories.length > 0) {
      const name = findCategoryName(categoryId, apiCategories);
      setRealCategoryName(name);
      // Category name resolved
    }
  }, [categoryId, apiCategories]);

  // Update page title and meta description for SEO
  useEffect(() => {
    // Only update title when real category name is available
    if (!realCategoryName) return;

    const categoryName = realCategoryName;

    // Set page title
    document.title = `${categoryName} - GAMOIWERE.GE`;

    // Generate and set meta description
    const generateCategoryDescription = (name: string) => {
      if (name.includes('ქალ') || name.toLowerCase().includes('women')) {
        return `აღმოაჩინეთ ქალბატონების მოდური ტანსაცმელი და აქსესუარები GAMOIWERE.GE-ზე. უფასო მიწოდება, საუკეთესო ფასები და ფართო არჩევანი საერთაშორისო ბრენდებისგან.`;
      } else if (
        name.includes('მამაკაც') ||
        name.toLowerCase().includes('men')
      ) {
        return `იყიდეთ მამაკაცების სტილური ტანსაცმელი და აქსესუარები GAMOIWERE.GE-ზე. ფართო არჩევანი, საუკეთესო ფასები და სწრაფი მიწოდება ყველა რეგიონში.`;
      } else if (
        name.includes('ბავშვ') ||
        name.toLowerCase().includes('child') ||
        name.toLowerCase().includes('kid')
      ) {
        return `ბავშვების ტანსაცმელი და სათამაშოები GAMOIWERE.GE-ზე. უსაფრთხო, ხარისხიანი პროდუქტები ბავშვებისთვის საუკეთესო ფასებში.`;
      } else {
        return `${categoryName} კატეგორიის პროდუქტები GAMOIWERE.GE-ზე. ფართო არჩევანი, საუკეთესო ფასები და უფასო მიწოდება საერთაშორისო ბაზრებიდან.`;
      }
    };

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      generateCategoryDescription(categoryName)
    );
  }, [realCategoryName, category.name, categoryId]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  // Fetch real category products from API with pagination
  const {
    products: apiProducts,
    isLoading,
    error,
    paginationInfo,
  } = useCategoryProducts(categoryId, currentPage);

  // Only use real API data, ensure it's an array
  // Don't show products while loading to prevent showing old products during page transitions
  let allProducts: TransformedProduct[] = [];
  if (!isLoading && Array.isArray(apiProducts) && apiProducts.length > 0) {
    // Only transform products that have the necessary data
    allProducts = apiProducts
      .filter((product) => product && product.Id && product.Title)
      .map(transformApiProduct);
  }

  // State for active filters
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    category.priceRange[0],
    category.priceRange[1],
  ]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterMobileOpen, setFilterMobileOpen] = useState(false);

  // Transform API product format to match our app's format
  // Define an interface for transformed products to help TypeScript
  interface TransformedProduct {
    id: string | number;
    name: string;
    originalTitle?: string; // Add original title for translation
    price: number;
    oldPrice?: number;
    imageUrl: string;
    discountPercentage?: number;
    quantity: number;
    sales: number; // Add this for sorting
    rating: number;
    reviewCount: number;
    sign: string;
    isSellAllowed: boolean;
    customData: boolean;
  }

  function transformApiProduct(apiProduct: any): TransformedProduct {
    // Processing product data

    // Extract price information based on the actual API response structure
    let price = 0;
    let oldPrice = undefined;
    let discountPercentage = undefined;
    let currencySign = '₾';

    if (
      apiProduct.Price &&
      apiProduct.Price.ConvertedPriceList &&
      apiProduct.Price.ConvertedPriceList.DisplayedMoneys &&
      apiProduct.Price.ConvertedPriceList.DisplayedMoneys.length > 0
    ) {
      const priceInfo = apiProduct.Price.ConvertedPriceList.DisplayedMoneys[0];
      price = priceInfo.Price || 0;

      // Check if there's a discount
      if (
        apiProduct.Price.OriginalPrice &&
        apiProduct.Price.OriginalPrice > price
      ) {
        oldPrice = apiProduct.Price.OriginalPrice;
        discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
      }

      // Get currency sign
      currencySign = priceInfo.Sign || '₾';
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
      const ratingItem = apiProduct.FeaturedValues.find(
        (item: any) => item.Name === 'rating'
      );
      const reviewsItem = apiProduct.FeaturedValues.find(
        (item: any) => item.Name === 'reviews'
      );
      const basketCountItem = apiProduct.FeaturedValues.find(
        (item: any) => item.Name === 'basketCount'
      );

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

    // Product data processed

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
      customData: true,
    };
  }

  // Reset filters when category changes
  useEffect(() => {
    setActiveBrands([]);
    setActiveColors([]);
    setActiveFeatures([]);
    setPriceRange([category.priceRange[0], category.priceRange[1]]);
    setSortOption('newest');
  }, [categoryId, category]);

  // Debug all API products to see what's available
  console.log(`API products fetched: ${apiProducts.length}`);

  // For debugging, check if any API products have images
  const productsWithImages = apiProducts.filter(
    (p) =>
      p &&
      (p.MainPictureUrl ||
        (p.Pictures && Array.isArray(p.Pictures) && p.Pictures.length > 0))
  );
  console.log(
    `Products with images: ${productsWithImages.length} out of ${apiProducts.length}`
  );

  // Let's use all available API products and transform them
  const validApiProducts = apiProducts.filter(
    (p) => !!p && !!p.Id && !!p.Title
  );
  console.log(`Valid API products: ${validApiProducts.length}`);

  // First let's log the products we're working with
  console.log(
    `Processing ${allProducts.length} products with price ranges:`,
    allProducts.map((p) => p.price).slice(0, 5)
  );

  // Filter products with more lenient criteria initially to debug
  const filteredProducts = allProducts.filter((product) => {
    // Log each product being evaluated
    console.log(
      `Evaluating product ${product.id}: price=${
        product.price
      }, hasImage=${!!product.imageUrl}`
    );

    // Only filter out products with no price or no image
    return product.price > 0 && !!product.imageUrl;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low-high':
        return Number(a.price || 0) - Number(b.price || 0);
      case 'price-high-low':
        return Number(b.price || 0) - Number(a.price || 0);
      case 'discount':
        return (
          Number(b.discountPercentage || 0) - Number(a.discountPercentage || 0)
        );
      case 'popular':
        // For API products, use actual sales numbers if available
        const aSales = typeof a.sales === 'number' ? a.sales : 0;
        const bSales = typeof b.sales === 'number' ? b.sales : 0;
        return bSales - aSales;
      case 'newest':
      default:
        if (typeof a.id === 'string' && typeof b.id === 'string') {
          return b.id.localeCompare(a.id); // For API products with string IDs
        } else {
          const aNum = typeof a.id === 'number' ? a.id : 0;
          const bNum = typeof b.id === 'number' ? b.id : 0;
          return bNum - aNum; // For mock products with numeric IDs
        }
    }
  });

  const handleBrandChange = (brand: string) => {
    setActiveBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleColorChange = (color: string) => {
    setActiveColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleFeatureChange = (feature: string) => {
    setActiveFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleAddToCart = (id: string | number) => {
    toast({
      title: 'პროდუქტი დამატებულია',
      description: `პროდუქტი (ID: ${id}) დაემატა კალათაში`,
    });
  };

  const handleAddToWishlist = (id: string | number) => {
    toast({
      title: 'პროდუქტი დამატებულია',
      description: `პროდუქტი (ID: ${id}) დაემატა სასურველებში`,
    });
  };

  const clearFilters = () => {
    setActiveBrands([]);
    setActiveColors([]);
    setActiveFeatures([]);
    setPriceRange([category.priceRange[0], category.priceRange[1]]);
  };

  const activeFiltersCount =
    activeBrands.length +
    activeColors.length +
    activeFeatures.length +
    (priceRange[0] !== category.priceRange[0] ||
    priceRange[1] !== category.priceRange[1]
      ? 1
      : 0);

  // Filter panel for desktop
  const FilterPanel = () => {
    return (
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-24">
          {/* Filter Header */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/90 h-8"
              >
                გასუფთავება
              </Button>
            </div>
          )}

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {activeBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="outline"
                    className="bg-white px-2 py-1 flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                  >
                    {brand}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => handleBrandChange(brand)}
                    />
                  </Badge>
                ))}

                {activeColors.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className="bg-white px-2 py-1 flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                  >
                    {color}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => handleColorChange(color)}
                    />
                  </Badge>
                ))}

                {activeFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="bg-white px-2 py-1 flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                  >
                    {feature}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => handleFeatureChange(feature)}
                    />
                  </Badge>
                ))}

                {(priceRange[0] !== category.priceRange[0] ||
                  priceRange[1] !== category.priceRange[1]) && (
                  <Badge
                    variant="outline"
                    className="bg-white px-2 py-1 flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                  >
                    ფასი: ₾{priceRange[0]} - ₾{priceRange[1]}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setPriceRange([
                          category.priceRange[0],
                          category.priceRange[1],
                        ])
                      }
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Filter Options */}
          <Accordion
            type="multiple"
            defaultValue={['price', 'brands', 'colors']}
            className="space-y-2"
          >
            <AccordionItem
              value="price"
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <AccordionTrigger className="text-base font-medium px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100">
                ფასი
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-5 border-t border-gray-200">
                <div className="px-1">
                  <div className="mb-6 mt-3">
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      max={category.priceRange[1]}
                      min={category.priceRange[0]}
                      step={10}
                      onValueChange={handlePriceChange}
                      className="py-2"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="px-3 py-1.5 border border-gray-200 rounded text-sm w-24 text-center bg-white text-gray-800">
                      ₾{priceRange[0]}
                    </div>
                    <div className="text-gray-400 text-xs">-</div>
                    <div className="px-3 py-1.5 border border-gray-200 rounded text-sm w-24 text-center bg-white text-gray-800">
                      ₾{priceRange[1]}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {category.brands.length > 0 && (
              <AccordionItem
                value="brands"
                className="border border-gray-200 rounded-md overflow-hidden"
              >
                <AccordionTrigger className="text-base font-medium px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100">
                  ბრენდები
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col gap-3 py-2">
                    {category.brands.map((brand) => (
                      <div key={brand} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={activeBrands.includes(brand)}
                          onCheckedChange={() => handleBrandChange(brand)}
                          className="text-primary border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`brand-${brand}`}
                          className="text-sm font-normal text-gray-700 cursor-pointer select-none"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {category.colors.length > 0 && (
              <AccordionItem
                value="colors"
                className="border border-gray-200 rounded-md overflow-hidden"
              >
                <AccordionTrigger className="text-base font-medium px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100">
                  ფერები
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col gap-3 py-2">
                    {category.colors.map((color) => (
                      <div key={color} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`color-${color}`}
                          checked={activeColors.includes(color)}
                          onCheckedChange={() => handleColorChange(color)}
                          className="text-primary border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className="text-sm font-normal text-gray-700 cursor-pointer select-none"
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {category.features.length > 0 && (
              <AccordionItem
                value="features"
                className="border border-gray-200 rounded-md overflow-hidden"
              >
                <AccordionTrigger className="text-base font-medium px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100">
                  მახასიათებლები
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col gap-3 py-2">
                    {category.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={activeFeatures.includes(feature)}
                          onCheckedChange={() => handleFeatureChange(feature)}
                          className="text-primary border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`feature-${feature}`}
                          className="text-sm font-normal text-gray-700 cursor-pointer select-none"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb - only show when category name is loaded */}
      {realCategoryName && (
        <nav className="flex mb-6 text-sm">
          <WouterLink href="/" className="text-neutral-500 hover:text-primary">
            მთავარი
          </WouterLink>
          <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
          <span className="font-medium">{realCategoryName}</span>
        </nav>
      )}

      {/* Page Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-100 p-4 sm:p-6">
          {/* Mobile Layout */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center flex-1 min-w-0 pr-3">
              <div className="mr-2 bg-blue-50 text-blue-600 p-1.5 rounded-lg flex-shrink-0">
                {/* Display an icon based on the category name */}
                {(() => {
                  const categoryName = (
                    realCategoryName ||
                    category.name ||
                    ''
                  ).toLowerCase();

                  if (
                    categoryName.includes('ტანსაცმელი') ||
                    categoryName.includes('ქალი') ||
                    categoryName.includes('კაცი')
                  ) {
                    return <ShoppingBag className="h-4 w-4" />;
                  } else if (
                    categoryName.includes('სახლი') ||
                    categoryName.includes('მაღაზია')
                  ) {
                    return <Store className="h-4 w-4" />;
                  } else if (
                    categoryName.includes('ფასდაკლება') ||
                    categoryName.includes('აქცია')
                  ) {
                    return <TagIcon className="h-4 w-4" />;
                  } else if (
                    categoryName.includes('სილამაზე') ||
                    categoryName.includes('აქსესუარები')
                  ) {
                    return <Sparkles className="h-4 w-4" />;
                  } else {
                    return <Grid3X3 className="h-4 w-4" />;
                  }
                })()}
              </div>
              <h1 className="text-lg font-semibold text-gray-800 leading-tight truncate">
                {normalizeGeorgian(realCategoryName || '')}
              </h1>
            </div>
            <div className="flex items-center">
              <div className="w-px h-6 bg-gray-300 mr-3"></div>
              <div className="inline-flex items-center bg-neutral-50 px-2.5 py-1 rounded-full text-xs text-neutral-700 flex-shrink-0">
                <span className="font-medium mr-1">
                  {paginationInfo?.totalCount?.toLocaleString() ||
                    sortedProducts.length}
                </span>
                <span>ნაპოვნია</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-50 text-blue-600 p-2 rounded-lg">
                {/* Display an icon based on the category name */}
                {(() => {
                  const categoryName = (
                    realCategoryName ||
                    category.name ||
                    ''
                  ).toLowerCase();

                  if (
                    categoryName.includes('ტანსაცმელი') ||
                    categoryName.includes('ქალი') ||
                    categoryName.includes('კაცი')
                  ) {
                    return <ShoppingBag className="h-5 w-5" />;
                  } else if (
                    categoryName.includes('სახლი') ||
                    categoryName.includes('მაღაზია')
                  ) {
                    return <Store className="h-5 w-5" />;
                  } else if (
                    categoryName.includes('ფასდაკლება') ||
                    categoryName.includes('აქცია')
                  ) {
                    return <TagIcon className="h-5 w-5" />;
                  } else if (
                    categoryName.includes('სილამაზე') ||
                    categoryName.includes('აქსესუარები')
                  ) {
                    return <Sparkles className="h-5 w-5" />;
                  } else {
                    return <Grid3X3 className="h-5 w-5" />;
                  }
                })()}
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {realCategoryName || ''}
              </h1>
            </div>
            <div className="inline-flex items-center bg-neutral-50 px-3 py-1.5 rounded-full text-sm text-neutral-700">
              <span className="font-medium mr-1.5">
                {paginationInfo?.totalCount?.toLocaleString() ||
                  sortedProducts.length}
              </span>
              <span>პროდუქტი კატეგორიაში</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filter Button - Mobile */}
          <Sheet open={filterMobileOpen} onOpenChange={setFilterMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 md:hidden"
              >
                <Filter className="h-4 w-4" />
                <span>ფილტრები</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] p-0 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">ფილტრები</h2>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm text-primary hover:bg-gray-50"
                  >
                    გასუფთავება
                  </Button>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {activeBrands.map((brand) => (
                      <Badge
                        key={brand}
                        variant="outline"
                        className="px-2 py-1 flex items-center gap-1 bg-gray-50 border-gray-200"
                      >
                        {brand}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer text-gray-500"
                          onClick={() => handleBrandChange(brand)}
                        />
                      </Badge>
                    ))}

                    {activeColors.map((color) => (
                      <Badge
                        key={color}
                        variant="outline"
                        className="px-2 py-1 flex items-center gap-1 bg-gray-50 border-gray-200"
                      >
                        {color}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer text-gray-500"
                          onClick={() => handleColorChange(color)}
                        />
                      </Badge>
                    ))}

                    {activeFeatures.map((feature) => (
                      <Badge
                        key={feature}
                        variant="outline"
                        className="px-2 py-1 flex items-center gap-1 bg-gray-50 border-gray-200"
                      >
                        {feature}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer text-gray-500"
                          onClick={() => handleFeatureChange(feature)}
                        />
                      </Badge>
                    ))}

                    {(priceRange[0] !== category.priceRange[0] ||
                      priceRange[1] !== category.priceRange[1]) && (
                      <Badge
                        variant="outline"
                        className="px-2 py-1 flex items-center gap-1 bg-gray-50 border-gray-200"
                      >
                        ₾{priceRange[0]} - ₾{priceRange[1]}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer text-gray-500"
                          onClick={() =>
                            setPriceRange([
                              category.priceRange[0],
                              category.priceRange[1],
                            ])
                          }
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Modern filters section */}
              <div className="divide-y divide-gray-100">
                {/* Dynamic categories - removed title as requested */}
                <div className="p-4">
                  {(() => {
                    const { sidebarData, isLoading } =
                      useSidebarCategories(categoryId);

                    if (isLoading) {
                      return (
                        <div className="flex justify-center py-4">
                          <Loader className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* Main Categories */}
                        {sidebarData.mainCategories.length > 0 && (
                          <div className="space-y-1.5">
                            {sidebarData.mainCategories.map((cat) => {
                              const isActive = cat.Id === categoryId;
                              // Get appropriate icon based on category name
                              const categoryName = cat.Name.toLowerCase();
                              let icon;

                              if (
                                categoryName.includes('ტანსაცმელი') ||
                                categoryName.includes('ქალი') ||
                                categoryName.includes('კაცი')
                              ) {
                                icon = (
                                  <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                                );
                              } else if (
                                categoryName.includes('სახლი') ||
                                categoryName.includes('მაღაზია')
                              ) {
                                icon = (
                                  <Store className="h-4 w-4 mr-2 text-gray-500" />
                                );
                              } else if (
                                categoryName.includes('ფასდაკლება') ||
                                categoryName.includes('აქცია')
                              ) {
                                icon = (
                                  <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
                                );
                              } else if (
                                categoryName.includes('სილამაზე') ||
                                categoryName.includes('აქსესუარები')
                              ) {
                                icon = (
                                  <Sparkles className="h-4 w-4 mr-2 text-gray-500" />
                                );
                              } else {
                                icon = (
                                  <Grid3X3 className="h-4 w-4 mr-2 text-gray-400" />
                                );
                              }

                              return (
                                <WouterLink
                                  key={cat.Id}
                                  href={`/category/${cat.Id}`}
                                  className={`flex items-center py-2 px-2 text-[0.8125rem] rounded-md transition-colors ${
                                    isActive
                                      ? 'bg-gray-100 font-medium text-primary'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => setFilterMobileOpen(false)}
                                >
                                  {icon}
                                  <span>{capitalizeGeorgian(cat.Name)}</span>
                                </WouterLink>
                              );
                            })}
                          </div>
                        )}

                        {/* Sub Categories */}
                        {sidebarData.subCategories.length > 0 && (
                          <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
                            {sidebarData.subCategories.map((cat) => {
                              const isActive = cat.Id === categoryId;

                              return (
                                <WouterLink
                                  key={cat.Id}
                                  href={`/category/${cat.Id}`}
                                  className={`flex items-center justify-between py-2 px-2 text-[0.8125rem] rounded-md transition-colors ${
                                    isActive
                                      ? 'bg-gray-100 font-medium text-primary'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={() => setFilterMobileOpen(false)}
                                >
                                  <span>{capitalizeGeorgian(cat.Name)}</span>
                                  <ChevronRight
                                    className={`h-4 w-4 ${
                                      isActive
                                        ? 'text-primary'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                </WouterLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Brands Filter */}
                {category.brands.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3 text-sm">
                      ბრენდები
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {category.brands.map((brand) => (
                        <div key={brand} className="flex items-center">
                          <Checkbox
                            id={`mobile-brand-${brand}`}
                            checked={activeBrands.includes(brand)}
                            onCheckedChange={() => handleBrandChange(brand)}
                            className="text-primary border-gray-300 rounded-sm"
                          />
                          <label
                            htmlFor={`mobile-brand-${brand}`}
                            className="text-sm ml-2.5 cursor-pointer text-gray-700"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors Filter */}
                {category.colors.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3 text-sm">
                      ფერები
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {category.colors.map((color) => (
                        <div key={color} className="flex items-center">
                          <Checkbox
                            id={`mobile-color-${color}`}
                            checked={activeColors.includes(color)}
                            onCheckedChange={() => handleColorChange(color)}
                            className="text-primary border-gray-300 rounded-sm"
                          />
                          <label
                            htmlFor={`mobile-color-${color}`}
                            className="text-sm ml-2.5 cursor-pointer text-gray-700"
                          >
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Filter */}
                {category.features.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3 text-sm">
                      მახასიათებლები
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {category.features.map((feature) => (
                        <div key={feature} className="flex items-center">
                          <Checkbox
                            id={`mobile-feature-${feature}`}
                            checked={activeFeatures.includes(feature)}
                            onCheckedChange={() => handleFeatureChange(feature)}
                            className="text-primary border-gray-300 rounded-sm"
                          />
                          <label
                            htmlFor={`mobile-feature-${feature}`}
                            className="text-sm ml-2.5 cursor-pointer text-gray-700"
                          >
                            {feature}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm">
                    ფასი
                  </h3>
                  <div className="px-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700 font-medium">
                        ₾{priceRange[0]}
                      </span>
                      <span className="text-sm text-gray-700 font-medium">
                        ₾{priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={[priceRange[0], priceRange[1]]}
                      min={category.priceRange[0]}
                      max={category.priceRange[1]}
                      step={10}
                      onValueChange={(value) =>
                        setPriceRange([value[0], value[1]])
                      }
                      className="my-4"
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="დალაგება" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">ახალი პირველად</SelectItem>
              <SelectItem value="price-low-high">
                ფასი: დაბლიდან მაღლა
              </SelectItem>
              <SelectItem value="price-high-low">
                ფასი: მაღლიდან დაბლა
              </SelectItem>
              <SelectItem value="discount">ფასდაკლება</SelectItem>
              <SelectItem value="popular">პოპულარობა</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category Sidebar - Desktop */}
        <div className="hidden md:block">
          <CategorySidebarPanel currentCategoryId={categoryId} />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">პროდუქტების ჩატვირთვა...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Sliders className="mx-auto h-12 w-12 text-red-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">შეცდომა დაფიქსირდა</h3>
              <p className="text-neutral-500 mb-6">
                პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                სცადეთ თავიდან
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Sliders className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">
                პროდუქტები ვერ მოიძებნა
              </h3>
              <p className="text-neutral-500 mb-6">
                თქვენი ძიების შედეგებზე პროდუქტები ვერ მოიძებნა. გთხოვთ,
                გაანულოთ ფილტრები ან სცადოთ სხვა ძიების პარამეტრები.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                გაასუფთავეთ ფილტრები
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    originalTitle={product.originalTitle}
                    price={product.price}
                    oldPrice={product.oldPrice}
                    imageUrl={product.imageUrl}
                    discountPercentage={product.discountPercentage}
                    stockCount={product.quantity}
                    totalSales={product.sales}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    currencySign={product.sign}
                    sign="₾"
                    customData={true}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={paginationInfo.totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      // Scroll to top on page change
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    siblingCount={1}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CategoryPage;
