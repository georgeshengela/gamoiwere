import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  ChevronRight, 
  User, 
  ShoppingBag, 
  Heart, 
  Shirt, 
  Home, 
  Baby, 
  Palmtree, 
  Smartphone, 
  GraduationCap, 
  Plane, 
  Car, 
  Dumbbell,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories, CategoryItem } from "@/hooks/useCategories";
import { capitalizeGeorgian } from '@/utils/georgian-utils';

type DynamicCategoryMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DynamicCategoryMenu({ isOpen, onClose }: DynamicCategoryMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { categories, isLoading, error } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get icon for main category based on category name or ID
  const getCategoryIcon = (category: CategoryItem) => {
    const name = category.Name.toLowerCase();
    
    if (name.includes("ქალ")) return <User className="h-5 w-5 text-pink-600" />;
    if (name.includes("კაც")) return <User className="h-5 w-5 text-blue-600" />;
    if (name.includes("ბავშვ")) return <Baby className="h-5 w-5 text-yellow-600" />;
    if (name.includes("ტანსაცმელ") || name.includes("მოდა")) return <Shirt className="h-5 w-5 text-purple-600" />;
    if (name.includes("სახლ") || name.includes("ავეჯ")) return <Home className="h-5 w-5 text-green-600" />;
    if (name.includes("ელექტრო") || name.includes("ტექნიკ")) return <Smartphone className="h-5 w-5 text-gray-600" />;
    if (name.includes("სპორტ")) return <Dumbbell className="h-5 w-5 text-red-600" />;
    if (name.includes("წიგნ") || name.includes("განათლებ")) return <BookOpen className="h-5 w-5 text-indigo-600" />;
    if (name.includes("ავტო") || name.includes("მანქან")) return <Car className="h-5 w-5 text-orange-600" />;
    if (name.includes("მოგზაურ")) return <Plane className="h-5 w-5 text-cyan-600" />;
    if (name.includes("სილამაზ")) return <Heart className="h-5 w-5 text-red-400" />;
    
    // Default icon if no match
    return <ShoppingBag className="h-5 w-5 text-primary" />;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Set first category as active when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].Id);
    }
  }, [categories, activeCategory]);

  if (!isOpen) return null;

  // Find the active main category
  const activeCategoryData = categories.find(cat => cat.Id === activeCategory);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20"
      onClick={onClose}
    >
      <div
        ref={menuRef}
        className="absolute top-[100px] left-1/2 transform -translate-x-1/2 w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>კატეგორიების ჩატვირთვა...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>კატეგორიების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.</p>
          </div>
        ) : (
          <div className="flex min-h-[400px] max-h-[80vh]">
            {/* Left sidebar - Main categories */}
            <div className="w-1/4 bg-gray-50 border-r overflow-y-auto max-h-[80vh]">
              <ul className="py-2">
                {categories.map((category) => (
                  <li key={category.Id}>
                    <button
                      className={cn(
                        "flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors",
                        activeCategory === category.Id ? "bg-gray-100 font-medium" : ""
                      )}
                      onClick={() => setActiveCategory(category.Id)}
                    >
                      <span className="flex items-center">
                        <span className="mr-2">{getCategoryIcon(category)}</span>
                        <span>{capitalizeGeorgian(category.Name)}</span>
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right content - Subcategories */}
            <div className="w-3/4 p-6 overflow-y-auto">
              {activeCategoryData?.Children?.map((subcategory) => (
                <div key={subcategory.Id} className="mb-8">
                  <Link 
                    href={`/category/${subcategory.Id}`}
                    onClick={onClose}
                    className="inline-block"
                  >
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 hover:text-primary transition-colors flex items-center">
                      {subcategory.Name}
                      <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
                    </h3>
                  </Link>
                  <ul className="grid grid-cols-3 gap-2">
                    {subcategory.Children?.map((item) => (
                      <li key={item.Id}>
                        <Link 
                          href={`/category/${item.Id}`}
                          className="block py-1.5 px-2 hover:bg-gray-100 rounded text-gray-700 hover:text-primary transition-colors"
                          onClick={onClose}
                        >
                          {item.Name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DynamicCategoryMenuTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center space-x-1 text-gray-700 hover:text-primary"
    >
      <span>კატეგორიები</span>
      <ChevronRight className="h-4 w-4 rotate-90" />
    </button>
  );
}