import { Link } from 'wouter';
import { Crown } from 'lucide-react';

interface Brand {
  name: string;
  logo: string;
  url: string;
  description: string;
}

const brands: Brand[] = [
  {
    name: 'Bershka',
    logo: 'https://logos-world.net/wp-content/uploads/2020/12/Bershka-Logo.png',
    url: '/brand/bershka',
    description: 'მოდური ტანსაცმელი ახალგაზრდებისთვის',
  },
  {
    name: 'Nike',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
    url: '/brand/nike',
    description: 'სპორტული ტანსაცმელი და ფეხსაცმელი',
  },
  {
    name: 'Adidas',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
    url: '/brand/adidas',
    description: 'სპორტული ბრენდი მსოფლიოს მასშტაბით',
  },
  {
    name: 'Stradivarius',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/Stradivarius-Logo.png',
    url: '/brand/stradivarius',
    description: 'ახალგაზრდული და მოდური ბრენდი',
  },
  {
    name: 'Zara',
    logo: 'https://brandlogos.net/wp-content/uploads/2022/04/zara-logo-brandlogos.net_.png',
    url: '/brand/zara',
    description: 'ფასტ ფეშნის წამყვანი ბრენდი',
  },
  {
    name: 'H&M',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png',
    url: '/brand/hm',
    description: 'ხელმისაწვდომი მოდური ტანსაცმელი',
  },
  {
    name: 'Pull & Bear',
    logo: 'https://download.logo.wine/logo/Pull%26Bear/Pull%26Bear-Logo.wine.png',
    url: '/brand/pullbear',
    description: 'კაზუალური ბრენდი ახალგაზრდებისთვის',
  },
  {
    name: 'Mango',
    logo: 'https://download.logo.wine/logo/Mango_(retailer)/Mango_(retailer)-Logo.wine.png',
    url: '/brand/mango',
    description: 'ქალის მოდური ტანსაცმელი',
  },
  {
    name: 'Puma',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png',
    url: '/brand/puma',
    description: 'სპორტული ტანსაცმელი და აქსესუარები',
  },
  {
    name: 'Converse',
    logo: 'https://loodibee.com/wp-content/uploads/Converse-Logo.png',
    url: '/brand/converse',
    description: 'კლასიკური კედების და ფეხსაცმელი',
  },
  {
    name: "Levi's",
    logo: 'https://brandlogos.net/wp-content/uploads/2013/03/levis-black-vector-logo.png',
    url: '/brand/levis',
    description: 'ჯინსის ტანსაცმლის ლეგენდარული ბრენდი',
  },
  {
    name: 'Calvin Klein',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Calvin-Klein-Logo.png',
    url: '/brand/calvinklein',
    description: 'მოდური და ელეგანტური ბრენდი',
  },
];

const PopularBrands = () => {
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[#5b38ed]" />
          <h2 className="text-[16px] md:text-[20px] font-bold text-gray-900 uppercase">
            პოპულარული ბრენდები
          </h2>
        </div>
        <Link
          href="/brands"
          className="text-primary hover:text-primary/80 font-medium text-sm md:text-base transition-colors"
        >
          ყველას ნახვა →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 md:gap-3">
        {brands.map((brand, index) => (
          <Link
            key={index}
            href={brand.url}
            className="group relative bg-white rounded-xl border border-gray-100 p-3 md:p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="aspect-square flex items-center justify-center">
              <img
                src={brand.logo}
                alt={`${brand.name} ლოგო`}
                className="w-full h-full object-contain filter brightness-95 group-hover:brightness-100 transition-all"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg text-primary font-bold text-xs">${brand.name.charAt(
                      0
                    )}</div>`;
                  }
                }}
              />
            </div>

            {/* Tooltip with brand name on hover */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {brand.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          შეუკვეთეთ თქვენი საყვარელი ბრენდების პროდუქტები მსოფლიოს ნებისმიერი
          ქვეყნიდან
        </p>
      </div>
    </section>
  );
};

export default PopularBrands;
