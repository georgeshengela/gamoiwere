import { Cookie, Settings, Eye, Database, BarChart3, Shield, Phone, Mail, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";
import { useState } from "react";

const CookiesPolicyPage = () => {
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true
  });

  const handleCookieToggle = (type: string) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  const saveCookiePreferences = () => {
    // Save preferences to localStorage or send to server
    console.log("Cookie preferences saved:", cookieSettings);
    alert("ქუქიების პარამეტრები შენახულია!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Cookie className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ქუქიების პოლიტიკა
            </h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              გაეცანით იმ ინფორმაციას, თუ როგორ ვიყენებთ cookies-ებს ჩვენს ვებსაიტზე 
              თქვენი მომხმარებლური გამოცდილების გასაუმჯობესებლად.
            </p>
            <p className="text-sm text-pink-300 mt-4">
              ბოლო განახლება: 07 ივნისი, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Cookie Management */}
        <div className="mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-50 to-rose-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Settings className="h-6 w-6 text-pink-600" />
                ქუქიების მართვა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                აქ შეგიძლიათ მართოთ თქვენი ქუქიების პარამეტრები. გთხოვთ, გაითვალისწინოთ, 
                რომ ზოგიერთი ქუქი აუცილებელია ვებსაიტის სწორი მუშაობისთვის.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">აუცილებელი ქუქიები</h4>
                      <p className="text-sm text-gray-600">სესია, ავტორიზაცია, უსაფრთხოება</p>
                    </div>
                    <Switch 
                      checked={cookieSettings.necessary} 
                      disabled={true}
                      className="opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">ანალიტიკური ქუქიები</h4>
                      <p className="text-sm text-gray-600">Google Analytics, ვიზიტების ანალიზი</p>
                    </div>
                    <Switch 
                      checked={cookieSettings.analytics} 
                      onCheckedChange={() => handleCookieToggle('analytics')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">მარკეტინგული ქუქიები</h4>
                      <p className="text-sm text-gray-600">Facebook Pixel, რეკლამის ოპტიმიზაცია</p>
                    </div>
                    <Switch 
                      checked={cookieSettings.marketing} 
                      onCheckedChange={() => handleCookieToggle('marketing')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">პრეფერენსების ქუქიები</h4>
                      <p className="text-sm text-gray-600">ენა, ვალუტა, თემის პარამეტრები</p>
                    </div>
                    <Switch 
                      checked={cookieSettings.preferences} 
                      onCheckedChange={() => handleCookieToggle('preferences')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={saveCookiePreferences} className="bg-pink-600 hover:bg-pink-700">
                  <Settings className="h-4 w-4 mr-2" />
                  პარამეტრების შენახვა
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCookieSettings({necessary: true, analytics: false, marketing: false, preferences: false})}
                >
                  მხოლოდ აუცილებელი
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCookieSettings({necessary: true, analytics: true, marketing: true, preferences: true})}
                >
                  ყველას მიღება
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What are Cookies */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Cookie className="h-6 w-6 text-pink-600" />
                  რა არის ქუქიები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  ქუქიები არის მცირე ტექსტური ფაილები, რომლებიც ინახება თქვენს კომპიუტერზე ან 
                  მობილურ მოწყობილობაზე, როდესაც თქვენ ეწვევით ვებსაიტს. ისინი ფართოდ 
                  გამოიყენება ვებსაიტების მუშაობისთვის ან უფრო ეფექტური მუშაობისთვის.
                </p>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h4 className="font-medium text-pink-800 mb-2">ქუქიები გვეხმარება:</h4>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li>• დავიმახსოვროთ თქვენი რეგისტრაცია და შესვლა</li>
                    <li>• გავიგოთ როგორ იყენებთ ჩვენს ვებსაიტს</li>
                    <li>• გავაუმჯობესოთ თქვენი მომხმარებლური გამოცდილება</li>
                    <li>• გაჩვენოთ რელევანტური კონტენტი და რეკლამები</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  ქუქიების ტიპები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {/* Necessary Cookies */}
                  <div className="border-l-4 border-red-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">აუცილებელი ქუქიები</h4>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">სავალდებულო</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      ეს ქუქიები აუცილებელია ვებსაიტის ძირითადი ფუნქციების მუშაობისთვის 
                      და ვერ გამოირთვება ჩვენს სისტემებში.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">სესიის ქუქიები</h5>
                        <p className="text-xs text-gray-600">PHPSESSID, session_token</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">უსაფრთხოების ქუქიები</h5>
                        <p className="text-xs text-gray-600">csrf_token, security_hash</p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">ანალიტიკური ქუქიები</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">არჩევითი</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      ეს ქუქიები გვეხმარება გავიგოთ ვიზიტორები როგორ ურთიერთქმედებენ ვებსაიტთან, 
                      რაც მოგვცემს შესაძლებლობას გავაუმჯობესოთ მომსახურება.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">Google Analytics</h5>
                        <p className="text-xs text-gray-600">_ga, _ga_*, _gid</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">Hotjar</h5>
                        <p className="text-xs text-gray-600">_hjSessionUser_*, _hjSession_*</p>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">მარკეტინგული ქუქიები</h4>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">არჩევითი</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      ეს ქუქიები გამოიყენება რეკლამების გასაჩენად, რომლებიც რელევანტურია 
                      თქვენთვის და თქვენი ინტერესებისთვის.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">Facebook Pixel</h5>
                        <p className="text-xs text-gray-600">_fbp, _fbc</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">Google Ads</h5>
                        <p className="text-xs text-gray-600">_gcl_au, _gcl_aw</p>
                      </div>
                    </div>
                  </div>

                  {/* Preference Cookies */}
                  <div className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">პრეფერენსების ქუქიები</h4>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">არჩევითი</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      ეს ქუქიები ინახავს თქვენს პრეფერენსებს და მორგებულ პარამეტრებს, 
                      რომ გავაუმჯობესოთ თქვენი მომხმარებლური გამოცდილება.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">ენისა და რეგიონის</h5>
                        <p className="text-xs text-gray-600">language, region, currency</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm">თემისა და ინტერფეისი</h5>
                        <p className="text-xs text-gray-600">theme, layout_preference</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Duration */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  ქუქიების ვადა და წაშლა
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">ქუქიების ვადები:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">სესიის ქუქიები</span>
                        <span className="text-xs text-gray-600">ბრაუზერის დახურვამდე</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">პრეფერენსების ქუქიები</span>
                        <span className="text-xs text-gray-600">1 წელი</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">ანალიტიკური ქუქიები</span>
                        <span className="text-xs text-gray-600">2 წელი</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">მარკეტინგული ქუქიები</span>
                        <span className="text-xs text-gray-600">90 დღე</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">ქუქიების წაშლა:</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h5 className="font-medium text-blue-800 text-sm mb-1">ბრაუზერში</h5>
                        <p className="text-xs text-blue-700">
                          Settings → Privacy → Clear browsing data → Cookies
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <h5 className="font-medium text-green-800 text-sm mb-1">ჩვენს საიტზე</h5>
                        <p className="text-xs text-green-700">
                          გამოიყენეთ ზემოთ მოცემული ქუქიების მართვის ინსტრუმენტები
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third Party Cookies */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-purple-600" />
                  მესამე მხარის ქუქიები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  ჩვენს ვებსაიტზე შეიძლება განთავსდეს მესამე მხარის ქუქიები შემდეგი სერვისებისგან:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Google Services</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Google Analytics</li>
                      <li>• Google Ads</li>
                      <li>• Google Maps</li>
                      <li>• reCAPTCHA</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Social Media</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Facebook</li>
                      <li>• Instagram</li>
                      <li>• LinkedIn</li>
                      <li>• YouTube</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Payment & Support</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Stripe</li>
                      <li>• PayPal</li>
                      <li>• Intercom</li>
                      <li>• Zendesk</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">მნიშვნელოვანი</h4>
                      <p className="text-sm text-orange-700">
                        მესამე მხარის ქუქიებზე მათი შესაბამისი კონფიდენციალურობის პოლიტიკები ვრცელდება. 
                        ჩვენ არ ვაკონტროლებთ ამ ქუქიების შინაარსს ან გამოყენებას.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">სწრაფი პარამეტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCookieSettings({necessary: true, analytics: true, marketing: true, preferences: true})}
                  >
                    <ToggleRight className="h-4 w-4 mr-2" />
                    ყველას ჩართვა
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCookieSettings({necessary: true, analytics: false, marketing: false, preferences: false})}
                  >
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    მხოლოდ აუცილებელი
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={saveCookiePreferences}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    შენახვა
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Browser Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">ბრაუზერის პარამეტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Chrome</h4>
                    <p className="text-xs text-gray-600">
                      Settings → Privacy and security → Cookies and other site data
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Firefox</h4>
                    <p className="text-xs text-gray-600">
                      Options → Privacy & Security → Cookies and Site Data
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Safari</h4>
                    <p className="text-xs text-gray-600">
                      Preferences → Privacy → Manage Website Data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">ქუქიების შესახებ კითხვები</CardTitle>
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

                <Button asChild variant="outline" className="w-full">
                  <a href="mailto:privacy@gamoiwere.ge">
                    <Mail className="h-4 w-4 mr-2" />
                    ელ.ფოსტა
                  </a>
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
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
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
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობის პოლიტიკა
                </WouterLink>
                <WouterLink 
                  href="/terms" 
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicyPage;