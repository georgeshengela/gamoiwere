import { FileText, Scale, Users, CreditCard, Package, Shield, Phone, Mail, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Scale className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              მომსახურების პირობები
            </h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto">
              ჩვენი ონლაინ მაღაზიის გამოყენებისას მოქმედი წესები და პირობები. 
              გთხოვთ, ყურადღებით გაეცანით ამ დოკუმენტს სერვისის გამოყენებამდე.
            </p>
            <p className="text-sm text-amber-300 mt-4">
              ბოლო განახლება: 07 ივნისი, 2025 | ძალაში შესვლა: 01 იანვარი, 2019
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">18+ წლის ასაკი</h3>
              <p className="text-gray-600 text-sm">
                სერვისის გამოყენება ნებადართულია სრულწლოვნებისთვის
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">უსაფრთხოება</h3>
              <p className="text-gray-600 text-sm">
                SSL დაშიფვრა და მონაცემების დაცვა
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">საქართველოს კანონი</h3>
              <p className="text-gray-600 text-sm">
                ყველა ურთიერთობა რეგულირდება ქართული კანონმდებლობით
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">სავალდებულო შეთანხმება</h3>
              <p className="text-gray-600 text-sm">
                სერვისის გამოყენება ნიშნავს პირობების მიღებას
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Terms */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-amber-600" />
                  ზოგადი პირობები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  ეს მომსახურების პირობები ("პირობები") რეგულირებს თქვენს ურთიერთობას 
                  შპს გამოიწერესთან (საიდენტიფიკაციო კოდი: 405729653) და ჩვენი 
                  ონლაინ მაღაზიის gamoiwere.ge-ის გამოყენებას.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">მნიშვნელოვანი</h4>
                      <p className="text-sm text-amber-700">
                        ვებსაიტზე რეგისტრაციით ან შეკვეთის განხორციელებით თქვენ ავტომატურად 
                        ეთანხმებით ამ პირობებს. თუ არ ეთანხმებით, გთხოვთ, არ გამოიყენოთ ჩვენი სერვისები.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">შეთანხმების მხარეები:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        <strong>"კომპანია"</strong> - შპს გამოიწერე, რომელიც ფლობს და ოპერირებს gamoiwere.ge ვებსაიტს
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        <strong>"მომხმარებელი"</strong> - ნებისმიერი ფიზიკური ან იურიდიული პირი, რომელიც იყენებს ჩვენს სერვისებს
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        <strong>"სერვისი"</strong> - ონლაინ მაღაზია, ვებსაიტი და ყველა მასთან დაკავშირებული ფუნქცია
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Registration */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  ანგარიშის რეგისტრაცია
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ასაკის მოთხოვნა</h4>
                      <p className="text-sm text-gray-600">
                        რეგისტრაცია შესაძლებელია მხოლოდ 18 წლის ასაკიდან. 
                        18 წლამდე ასაკის პირებს შეუძლიათ გამოიყენონ სერვისი მშობლის/კანონიერი წარმომადგენლის ზედამხედველობით.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ზუსტი ინფორმაცია</h4>
                      <p className="text-sm text-gray-600">
                        თქვენ ვალდებული ხართ მიაწოდოთ ზუსტი, სრული და განახლებული ინფორმაცია რეგისტრაციისას.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ანგარიშის უსაფრთხოება</h4>
                      <p className="text-sm text-gray-600">
                        თქვენ პასუხისმგებელი ხართ თქვენი ანგარიშის პაროლის უსაფრთხოებაზე და ყველა მოქმედებაზე, 
                        რომელიც ხორციელდება თქვენი ანგარიშით.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ერთი ანგარიში პიროვნებაზე</h4>
                      <p className="text-sm text-gray-600">
                        ყოველ ფიზიკურ პირს შეუძლია ჰქონდეს მხოლოდ ერთი აქტიური ანგარიში ჩვენს პლატფორმაზე.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders and Payments */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  შეკვეთები და გადახდა
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">შეკვეთის პროცესი:</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-blue-800">ფასები და ხელმისაწვდომობა</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        ყველა ფასი მითითებულია ქართულ ლარში (₾) და შეიძლება შეიცვალოს წინასწარი შეტყობინების გარეშე. 
                        პროდუქტების ხელმისაწვდომობა არ არის გარანტირებული.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-green-800">შეკვეთის დადასტურება</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        შეკვეთა ითვლება დადასტურებულად მხოლოდ ჩვენი წერილობითი შეტყობინების შემდეგ ელ.ფოსტით ან SMS-ით.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-purple-800">გადახდის პირობები</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        მიღებულია ონლაინ გადახდა ბარათით, ნაღდი ანგარიშსწორება მიწოდებისას და ბანკის გადარიცხვა. 
                        ყველა ტრანზაქცია უსაფრთხოა და დაშიფრულია.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">შეკვეთის გაუქმება</h4>
                  <p className="text-sm text-green-700">
                    შეკვეთის გაუქმება შესაძლებელია მიწოდებამდე ნებისმიერ დროს. 
                    გაუქმების შემთხვევაში თანხა სრულად ბრუნდება 3-5 სამუშაო დღეში.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Terms */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-purple-600" />
                  მიწოდების პირობები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">მიწოდების დრო</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• თბილისი: 24 საათი</li>
                      <li>• რეგიონები: 2-3 დღე</li>
                      <li>• ექსპრეს: 3-6 საათი (თბილისი)</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">რისკები</h4>
                    <p className="text-sm text-purple-700">
                      კომპანია არ არის პასუხისმგებელი ვითარებაზე, რომელიც არ არის მის კონტროლში 
                      (ამინდი, ბუნებრივი კატასტროფები, სტრაიკები).
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">მიწოდებისას შემოწმება</h4>
                  <p className="text-sm text-gray-600">
                    მომხმარებელს უფლება აქვს შეამოწმოს პროდუქტი მიწოდებისას. თუ პროდუქტი არ შეესაბამება 
                    აღწერას ან დაზიანებულია, მომხმარებელი უფლებამოსილია უარი თქვას მიღებაზე.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Warranties and Returns */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  გარანტია და დაბრუნება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  დეტალური ინფორმაცია გარანტიისა და დაბრუნების შესახებ განთავსებულია 
                  შესაბამის გვერდებზე, რომლებიც წარმოადგენს ამ პირობების განუყოფელ ნაწილს.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">14 დღიანი დაბრუნება</h4>
                    <p className="text-sm text-gray-600">
                      პროდუქტის დაბრუნება ორიგინალ მდგომარეობაში მიღებიდან 14 დღის განმავლობაში.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">მწარმოებლის გარანტია</h4>
                    <p className="text-sm text-gray-600">
                      ყველა პროდუქტზე მოქმედებს მწარმოებლის ოფიციალური გარანტია.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability and Limitations */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  პასუხისმგებლობის შეზღუდვები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-3">მნიშვნელოვანი შეზღუდვები:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        კომპანია არ არის პასუხისმგებელი ირიბ, შემთხვევით ან კონსეკვენტურ ზარალზე
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        პასუხისმგებლობა შეზღუდულია შეკვეთის ღირებულებით
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <p className="text-sm text-orange-700">
                        არ ვიღებთ პასუხისმგებლობას მესამე მხარის მომსახურებებზე
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">ვებსაიტის ხელმისაწვდომობა</h4>
                  <p className="text-sm text-gray-600">
                    ვცდილობთ უზრუნველვყოთ ვებსაიტის მუდმივი მუშაობა, მაგრამ არ ვგარანტირებთ 
                    24/7 ხელმისაწვდომობას. ტექნიკური სამუშაოები შესაძლებელია წინასწარი შეტყობინებით.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-gray-600" />
                  პირობების ცვლილება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  კომპანიას უფლება აქვს ნებისმიერ დროს შეცვალოს ეს პირობები. 
                  მნიშვნელოვანი ცვლილებების შესახებ მომხმარებლები გაიგებენ:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm">ელ.ფოსტით შეტყობინება</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm">ვებსაიტზე შეტყობინება</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm">30 დღით ადრე გაფრთხილება</span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    სერვისის გამოყენების გაგრძელება ცვლილებების შემდეგ ნიშნავს ახალი პირობების მიღებას.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legal Contact */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">იურიდიული საკითხები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">legal@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">იურიდიული განყოფილება</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">+995 599 123 456</p>
                    <p className="text-sm text-gray-600">ორშ-პარ: 09:00-18:00</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <a href="mailto:legal@gamoiwere.ge">
                      <Mail className="h-4 w-4 mr-2" />
                      იურიდიული კონსულტაცია
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">მოქმედი კანონმდებლობა</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">იურისდიქცია</h4>
                  <p className="text-sm text-gray-600">
                    ყველა დავა განიხილება საქართველოს სასამართლოებში 
                    ქართული კანონმდებლობის შესაბამისად.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">სავალდებულო არბიტრაჟი</h4>
                  <p className="text-sm text-gray-600">
                    მომხმარებლებთან დავები ისინჯება მედიაციის გზით, 
                    შემდეგ კი სასამართლო გზით.
                  </p>
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
                    <strong>იურიდიული მისამართი:</strong><br />
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>დირექტორი:</strong> [სახელი გვარი]<br />
                    <strong>რეგისტრაციის თარიღი:</strong> 2019 წელი
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">დაკავშირებული დოკუმენტები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <WouterLink 
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობის პოლიტიკა
                </WouterLink>
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">კითხვები პირობების შესახებ?</h3>
            <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
              თუ გაქვთ კითხვები ამ მომსახურების პირობების შესახებ, გთხოვთ დაგვიკავშირდით 
              და ჩვენი იურიდიული გუნდი დაგეხმარებათ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="mailto:legal@gamoiwere.ge">
                  <Mail className="h-5 w-5 mr-2" />
                  იურიდიული კონსულტაცია
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <WouterLink href="/contact">
                  <Phone className="h-5 w-5 mr-2" />
                  ზოგადი კონტაქტი
                </WouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;