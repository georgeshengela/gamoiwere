import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Home, 
  ShoppingBag, 
  Smile, 
  Smartphone, 
  Heart, 
  Briefcase, 
  BookOpen, 
  Palette, 
  Laptop, 
  Car, 
  Flower2, 
  Paintbrush, 
  FileDigit, 
  Baby, 
  Scissors,
  DumbbellIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: CategoryItem[];
};

type CategoryGroup = {
  title: string;
  items: CategoryItem[];
  href?: string;
};

type MegaMenuProps = {
  categories: CategoryGroup[];
  isOpen: boolean;
  onClose: () => void;
};

export function MegaMenu({ categories, isOpen, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const [activeCategory, setActiveCategory] = useState(0);

  // Main category items for the sidebar
  const mainCategories = [
    { title: "ქალისთვის", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 0 1 8 0v5H8V2z"/><rect x="2" y="7" width="20" height="15" rx="2"/></svg> },
    { title: "მამაკაცებისთვის", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
    { title: "ბავშვებისთვის", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6"/><path d="M11 18V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h9"/><path d="M5 21c0-2.5 5-2.5 5 0"/><path d="M18 21c0-2.5 5-2.5 5 0"/></svg> },
    { title: "საყოფაცხოვრებო ტექნიკა და ავეჯი", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { title: "ყოველდღიური მოთხოვნის პროდუქტები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { title: "სილამაზე და ჰიგიენა", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
    { title: "ფეხსაცმელი", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2v6h6"/><path d="M8 2v6H2"/><path d="M22 12v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2Z"/><path d="M12 10v8"/></svg> },
    { title: "სპორტისთვის გარეთ", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg> },
    { title: "ელექტრონიკა", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
    { title: "ქსოვილი", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
    { title: "ტანსაცმელი ორსული ქალებისთვის", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> },
    { title: "სამსახური", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { title: "წიგნები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { title: "ჰობი და არდადეგები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 14.5a3.5 3.5 0 0 0-7 0v7l1 1 1.42-1.42a2 2 0 0 1 2.83 0L17 22Z"/><circle cx="10" cy="6.5" r=".5"/><path d="M7 14.5V21"/></svg> },
    { title: "მოწყობილობები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/><line x1="12" y1="20" x2="12" y2="17"/></svg> },
    { title: "მანქანები და მოტოციკლები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="16" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/></svg> },
    { title: "სახლისა და ბაღის მოწყობა", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a6 6 0 0 0-6-6H3v12h3a6 6 0 0 0 6-6Z"/><path d="M12 10a6 6 0 0 1 6-6h3v12h-3a6 6 0 0 1-6-6Z"/><path d="M12 22v-8.5"/></svg> },
    { title: "ნამუშევრები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h18l1 1"/><path d="M7 6h10"/><path d="M12 18v-6"/><rect x="8" y="12" width="8" height="6"/><path d="M4 10v6"/><path d="M20 10v6"/></svg> },
    { title: "ციფრული საქონელი", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg> },
    { title: "დედა და ბავშვი და ბავშვები", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.5.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg> },
  ];

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50 transition-all duration-300 ease-in-out",
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}
      style={{ 
        transform: isOpen ? 'translateY(0)' : 'translateY(-1rem)',
        maxHeight: isOpen ? '85vh' : '0',
        overflow: 'auto'
      }}
    >
      <div className="container mx-auto py-6 px-4">
        <div className="flex">
          {/* Left sidebar with main categories */}
          <div className="w-80 border-r border-gray-100 pr-4 hidden md:block">
            <ul className="space-y-1">
              {mainCategories.map((category, idx) => (
                <li key={idx}>
                  <button
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors",
                      activeCategory === idx 
                        ? "bg-gray-100 text-primary" 
                        : "hover:bg-gray-50 text-gray-700 hover:text-primary"
                    )}
                    onClick={() => setActiveCategory(idx)}
                  >
                    <span className="text-gray-500">
                      {category.icon}
                    </span>
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right side with subcategories - just 2 fixed rows */}
          <div className="flex-1 pl-0 md:pl-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First row - two columns */}
              <div className="mb-4">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <Link 
                    href="/category/phones"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    ტელეფონები და აქსესუარები
                  </Link>
                </div>
                <div className="space-y-2.5">
                  <div className="mb-1.5">
                    <Link
                      href="/category/phones/mobile"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      მობილური ტელეფონები
                    </Link>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/phones/accessories"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      მობილური ტელეფონების აქსესუარები
                    </Link>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/phones/screen-protectors"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      ეკრანის დამცავები
                    </Link>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/phones/installation"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      ეკრანის დამცავი მინების დამაგრება
                    </Link>
                  </div>
                </div>
                <Link
                  href="/category/phones"
                  className="text-xs text-primary hover:text-primary-dark hover:underline inline-block mt-2"
                  onClick={onClose}
                >
                  სრულად
                </Link>
              </div>
              
              <div className="mb-4">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <Link 
                    href="/category/computers"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    კომპიუტერული ტექნიკა
                  </Link>
                </div>
                <div className="space-y-2.5">
                  <div className="mb-4">
                    <Link
                      href="/category/computers/laptops"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      ლეპტოპები
                    </Link>
                    <div className="pl-2 mt-1.5 space-y-1.5">
                      <Link
                        href="/category/computers/laptops/apple"
                        className="text-xs text-gray-600 hover:text-primary transition-colors block"
                        onClick={onClose}
                      >
                        Apple
                      </Link>
                      <Link
                        href="/category/computers/laptops/lenovo"
                        className="text-xs text-gray-600 hover:text-primary transition-colors block"
                        onClick={onClose}
                      >
                        Lenovo
                      </Link>
                    </div>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/computers/desktops"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      დესკტოპები
                    </Link>
                  </div>
                </div>
                <Link
                  href="/category/computers"
                  className="text-xs text-primary hover:text-primary-dark hover:underline inline-block mt-2"
                  onClick={onClose}
                >
                  სრულად
                </Link>
              </div>
              
              {/* Second row - two columns */}
              <div className="mb-4">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <Link 
                    href="/category/audio"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    აუდიო ტექნიკა
                  </Link>
                </div>
                <div className="space-y-2.5">
                  <div className="mb-4">
                    <Link
                      href="/category/audio/headphones"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      ყურსასმენები
                    </Link>
                    <div className="pl-2 mt-1.5 space-y-1.5">
                      <Link
                        href="/category/audio/headphones/wireless"
                        className="text-xs text-gray-600 hover:text-primary transition-colors block"
                        onClick={onClose}
                      >
                        უსადენო ყურსასმენები
                      </Link>
                      <Link
                        href="/category/audio/headphones/wired"
                        className="text-xs text-gray-600 hover:text-primary transition-colors block"
                        onClick={onClose}
                      >
                        სადენიანი ყურსასმენები
                      </Link>
                    </div>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/audio/speakers"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      დინამიკები
                    </Link>
                  </div>
                </div>
                <Link
                  href="/category/audio"
                  className="text-xs text-primary hover:text-primary-dark hover:underline inline-block mt-2"
                  onClick={onClose}
                >
                  სრულად
                </Link>
              </div>
              
              <div className="mb-4">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <Link 
                    href="/category/home"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    საყოფაცხოვრებო
                  </Link>
                </div>
                <div className="space-y-2.5">
                  <div className="mb-1.5">
                    <Link
                      href="/category/home/washing-machines"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      სარეცხი მანქანები
                    </Link>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/home/fridges"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      მაცივრები
                    </Link>
                  </div>
                  <div className="mb-1.5">
                    <Link
                      href="/category/home/dishwashers"
                      className="text-xs font-medium text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                      onClick={onClose}
                    >
                      ჭურჭლის სარეცხი მანქანები
                    </Link>
                  </div>
                </div>
                <Link
                  href="/category/home"
                  className="text-xs text-primary hover:text-primary-dark hover:underline inline-block mt-2"
                  onClick={onClose}
                >
                  სრულად
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryMenuTriggerProps {
  label: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

export function CategoryMenuTrigger({ 
  label, 
  icon, 
  isOpen, 
  onClick 
}: CategoryMenuTriggerProps) {
  return (
    <div className="font-normal flex items-center gap-1 h-full">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 transition-colors",
          isOpen ? "text-primary" : "text-gray-800 hover:text-primary"
        )}
      >
        {icon}
        <span className="mt-px">{label}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-300",
          isOpen ? "rotate-180" : ""
        )} />
      </button>
    </div>
  );
}