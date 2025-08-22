import { Building, Users, Target, Award, Globe, Heart, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Building className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ჩვენ შესახებ
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              შპს გამოიწერე - თქვენი სანდო პარტნიორი ონლაინ ყიდვებში. ჩვენ ვთანამშრომლობთ მსოფლიოს წამყვან ბრენდებთან, 
              რათა შემოგთავაზოთ ყველაზე ხარისხიანი პროდუქტები საუკეთესო ფასებად.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">2019</div>
              <p className="text-sm text-gray-600">დაფუძნების წელი</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <p className="text-sm text-gray-600">მომხმარებელი</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">200K+</div>
              <p className="text-sm text-gray-600">შეკვეთა</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
              <p className="text-sm text-gray-600">კმაყოფილება</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Our Story */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-600" />
                  ჩვენი ისტორია
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  შპს გამოიწერე დაარსდა 2019 წელს იმ მიზნით, რომ საქართველოს მოსახლეობისთვის 
                  ხელმისაწვდომი გახადოს მსოფლიოს ყველაზე თანამედროვე და ხარისხიანი პროდუქტები. 
                  ჩვენი გუნდი შედგება გამოცდილი პროფესიონალებისგან, რომლებიც ყოველდღიურად 
                  მუშაობენ იმისთვის, რომ თქვენ მიიღოთ საუკეთესო მომსახურება.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  დღეს ჩვენ ვართ ერთ-ერთი წამყვანი ონლაინ მაღაზია საქართველოში, რომელიც 
                  ემსახურება 50,000-ზე მეტ დაკმაყოფილებულ მომხმარებელს. ჩვენი მისია არის 
                  ტექნოლოგიების ხელმისაწვდომობა ყველასთვის - მარტივი, სწრაფი და უსაფრთხო 
                  ონლაინ ყიდვების მეშვეობით.
                </p>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-2">ჩვენი მისია</h4>
                  <p className="text-sm text-indigo-700">
                    ინოვაციური ტექნოლოგიების ხელმისაწვდომობა ყველა ქართველისთვის, 
                    უმაღლესი ხარისხის მომსახურებით და კონკურენტული ფასებით.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Our Values */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-600" />
                  ჩვენი ღირებულებები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ხარისხი</h4>
                      <p className="text-sm text-gray-600">
                        ვთანამშრომლობთ მხოლოდ ოფიციალურ მიმწოდებლებთან და გვაქვს 
                        ყველა პროდუქტზე ოფიციალური გარანტია.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">მომხმარებელზე ორიენტაცია</h4>
                      <p className="text-sm text-gray-600">
                        თქვენი კმაყოფილება ჩვენი უმთავრესი პრიორიტეტია. 
                        24/7 მხარდაჭერა და სწრაფი მიწოდება.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                      <Globe className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ინოვაცია</h4>
                      <p className="text-sm text-gray-600">
                        ვაგრძელებთ პლატფორმის განვითარებას და ახალი 
                        ტექნოლოგიების დანერგვას.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ნდობა</h4>
                      <p className="text-sm text-gray-600">
                        გამჭვირვალე ფასები, ნაღდი ინფორმაცია და 
                        სანდო ურთიერთობები ყველა კლიენტთან.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-green-600" />
                  რატომ აირჩიოთ ჩვენ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">ოფიციალური გარანტია</h4>
                    <p className="text-sm text-green-700">
                      ყველა პროდუქტს თან ახლავს მწარმოებლის ოფიციალური გარანტია და 
                      ავტორიზებული სერვისცენტრების მხარდაჭერა.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">სწრაფი მიწოდება</h4>
                    <p className="text-sm text-blue-700">
                      თბილისში 24 საათში, რეგიონებში 2-3 დღეში. 
                      უფასო მიწოდება 100₾-ზე მეტი შეკვეთისას.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">უსაფრთხო გადახდა</h4>
                    <p className="text-sm text-purple-700">
                      SSL დაცვა, PCI DSS სტანდარტები და მრავალფეროვანი 
                      გადახდის მეთოდები თქვენი უსაფრთხოებისთვის.
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2">24/7 მხარდაჭერა</h4>
                    <p className="text-sm text-orange-700">
                      ჩვენი მხარდაჭერის გუნდი ყოველთვის მზადაა დაგეხმაროთ 
                      ნებისმიერ საკითხში და უპასუხოს კითხვებს.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Team */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  ჩვენი გუნდი
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  შპს გამოიწერეს გუნდი შედგება 25-ზე მეტი პროფესიონალისგან, რომლებიც 
                  ყოველდღიურად მუშაობენ იმისთვის, რომ თქვენ მიიღოთ საუკეთესო მომსახურება:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-indigo-100 rounded-full p-4 w-fit mx-auto mb-3">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h4 className="font-medium mb-1">მყიდველების მხარდაჭერა</h4>
                    <p className="text-sm text-gray-600">24/7 მხარდაჭერის სპეციალისტები</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-3">
                      <Globe className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-1">IT განყოფილება</h4>
                    <p className="text-sm text-gray-600">ტექნიკური პლატფორმის განვითარება</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-orange-100 rounded-full p-4 w-fit mx-auto mb-3">
                      <Award className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="font-medium mb-1">ლოგისტიკა</h4>
                    <p className="text-sm text-gray-600">სწრაფი და უსაფრთხო მიწოდება</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">საკონტაქტო ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">მისამართი</p>
                    <p className="text-sm text-gray-600">
                      რუსთაველის გამზირი 42<br />
                      თბილისი 0108, საქართველო
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">+995 599 123 456</p>
                    <p className="text-sm text-gray-600">მთავარი ნომერი</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">info@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">ზოგადი ინფორმაცია</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">სამუშაო საათები</p>
                    <p className="text-sm text-gray-600">
                      ორშაბათი - პარასკევი: 09:00-19:00<br />
                      შაბათი: 10:00-18:00<br />
                      კვირა: 12:00-17:00
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <a href="tel:+995599123456">
                      <Phone className="h-4 w-4 mr-2" />
                      დაკავშირება
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="mailto:info@gamoiwere.ge">
                      <Mail className="h-4 w-4 mr-2" />
                      ელ.ფოსტა
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company Legal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">იურიდიული ინფორმაცია</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">შპს გამოიწერე</p>
                  <p className="text-sm text-gray-600">საიდენტიფიკაციო კოდი: 405729653</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>იურიდიული მისამართი:</strong><br />
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>საქმიანობის სფერო:</strong><br />
                    ელექტრონული კომერცია<br />
                    ტექნიკური პროდუქტების რეალიზაცია
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">სერტიფიკატები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ISO 9001
                  </Badge>
                  <span className="text-sm text-gray-600">ხარისხის მართვა</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    PCI DSS
                  </Badge>
                  <span className="text-sm text-gray-600">გადახდების უსაფრთხოება</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    SSL
                  </Badge>
                  <span className="text-sm text-gray-600">მონაცემთა დაცვა</span>
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
                <WouterLink 
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობა
                </WouterLink>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">შემოუერთდით ჩვენს ოჯახს</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              იყავით ნაწილი ჩვენი მზარდი საზოგადოების, სადაც ხარისხი და მომსახურება 
              ყოველთვის პირველ ადგილზეა. დაიწყეთ ყიდვები დღესვე!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <WouterLink href="/">
                  <Globe className="h-5 w-5 mr-2" />
                  ყიდვების დაწყება
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

export default AboutPage;