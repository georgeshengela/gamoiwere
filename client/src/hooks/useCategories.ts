import { useState, useEffect } from 'react';

export interface CategoryItem {
  Id: string;
  ProviderType: string;
  UpdatedTime?: string;
  Name: string;
  Children?: CategoryItem[];
  IsParent?: boolean;
  ParentId?: string;
  IsHidden?: boolean;
  IsInternal?: boolean;
  ItemCount?: number;
  ExternalId?: string;
}

export interface SidebarCategoriesData {
  mainCategories: CategoryItem[];
  subCategories: CategoryItem[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://service.devmonkeys.ge/api/getProviderBriefCatalog');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.Result && data.Result.Roots) {
          setCategories(data.Result.Roots);
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

export const useSidebarCategories = (currentCategoryId?: string) => {
  const [sidebarData, setSidebarData] = useState<SidebarCategoriesData>({
    mainCategories: [],
    subCategories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSidebarCategories = async () => {
      setIsLoading(true);
      try {
        // Use the categoryId parameter, or default to tr-g1 if not provided
        const categoryId = currentCategoryId || 'tr-g1';
        
        // Fetch data directly from the specified API endpoint with dynamic categoryId
        const response = await fetch(`https://service.devmonkeys.ge/api/batchSearchItemsFrame?categoryId=${categoryId}&framePosition=0`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let mainCategories: CategoryItem[] = [];
        let subCategories: CategoryItem[] = [];
        
        // Extract Categories.Content as requested
        if (data?.Result?.Items?.Categories?.Content && Array.isArray(data.Result.Items.Categories.Content)) {
          mainCategories = data.Result.Items.Categories.Content;
        }
        
        // Extract SubCategories.Content as requested
        if (data?.Result?.SubCategories?.Content && Array.isArray(data.Result.SubCategories.Content)) {
          subCategories = data.Result.SubCategories.Content;
        }
        
        // For better user experience, sort by name if needed
        mainCategories.sort((a, b) => a.Name.localeCompare(b.Name));
        subCategories.sort((a, b) => a.Name.localeCompare(b.Name));
        
        setSidebarData({
          mainCategories,
          subCategories
        });
        
        console.log('Sidebar categories loaded:', {
          mainCategories: mainCategories.length,
          subCategories: subCategories.length
        });
      } catch (err) {
        console.error('Error fetching sidebar categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sidebar categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSidebarCategories();
  }, [currentCategoryId]); // Re-fetch when currentCategoryId changes

  return { sidebarData, isLoading, error };
};