import { Briefcase, Users, Target, Heart, GraduationCap, TrendingUp, Phone, Mail, MapPin, Clock, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";
import { useState } from "react";

const CareersPage = () => {
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Career application submitted:", applicationForm);
    // Handle form submission logic here
  };

  const openPositions = [
    {
      id: 1,
      title: "Frontend დეველოპერი",
      department: "IT განყოფილება",
      type: "სრული დატვირთვა",
      location: "თბილისი",
      experience: "2-4 წელი",
      salary: "₾2,500 - ₾4,000",
      description: "ვეძებთ გამოცდილ Frontend დეველოპერს React/TypeScript-ის ცოდნით",
      requirements: [
        "React.js და TypeScript-ის ღრმა ცოდნა",
        "Responsive დიზაინის გამოცდილება",
        "Git version control",
        "API integration გამოცდილება"
      ]
    },
    {
      id: 2,
      title: "მყიდველების მხარდაჭერის სპეციალისტი",
      department: "მხარდაჭერის განყოფილება",
      type: "სრული დატვირთვა",
      location: "თბილისი",
      experience: "1-2 წელი",
      salary: "₾1,200 - ₾1,800",
      description: "მომხმარებელთა მხარდაჭერის სფეროში გამოცდილი სპეციალისტი",
      requirements: [
        "ممتาز კომუნიკაციის უნარები",
        "მომხმარებელთა მომსახურების გამოცდილება",
        "ქართული და ინგლისური ენების ცოდნა",
        "კომპიუტერული უნარები"
      ]
    },
    {
      id: 3,
      title: "ლოგისტიკის კოორდინატორი",
      department: "ლოგისტიკა",
      type: "სრული დატვირთვა",
      location: "თბილისი",
      experience: "2-3 წელი",
      salary: "₾1,500 - ₾2,200",
      description: "მიწოდების პროცესების მართვა და კოორდინაცია",
      requirements: [
        "ლოგისტიკის სფეროში გამოცდილება",
        "ორგანიზაციული უნარები",
        "MS Office პაკეტის ცოდნა",
        "მრავალი პროექტის პარალელურად მართვის უნარი"
      ]
    },
    {
      id: 4,
      title: "მარკეტინგის სპეციალისტი",
      department: "მარკეტინგი",
      type: "სრული დატვირთვა",
      location: "თბილისი / დისტანციურად",
      experience: "1-3 წელი",
      salary: "₾1,800 - ₾2,800",
      description: "დიგიტალური მარკეტინგის კამპანიების დაგეგმვა და განხორციელება",
      requirements: [
        "დიგიტალური მარკეტინგის გამოცდილება",
        "Social Media Marketing",
        "Google Ads და Facebook Ads ცოდნა",
        "Analytics და კონტენტ მარკეტინგი"
      ]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "ჯანმრთელობის დაზღვევა",
      description: "სრული მედიცინური დაზღვევა ოჯახის წევრებისთვისაც"
    },
    {
      icon: GraduationCap,
      title: "პროფესიული განვითარება",
      description: "ტრენინგები, კონფერენციები და სერტიფიკაცია კომპანიის ხარჯზე"
    },
    {
      icon: TrendingUp,
      title: "კარიერული ზრდა",
      description: "გამჭვირვალე კარიერული სტრუქტურა და სწრაფი დაწინაურება"
    },
    {
      icon: Target,
      title: "ბონუსური სისტემა",
      description: "შედეგზე დაფუძნებული ბონუსები და წლიური პრემიები"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              კარიერა
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              შემოუერთდით ჩვენს დინამიურ გუნდს და იყავით ნაწილი საქართველოს წამყვანი 
              ონლაინ პლატფორმის განვითარებაში. ჩვენთან ერთად ააშენეთ თქვენი კარიერა.
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
              <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
              <p className="text-sm text-gray-600">გუნდის წევრი</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <p className="text-sm text-gray-600">განყოფილება</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-sm text-gray-600">თანამშრომელთა კმაყოფილება</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">6</div>
              <p className="text-sm text-gray-600">წელი ბაზარზე</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Why Work With Us */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                  რატომ ჩვენთან მუშაობა
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  შპს გამოიწერე არის ერთ-ერთი ყველაზე სწრაფად მზარდი ტექნოლოგიური კომპანია 
                  საქართველოში. ჩვენ ვქმნით ინოვაციურ გადაწყვეტილებებს ელექტრონული კომერციის 
                  სფეროში და ვანვითარებთ პლატფორმას, რომელიც ემსახურება ათასობით მომხმარებელს.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Open Positions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  ღია ვაკანსიები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {openPositions.map((position) => (
                  <div key={position.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{position.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{position.department}</Badge>
                          <Badge variant="outline">{position.type}</Badge>
                          <Badge variant="outline">{position.location}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{position.salary}</p>
                        <p className="text-sm text-gray-600">{position.experience}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{position.description}</p>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">მოთხოვნები:</h4>
                      <ul className="space-y-1">
                        {position.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full md:w-auto">
                      განაცხადის გაგზავნა
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Send className="h-6 w-6 text-green-600" />
                  სამუშაოზე განაცხადი
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
                        value={applicationForm.name}
                        onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
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
                        value={applicationForm.email}
                        onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ტელეფონის ნომერი *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+995 5XX XXX XXX"
                        value={applicationForm.phone}
                        onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        სასურველი პოზიცია *
                      </label>
                      <Select 
                        value={applicationForm.position} 
                        onValueChange={(value) => setApplicationForm({...applicationForm, position: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="აირჩიეთ პოზიცია" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend დეველოპერი</SelectItem>
                          <SelectItem value="support">მხარდაჭერის სპეციალისტი</SelectItem>
                          <SelectItem value="logistics">ლოგისტიკის კოორდინატორი</SelectItem>
                          <SelectItem value="marketing">მარკეტინგის სპეციალისტი</SelectItem>
                          <SelectItem value="other">სხვა პოზიცია</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      გამოცდილება *
                    </label>
                    <Select 
                      value={applicationForm.experience} 
                      onValueChange={(value) => setApplicationForm({...applicationForm, experience: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="აირჩიეთ გამოცდილების დონე" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 წელი)</SelectItem>
                        <SelectItem value="middle">Middle (2-5 წელი)</SelectItem>
                        <SelectItem value="senior">Senior (5+ წელი)</SelectItem>
                        <SelectItem value="lead">Lead/Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      მოტივაციური წერილი *
                    </label>
                    <Textarea
                      placeholder="მოგვიყევით თქვენს შესახებ, გამოცდილებაზე და რატომ გსურთ ჩვენთან მუშაობა..."
                      rows={6}
                      value={applicationForm.message}
                      onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>შენიშვნა:</strong> CV-ს და პორტფოლიოს (საჭიროების შემთხვევაში) 
                      გაგზავნა შეგიძლიათ ელ.ფოსტით careers@gamoiwere.ge მისამართზე.
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    განაცხადის გაგზავნა
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* HR Contact */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">HR განყოფილება</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">careers@gamoiwere.ge</p>
                    <p className="text-sm text-gray-600">კარიერის საკითხები</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">+995 599 123 459</p>
                    <p className="text-sm text-gray-600">HR ხაზი</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <a href="mailto:careers@gamoiwere.ge">
                      <Mail className="h-4 w-4 mr-2" />
                      CV-ს გაგზავნა
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="tel:+995599123459">
                      <Phone className="h-4 w-4 mr-2" />
                      HR-თან დაკავშირება
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MapPin className="h-5 w-5 text-red-600" />
                  ოფისის მისამართი
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">მთავარი ოფისი</p>
                  <p className="text-sm text-gray-600">
                    რუსთაველის გამზირი 42<br />
                    თბილისი 0108, საქართველო
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">ოფისის საათები</p>
                    <p className="text-sm text-gray-600">
                      ორშაბათი - პარასკევი: 09:00-18:00<br />
                      შაბათი: დახურულია<br />
                      კვირა: დახურულია
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Culture */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  კომპანიის კულტურა
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">მეგობრული და ღია გარემო</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">ნებაყოფლობითი ოვერტაიმები</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">პროფესიული განვითარების მხარდაჭერა</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">გუნდური აქტივობები</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">მისაღები გამოცდილების ადამიანები</span>
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
                  href="/about" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კომპანიის შესახებ
                </WouterLink>
                <WouterLink 
                  href="/contact" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონტაქტი
                </WouterLink>
                <WouterLink 
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობა
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">მზად ხართ ახალი გამოწვევისთვის?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              შემოუერთდით ჩვენს გუნდს და იყავით ნაწილი წარმატებული ისტორიისა. 
              ჩვენთან ერთად განავითარეთ თქვენი კარიერა და მიაღწიეთ ახალ შედეგებს.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="mailto:careers@gamoiwere.ge">
                  <Send className="h-5 w-5 mr-2" />
                  CV-ს გაგზავნა
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <a href="tel:+995599123459">
                  <Phone className="h-5 w-5 mr-2" />
                  HR-თან დაკავშირება
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;