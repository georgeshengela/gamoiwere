import { useState, useEffect } from "react";
import { useRoute, Link as WouterLink } from "wouter";
import { 
  ChevronRight, 
  ChevronLeft,
  Search,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/ui/custom-pagination";
import { useToast } from "@/hooks/use-toast";
import { useSearchResults } from "@/hooks/useSearchResults";
import ProductCard from "@/components/ui/product-card";

const SearchResults = () => {
  const [, params] = useRoute("/search/:query");
  const { toast } = useToast();
  const searchQuery = params?.query ? decodeURIComponent(params.query) : "";
  
  // State for current page
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Fetch search results with pagination
  const { 
    products, 
    isLoading, 
    error, 
    paginationInfo,
    categories,
    subCategories
  } = useSearchResults(searchQuery, currentPage);
  
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
        <span className="font-medium">ძიების შედეგები</span>
      </nav>
      
      {/* Page Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-100 p-4 sm:p-6">
          {/* Mobile Layout */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center flex-1 min-w-0 pr-3">
              <div className="mr-2 bg-blue-50 text-blue-600 p-1.5 rounded-lg flex-shrink-0">
                <Search className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800 leading-tight truncate">
                ძიების შედეგები: <span className="text-primary">"{searchQuery}"</span>
              </h1>
            </div>
            <div className="flex items-center">
              <div className="w-px h-6 bg-gray-300 mr-3"></div>
              <div className="inline-flex items-center bg-neutral-50 px-2.5 py-1 rounded-full text-xs text-neutral-700 flex-shrink-0">
                <span className="font-medium mr-1">{paginationInfo?.totalCount?.toLocaleString() || 0}</span> 
                <span>ნაპოვნია</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">
                ძიების შედეგები: <span className="text-primary">"{searchQuery}"</span>
              </h1>
            </div>
            <div className="inline-flex items-center bg-neutral-50 px-3 py-1.5 rounded-full text-sm text-neutral-700">
              <span className="font-medium mr-1.5">{paginationInfo?.totalCount?.toLocaleString() || 0}</span> 
              <span>პროდუქტი ნაპოვნია</span>
            </div>
          </div>
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
              <p className="mt-2">გთხოვთ, სცადოთ სხვა საძიებო სიტყვა.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
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

export default SearchResults;