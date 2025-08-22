import React from 'react';
import { useSidebarCategories } from '@/hooks/useCategories';
import CategorySidebar from './category-sidebar';

interface CategorySidebarPanelProps {
  currentCategoryId?: string;
}

const CategorySidebarPanel: React.FC<CategorySidebarPanelProps> = ({ currentCategoryId }) => {
  // Fetch categories data from API for sidebar with current category ID
  const { sidebarData, isLoading, error } = useSidebarCategories(currentCategoryId);

  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      <div className="sticky top-24">
        {/* Modern category sidebar with real API data */}
        <CategorySidebar
          mainCategories={sidebarData.mainCategories}
          subCategories={sidebarData.subCategories}
          isLoading={isLoading}
          error={error}
          currentCategoryId={currentCategoryId}
        />
      </div>
    </div>
  );
};

export default CategorySidebarPanel;