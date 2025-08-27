import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  link: string;
}

interface CategoryBannerProps {
  categories: Category[];
}

const CategoryBanner = ({ categories }: CategoryBannerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
          initial={{ scale: 1, y: 0 }}
          whileHover={{
            scale: 1.03,
            y: -5,
            transition: { duration: 0.4, ease: 'easeOut' },
          }}
        >
          <motion.img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black transition-opacity duration-300 ease-out bg-opacity-40 group-hover:bg-opacity-60 flex items-center p-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-2">
                {category.name}
              </h3>
              <motion.a
                href={category.link}
                className="text-white text-sm flex items-center transform transition-all duration-300 ease-out "
              >
                ყველას ნახვა
                <ChevronRight className="h-4 w-4 ml-1" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryBanner;
