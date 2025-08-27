import { useState, useEffect, useRef, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import logoImage from '@assets/Asset 13@4x.png';
import { useCart } from '@/components/cart/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MegaMenu, CategoryMenuTrigger } from '@/components/ui/mega-menu';
import {
  DynamicCategoryMenu,
  DynamicCategoryMenuTrigger,
} from '@/components/ui/dynamic-category-menu';
import { MobileCategoryMenu } from '@/components/ui/mobile-category-menu';
import { categoryData, getCategoryIcon } from '@/lib/category-data.tsx';
import {
  Search,
  Phone,
  Mail,
  Heart,
  ShoppingBag,
  ChevronDown,
  Home,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Watch,
  Gamepad,
  Tablet,
  Camera,
  TagIcon,
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  LogOut,
  ShoppingCart,
  CreditCard,
  Settings,
  Grid,
  ImageIcon,
  Baby,
} from 'lucide-react';
import ImageSearchUpload from '@/components/ui/image-search-upload';
import { motion } from 'framer-motion';

interface HeaderProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const Header = ({ onLoginClick, onRegisterClick }: HeaderProps) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isDynamicCategoryMenuOpen, setIsDynamicCategoryMenuOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestion, setSearchSuggestion] = useState<{
    hasSuggestion: boolean;
    originalQuery?: string;
    suggestedQuery?: string;
    queryType?: string;
    confidence?: number;
  } | null>(null);
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoryMenuOpen, setIsMobileCategoryMenuOpen] =
    useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileCategoryMenuRef = useRef<HTMLDivElement>(null);
  const mainSearchRef = useRef<HTMLDivElement>(null);
  const stickySearchRef = useRef<HTMLDivElement>(null);

  // Check for search suggestions when user types
  useEffect(() => {
    const checkSearchSuggestions = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await fetch(
            `/api/search-suggestions/${encodeURIComponent(searchQuery.trim())}`
          );
          if (response.ok) {
            const suggestion = await response.json();
            setSearchSuggestion(suggestion);
          }
        } catch (error) {
          console.error('Search suggestion error:', error);
        }
      } else {
        setSearchSuggestion(null);
      }
    };

    const timeoutId = setTimeout(checkSearchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search form submissions with intelligent correction
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let finalQuery = searchQuery.trim();

      // Use corrected query if available
      if (searchSuggestion?.hasSuggestion) {
        finalQuery = searchSuggestion.suggestedQuery || searchQuery.trim();
      }

      const encodedQuery = encodeURIComponent(finalQuery);
      navigate(`/search/${encodedQuery}`);
      setSearchQuery('');
      setSearchSuggestion(null);
    }
  };

  // Handle using suggested query directly
  const useSuggestedQuery = () => {
    if (searchSuggestion?.suggestedQuery) {
      setSearchQuery(searchSuggestion.suggestedQuery);
      setSearchSuggestion(null);
    }
  };

  // Super simple scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Close mobile menus when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        mobileCategoryMenuRef.current &&
        !mobileCategoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileCategoryMenuOpen(false);
      }
    };

    // Handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMobileCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <>
      {/* Main header (always in the flow) */}
      <header
        className={`bg-white w-full border-b transition-all duration-300 ${
          isScrolled ? 'border-transparent' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Main Header */}
          <div
            className={`flex justify-between items-center transition-all duration-300 ${
              isScrolled ? 'py-3' : 'py-4'
            }`}
          >
            {/* Logo and menu button for mobile */}
            <div className="flex items-center">
              <button
                className="mr-3 md:hidden text-gray-700 hover:text-primary"
                onClick={() => setIsMobileCategoryMenuOpen(true)}
                aria-label="Open categories menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/" className="flex items-center">
                <img src={logoImage} alt="GAMOIWERE" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Search bar - hidden on mobile, will be below header */}
            <div
              className="flex-grow mx-4 relative hidden sm:block"
              ref={mainSearchRef}
            >
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="ძიება პროდუქტებში..."
                  className="w-full pr-24 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-12 flex items-center">
                  <ImageSearchUpload />
                </div>
                <Button
                  className="absolute inset-y-0 right-0 px-4 rounded-l-none"
                  size="icon"
                  type="submit"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Icons for wishlist, cart and login */}
            <div className="flex items-center gap-4">
              <Link href="/wishlist" className="relative">
                <Heart className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="flex items-center">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-secondary text-white text-xs rounded-full">
                    {totalItems}
                  </span>
                </div>
              </Link>

              {/* Notification Bell - only show for authenticated users */}
              {isAuthenticated && <NotificationBell />}

              {/* Login button or User Avatar */}
              <div className="relative z-50">
                {isAuthenticated ? (
                  <>
                    {/* Desktop avatar */}
                    <div className="hidden md:block">
                      <UserAvatar
                        username={user?.username || ''}
                        email={user?.email}
                      />
                    </div>
                    {/* Mobile avatar */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-gray-700 hover:text-primary"
                      >
                        <User className="h-6 w-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop login button */}
                    <button
                      onClick={onLoginClick}
                      className="hidden md:flex items-center border border-gray-200 rounded-md py-1.5 px-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="h-5 w-5 mr-1.5" />
                      <span className="font-medium">შესვლა</span>
                    </button>
                    {/* Mobile login button */}
                    <button
                      onClick={onLoginClick}
                      className="md:hidden text-gray-700 hover:text-primary"
                    >
                      <User className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search bar below header for mobile */}
          <div className="sm:hidden py-3 border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="ძიება პროდუქტებში..."
                className="w-full pr-24 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-12 flex items-center">
                <ImageSearchUpload />
              </div>
              <Button
                className="absolute inset-y-0 right-0 px-4 rounded-l-none"
                size="icon"
                type="submit"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Navigation - hidden on mobile, moved to sidebar */}
          <div className="relative">
            <nav
              className={`hidden md:block transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-visible ${
                isScrolled ? 'max-h-0 opacity-0' : 'max-h-28 opacity-100 pb-3'
              }`}
            >
              <div className="overflow-x-auto scrollbar-minimal pb-4">
                <ul className="flex gap-2 min-w-max px-2 pt-2">
                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    {/* Categories dropdown trigger */}
                    <motion.div
                      className="flex items-center cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                      onClick={() =>
                        setIsDynamicCategoryMenuOpen(!isDynamicCategoryMenuOpen)
                      }
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-gray-50 p-1.5 rounded-lg mr-2.5">
                        <Grid className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        კატეგორიები
                      </span>
                    </motion.div>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-g1"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-pink-50 p-1.5 rounded-lg mr-2.5">
                        <User className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        ქალი
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-g2"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-blue-50 p-1.5 rounded-lg mr-2.5">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        მამაკაცი
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-g3"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-amber-50 p-1.5 rounded-lg mr-2.5">
                        <Baby className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        ბავშვები
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-104024"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-indigo-50 p-1.5 rounded-lg mr-2.5">
                        <Smartphone className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        ელექტრონიკა
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-145704"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-emerald-50 p-1.5 rounded-lg mr-2.5">
                        <Home className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700 whitespace-nowrap">
                        ტექნიკა და ავეჯი
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-89"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-rose-50 p-1.5 rounded-lg mr-2.5">
                        <Heart className="h-4 w-4 text-rose-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        სილამაზე
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-104625"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-purple-50 p-1.5 rounded-lg mr-2.5">
                        <Baby className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        ორსულები
                      </span>
                    </Link>
                  </motion.li>

                  <motion.li
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <Link
                      href="/category/tr-g2c34"
                      className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-gray-300/80 hover:shadow-md px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[120px]"
                    >
                      <div className="bg-cyan-50 p-1.5 rounded-lg mr-2.5">
                        <Watch className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="text-xs  uppercase tracking-wide text-gray-700">
                        საათები
                      </span>
                    </Link>
                  </motion.li>
                </ul>
              </div>
            </nav>

            {/* Dynamic Category Menu */}
            <DynamicCategoryMenu
              isOpen={isDynamicCategoryMenuOpen}
              onClose={() => setIsDynamicCategoryMenuOpen(false)}
            />
          </div>
        </div>
      </header>

      {/* Sticky header overlay for desktop */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-md transition-transform duration-300 ease-out hidden sm:block ${
          isScrolled ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link href="/" className="flex items-center">
              <img src={logoImage} alt="GAMOIWERE" className="h-10 w-auto" />
            </Link>

            <div className="flex-grow mx-4 relative" ref={stickySearchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="ძიება პროდუქტებში..."
                  className="w-full pr-24 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-12 flex items-center">
                  <ImageSearchUpload />
                </div>
                <Button
                  className="absolute inset-y-0 right-0 px-4 rounded-l-none"
                  size="icon"
                  type="submit"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/wishlist" className="relative hover:text-primary">
                <Heart className="h-6 w-6" />
              </Link>
              <Link
                href="/cart"
                className="flex items-center hover:text-primary"
              >
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-secondary text-white text-xs rounded-full">
                    {totalItems}
                  </span>
                </div>
              </Link>

              {/* Login button or User Avatar for sticky header */}
              <div className="relative z-50">
                {isAuthenticated ? (
                  <UserAvatar
                    username={user?.username || ''}
                    email={user?.email}
                  />
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="flex items-center border border-gray-200 rounded-md py-1.5 px-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogIn className="h-5 w-5 mr-1.5" />
                    <span className="font-medium">შესვლა</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky header - simplified with just search that stays when scrolling */}
      <div
        className={`sm:hidden fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ease-out ${
          isScrolled ? 'translate-y-0 shadow-md' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="ძიება პროდუქტებში..."
              className="w-full pr-10 border-gray-200"
            />
            <Button
              className="absolute inset-y-0 right-0 px-4 rounded-l-none"
              size="icon"
              type="submit"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar menu - slides in from the right */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile menu header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">მენიუ</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User profile or Login/Register section */}
          <div className="border-b border-gray-200 p-4">
            {isAuthenticated ? (
              <div className="flex flex-col items-center mb-2">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage alt={user?.username} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{user?.username}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 w-full">
                  <Link
                    href="/profile"
                    className="bg-blue-50 text-blue-600 py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    პროფილი
                  </Link>
                  <Link
                    href="/orders"
                    className="bg-amber-50 text-amber-600 py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    შეკვეთები
                  </Link>
                  <Link
                    href="/wishlist"
                    className="bg-red-50 text-red-600 py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    რჩეულები
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-gray-100 text-gray-800 py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    გასვლა
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-2">
                <Link
                  href="/login"
                  className="flex-1 bg-primary text-white py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  შესვლა
                </Link>
                <Link
                  href="/register"
                  className="flex-1 bg-gray-100 text-gray-800 py-2 px-3 rounded flex items-center justify-center gap-1 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus className="h-4 w-4" />
                  რეგისტრაცია
                </Link>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="p-4">
            <h3 className="text-[14px] tracking-wider mb-4">კატეგორიები</h3>
            <div className="overflow-x-auto pb-4 scrollbar-none">
              <ul className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-max md:min-w-0">
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Home className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      მთავარი
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/smartphones"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Smartphone className="h-6 w-6 text-purple-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      სმარტფონები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/laptops"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Laptop className="h-6 w-6 text-teal-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      ლეპტოპები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/audio"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Headphones className="h-6 w-6 text-indigo-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      აუდიო
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/tvs"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Tv className="h-6 w-6 text-emerald-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      ტელევიზორები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/smartwatches"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Watch className="h-6 w-6 text-cyan-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      სმარტ საათები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/gaming"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Gamepad className="h-6 w-6 text-rose-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      გეიმინგი
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/tablets"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Tablet className="h-6 w-6 text-amber-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      ტაბლეტები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/category/cameras"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-lime-50 to-lime-100 hover:from-lime-100 hover:to-lime-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Camera className="h-6 w-6 text-lime-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-gray-700">
                      კამერები
                    </span>
                  </Link>
                </motion.li>

                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="transform-gpu"
                >
                  <Link
                    href="/sales"
                    className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="bg-white p-3 rounded-lg shadow-sm mb-2"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <TagIcon className="h-6 w-6 text-red-600" />
                    </motion.div>
                    <span className="text-[13px] tracking-wide text-red-600">
                      ფასდაკლებები
                    </span>
                  </Link>
                </motion.li>
              </ul>
            </div>
          </div>

          {/* Contact info */}
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              კონტაქტი
            </h3>
            <div className="space-y-2">
              <a
                href="tel:+995 32 123 4567"
                className="flex items-center gap-2 text-gray-600"
              >
                <Phone className="h-4 w-4 text-primary" />
                +995 32 123 4567
              </a>
              <a
                href="mailto:info@gamoiwere.ge"
                className="flex items-center gap-2 text-gray-600"
              >
                <Mail className="h-4 w-4 text-primary" />
                info@gamoiwere.ge
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile category menu - slides in from the left */}
      <MobileCategoryMenu
        isOpen={isMobileCategoryMenuOpen}
        onClose={() => setIsMobileCategoryMenuOpen(false)}
      />

      {/* Unified Search Suggestion Dropdown */}
      {searchSuggestion?.hasSuggestion && (
        <div
          className={`fixed left-0 right-0 z-[60] pt-[65px] md:pt-0 ${
            isScrolled ? 'top-[68px]' : 'top-[68px] sm:top-[68px]'
          }`}
        >
          <div className="container mx-auto px-4">
            {/* Search suggestion that matches search bar width and position */}
            <div
              className={`bg-white border border-gray-200 rounded-lg shadow-xl ${
                isScrolled
                  ? 'mx-0 sm:ml-[50px] sm:mr-[200px]'
                  : 'mx-0 sm:ml-[122px] sm:mr-[248px]'
              } backdrop-blur-sm`}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        (searchSuggestion as any).isAiGenerated
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                    <span
                      className="font-medium text-gray-700 flex-1"
                      style={{ fontSize: '13px' }}
                    >
                      {searchSuggestion.queryType === 'brand_correction'
                        ? 'ბრენდის სახელის შესწორება:'
                        : searchSuggestion.queryType === 'phonetic_variation'
                        ? 'ჩვენი ციფრული ასისტენტი გთავაზობთ:'
                        : 'მართლწერის შესწორება:'}
                    </span>
                    {(searchSuggestion as any).isAiGenerated && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-gray-500 bg-gray-50 px-2 py-1 rounded"
                      style={{ fontSize: '13px' }}
                    >
                      {searchSuggestion.confidence}%
                    </span>
                    <button
                      onClick={() => setSearchSuggestion(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full"
                      aria-label="Close suggestion"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-gray-500 line-through flex-shrink-0"
                    style={{ fontSize: '13px' }}
                  >
                    {searchSuggestion.originalQuery}
                  </span>
                  <span className="text-gray-400">→</span>
                  <button
                    onClick={useSuggestedQuery}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors flex-1 text-left"
                    style={{ fontSize: '13px' }}
                  >
                    {searchSuggestion.suggestedQuery}
                  </button>
                </div>

                <div
                  className="text-gray-500 mb-3 leading-relaxed"
                  style={{ fontSize: '13px' }}
                >
                  {(searchSuggestion as any).isAiGenerated
                    ? 'AI-ით ავტომატურად აღმოჩენილი შესწორება - ღილაკზე დაჭერით გამოიყენება'
                    : 'ღილაკზე დაჭერით ან Enter-ით ავტომატურად გამოიყენება შესწორებული ვარიანტი'}
                </div>

                <div className="flex items-center gap-2 text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span
                    className="leading-relaxed"
                    style={{ fontSize: '13px' }}
                  >
                    ხელოვნური ინტელექტი გეხმარებათ ძებნის გამოცდილება სრულყოფილი
                    გახადოთ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
