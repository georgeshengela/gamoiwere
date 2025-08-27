import HeroSlider from '@/components/HeroSlider';
import CategoryBanner from '@/components/CategoryBanner';
import CurrencyConverter from '@/components/CurrencyConverter';
import PopularBrands from '@/components/PopularBrands';
import PopularProductsGrid from '@/components/PopularProductsGrid';
import RecommendedProductsGrid from '@/components/RecommendedProductsGrid';
import Features from '@/components/Features';
import Newsletter from '@/components/Newsletter';
import LatestSearches from '@/components/LatestSearches';
import Brands from '@/components/Brands';
import { heroSlides, categories, lowerBannerImage } from '@/lib/data';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* SEO H1 Heading - Hidden visually but accessible to search engines */}
      <h1 className="sr-only">
        გამოიწერე - შეუკვეთე პროდუქტები Taobao, Trendyol, AliExpress-დან
        საქართველოში
      </h1>

      <HeroSlider slides={heroSlides} />

      <CategoryBanner categories={categories} />

      <CurrencyConverter />

      <PopularBrands />

      <RecommendedProductsGrid
        title="რეკომენდირებული"
        viewAllLink="/products/recommended"
      />

      {/* Promotion Banner */}
      <motion.div
        className="mb-8 md:mb-12 relative overflow-hidden rounded-lg group cursor-pointer"
        whileHover="hover"
        initial="initial"
        animate="initial"
      >
        <motion.img
          src={lowerBannerImage}
          alt="ფასდაკლება ყველა პროდუქტზე"
          className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover object-top"
          variants={{
            initial: { scale: 1 },
            hover: {
              scale: 1.05,
              transition: { duration: 0.6, ease: 'easeOut' },
            },
          }}
        />
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-30"
          variants={{
            initial: { opacity: 0.3 },
            hover: {
              opacity: 0.4,
              transition: { duration: 0.3 },
            },
          }}
        >
          <motion.div
            className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5"
            variants={{
              initial: { x: 0 },
              hover: {
                x: 5,
                transition: { duration: 0.3 },
              },
            }}
          >
            <motion.a
              href="/sales"
              className="bg-black text-white hover:bg-gray-800 px-4 sm:px-6 py-2 sm:py-2.5 rounded-md inline-block transition-colors font-medium text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              იხილეთ დეტალები
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      <PopularProductsGrid title="პოპულარული" viewAllLink="/products/popular" />

      <Features />

      <Newsletter />

      <LatestSearches />
    </main>
  );
};

export default Home;
