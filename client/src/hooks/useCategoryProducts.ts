import { useState, useEffect } from 'react';

// Define the product interface
export interface CategoryProduct {
  Id: string;
  Title: string;
  MainPictureUrl: string;
  Pictures?: {
    Url: string;
    IsMain?: boolean;
  }[];
  Price: {
    ConvertedPriceList: {
      DisplayedMoneys: {
        MainValue: number;
        OldValue?: number;
        Sign: string;
      }[];
    };
  };
  SaleStatus?: {
    Sales: number;
  };
  Quantity: number;
  IsSellAllowed: boolean;
  HasDiscount?: boolean;
  DiscountRate?: number;
}

export interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalCount?: number; // Add the TotalCount from API response
}

export const useCategoryProducts = (categoryId: string, page: number = 1) => {
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalPages: 1, // Default to 1 page initially
    currentPage: page,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      setProducts([]); // Clear products while loading to prevent showing old products during transitions
      try {
        // Calculate framePosition based on the page number
        // Page 1 -> framePosition=0, Page 2 -> framePosition=20, etc.
        const framePosition = (page - 1) * 20;
        
        console.log(`Fetching products for category: ${categoryId}, page: ${page}, framePosition: ${framePosition}`);
        const response = await fetch(
          `https://service.devmonkeys.ge/api/batchSearchItemsFrame?categoryId=${categoryId}&framePosition=${framePosition}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        // Looking at the response structure in the console, the items are nested in Result.Items.Items.Content
        if (data && data.Result && data.Result.Items && data.Result.Items.Items && data.Result.Items.Items.Content) {
          // The actual items are in data.Result.Items.Items.Content array
          setProducts(data.Result.Items.Items.Content);
          
          // Update pagination info if available
          if (data.Result.Items.Items.TotalCount) {
            const totalItems = data.Result.Items.Items.TotalCount;
            const itemsPerPage = 20; // Products per page
            // Calculate total pages by dividing total products by products per page
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const totalCount = data.Result.Items.Items.TotalCount; // Capture the total count
            
            console.log(`Total products: ${totalItems}, Items per page: ${itemsPerPage}, Total pages: ${totalPages}`);
            
            setPaginationInfo({
              totalPages, // Use the calculated total pages without cap
              currentPage: page,
              totalItems,
              itemsPerPage,
              totalCount  // Store the total count from API
            });
          }
          
          console.log(`Loaded ${data.Result.Items.Items.Content.length} products from API`);
        } else if (data && data.Result && data.Result.Items && Array.isArray(data.Result.Items)) {
          // Alternative structure - direct array
          setProducts(data.Result.Items);
          console.log(`Loaded ${data.Result.Items.length} products from API`);
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Unexpected API response format');
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch category products');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId, page]);

  return { products, isLoading, error, paginationInfo };
};