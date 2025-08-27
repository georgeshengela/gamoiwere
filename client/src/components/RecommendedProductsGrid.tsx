import { ChevronRight, Star } from 'lucide-react';
import ProductCard from '@/components/ui/product-card';
import { useRecommendedProducts } from '@/hooks/useRecommendedProducts';
import { useToast } from '@/hooks/use-toast';
import { addItemToCart } from '@/utils/cartUtils';
import { Loader } from '@/components/ui/loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendedProductsGridProps {
  title: string;
  viewAllLink?: string;
}

const easeInOutQuart = [0.76, 0, 0.24, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: easeInOutQuart,
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeInOutQuart,
    },
  },
};

const RecommendedProductsGrid = ({
  title,
  viewAllLink = '#',
}: RecommendedProductsGridProps) => {
  const { products, loading, error } = useRecommendedProducts();
  const { toast } = useToast();

  const handleAddToCart = (productId: string | number) => {
    const product = products.find((p) => p.Id === productId);
    if (product) {
      addItemToCart({
        id: product.Id,
        name: product.Title,
        price: product.Price,
        imageUrl: product.MainPictureUrl,
      });

      toast({
        title: 'პროდუქტი დამატებულია',
        description: 'პროდუქტი წარმატებით დაემატა კალათაში',
      });
    }
  };

  const handleAddToWishlist = (productId: string | number) => {
    toast({
      title: 'პროდუქტი დამატებულია',
      description: 'პროდუქტი წარმატებით დაემატა სასურველებში',
    });
  };

  // Format products to match our component structure
  const formattedProducts = products.map((product) => ({
    id: product.Id,
    name: product.Title,
    originalTitle: product.OriginalTitle || product.Title,
    price: product.Price,
    oldPrice: product.oldPrice,
    discountPercentage: product.discountPercentage,
    imageUrl: product.MainPictureUrl,
    stockCount: product.MasterQuantity,
    sign: product.Sign,
    totalSales: product.basketCount || Math.floor(Math.random() * 1000),
  }));

  return (
    <motion.section
      className="mb-12"
      initial="show"
      whileInView="show"
      viewport={{ once: false, margin: '-50px' }}
      variants={containerVariants}
    >
      <motion.div
        className="flex justify-between items-center mb-4 md:mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: easeInOutQuart }}
          >
            <Star className="h-5 w-5 text-[#5b38ed]" />
          </motion.div>
          <h2 className="text-[16px] md:text-[20px] font-bold text-gray-900 ">
            {title}
          </h2>
        </div>
        <motion.a
          href={viewAllLink}
          className="text-primary hover:underline flex items-center text-sm md:text-base group"
          transition={{ duration: 0.3, ease: easeInOutQuart }}
        >
          ყველა
          <motion.div
            className="ml-1"
            initial={{ x: 0 }}
            transition={{ duration: 0.3, ease: easeInOutQuart }}
          >
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </motion.div>
        </motion.a>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex justify-center items-center py-16"
          variants={itemVariants}
        >
          <Loader size="large" text="პროდუქტების ჩატვირთვა..." />
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants}>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4"
          initial="show"
          variants={containerVariants}
        >
          {formattedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, ease: easeInOutQuart }}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                originalTitle={product.originalTitle}
                price={product.price}
                oldPrice={product.oldPrice}
                discountPercentage={product.discountPercentage}
                imageUrl={product.imageUrl}
                stockCount={product.stockCount}
                sign={product.sign}
                totalSales={product.totalSales}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                customData={true}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
};

export default RecommendedProductsGrid;
