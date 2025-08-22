import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function Sitemap() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">საიტის რუკა</h1>
      <p className="text-gray-600 mb-8">
        გამოიყენეთ ეს გვერდი, რომ იპოვოთ და გადახვიდეთ საიტის ნებისმიერ ნაწილზე.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* Main Pages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">მთავარი გვერდები</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-primary hover:underline">
                მთავარი გვერდი
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-primary hover:underline">
                შესვლა
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-primary hover:underline">
                რეგისტრაცია
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-primary hover:underline">
                კალათა
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="text-primary hover:underline">
                შეკვეთის გაფორმება
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-primary hover:underline">
                პროფილი
              </Link>
            </li>
            <li>
              <Link href="/orders" className="text-primary hover:underline">
                შეკვეთები
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ძირითადი კატეგორიები</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/tr-g2" className="text-primary hover:underline">
                ქალები
              </Link>
            </li>
            <li>
              <Link href="/category/tr-g1" className="text-primary hover:underline">
                მამაკაცები
              </Link>
            </li>
            <li>
              <Link href="/category/tr-g3" className="text-primary hover:underline">
                ბავშვები
              </Link>
            </li>
            <li>
              <Link href="/category/tr-104024" className="text-primary hover:underline">
                ელექტრონიკა
              </Link>
            </li>
            <li>
              <Link href="/category/tr-145704" className="text-primary hover:underline">
                საყოფაცხოვრებო ტექნიკა და ავეჯი
              </Link>
            </li>
          </ul>
        </div>

        {/* Electronics Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ელექტრონიკა</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/smartphones" className="text-primary hover:underline">
                სმარტფონები
              </Link>
            </li>
            <li>
              <Link href="/category/laptops" className="text-primary hover:underline">
                ლეპტოპები
              </Link>
            </li>
            <li>
              <Link href="/category/audio" className="text-primary hover:underline">
                აუდიო
              </Link>
            </li>
            <li>
              <Link href="/category/tvs" className="text-primary hover:underline">
                ტელევიზორები
              </Link>
            </li>
            <li>
              <Link href="/category/smartwatches" className="text-primary hover:underline">
                სმარტ საათები
              </Link>
            </li>
            <li>
              <Link href="/category/gaming" className="text-primary hover:underline">
                გეიმინგი
              </Link>
            </li>
          </ul>
        </div>

        {/* Audio Subcategories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">აუდიო ტექნიკა</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/audio/headphones" className="text-primary hover:underline">
                ყურსასმენები
              </Link>
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link href="/category/audio/headphones/wireless" className="text-gray-600 hover:underline">
                    უსადენო ყურსასმენები
                  </Link>
                </li>
                <li>
                  <Link href="/category/audio/headphones/wired" className="text-gray-600 hover:underline">
                    სადენიანი ყურსასმენები
                  </Link>
                </li>
                <li>
                  <Link href="/category/audio/headphones/sports" className="text-gray-600 hover:underline">
                    სპორტული ყურსასმენები
                  </Link>
                </li>
                <li>
                  <Link href="/category/audio/headphones/noise-cancelling" className="text-gray-600 hover:underline">
                    ნოისქენსელებიანი ყურსასმენები
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/category/audio/speakers" className="text-primary hover:underline">
                დინამიკები
              </Link>
            </li>
            <li>
              <Link href="/category/audio/sound-systems" className="text-primary hover:underline">
                გარემენტები
              </Link>
            </li>
            <li>
              <Link href="/category/audio/microphones" className="text-primary hover:underline">
                მიკროფონები
              </Link>
            </li>
            <li>
              <Link href="/category/audio/adapters" className="text-primary hover:underline">
                აუდიო ადაპტერები
              </Link>
            </li>
          </ul>
        </div>

        {/* Computer Subcategories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">კომპიუტერული ტექნიკა</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/computers/laptops" className="text-primary hover:underline">
                ლეპტოპები
              </Link>
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link href="/category/computers/laptops/apple" className="text-gray-600 hover:underline">
                    Apple
                  </Link>
                </li>
                <li>
                  <Link href="/category/computers/laptops/lenovo" className="text-gray-600 hover:underline">
                    Lenovo
                  </Link>
                </li>
                <li>
                  <Link href="/category/computers/laptops/hp" className="text-gray-600 hover:underline">
                    HP
                  </Link>
                </li>
                <li>
                  <Link href="/category/computers/laptops/dell" className="text-gray-600 hover:underline">
                    Dell
                  </Link>
                </li>
                <li>
                  <Link href="/category/computers/laptops/asus" className="text-gray-600 hover:underline">
                    Asus
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/category/computers/desktops" className="text-primary hover:underline">
                დესკტოპები
              </Link>
            </li>
            <li>
              <Link href="/category/computers/tv-adapters" className="text-primary hover:underline">
                TV ადაპტერები
              </Link>
            </li>
            <li>
              <Link href="/category/computers/mounting" className="text-primary hover:underline">
                სამონტაჟო დეტალები
              </Link>
            </li>
            <li>
              <Link href="/category/computers/components" className="text-primary hover:underline">
                კომპონენტები და მცირე დეტალები
              </Link>
            </li>
          </ul>
        </div>

        {/* Entertainment Subcategories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">გართობისთვის ტექნიკა</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/entertainment/consoles" className="text-primary hover:underline">
                კონსოლები
              </Link>
            </li>
            <li>
              <Link href="/category/entertainment/ringtones" className="text-primary hover:underline">
                რინგტოუნები
              </Link>
            </li>
            <li>
              <Link href="/category/entertainment/console-accessories" className="text-primary hover:underline">
                აქსესუარები კონსოლებისთვის
              </Link>
            </li>
            <li>
              <Link href="/category/entertainment/games" className="text-primary hover:underline">
                თამაშები კონსოლებისთვის
              </Link>
            </li>
            <li>
              <Link href="/category/entertainment/vip" className="text-primary hover:underline">
                VIP გართობისთვის მოწყობილობა
              </Link>
            </li>
          </ul>
        </div>

        {/* Home Appliances */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">საყოფაცხოვრებო ტექნიკა</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/category/home/washing-machines" className="text-primary hover:underline">
                სარეცხი მანქანები
              </Link>
            </li>
            <li>
              <Link href="/category/home/fridges" className="text-primary hover:underline">
                მაცივრები
              </Link>
            </li>
            <li>
              <Link href="/category/home/dishwashers" className="text-primary hover:underline">
                ჭურჭლის სარეცხი მანქანები
              </Link>
            </li>
            <li>
              <Link href="/category/home/freezers" className="text-primary hover:underline">
                საყინულეები და მცირე ტექნიკა
              </Link>
            </li>
            <li>
              <Link href="/category/home/cookers" className="text-primary hover:underline">
                ქურები
              </Link>
            </li>
            <li>
              <Link href="/category/home/hoods" className="text-primary hover:underline">
                გამწოვები
              </Link>
            </li>
            <li>
              <Link href="/category/home/installation" className="text-primary hover:underline">
                დაინსტალაცია
              </Link>
            </li>
          </ul>
        </div>

        {/* Information Pages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ინფორმაცია</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-primary hover:underline">
                ჩვენს შესახებ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-primary hover:underline">
                კონტაქტი
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-primary hover:underline">
                მიწოდება
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary hover:underline">
                ხშირად დასმული კითხვები
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary hover:underline">
                წესები და პირობები
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-primary hover:underline">
                კონფიდენციალურობა
              </Link>
            </li>
          </ul>
        </div>

        {/* Special Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">სპეციალური სერვისები</h2>
          <Separator />
          <ul className="space-y-2">
            <li>
              <Link href="/image-search" className="text-primary hover:underline">
                სურათით ძიება
              </Link>
            </li>
            <li>
              <Link href="/tracking" className="text-primary hover:underline">
                ამანათის თვალყურის დევნება
              </Link>
            </li>
            <li>
              <Link href="/balance" className="text-primary hover:underline">
                ბალანსის შევსება
              </Link>
            </li>
            <li>
              <Link href="/notifications" className="text-primary hover:underline">
                შეტყობინებების პარამეტრები
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}