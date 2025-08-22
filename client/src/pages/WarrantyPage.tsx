import { Shield, Clock, Settings, FileText, Phone, Mail, CheckCircle, AlertCircle, Wrench, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const WarrantyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              გარანტიის პირობები
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              ყველა პროდუქტი მოიცავს ოფიციალურ მწარმოებლის გარანტიას. გაეცანით გარანტიის პირობებს და სერვისის დეტალებს.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ოფიციალური გარანტია</h3>
              <p className="text-gray-600 text-sm">
                მწარმოებლის ოფიციალური გარანტია ყველა პროდუქტზე
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">უფასო რემონტი</h3>
              <p className="text-gray-600 text-sm">
                გარანტიის ვადაში უფასო რემონტი ან შეცვლა
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">სწრაფი სერვისი</h3>
              <p className="text-gray-600 text-sm">
                გარანტიული სერვისი 3-7 სამუშაო დღეში
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">სრული დოკუმენტაცია</h3>
              <p className="text-gray-600 text-sm">
                ყველა პროდუქტი თან ახლავს გარანტიის ბარათი
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Warranty Periods */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                  გარანტიის ვადები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Electronics */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-lg">ელექტრონიკა</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">სმარტფონები</span>
                        <Badge variant="secondary">24 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ლეპტოპები</span>
                        <Badge variant="secondary">24 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ტელევიზორები</span>
                        <Badge variant="secondary">12 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ფოტოაპარატები</span>
                        <Badge variant="secondary">12 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">აუდიო მოწყობილობები</span>
                        <Badge variant="secondary">12 თვე</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Appliances */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 rounded-full p-2">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-lg">ტექნიკა</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">თეთრი ტექნიკა</span>
                        <Badge variant="secondary">24 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">მცირე ტექნიკა</span>
                        <Badge variant="secondary">12 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">კლიმატური ტექნიკა</span>
                        <Badge variant="secondary">36 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">სამზარეულოს ტექნიკა</span>
                        <Badge variant="secondary">24 თვე</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">გათბობის სისტემები</span>
                        <Badge variant="secondary">36 თვე</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">გაფართოებული გარანტია</h4>
                      <p className="text-sm text-green-700">
                        ზოგიერთ პროდუქტზე შესაძლებელია გაფართოებული გარანტიის შეძენა დამატებით 3-5 წლით.
                        დეტალებისთვის კონსულტაცია გაიარეთ მყიდველობისას.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warranty Terms */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  გარანტიის პირობები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">გარანტიის ბარათი</h4>
                      <p className="text-sm text-gray-600">
                        ყველა პროდუქტს თან ახლავს გარანტიის ოფიციალური ბარათი ან ინვოისი
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ოფიციალური სერვისი</h4>
                      <p className="text-sm text-gray-600">
                        გარანტიული მომსახურება მხოლოდ ავტორიზებულ სერვის ცენტრებში
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">უფასო დიაგნოსტიკა</h4>
                      <p className="text-sm text-gray-600">
                        გარანტიის ვადაში უფასო დიაგნოსტიკა და შეფასება
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ორიგინალური ნაწილები</h4>
                      <p className="text-sm text-gray-600">
                        რემონტისას გამოიყენება მხოლოდ ორიგინალური ანაცვლები
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">სრული შეცვლა</h4>
                      <p className="text-sm text-gray-600">
                        ვერ შეკეთების შემთხვევაში პროდუქტის სრული შეცვლა
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's NOT Covered */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  რა არ არის გარანტიით დაცული
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-3">გარანტია არ მოქმედებს:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        მექანიკური დაზიანების შემთხვევაში (დაცემა, დარტყმა, სითხის ჩაღვრა)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        არასწორი გამოყენების ან ზრუნვის შედეგად მიღებული დაზიანება
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        არაავტორიზებულ სერვისში რემონტის მცდელობის შემთხვევაში
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        ბუნებრივი ცვეთა (ბატარეა, ფილტრები, ლამპები)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        პროგრამული პრობლემები, რომლებიც არ უკავშირდება ტექნიკურ ხარვეზებს
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">განსაკუთრებული შემთხვევები:</h4>
                  <p className="text-sm text-blue-700">
                    ზოგიერთი ელექტრონული პროდუქტისთვის (სმარტფონები, ლეპტოპები) 
                    მოქმედებს განსაკუთრებული გარანტიის პირობები. დეტალებისთვის გაეცანით 
                    პროდუქტის ინდივიდუალურ გარანტიის ბარათს.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Process */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Wrench className="h-6 w-6 text-green-600" />
                  გარანტიული სერვისის პროცესი
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">დაკავშირება</h4>
                      <p className="text-sm text-gray-600">
                        დაგვიკავშირდით ტელეფონით +995 599 123 456 ან ელ.ფოსტით warranty@gamoiwere.ge
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">დიაგნოსტიკა</h4>
                      <p className="text-sm text-gray-600">
                        ტექნიკური ექსპერტი ჩაატარებს უფასო დიაგნოსტიკას და დაადგენს პრობლემას
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">რემონტი ან შეცვლა</h4>
                      <p className="text-sm text-gray-600">
                        გარანტიის ფარგლებში უფასო რემონტი ან სრული შეცვლა 3-7 სამუშაო დღეში
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">ტესტირება</h4>
                      <p className="text-sm text-gray-600">
                        შეკეთების შემდეგ სრული ტესტირება და ხარისხის უზრუნველყოფა
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">გარანტიული სერვისი</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">+995 599 123 456</p>
                    <p className="text-sm text-gray-600">ტექნიკური მხარდაჭერა</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">warranty@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">გარანტიული სერვისი</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <a href="tel:+995599123456">
                      <Phone className="h-4 w-4 mr-2" />
                      ტექნიკური მხარდაჭერა
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="mailto:warranty@gamoiwere.ge">
                      <Mail className="h-4 w-4 mr-2" />
                      გარანტიული სერვისი
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Centers */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">სერვის ცენტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">თბილისი - მთავარი</h4>
                  <p className="text-sm text-gray-600 mb-1">რუსთაველის გამზირი 42</p>
                  <p className="text-sm text-gray-600">ორშ-პარ: 09:00-19:00</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">ბათუმი</h4>
                  <p className="text-sm text-gray-600 mb-1">ნინოშვილის ქუჩა 25</p>
                  <p className="text-sm text-gray-600">ორშ-შაბ: 10:00-18:00</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">ქუთაისი</h4>
                  <p className="text-sm text-gray-600 mb-1">თამარის ქუჩა 15</p>
                  <p className="text-sm text-gray-600">ორშ-პარ: 10:00-17:00</p>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">კომპანიის ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">შპს გამოიწერე</p>
                  <p className="text-sm text-gray-600">ს/კ 405729653</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>ოფიციალური წარმომადგენელი:</strong><br />
                    სხვადასხვა ბრენდების ავტორიზებული დილერი საქართველოში
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">სასარგებლო ბმულები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <WouterLink 
                  href="/return-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  დაბრუნების პოლიტიკა
                </WouterLink>
                <WouterLink 
                  href="/shipping" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  მიწოდების პირობები
                </WouterLink>
                <WouterLink 
                  href="/faq" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ხშირად დასმული კითხვები
                </WouterLink>
                <WouterLink 
                  href="/profile" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ჩემი შეკვეთები
                </WouterLink>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">გაქვთ გარანტიული სერვისის საჭიროება?</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              ჩვენი ტექნიკური ექსპერტები მზადაა დაგეხმაროთ ნებისმიერ პრობლემაში. 
              უფასო კონსულტაციისთვის დაგვიკავშირდით.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="tel:+995599123456">
                  <Phone className="h-5 w-5 mr-2" />
                  ტექნიკური მხარდაჭერა
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <a href="mailto:warranty@gamoiwere.ge">
                  <Mail className="h-5 w-5 mr-2" />
                  გარანტიული სერვისი
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;