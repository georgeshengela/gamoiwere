import HeroSlider from "@/components/HeroSlider";
import CategoryBanner from "@/components/CategoryBanner";
import CurrencyConverter from "@/components/CurrencyConverter";
import PopularBrands from "@/components/PopularBrands";
import PopularProductsGrid from "@/components/PopularProductsGrid";
import RecommendedProductsGrid from "@/components/RecommendedProductsGrid";
import Features from "@/components/Features";
import Newsletter from "@/components/Newsletter";
import LatestSearches from "@/components/LatestSearches";
import Brands from "@/components/Brands";
import { heroSlides, categories, lowerBannerImage } from "@/lib/data";

const Home = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* SEO H1 Heading - Hidden visually but accessible to search engines */}
      <h1 className="sr-only">გამოიწერე - შეუკვეთე პროდუქტები Taobao, Trendyol, AliExpress-დან საქართველოში</h1>
      
      <HeroSlider slides={heroSlides} />
      
      <CategoryBanner categories={categories} />
      
      <CurrencyConverter />
      
      <PopularBrands />
      
      <RecommendedProductsGrid
        title="რეკომენდირებული"
        viewAllLink="/products/recommended"
      />
      
      {/* Promotion Banner */}
      <div className="mb-8 md:mb-12 relative overflow-hidden rounded-lg">
        <img
          src={lowerBannerImage}
          alt="ფასდაკლება ყველა პროდუქტზე"
          className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover object-top"
        />
        <div className="absolute inset-0">
          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5">
            <a
              href="/sales"
              className="bg-black text-white hover:bg-gray-800 px-4 sm:px-6 py-2 sm:py-2.5 rounded-md inline-block transition-colors font-medium text-sm sm:text-base"
            >
              იხილეთ დეტალები
            </a>
          </div>
        </div>
      </div>
      
      <PopularProductsGrid
        title="პოპულარული"
        viewAllLink="/products/popular"
      />
      
      <Features />
      
      <Newsletter />
      
      <LatestSearches />
    </main>
  );
};

export default Home;
