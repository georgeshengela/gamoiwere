import { useState, useEffect } from 'react';
import { transformApiProduct } from '@/lib/productUtils';
import { trackSearchKeyword } from '@/lib/searchTracking';

export interface SearchPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoryItem {
  Id: number;
  Name: string;
}

export const useSearchResults = (searchQuery: string, page: number = 1) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<SearchPaginationInfo>({
    currentPage: 1,
    totalPages: 1, // Default to 1 page initially, will be updated based on total count
    totalCount: 0, // Will be updated with the actual count from the API response
    hasNextPage: false,
    hasPreviousPage: false
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Track the search keyword
      trackSearchKeyword(searchQuery).catch(console.error);

      setIsLoading(true);
      setError(null);
      setProducts([]); // Clear products while loading to prevent showing old products during transitions

      try {
        // Calculate frame position based on page (20 items per page)
        // For page 1: framePosition = 0
        // For page 2: framePosition = 20
        // For page 3: framePosition = 40
        // etc.
        const framePosition = (page - 1) * 20;
        const frameSize = 20;

        // Use smart search that translates query to Turkish behind the scenes
        const smartSearchResponse = await fetch('/api/smart-search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: searchQuery })
        });

        if (!smartSearchResponse.ok) {
          throw new Error(`Smart search failed with status ${smartSearchResponse.status}`);
        }

        const smartSearchData = await smartSearchResponse.json();
        
        // Now fetch paginated results using the Turkish query
        const url = `https://service.devmonkeys.ge/api/batchSearchItemsFrameForSearch?itemTitle=${encodeURIComponent(smartSearchData.turkishQuery || searchQuery)}&framePosition=${framePosition}&frameSize=${frameSize}`;
        console.log('Fetching search results from:', url);
        console.log('Original query:', searchQuery, 'Turkish query:', smartSearchData.turkishQuery);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // The API returns a structure where data.Result.Items.Items.Content contains the products
        if (data && data.Result && data.Result.Items && 
            data.Result.Items.Items && data.Result.Items.Items.Content) {
          
          const itemsArray = data.Result.Items.Items.Content;
          
          if (Array.isArray(itemsArray) && itemsArray.length > 0) {
            // Transform products to our application format
            const transformedProducts = itemsArray.map((item: any) => {
              return transformApiProduct(item);
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
          
          // Log the TotalCount from API response (correct path)
          console.log('Search API TotalCount:', data.Result.Items.Items.TotalCount);
          
          setCategories(categoriesData);
          setSubCategories(subCategoriesData);

          // Calculate total pages based on total product count divided by products per page
          const totalCount = data.Result.Items.Items.TotalCount || 0;
          const itemsPerPage = 20;
          const totalPages = Math.ceil(totalCount / itemsPerPage);
          
          console.log(`Search results: Total products: ${totalCount}, Items per page: ${itemsPerPage}, Total pages: ${totalPages}`);
          
          setPaginationInfo({
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          });
        } else {
          // API returned data but not in expected format or no results
          setProducts([]);
          setCategories([]);
          setSubCategories([]);
          
          // Even with no results, maintain the 250 page structure
          setPaginationInfo({
            currentPage: page,
            totalPages: 250,
            totalCount: 0, // No results found
            hasNextPage: page < 250,
            hasPreviousPage: page > 1
          });
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('ძიების დროს დაფიქსირდა შეცდომა. გთხოვთ, სცადოთ მოგვიანებით.');
        setProducts([]);
        
        // Ensure pagination is still shown even on error
        // Keep the existing totalCount, don't reset it on error
        setPaginationInfo(prevInfo => ({
          currentPage: page,
          totalPages: 250,
          totalCount: prevInfo.totalCount, // Maintain previous total count
          hasNextPage: page < 250,
          hasPreviousPage: page > 1
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, page]);

  return { 
    products, 
    isLoading, 
    error, 
    paginationInfo,
    categories,
    subCategories
  };
};