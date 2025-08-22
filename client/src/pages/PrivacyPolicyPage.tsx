import { Shield, Eye, Lock, Database, UserCheck, Globe, Phone, Mail, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-600 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              კონფიდენციალურობის პოლიტიკა
            </h1>
            <p className="text-xl text-slate-100 max-w-3xl mx-auto">
              ჩვენ ვიცავთ თქვენს პირად ინფორმაციას და გვახსოვს, რომ ნდობა ყველაზე მნიშვნელოვანია. 
              გაეცანით ჩვენს კონფიდენციალურობის პოლიტიკას.
            </p>
            <p className="text-sm text-slate-300 mt-4">
              ბოლო განახლება: 07 ივნისი, 2025
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
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">დაცული მონაცემები</h3>
              <p className="text-gray-600 text-sm">
                SSL დაშიფვრა და PCI DSS სტანდარტები
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">თქვენი კონტროლი</h3>
              <p className="text-gray-600 text-sm">
                მონაცემების წაშლა და შეცვლა ნებისმიერ დროს
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">გამჭვირვალობა</h3>
              <p className="text-gray-600 text-sm">
                ღია ინფორმაცია მონაცემების გამოყენებაზე
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">GDPR შესაბამისობა</h3>
              <p className="text-gray-600 text-sm">
                ევროპული სტანდარტების დაცვა
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-slate-600" />
                  შესავალი
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  შპს გამოიწერე (საიდენტიფიკაციო კოდი: 405729653) იცავს თქვენს პირადულობას და 
                  პატივს სცემს თქვენს უფლებებს. ეს კონფიდენციალურობის პოლიტიკა განმარტავს, 
                  როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს პირად ინფორმაციას.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  ჩვენი ვებსაიტისა და სერვისების გამოყენებით, თქვენ თანხმდებით ამ პოლიტიკაში 
                  აღწერილ პირობებზე. თუ არ ეთანხმებით ამ პირობებს, გთხოვთ, არ გამოიყენოთ ჩვენი სერვისები.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">მნიშვნელოვანი ცვლილებები</h4>
                  <p className="text-sm text-slate-700">
                    ამ პოლიტიკის ნებისმიერი ცვლილების შესახებ ჩვენ გაცნობებთ ელ.ფოსტით 
                    და ვებსაიტზე შეტყობინების მეშვეობით 30 დღით ადრე.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  მონაცემების შეგროვება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">პირადი ინფორმაცია, რომელსაც ვაგროვებთ:</h4>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-blue-800">რეგისტრაციისას</h5>
                      <ul className="text-sm text-gray-600 space-y-1 mt-2">
                        <li>• სახელი და გვარი</li>
                        <li>• ელექტრონული ფოსტის მისამართი</li>
                        <li>• ტელეფონის ნომერი</li>
                        <li>• მისამართი (მიწოდებისთვის)</li>
                        <li>• პაროლი (დაშიფრული)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-green-800">შეკვეთისას</h5>
                      <ul className="text-sm text-gray-600 space-y-1 mt-2">
                        <li>• ბილინგის ინფორმაცია</li>
                        <li>• მიწოდების მისამართი</li>
                        <li>• გადახდის მეთოდი (ბარათის ბოლო 4 ციფრი)</li>
                        <li>• შეკვეთის ისტორია</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-purple-800">ტექნიკური მონაცემები</h5>
                      <ul className="text-sm text-gray-600 space-y-1 mt-2">
                        <li>• IP მისამართი</li>
                        <li>• ბრაუზერის ტიპი და ვერსია</li>
                        <li>• ოპერაციული სისტემა</li>
                        <li>• საიტზე ნავიგაციის ინფორმაცია</li>
                        <li>• Cookies და ანალიტიკური მონაცემები</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  მონაცემების გამოყენება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  ჩვენ ვიყენებთ თქვენს პირად ინფორმაციას შემდეგი მიზნებისთვის:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">სერვისის გაწევა</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• შეკვეთების დამუშავება</li>
                      <li>• მიწოდების ორგანიზება</li>
                      <li>• მომხმარებლის მხარდაჭერა</li>
                      <li>• ანგარიშის მართვა</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">კომუნიკაცია</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• შეკვეთის შესახებ შეტყობინებები</li>
                      <li>• მარკეტინგული კომუნიკაცია</li>
                      <li>• უსაფრთხოების განახლებები</li>
                      <li>• მნიშვნელოვანი შეტყობინებები</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">გაუმჯობესება</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• საიტის ანალიტიკა</li>
                      <li>• მომხმარებლის გამოცდილება</li>
                      <li>• პროდუქტების რეკომენდაცია</li>
                      <li>• სერვისის ოპტიმიზაცია</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2">იურიდიული</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• კანონის მოთხოვნების შესრულება</li>
                      <li>• მოთხოვნების განხილვა</li>
                      <li>• ბუღალტრული ანგარიშგება</li>
                      <li>• უსაფრთხოების უზრუნველყოფა</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-purple-600" />
                  მონაცემების გაზიარება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">მნიშვნელოვანი</h4>
                      <p className="text-sm text-red-700">
                        ჩვენ არასდროს ვყიდით, ვქირაობთ ან ვუზიარებთ თქვენს პირად ინფორმაციას 
                        მესამე მხარეებს კომერციული მიზნებისთვის.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">მონაცემები შეიძლება გაზიარდეს:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">სერვისის პროვაიდერებთან</p>
                        <p className="text-sm text-gray-600">მიწოდების კომპანიები, გადახდის სისტემები (მხოლოდ საჭირო ინფორმაცია)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">იურიდიული მოთხოვნების შემთხვევაში</p>
                        <p className="text-sm text-gray-600">სასამართლო ორდერი, კანონის აღსრულების ორგანოები</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">ბიზნესის ტრანსფერის შემთხვევაში</p>
                        <p className="text-sm text-gray-600">შერწყმა, შეძენა (წინასწარი შეტყობინებით)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-green-600" />
                  მონაცემების უსაფრთხოება
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  ჩვენ ვიყენებთ ინდუსტრიულ სტანდარტულ უსაფრთხოების ზომებს თქვენი მონაცემების დასაცავად:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Lock className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">SSL 256-bit დაშიფვრა</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">PCI DSS სერტიფიცირება</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">დაცული სერვერები</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-2">
                        <Eye className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">წვდომის კონტროლი</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium">უსაფრთხოების მონიტორინგი</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <UserCheck className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium">პერსონალის ტრენინგი</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  თქვენი უფლებები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  GDPR-ის და საქართველოს კანონმდებლობის შესაბამისად, თქვენ გაქვთ შემდეგი უფლებები:
                </p>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">წვდომის უფლება</h4>
                    <p className="text-sm text-gray-600">
                      მოითხოვეთ ინფორმაცია იმის შესახებ, რა მონაცემები გვაქვს თქვენზე
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">შესწორების უფლება</h4>
                    <p className="text-sm text-gray-600">
                      შეცვალეთ ან განაახლეთ თქვენი პირადი ინფორმაცია
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">წაშლის უფლება</h4>
                    <p className="text-sm text-gray-600">
                      მოითხოვეთ თქვენი მონაცემების სრული წაშლა
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">პორტაბილურობის უფლება</h4>
                    <p className="text-sm text-gray-600">
                      მიიღეთ თქვენი მონაცემები მანქანურად წაკითხვად ფორმატში
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>როგორ გამოვიყენოთ ეს უფლებები:</strong><br />
                    დაგვიკავშირდით ელ.ფოსტით privacy@gamoiwere.ge ან ტელეფონით +995 599 123 456. 
                    პასუხს მიიღებთ 30 დღის განმავლობაში.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact for Privacy */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">კონფიდენციალურობის საკითხები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">privacy@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">მონაცემების დაცვის ოფიცერი</p>
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
                    <a href="mailto:privacy@gamoiwere.ge">
                      <Mail className="h-4 w-4 mr-2" />
                      კონფიდენციალურობის საკითხი
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <WouterLink href="/contact">
                      <Phone className="h-4 w-4 mr-2" />
                      ზოგადი კონტაქტი
                    </WouterLink>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cookies Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Cookies და ტრეკინგი</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">რა Cookies-ებს ვიყენებთ:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">საჭირო Cookies (ავტორიზაცია)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">ანალიტიკური (Google Analytics)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">მარკეტინგული (Facebook Pixel)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <p className="text-sm text-gray-600">
                  Cookies-ების პარამეტრები შეგიძლიათ მართოთ ბრაუზერის საშუალებით.
                </p>
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
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>მონაცემების დაცვის ოფიცერი:</strong><br />
                    [სახელი გვარი]<br />
                    privacy@gamoiwere.ge
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">დაკავშირებული გვერდები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <WouterLink 
                  href="/return-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  დაბრუნების პოლიტიკა
                </WouterLink>
                <WouterLink 
                  href="/terms-of-service" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  მომსახურების პირობები
                </WouterLink>
                <WouterLink 
                  href="/contact" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონტაქტი
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
          <div className="bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">კითხვები კონფიდენციალურობაზე?</h3>
            <p className="text-slate-100 mb-6 max-w-2xl mx-auto">
              ჩვენი მონაცემების დაცვის გუნდი მზადაა უპასუხოს ნებისმიერ კითხვას თქვენი 
              პირადი ინფორმაციისა და მისი გამოყენების შესახებ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="mailto:privacy@gamoiwere.ge">
                  <Mail className="h-5 w-5 mr-2" />
                  მონაცემების დაცვის ოფიცერი
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

export default PrivacyPolicyPage;