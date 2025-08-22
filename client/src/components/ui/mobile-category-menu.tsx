import React, { useRef } from "react";
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
  BookOpen,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories, CategoryItem } from "@/hooks/useCategories";

type MobileCategoryMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileCategoryMenu({ isOpen, onClose }: MobileCategoryMenuProps) {
  const { categories, isLoading, error } = useCategories();

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">კატეგორიები</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>კატეგორიების ჩატვირთვა...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>კატეგორიების ჩატვირთვა ვერ მოხერხდა.</p>
          </div>
        ) : (
          <ul className="py-2">
            {categories.map((category) => (
              <li key={category.Id} className="border-b border-gray-100 last:border-b-0">
                <Link
                  href={`/category/${category.Id}`}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <span className="mr-3">{getCategoryIcon(category)}</span>
                  <span>{category.Name}</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}