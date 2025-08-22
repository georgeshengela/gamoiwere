import { Shield, Clock, RefreshCw, AlertCircle, CheckCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <RefreshCw className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              დაბრუნების პოლიტიკა
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              თქვენი კმაყოფილება ჩვენი უმთავრესი პრიორიტეტია. გაეცანით ჩვენს მარტივ და გამჭვირვალე დაბრუნების წესებს.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">14 დღიანი პერიოდი</h3>
              <p className="text-gray-600 text-sm">
                შეძენიდან 14 დღის განმავლობაში შეგიძლიათ პროდუქტის დაბრუნება
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">100% უსაფრთხო</h3>
              <p className="text-gray-600 text-sm">
                სრული თანხის დაბრუნება პროდუქტის მიღებიდან 3-5 სამუშაო დღეში
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">მარტივი პროცესი</h3>
              <p className="text-gray-600 text-sm">
                ონლაინ განაცხადი ან ტელეფონით დაკავშირება - სწრაფი და მარტივი
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Return Conditions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  დაბრუნების პირობები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">ახალი მდგომარეობა</h4>
                      <p className="text-sm text-gray-600">პროდუქტი უნდა იყოს გამოუყენებელი</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">ორიგინალი შეფუთვა</h4>
                      <p className="text-sm text-gray-600">ყველა აქსესუარი და შეფუთვა</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">ნაღდი ქვითარი</h4>
                      <p className="text-sm text-gray-600">შენახული ქვითარი ან ინვოისი</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">14 დღიანი ვადა</h4>
                      <p className="text-sm text-gray-600">მიღებიდან 14 კალენდარული დღე</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Process */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                  დაბრუნების პროცესი
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">განაცხადის შევსება</h4>
                      <p className="text-sm text-gray-600">
                        შეავსეთ ონლაინ განაცხადი ან დაგვიკავშირდით ტელეფონით +995 599 123 456
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">დადასტურება</h4>
                      <p className="text-sm text-gray-600">
                        მიიღებთ დადასტურებას SMS-ით ან ელ.ფოსტით 24 საათის განმავლობაში
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">პროდუქტის გაგზავნა</h4>
                      <p className="text-sm text-gray-600">
                        შეფუთეთ პროდუქტი ორიგინალ შეფუთვაში და გამოგზავნეთ ჩვენს მისამართზე
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">თანხის დაბრუნება</h4>
                      <p className="text-sm text-gray-600">
                        პროდუქტის მიღებიდან 3-5 სამუშაო დღეში მიიღებთ სრულ თანხას
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exceptions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  განსაკუთრებული შემთხვევები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">არ ექვემდებარება დაბრუნებას:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• პერსონალური ჰიგიენის პროდუქტები</li>
                    <li>• სურსათის პროდუქტები</li>
                    <li>• ინდივიდუალურად შეკვეთილი ნივთები</li>
                    <li>• დაზიანებული ან გამოყენებული პროდუქტები</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">გაგრძელებული გარანტია:</h4>
                  <p className="text-sm text-blue-700">
                    ელექტრონული პროდუქტებისთვის გარანტიის პერიოდი 30 დღემდე გაგრძელდება მწარმოებლის გარანტიით.
                  </p>
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
                    <p className="text-sm text-gray-600">ორშ-პარ: 09:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">info@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">24/7 მხარდაჭერა</p>
                  </div>
                </div>

                <Separator />

                <Button asChild className="w-full">
                  <WouterLink href="/profile">
                    ჩემი შეკვეთები
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
                    <strong>მისამართი:</strong><br />
                    თბილისი, საქართველო
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>სამუშაო საათები:</strong><br />
                    ორშაბათი - პარასკევი: 09:00-18:00<br />
                    შაბათი: 10:00-16:00<br />
                    კვირა: დასვენების დღე
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">დამატებითი ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <WouterLink 
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობის პოლიტიკა
                </WouterLink>
                <WouterLink 
                  href="/terms-of-service" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  მომსახურების პირობები
                </WouterLink>
                <WouterLink 
                  href="/shipping-info" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  მიწოდების ინფორმაცია
                </WouterLink>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">კითხვები გაქვთ?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              ჩვენი მხარდაჭერის გუნდი მზადაა დაგეხმაროთ ნებისმიერ საკითხში. დაგვიკავშირდით ნებისმიერ დროს.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="tel:+995599123456">
                  <Phone className="h-5 w-5 mr-2" />
                  დარეკვა
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <a href="mailto:info@gamoiwere.ge">
                  <Mail className="h-5 w-5 mr-2" />
                  ელ.ფოსტა
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;