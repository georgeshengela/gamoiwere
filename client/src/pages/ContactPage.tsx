import { Phone, Mail, MapPin, Clock, MessageSquare, Send, Building, Users, Headphones, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";
import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              კონტაქტი
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              ჩვენ ყოველთვის მზად ვართ დაგეხმაროთ. დაგვიკავშირდით ნებისმიერ დროს და მიიღეთ 
              პროფესიონალური კონსულტაცია ყველა საკითხზე.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ტელეფონი</h3>
              <p className="text-gray-600 text-sm mb-3">
                ზარი ან SMS ნებისმიერ დროს
              </p>
              <a href="tel:+995599123456" className="text-blue-600 font-medium hover:underline">
                +995 599 123 456
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ელ.ფოსტა</h3>
              <p className="text-gray-600 text-sm mb-3">
                24/7 ონლაინ მხარდაჭერა
              </p>
              <a href="mailto:info@gamoiwere.ge" className="text-green-600 font-medium hover:underline">
                info@gamoiwere.ge
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">მისამართი</h3>
              <p className="text-gray-600 text-sm mb-3">
                ოფისი და მაღაზია თბილისში
              </p>
              <p className="text-purple-600 font-medium">
                რუსთაველის გამზირი 42
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Send className="h-6 w-6 text-teal-600" />
                  დაგვიკავშირდით
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        სახელი და გვარი *
                      </label>
                      <Input
                        type="text"
                        placeholder="შეიყვანეთ თქვენი სახელი"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ელ.ფოსტა *
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ტელეფონის ნომერი
                      </label>
                      <Input
                        type="tel"
                        placeholder="+995 5XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        თემა *
                      </label>
                      <Select 
                        value={formData.subject} 
                        onValueChange={(value) => setFormData({...formData, subject: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="აირჩიეთ თემა" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">ზოგადი კითხვა</SelectItem>
                          <SelectItem value="order">შეკვეთის შესახებ</SelectItem>
                          <SelectItem value="technical">ტექნიკური მხარდაჭერა</SelectItem>
                          <SelectItem value="warranty">გარანტიული სერვისი</SelectItem>
                          <SelectItem value="return">დაბრუნება/გაცვლა</SelectItem>
                          <SelectItem value="complaint">პრეტენზია</SelectItem>
                          <SelectItem value="partnership">თანამშრომლობა</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      შეტყობინება *
                    </label>
                    <Textarea
                      placeholder="დეტალურად აღწერეთ თქვენი კითხვა ან პრობლემა..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      შეტყობინების გაგზავნა
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href="tel:+995599123456">პირდაპირ ზარი</a>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Clock className="h-5 w-5 text-teal-600" />
                  სამუშაო საათები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">ორშაბათი - პარასკევი</span>
                    <span className="text-sm text-gray-600">09:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">შაბათი</span>
                    <span className="text-sm text-gray-600">10:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">კვირა</span>
                    <span className="text-sm text-gray-600">12:00 - 17:00</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>24/7 ონლაინ მხარდაჭერა:</strong><br />
                    ელ.ფოსტა და ონლაინ ჩეთი ყოველთვის ხელმისაწვდომია
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Department Contacts */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  განყოფილებები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">შეკვეთები</h4>
                      <p className="text-xs text-gray-600">orders@gamoiwere.ge</p>
                      <p className="text-xs text-gray-600">+995 599 123 456</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Headphones className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">ტექნიკური მხარდაჭერა</h4>
                      <p className="text-xs text-gray-600">support@gamoiwere.ge</p>
                      <p className="text-xs text-gray-600">+995 599 123 457</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Building className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">ბიზნეს პარტნიორობა</h4>
                      <p className="text-xs text-gray-600">business@gamoiwere.ge</p>
                      <p className="text-xs text-gray-600">+995 599 123 458</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">ზოგადი ინფორმაცია</h4>
                      <p className="text-xs text-gray-600">info@gamoiwere.ge</p>
                      <p className="text-xs text-gray-600">+995 599 123 456</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MapPin className="h-5 w-5 text-red-600" />
                  ლოკაცია
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">მთავარი ოფისი და მაღაზია</h4>
                    <p className="text-sm text-gray-600">
                      რუსთაველის გამზირი 42<br />
                      თბილისი 0108, საქართველო
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-sm mb-2">ტრანსპორტი</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">• მეტრო: რუსთაველი (5 წუთი)</p>
                      <p className="text-xs text-gray-600">• ავტობუსი: №1, №37, №50</p>
                      <p className="text-xs text-gray-600">• მარშრუტკა: №2, №15, №21</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-sm mb-1">პარკინგი</h4>
                    <p className="text-xs text-gray-600">
                      უფასო პარკინგი ხელმისაწვდომია შენობის უკანა მხარეს
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <a 
                    href="https://maps.google.com/?q=რუსთაველის გამზირი 42, თბილისი" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Google Maps-ზე ნახვა
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
                    <strong>დირექტორი:</strong> [სახელი გვარი]<br />
                    <strong>რეგისტრაციის თარიღი:</strong> 2019 წელი<br />
                    <strong>საქმიანობის სფერო:</strong> ელექტრონული კომერცია
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">გამოგვყევით</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="https://facebook.com/gamoiwere" target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="https://instagram.com/gamoiwere" target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="https://linkedin.com/company/gamoiwere" target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">ვერ იპოვეთ რასაც ეძებდით?</h3>
            <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
              ჩვენი გუნდი ყოველთვის მზადაა დაგეხმაროთ. დაგვიკავშირდით ნებისმიერი არხით 
              და მიიღეთ სწრაფი და ეფექტური პასუხი.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="tel:+995599123456">
                  <Phone className="h-5 w-5 mr-2" />
                  უკმო ზარი
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <WouterLink href="/faq">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  ხშირი კითხვები
                </WouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;