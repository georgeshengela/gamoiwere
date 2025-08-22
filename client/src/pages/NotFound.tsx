import { useState, useEffect } from "react";
import { Home, Search, ArrowLeft, RefreshCw, Mail, MapPin, Zap, Star, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link as WouterLink, useLocation } from "wouter";

const NotFound = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, rotation: number}>>([]);

  // Create floating elements animation
  useEffect(() => {
    const elements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360
    }));
    setFloatingElements(elements);

    const interval = setInterval(() => {
      setFloatingElements(prev => prev.map(el => ({
        ...el,
        x: (el.x + 0.2) % 100,
        y: el.y + Math.sin(Date.now() * 0.001 + el.id) * 0.1,
        rotation: (el.rotation + 0.5) % 360
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularCategories = [
    { name: "ქალი", href: "/category/tr-g2c29", icon: "👗" },
    { name: "მამაკაცი", href: "/category/tr-g2c30", icon: "👔" },
    { name: "ბავშვები", href: "/category/tr-g2c31", icon: "🧸" },
    { name: "ელექტრონიკა", href: "/category/tr-g2c32", icon: "📱" },
    { name: "ტექნიკა და ავეჯი", href: "/category/tr-g2c33", icon: "🏠" },
    { name: "სილამაზე და ჰიგიენა", href: "/category/tr-104624", icon: "💄" },
    { name: "ორსულებისთვის", href: "/category/tr-104625", icon: "🤱" },
    { name: "საათები", href: "/category/tr-g2c34", icon: "⌚" }
  ];

  const interestingFacts = [
    "404 შეცდომის კოდი წარმოიშვა 1990-იან წლებში, როდესაც CERN-ის სერვერი ოთახი №404-ში იდგა.",
    "Google-ის თანამშრომლები ყოველდღე 15% დროს უთმობენ პერსონალურ პროექტებს - ესაა Gmail-ისა და AdSense-ის წარმოშობის ისტორია.",
    "პირველი ონლაინ შესყიდვა 1994 წელს შედგა - Dan Kohn-მა CD 'Ten Summoner's Tales' მიყიდა $12.48 + გადაზიდვით.",
    "Amazon-ი თავდაპირველად მხოლოდ წიგნების ონლაინ მაღაზია იყო და პირველი წიგნი Douglas Hofstadter-ის 'Fluid Concepts' იყო.",
    "QR კოდი შეიქმნა Toyota-ს მიერ ავტომობილების ნაწილების ტრეკინგისთვის 1994 წელს იაპონიაში.",
    "ონლაინ შოპინგის კალათის იკონა შთაგონებული იყო 1937 წლის სუპერმარკეტის კალათით.",
    "Pinterest-ის ფუძემდებელმა Ben Silbermann-მა პირველი 5000 მომხმარებლისთვის პირადად დაუწერა ელ.ფოსტა.",
    "eBay-ის ორიგინალური სახელი იყო 'AuctionWeb' და შეიქმნა Pierre Omidyar-ის მიერ 1995 წელს.",
    "SSL შიფრაცია, რომელიც დღეს ონლაინ შოპინგს უზრუნველყოფს, შეიქმნა Netscape-ის მიერ 1994 წელს."
  ];

  const [randomFact] = useState(() => 
    interestingFacts[Math.floor(Math.random() * interestingFacts.length)]
  );

  const helpfulLinks = [
    { name: "მთავარი გვერდი", href: "/", icon: Home },
    { name: "ყველა კატეგორია", href: "/categories", icon: Search },
    { name: "შეთავაზებები", href: "/offers", icon: Star },
    { name: "კონტაქტი", href: "/contact", icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute text-2xl opacity-20 transition-all duration-1000 ease-in-out"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: `rotate(${el.rotation}deg)`,
            }}
          >
            {[<Zap />, <Star />, <Heart />, <Coffee />][el.id % 4]}
          </div>
        ))}
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(120,119,198,0.1)_120deg,transparent_240deg)] animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number with Animation */}
          <div className="relative mb-8">
            <div className="text-[200px] md:text-[300px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 text-[200px] md:text-[300px] font-black text-blue-600/10 leading-none transform rotate-1 select-none">
              404
            </div>
            <div className="absolute inset-0 text-[200px] md:text-[300px] font-black text-purple-600/10 leading-none transform -rotate-1 select-none">
              404
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              გვერდი ვერ მოიძებნა
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6 max-w-2xl mx-auto">
              სამწუხაროდ, თქვენ მიერ მოძებნული გვერდი არ არსებობს ან გადატანილია სხვა მისამართზე.
            </p>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-xl mx-auto">
              <p className="text-gray-700 font-medium">
                🔍 არ ინერვიულოთ! ჩვენ დაგეხმარებით საძიებო მასალის პოვნაში.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-12">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm mx-auto max-w-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
                  <Search className="h-6 w-6 text-primary" />
                  მოძებნეთ სასურველი პროდუქტი
                </h3>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="მაგ: ტელეფონი, კომპიუტერი, ქალის ტანისამოსი..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg"
                  >
                    ძებნა
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Interesting Fact */}
          <div className="mb-12">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-sm mx-auto max-w-4xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">საინტერესო ფაქტი</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {randomFact}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">პოპულარული კატეგორიები</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {popularCategories.map((category, index) => (
                <WouterLink key={category.name} href={category.href}>
                  <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                    </CardContent>
                  </Card>
                </WouterLink>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">სასარგებლო ბმულები</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {helpfulLinks.map((link) => (
                <Button
                  key={link.name}
                  asChild
                  variant="outline"
                  className="h-auto p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                >
                  <WouterLink href={link.href}>
                    <div className="flex flex-col items-center gap-3">
                      <link.icon className="h-8 w-8 text-gray-600 group-hover:text-primary transition-colors" />
                      <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                        {link.name}
                      </span>
                    </div>
                  </WouterLink>
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              უკან დაბრუნება
            </Button>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <WouterLink href="/">
                <Home className="h-5 w-5 mr-2" />
                მთავარი გვერდი
              </WouterLink>
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              გვერდის განახლება
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      მაინც ვერ პოულობთ რასაც ეძებთ?
                    </h4>
                    <p className="text-gray-600 mb-4">
                      ჩვენი გუნდი მზადაა დაგეხმაროთ. დაუკავშირდით ჩვენს მხარდაჭერის სამსახურს.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <Button asChild variant="outline" className="bg-white/80 backdrop-blur-sm">
                        <a href="mailto:support@gamoiwere.ge">
                          <Mail className="h-4 w-4 mr-2" />
                          support@gamoiwere.ge
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="bg-white/80 backdrop-blur-sm">
                        <WouterLink href="/contact">
                          <MapPin className="h-4 w-4 mr-2" />
                          კონტაქტის ფორმა
                        </WouterLink>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>

      {/* Bottom Wave Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
            className="fill-gradient-to-r from-blue-200/50 to-purple-200/50"
          />
        </svg>
      </div>
    </div>
  );
};

export default NotFound;