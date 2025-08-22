import { Link } from "wouter";
import footerLogoImage from "@assets/Asset 23@4x.png";
import { 
  Facebook, 
  Instagram, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ChevronRight,
  AtSign,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  HeadphonesIcon,
  Gift,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-gray-900 text-gray-100">


      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* About section */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <Link href="/" className="flex items-center mb-4">
                <img 
                  src={footerLogoImage} 
                  alt="GAMOIWERE" 
                  className="h-10 w-auto"
                />
              </Link>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                თქვენი სანდო ონლაინ მაღაზია საუკეთესო ტექნოლოგიური პროდუქტებისთვის საქართველოში. 
                ვთანამშრომლობთ მსოფლიოს წამყვან ბრენდებთან, რათა შემოგთავაზოთ ყველაზე ხარისხიანი და 
                თანამედროვე გადაწყვეტილებები.
              </p>
              
              <div className="flex space-x-3 mb-6">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="mailto:info@gamoiwere.ge"
                  aria-label="Email"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <AtSign className="h-4 w-4" />
                </a>
              </div>


            </div>
          </div>

          {/* Links section */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white border-b border-gray-800 pb-2">
                  სწრაფი ბმულები
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
                      ჩვენ შესახებ
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
                      კონტაქტი
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/blog" className="text-gray-300 hover:text-primary transition-colors">
                      ბლოგი
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/careers" className="text-gray-300 hover:text-primary transition-colors">
                      კარიერა
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/sitemap" className="text-gray-300 hover:text-primary transition-colors">
                      საიტის რუკა
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white border-b border-gray-800 pb-2">
                  დახმარება
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/return-policy" className="text-gray-300 hover:text-primary transition-colors">
                      დაბრუნების პოლიტიკა
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/shipping" className="text-gray-300 hover:text-primary transition-colors">
                      მიწოდების პირობები
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/payment" className="text-gray-300 hover:text-primary transition-colors">
                      გადახდის მეთოდები
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/faq" className="text-gray-300 hover:text-primary transition-colors">
                      ხშირად დასმული კითხვები
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-primary mr-1.5" />
                    <Link href="/warranty" className="text-gray-300 hover:text-primary transition-colors">
                      გარანტია
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white border-b border-gray-800 pb-2">
                  კონტაქტი
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      რუსთაველის გამზირი 42, თბილისი, საქართველო
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <a href="tel:+995321234567" className="text-gray-300 hover:text-primary transition-colors">
                      +995 32 123 4567
                    </a>
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <a href="mailto:info@gamoiwere.ge" className="text-gray-300 hover:text-primary transition-colors">
                      info@gamoiwere.ge
                    </a>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-gray-300">
                      <p>ორშ-პარ: 09:00 - 20:00</p>
                      <p>შაბ-კვი: 10:00 - 18:00</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-white p-1.5 rounded">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
              </div>
              <div className="bg-white p-1.5 rounded">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
              </div>
            </div>
            <button 
              onClick={scrollToTop}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full hover:bg-primary transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} <span className="text-primary font-medium">GAMOIWERE</span>. ყველა უფლება დაცულია.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              კონფიდენციალურობის პოლიტიკა
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              მომსახურების პირობები
            </Link>
            <span>|</span>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              ქუქიების პოლიტიკა
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile scroll to top button */}
      <div className="md:hidden fixed bottom-5 right-5">
        <button 
          onClick={scrollToTop}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-full shadow-lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4 text-white" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
