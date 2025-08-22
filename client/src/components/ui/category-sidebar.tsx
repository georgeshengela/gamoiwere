import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { CategoryItem } from '@/hooks/useCategories';
import { ChevronRight, ChevronDown, Loader, Grid3X3, ShoppingBag, TagIcon, Store, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { capitalizeGeorgian } from '@/utils/georgian-utils';

interface CategorySidebarProps {
  mainCategories: CategoryItem[];
  subCategories: CategoryItem[];
  isLoading: boolean;
  error: string | null;
  currentCategoryId?: string;
}

// Category icon mapping based on category names for better visual representation
const getCategoryIcon = (category: CategoryItem) => {
  const name = category.Name.toLowerCase();
  
  if (name.includes('ტანსაცმელი') || name.includes('ქალი') || name.includes('კაცი')) {
    return <ShoppingBag className="h-4 w-4 mr-2 text-primary" />;
  } else if (name.includes('სახლი') || name.includes('მაღაზია')) {
    return <Store className="h-4 w-4 mr-2 text-emerald-500" />;
  } else if (name.includes('ფასდაკლება') || name.includes('აქცია')) {
    return <TagIcon className="h-4 w-4 mr-2 text-rose-500" />;
  } else if (name.includes('სილამაზე') || name.includes('აქსესუარები')) {
    return <Sparkles className="h-4 w-4 mr-2 text-amber-500" />;
  }
  
  return <Grid3X3 className="h-4 w-4 mr-2 text-gray-400" />;
};

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  mainCategories,
  subCategories,
  isLoading,
  error,
  currentCategoryId
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Auto-expand the current category and its parents for better UX
  useEffect(() => {
    if (currentCategoryId && subCategories.length > 0) {
      // Find the current category
      const currentCategory = subCategories.find(cat => cat.Id === currentCategoryId);
      if (currentCategory) {
        // Get parent categories
        let parentId = currentCategory.ParentId;
        const expandedCats: Record<string, boolean> = {};
        
        // Expand all parent categories
        while (parentId) {
          expandedCats[parentId] = true;
          const parent = subCategories.find(cat => cat.Id === parentId);
          parentId = parent?.ParentId || '';
        }
        
        // Also expand current category
        expandedCats[currentCategoryId] = true;
        
        setExpandedCategories(prev => ({
          ...prev,
          ...expandedCats
        }));
      }
    }
  }, [currentCategoryId, subCategories]);

  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-md">
        <div className="flex flex-col justify-center items-center h-40">
          <Loader className="h-6 w-6 animate-spin text-primary mb-2" />
          <p className="text-sm text-gray-500">იტვირთება კატეგორიები...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-md">
        <p className="text-red-500 text-sm">დაფიქსირდა შეცდომა კატეგორიების ჩატვირთვისას</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Modern header without gradient */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-medium text-gray-800">კატეგორიები</h3>
        <Grid3X3 className="h-4 w-4 text-gray-500" />
      </div>
      
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
        {/* Main Categories section */}
        {mainCategories.length > 0 && (
          <div className="py-3 px-4">
            <ul className="space-y-2">
              {mainCategories.map((category) => {
                const isActive = currentCategoryId === category.Id;
                const icon = getCategoryIcon(category);
                
                return (
                  <li key={category.Id}>
                    <Link 
                      href={`/category/${category.Id}`}
                      className={cn(
                        "flex items-center px-3 py-2 text-[0.8125rem] rounded-md transition-colors", 
                        isActive 
                          ? "bg-gray-100 text-primary font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {icon}
                      <span>{category.Name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Sub-Categories section with cleaner design */}
        {subCategories.length > 0 && (
          <div className="py-3 px-4 border-t border-gray-100">
            <ul className="space-y-1.5">
              {subCategories.map((category) => {
                const isActive = currentCategoryId === category.Id;
                
                return (
                  <li key={category.Id} className="group">
                    <Link 
                      href={`/category/${category.Id}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-[0.8125rem] rounded-md transition-colors", 
                        isActive 
                          ? "bg-gray-100 text-primary font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{category.Name}</span>
                      <ChevronRight className={cn(
                        "h-4 w-4 text-gray-400 transition-opacity opacity-0 group-hover:opacity-100",
                        isActive && "opacity-100 text-primary"
                      )} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Empty state if no categories */}
        {mainCategories.length === 0 && subCategories.length === 0 && (
          <div className="py-8 px-4 text-center">
            <p className="text-sm text-gray-500">კატეგორიები არ მოიძებნა</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;