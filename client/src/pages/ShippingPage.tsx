import { Truck, Clock, MapPin, DollarSign, Package, Shield, Phone, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Truck className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              მიწოდების პირობები
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              სწრაფი და უსაფრთხო მიწოდება საქართველოს ყველა რეგიონში. გაეცანით ჩვენს მიწოდების ოფციებს და ღირებულებებს.
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
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">უფასო მიწოდება</h3>
              <p className="text-gray-600 text-sm">
                100₾-ზე მეტი შეკვეთისას თბილისში
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">სწრაფი მიწოდება</h3>
              <p className="text-gray-600 text-sm">
                24 საათში თბილისში, 2-3 დღე რეგიონებში
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">დაზღვეული</h3>
              <p className="text-gray-600 text-sm">
                ყველა ნივთი დაზღვეულია ტრანსპორტირების დროს
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ყურადღებით შეფუთვა</h3>
              <p className="text-gray-600 text-sm">
                ყველა პროდუქტი ფრთხილად შეფუთული და დაცული
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Options */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-blue-600" />
                  მიწოდების ოფციები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Delivery */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">სტანდარტული მიწოდება</h4>
                      <p className="text-gray-600">ყველაზე პოპულარული ოფცია</p>
                    </div>
                    <Badge variant="secondary">რეკომენდებული</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">თბილისი: 24 საათი</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">რეგიონები: 2-3 დღე</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">თბილისი: 5₾</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">რეგიონები: 8₾</span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      <strong>უფასო მიწოდება:</strong> 100₾-ზე მეტი შეკვეთისას თბილისში და 150₾-ზე მეტი შეკვეთისას რეგიონებში
                    </p>
                  </div>
                </div>

                {/* Express Delivery */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">ექსპრეს მიწოდება</h4>
                      <p className="text-gray-600">სუპერ სწრაფი მიწოდება</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">სწრაფი</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">თბილისი: 3-6 საათი</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">რეგიონები: 24 საათი</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">თბილისი: 15₾</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">რეგიონები: 25₾</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>შენიშვნა:</strong> ექსპრეს მიწოდება ხელმისაწვდომია სამუშაო დღეებში 09:00-18:00 საათებში
                    </p>
                  </div>
                </div>

                {/* Pickup */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">მაღაზიიდან აღება</h4>
                      <p className="text-gray-600">უფასო და მოსახერხებელი</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">უფასო</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">რუსთაველის გამზირი 42, თბილისი</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>სამუშაო საათები:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• ორშაბათი - პარასკევი: 09:00-19:00</li>
                      <li>• შაბათი: 10:00-18:00</li>
                      <li>• კვირა: 12:00-17:00</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Areas */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-green-600" />
                  მიწოდების ზონები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">თბილისი</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• ყველა რაიონი</li>
                      <li>• 24 საათიანი მიწოდება</li>
                      <li>• უფასო 100₾-დან</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">დიდი ქალაქები</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• ბათუმი, ქუთაისი</li>
                      <li>• რუსთავი, ზუგდიდი</li>
                      <li>• 1-2 დღიანი მიწოდება</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">რეგიონები</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• ყველა რეგიონი</li>
                      <li>• 2-3 დღიანი მიწოდება</li>
                      <li>• უფასო 150₾-დან</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-1">მაღალმთიანი რეგიონები</h4>
                      <p className="text-sm text-orange-700">
                        ზოგიერთ მაღალმთიან რეგიონში მიწოდების დრო შეიძლება გაგრძელდეს ამინდის პირობების გამო. 
                        დეტალური ინფორმაციისთვის დაგვიკავშირდით.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  მნიშვნელოვანი ინფორმაცია
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">შეკვეთის დადასტურება</h4>
                      <p className="text-sm text-gray-600">
                        მიწოდების წინ თქვენ მიიღებთ SMS ან ზარს კურიერისგან
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">პროდუქტის შემოწმება</h4>
                      <p className="text-sm text-gray-600">
                        მიწოდებისას შეგიძლიათ შეამოწმოთ პროდუქტი და შეფუთვა
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">გადახდის მეთოდები</h4>
                      <p className="text-sm text-gray-600">
                        ნაღდი ანგარიშსწორება ან ქარდით გადახდა მიწოდებისას
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">დაზღვევა</h4>
                      <p className="text-sm text-gray-600">
                        ყველა პროდუქტი დაზღვეულია ტრანსპორტირების დროს სრული ღირებულებით
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
                <CardTitle className="text-lg">დაგვიკავშირდით</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">+995 599 123 456</p>
                    <p className="text-sm text-gray-600">მიწოდების სამსახური</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">delivery@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">მიწოდების კითხვები</p>
                  </div>
                </div>

                <Separator />

                <Button asChild className="w-full">
                  <WouterLink href="/track-order">
                    შეკვეთის თვალყურისდევნება
                  </WouterLink>
                </Button>
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
                    <strong>მაღაზიის მისამართი:</strong><br />
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>სამუშაო საათები:</strong><br />
                    ორშაბათი - პარასკევი: 09:00-19:00<br />
                    შაბათი: 10:00-18:00<br />
                    კვირა: 12:00-17:00
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
                  href="/payment-methods" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  გადახდის მეთოდები
                </WouterLink>
                <WouterLink 
                  href="/warranty" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  გარანტიის პირობები
                </WouterLink>
                <WouterLink 
                  href="/faq" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ხშირად დასმული კითხვები
                </WouterLink>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">მზად ხართ შეკვეთისთვის?</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              ჩვენი სწრაფი და უსაფრთხო მიწოდების სერვისით თქვენი შეკვეთა მალე ჩამოგივათ. 
              აირჩიეთ ყველაზე მოსახერხებელი მიწოდების ოფცია.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <WouterLink href="/">
                  <Package className="h-5 w-5 mr-2" />
                  შეკვეთის გაკეთება
                </WouterLink>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <a href="tel:+995599123456">
                  <Phone className="h-5 w-5 mr-2" />
                  დაკავშირება
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;