import { Truck, ShieldCheck, CreditCard, HeadphonesIcon } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: "უფასო მიწოდება",
      description: "100₾-ზე მეტი შენაძენზე",
      hoverDescription: "შეუკვეთეთ 100₾-ზე მეტი ღირებულების პროდუქცია და მიიღეთ უფასო მიწოდება მთელ საქართველოში"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "დაცული გადახდა",
      description: "100% უსაფრთხო გადახდა",
      hoverDescription: "თქვენი მონაცემები დაცულია უახლესი ტექნოლოგიებით, გადახდა სრულიად უსაფრთხოა"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "ნაწილ-ნაწილ გადახდა",
      description: "0%-იანი განვადება",
      hoverDescription: "ისარგებლეთ 0%-იანი განვადებით და გადაიხადეთ თანხა თქვენთვის სასურველ ვადაში"
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6 text-primary" />,
      title: "24/7 მხარდაჭერა",
      description: "მუდმივი კონსულტაცია",
      hoverDescription: "ჩვენი მხარდაჭერის გუნდი მზადაა დღე-ღამის ნებისმიერ დროს დაგეხმაროთ ნებისმიერ საკითხში"
    },
  ];

  return (
    <section className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm mb-12 overflow-hidden border border-gray-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-6 hover:bg-primary/5 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center mb-2">
                <div className="bg-primary/10 p-3 rounded-full mr-3 group-hover:bg-primary/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-600 ml-14">{feature.description}</p>
              
              {/* Hover information */}
              <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 flex items-center justify-center p-5 transition-opacity duration-300 pointer-events-none">
                <p className="text-sm text-center text-gray-700">{feature.hoverDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
