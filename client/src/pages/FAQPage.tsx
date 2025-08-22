import { HelpCircle, Search, ShoppingCart, Truck, CreditCard, RotateCcw, Shield, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link as WouterLink } from "wouter";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "შეკვეთა და ყიდვა",
      icon: ShoppingCart,
      color: "blue",
      questions: [
        {
          question: "როგორ შევკვეთო პროდუქტი?",
          answer: "პროდუქტის შეკვეთისთვის აირჩიეთ სასურველი ნივთი, დააჭირეთ 'კალათაში დამატება' ღილაკს, შემდეგ გადახვიდეთ კალათაზე და დაასრულეთ შეკვეთა. თქვენ შეგიძლიათ გადაიხადოთ ონლაინ ან მიწოდებისას."
        },
        {
          question: "შემიძლია თუ არა შეკვეთის გაუქმება?",
          answer: "კი, შეკვეთის გაუქმება შესაძლებელია მიწოდებამდე. დაგვიკავშირდით ტელეფონით +995 599 123 456 ან ელ.ფოსტით info@gamoiwere.ge"
        },
        {
          question: "რა ხდება თუ არასწორი პროდუქტი შევკვეთე?",
          answer: "თუ შეცდომით არასწორი პროდუქტი შეკვეთეთ, შეგიძლიათ შეკვეთა შეცვალოთ მიწოდებამდე. დაგვიკავშირდით მხარდაჭერის სამსახურს სწრაფი დახმარებისთვის."
        },
        {
          question: "შეკვეთის მინიმალური ოდენობა არსებობს?",
          answer: "არა, მინიმალური შეკვეთის ოდენობა არ არსებობს. თუმცა, უფასო მიწოდებისთვის შეკვეთის ღირებულება უნდა იყოს 100₾-ზე მეტი თბილისში და 150₾-ზე მეტი რეგიონებში."
        }
      ]
    },
    {
      category: "მიწოდება",
      icon: Truck,
      color: "green",
      questions: [
        {
          question: "რამდენ ხანში მივიღებ შეკვეთას?",
          answer: "თბილისში სტანდარტული მიწოდება 24 საათშია, რეგიონებში 2-3 დღე. ექსპრეს მიწოდება ხელმისაწვდომია თბილისში 3-6 საათში."
        },
        {
          question: "მიწოდების ღირებულება რამდენია?",
          answer: "თბილისში 5₾, რეგიონებში 8₾. უფასო მიწოდება: 100₾-ზე მეტი შეკვეთისას თბილისში, 150₾-ზე მეტი რეგიონებში."
        },
        {
          question: "შემიძლია თუ არა მაღაზიიდან აღება?",
          answer: "კი, უფასო აღება შესაძლებელია ჩვენი მაღაზიიდან რუსთაველის გამზირი 42-ზე. სამუშაო საათები: ორშ-პარ 09:00-19:00, შაბ 10:00-18:00, კვირა 12:00-17:00."
        },
        {
          question: "მივყვები შეკვეთას როგორ?",
          answer: "შეკვეთის თვალყურისდევნება შესაძლებელია თქვენს პროფილში ან SMS-ით მიღებული კოდით. ასევე მიიღებთ შეტყობინებებს შეკვეთის სტატუსის ცვლილებისას."
        }
      ]
    },
    {
      category: "გადახდა",
      icon: CreditCard,
      color: "purple",
      questions: [
        {
          question: "რა გადახდის მეთოდები არის ხელმისაწვდომი?",
          answer: "შეგიძლიათ გადაიხადოთ ბარათით (ვიზა, მასტერკარდი), ნაღდი ანგარიშსწორებით მიწოდებისას, ან ბანკის გადარიცხვით."
        },
        {
          question: "უსაფრთხოა თუ არა ონლაინ გადახდა?",
          answer: "კი, ჩვენ ვიყენებთ უსაფრთხო SSL დაცვას და PCI DSS სტანდარტებს. თქვენი ბარათის მონაცემები არ ინახება ჩვენს სერვერებზე."
        },
        {
          question: "შემიძლია თუ არა განვადებით ყიდვა?",
          answer: "კი, 500₾-ზე მეტი შეკვეთისთვის ხელმისაწვდომია განვადება 3, 6, 12 თვემდე. დეტალებისთვის დაგვიკავშირდით."
        },
        {
          question: "ინვოისი როგორ მივიღო?",
          answer: "ინვოისი ავტომატურად იგზავნება ელ.ფოსტზე შეკვეთის დადასტურების შემდეგ. ასევე შეგიძლიათ ნაღო ინვოისის მოთხოვნა."
        }
      ]
    },
    {
      category: "დაბრუნება და გაცვლა",
      icon: RotateCcw,
      color: "orange",
      questions: [
        {
          question: "შემიძლია თუ არა პროდუქტის დაბრუნება?",
          answer: "კი, პროდუქტის დაბრუნება შესაძლებელია 14 დღის განმავლობაში მიღებიდან. პროდუქტი უნდა იყოს გამოუყენებელი და ორიგინალ შეფუთვაში."
        },
        {
          question: "რა პროდუქტები არ ქვემდებარება დაბრუნებას?",
          answer: "პერსონალური ჰიგიენის პროდუქტები, სურსათი, ინდივიდუალურად შეკვეთილი ნივთები და დაზიანებული პროდუქტები."
        },
        {
          question: "რამდენ ხანში მივიღებ თანხას?",
          answer: "დაბრუნებული პროდუქტის მიღებიდან 3-5 სამუშაო დღეში მიიღებთ სრულ თანხას იმავე მეთოდით, რითიც გადაიხადეთ."
        },
        {
          question: "შემიძლია თუ არა პროდუქტის გაცვლა?",
          answer: "კი, პროდუქტის გაცვლა შესაძლებელია სხვა ზომაზე ან ფერზე იგივე პირობებით, რაც დაბრუნება. ღირებულების სხვაობა დამატებით გადაიხდება."
        }
      ]
    },
    {
      category: "გარანტია და სერვისი",
      icon: Shield,
      color: "red",
      questions: [
        {
          question: "რა გარანტია აქვს პროდუქტებს?",
          answer: "ყველა პროდუქტს აქვს მწარმოებლის ოფიციალური გარანტია. ელექტრონიკისთვის ჩვეულებრივ 1-2 წელი, სხვა პროდუქტებისთვის შესაბამისად."
        },
        {
          question: "სად შემიძლია გარანტიული სერვისის გავლა?",
          answer: "გარანტიული სერვისი ხელმისაწვდომია ჩვენს მაღაზიაში ან უფლებამოსილ სერვის ცენტრებში. დეტალებისთვის დაგვიკავშირდით."
        },
        {
          question: "რა მოხდება თუ პროდუქტი გაიტყდება?",
          answer: "გარანტიის ვადაში მყოფი პროდუქტები უფასოდ შეკეთდება ან შეიცვლება. გარანტიის გარეშე - ფასიანი რემონტი ან ახალი პროდუქტის შეძენა."
        }
      ]
    },
    {
      category: "ანგარიში და პროფილი",
      icon: HelpCircle,
      color: "indigo",
      questions: [
        {
          question: "როგორ შევქმნა ანგარიში?",
          answer: "დააჭირეთ 'რეგისტრაცია' ღილაკს, შეავსეთ ფორმა თქვენი ელ.ფოსტითა და მობილურის ნომრით. შემდეგ დაადასტურეთ SMS კოდი."
        },
        {
          question: "დავივიწყე პაროლი, რა ვქნა?",
          answer: "შესვლის გვერდზე დააჭირეთ 'პაროლის აღდგენა', შეიყვანეთ ელ.ფოსტა და მიყევით ინსტრუქციებს."
        },
        {
          question: "შემიძლია თუ არა ანგარიშის წაშლა?",
          answer: "კი, ანგარიშის წაშლა შესაძლებელია. დაგვიკავშირდით მხარდაჭერის სამსახურს და ჩვენ წავშლით თქვენს ანგარიშს ყველა მონაცემთან ერთად."
        }
      ]
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        searchQuery === "" ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600", 
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colors[color as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ხშირად დასმული კითხვები
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              იპოვეთ პასუხები ყველაზე ხშირად დასმულ კითხვებზე. თუ ვერ იპოვნით სასურველ ინფორმაციას, დაგვიკავშირდით.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ძიება კითხვებში..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {faqData.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`rounded-full p-3 w-fit mx-auto mb-3 ${getColorClasses(category.color)}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm">{category.category}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.questions.length} კითხვა</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Content */}
          <div className="lg:col-span-2">
            {filteredFAQ.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    კითხვა ვერ მოიძებნა
                  </h3>
                  <p className="text-gray-600">
                    სცადეთ სხვა საძიებო სიტყვები ან დაგვიკავშირდით მხარდაჭერის სამსახურს.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredFAQ.map((category, categoryIndex) => {
                  const IconComponent = category.icon;
                  return (
                    <Card key={categoryIndex} className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${getColorClasses(category.color)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="space-y-2">
                          {category.questions.map((faq, faqIndex) => (
                            <AccordionItem 
                              key={faqIndex} 
                              value={`${categoryIndex}-${faqIndex}`}
                              className="border border-gray-200 rounded-lg px-4"
                            >
                              <AccordionTrigger className="hover:no-underline py-4">
                                <span className="text-left font-medium">
                                  {faq.question}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="pb-4 text-gray-600 leading-relaxed">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">ვერ იპოვეთ პასუხი?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  ჩვენი მხარდაჭერის გუნდი მზადაა დაგეხმაროთ ნებისმიერ საკითხში.
                </p>
                
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

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <a href="tel:+995599123456">
                      <Phone className="h-4 w-4 mr-2" />
                      დარეკვა
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

            {/* Quick Links */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">სასარგებლო ბმულები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  href="/profile" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ჩემი შეკვეთები
                </WouterLink>
                <WouterLink 
                  href="/warranty" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  გარანტიის პირობები
                </WouterLink>
                <WouterLink 
                  href="/privacy-policy" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  კონფიდენციალურობა
                </WouterLink>
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
                    <strong>სამუშაო საათები:</strong><br />
                    ორშაბათი - პარასკევი: 09:00-19:00<br />
                    შაბათი: 10:00-18:00<br />
                    კვირა: 12:00-17:00
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;