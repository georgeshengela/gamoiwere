import { ChevronRight } from "lucide-react";

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
        <div key={category.id} className="relative h-40 rounded-lg overflow-hidden">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center p-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-2">{category.name}</h3>
              <a href={category.link} className="text-white text-sm flex items-center">
                ყველას ნახვა
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryBanner;
