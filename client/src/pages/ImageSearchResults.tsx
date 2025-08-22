import { useState, useEffect } from "react";
import { useRoute, Link as WouterLink } from "wouter";
import { 
  ChevronRight, 
  ChevronLeft,
  Search,
  Loader,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/ui/custom-pagination";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ui/product-card";

interface SearchPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CategoryItem {
  Id: number;
  Name: string;
}

const ImageSearchResults = () => {
  const [, params] = useRoute("/image-search/:imageUrl");
  const { toast } = useToast();
  // Use the actual uploaded image URL from the route parameters
  const imageUrl = params?.imageUrl ? decodeURIComponent(params.imageUrl) : "";
  
  // State for products and pagination
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<SearchPaginationInfo>({
    currentPage: 1,
    totalPages: 1, // Default to 1 page initially, will be updated based on total count
    totalCount: 0, // Will be updated with the actual count from API
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  // Function to extract price information from API response
  const extractPriceInfo = (item: any) => {
    try {
      if (item.Price && 
          item.Price.ConvertedPriceList && 
          item.Price.ConvertedPriceList.DisplayedMoneys && 
          item.Price.ConvertedPriceList.DisplayedMoneys.length > 0) {
        
        const priceInfo = item.Price.ConvertedPriceList.DisplayedMoneys[0];
        const price = priceInfo.Price;
        const oldPrice = priceInfo.ListPrice;
        let discount = 0;
        
        if (oldPrice && oldPrice > price) {
          discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        
        return {
          price,
          oldPrice: oldPrice !== price ? oldPrice : undefined,
          discount: discount > 0 ? discount : undefined,
          sign: priceInfo.CurrencySymbol || '₾'
        };
      }
    } catch (error) {
      console.error('Error extracting price info:', error);
    }
    
    return {
      price: 0,
      oldPrice: undefined,
      discount: undefined,
      sign: '₾'
    };
  };
  
  // Fetch search results when image URL changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!imageUrl) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setProducts([]); // Clear products while loading to prevent showing old products during transitions
      
      try {
        // Calculate frame position based on page (20 items per page)
        const framePosition = (currentPage - 1) * 20;
        const frameSize = 20;
        
        // Use the actual user-uploaded image for search
        // Fetch search results from API using the user's own image URL
        const url = `https://service.devmonkeys.ge/api/batchSearchItemsFrameImage?imageUrl=${encodeURIComponent(imageUrl)}&framePosition=${framePosition}&frameSize=${frameSize}`;
        // Fetching image search resultsrl);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          throw new Error(`Image search request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // The API returns a structure where data.Result.Items.Items.Content contains the products
        if (data && data.Result && data.Result.Items && 
            data.Result.Items.Items && data.Result.Items.Items.Content) {
          
          const itemsArray = data.Result.Items.Items.Content;
          
          if (Array.isArray(itemsArray) && itemsArray.length > 0) {
            // Transform products to our application format
            const transformedProducts = itemsArray.map((item: any) => {
              // Map product data
              console.log('Processing product:', item.Id, item.Title);
              const priceInfo = extractPriceInfo(item);
              console.log(`Product ${item.Id}: Price = ${priceInfo.price}, OldPrice = ${priceInfo.oldPrice}, Discount = ${priceInfo.discount}%, Sign = ${priceInfo.sign}`);
              
              // Extract basketCount (sold count) from FeaturedValues
              let basketCount = 0;
              if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
                const basketCountValue = item.FeaturedValues.find((fv: any) => fv.Name === 'basketCount');
                if (basketCountValue && basketCountValue.Value) {
                  basketCount = parseInt(basketCountValue.Value, 10) || 0;
                }
              }
              
              // Use MasterQuantity for stock count
              const stockCount = item.MasterQuantity || 0;
              
              return {
                id: item.Id,
                name: item.Title,
                price: priceInfo.price,
                oldPrice: priceInfo.oldPrice,
                discountPercentage: priceInfo.discount,
                imageUrl: item.MainPictureUrl,
                link: `/product/${item.Id}`,
                sign: priceInfo.sign,
                quantity: stockCount,
                rating: item.VendorScore || 0,
                reviewCount: 0,
                totalSales: basketCount  // This is used to display "გაყიდულია" count from basketCount
              };
            });
            
            setProducts(transformedProducts);
          } else {
            setProducts([]);
          }
          
          // Extract categories and subcategories from search results
          const categoriesData: CategoryItem[] = [];
          const subCategoriesData: CategoryItem[] = [];
          
          // Check if Facets exists and contains Categories
          if (data.Result.Facets && data.Result.Facets.Categories && 
              data.Result.Facets.Categories.Content) {
            categoriesData.push(...data.Result.Facets.Categories.Content);
          }
          
          // Check if Facets exists and contains SubCategories
          if (data.Result.Facets && data.Result.Facets.SubCategories && 
              data.Result.Facets.SubCategories.Content) {
            subCategoriesData.push(...data.Result.Facets.SubCategories.Content);
          }
          
          // Log the TotalCount from API response
          console.log('Image Search API TotalCount:', data.Result.Items.Items.TotalCount);
          
          setCategories(categoriesData);
          setSubCategories(subCategoriesData);
          
          // Calculate total pages based on total product count divided by products per page
          const totalCount = data.Result.Items.Items.TotalCount || 0;
          const itemsPerPage = 20;
          const totalPages = Math.ceil(totalCount / itemsPerPage);
          
          console.log(`Image search results: Total products: ${totalCount}, Items per page: ${itemsPerPage}, Total pages: ${totalPages}`);
          
          setPaginationInfo({
            currentPage,
            totalPages,
            totalCount,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
          });
        } else {
          // API returned data but not in expected format or no results
          setProducts([]);
          setCategories([]);
          setSubCategories([]);
          
          // Even with no results, maintain the 250 page structure
          setPaginationInfo({
            currentPage,
            totalPages: 250,
            totalCount: 0, // No results found
            hasNextPage: currentPage < 250,
            hasPreviousPage: currentPage > 1
          });
        }
      } catch (err) {
        console.error('Error fetching image search results:', err);
        setError('ძიების დროს დაფიქსირდა შეცდომა. გთხოვთ, სცადოთ მოგვიანებით.');
        setProducts([]);
        
        // Ensure pagination is still shown even on error
        // Keep the existing totalCount, don't reset it on error
        setPaginationInfo(prevInfo => ({
          currentPage,
          totalPages: 250,
          totalCount: prevInfo.totalCount,
          hasNextPage: currentPage < 250,
          hasPreviousPage: currentPage > 1
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [imageUrl, currentPage]);
  
  const handleAddToCart = (id: string | number) => {
    toast({
      title: "პროდუქტი დამატებულია",
      description: `პროდუქტი (ID: ${id}) დაემატა კალათაში`,
    });
  };
  
  const handleAddToWishlist = (id: string | number) => {
    toast({
      title: "პროდუქტი დამატებულია",
      description: `პროდუქტი (ID: ${id}) დაემატა სასურველებში`,
    });
  };
  
  // Generate pagination links - improved for handling large page counts (up to 250 pages)
  const paginationLinks = () => {
    const links = [];
    const totalPages = paginationInfo.totalPages;
    const currentPageNum = paginationInfo.currentPage;
    
    // Previous page button
    if (currentPageNum > 1) {
      links.push(
        <Button 
          key="prev" 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(currentPageNum - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>წინა</span>
        </Button>
      );
    }
    
    // For large page counts, we need a more efficient pagination display
    // We'll show: first page, current page -1, current page, current page +1, last page
    // With ellipses in between when needed
    
    // Calculate which pages to show
    const pagesToShow = new Set<number>();
    
    // Always show page 1
    pagesToShow.add(1);
    
    // Show current page and adjacent pages
    pagesToShow.add(currentPageNum);
    if (currentPageNum > 1) pagesToShow.add(currentPageNum - 1);
    if (currentPageNum < totalPages) pagesToShow.add(currentPageNum + 1);
    
    // Always show last page if there's more than one page
    if (totalPages > 1) pagesToShow.add(totalPages);
    
    // For medium-sized page ranges, show more pages around current
    if (totalPages <= 10) {
      // For smaller total pages, show all pages
      for (let i = 2; i < totalPages; i++) {
        pagesToShow.add(i);
      }
    } else {
      // For larger total pages, add some context pages
      if (currentPageNum > 3) pagesToShow.add(2);
      if (currentPageNum > 4) pagesToShow.add(3);
      
      if (currentPageNum < totalPages - 2) pagesToShow.add(totalPages - 1);
      if (currentPageNum < totalPages - 3) pagesToShow.add(totalPages - 2);
    }
    
    // Convert to array and sort
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);
    
    // Generate buttons with ellipses
    for (let i = 0; i < sortedPages.length; i++) {
      const page = sortedPages[i];
      
      // Add ellipsis if there's a gap
      if (i > 0 && sortedPages[i] > sortedPages[i-1] + 1) {
        links.push(
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-gray-500">...</span>
        );
      }
      
      // Add page button
      links.push(
        <Button 
          key={page} 
          variant={page === currentPageNum ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
          className={page !== 1 && page !== totalPages && page !== currentPageNum && 
                   (page < currentPageNum - 1 || page > currentPageNum + 1) 
                   ? "hidden sm:flex" : ""}
        >
          {page}
        </Button>
      );
    }
    
    // Next page button
    if (currentPageNum < totalPages) {
      links.push(
        <Button 
          key="next" 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(currentPageNum + 1)}
          className="flex items-center gap-1"
        >
          <span>შემდეგი</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      );
    }
    
    return links;
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm">
        <WouterLink href="/" className="text-neutral-500 hover:text-primary">მთავარი</WouterLink>
        <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
        <span className="font-medium">სურათით ძიება</span>
      </nav>
      
      {/* Page Header - Redesigned */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Image className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">
                სურათით ძიების შედეგები
              </h1>
            </div>
            <div className="mt-3 sm:mt-0">
              <div className="inline-flex items-center bg-neutral-50 px-3 py-1.5 rounded-full text-sm text-neutral-700">
                <span className="font-medium mr-1.5">{paginationInfo?.totalCount?.toLocaleString() || 0}</span> 
                <span>პროდუქტი ნაპოვნია</span>
              </div>
            </div>
          </div>
          
          {/* Compact image preview */}
          {imageUrl && (
            <div className="mt-4 flex items-center">
              <div className="relative border border-neutral-100 rounded-lg overflow-hidden shadow-sm inline-block">
                <img 
                  src={imageUrl} 
                  alt="Search image" 
                  className="h-16 w-16 object-cover bg-white"
                />
                <div className="absolute inset-0 bg-black/5"></div>
              </div>
              <div className="ml-3 text-sm text-neutral-600">
                სურათით ძიების შედეგებს ხედავთ. სისტემამ მოძებნა პროდუქტები, რომლებიც ვიზუალურად მსგავსია თქვენი სურათისა.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Categories from search results */}
        {(categories.length > 0 || subCategories.length > 0) && (
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-800">კატეგორიები</h3>
                </div>
                <ul className="py-2 px-3 space-y-1">
                  {categories.map((category) => (
                    <li key={category.Id}>
                      <WouterLink 
                        href={`/category/${category.Id}`}
                        className="block px-2 py-1.5 text-sm rounded-md hover:bg-blue-50 transition-colors text-gray-700"
                      >
                        {category.Name}
                      </WouterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Subcategories */}
            {subCategories.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-800">ქვეკატეგორიები</h3>
                </div>
                <ul className="py-2 px-3 space-y-1">
                  {subCategories.map((category) => (
                    <li key={category.Id}>
                      <WouterLink 
                        href={`/category/${category.Id}`}
                        className="block px-2 py-1.5 text-sm rounded-md hover:bg-emerald-50 transition-colors text-gray-700"
                      >
                        {category.Name}
                      </WouterLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 min-h-[50vh] bg-white rounded-lg border border-neutral-100 shadow-sm">
              <Loader className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-gray-500">პროდუქტების ჩატვირთვა...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
              <p>{error}</p>
            </div>
          ) : products && products.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-6 text-center my-8">
              <Search className="h-12 w-12 mx-auto text-yellow-500 mb-4 opacity-80" />
              <h3 className="text-lg font-medium mb-2">პროდუქტები ვერ მოიძებნა</h3>
              <p>სამწუხაროდ, თქვენი ძიების შედეგად ვერცერთი პროდუქტი ვერ მოიძებნა.</p>
              <p className="mt-2">გთხოვთ, სცადოთ სხვა სურათით.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    oldPrice={product.oldPrice}
                    imageUrl={product.imageUrl}
                    discountPercentage={product.discountPercentage}
                    stockCount={product.quantity}
                    sign={product.sign}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    customData={true}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
              
              {/* Pagination */}
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
              
              {/* Footer pagination info */}
              {paginationInfo && paginationInfo.totalCount > 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  სულ {paginationInfo.totalCount.toLocaleString()} პროდუქტი
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ImageSearchResults;