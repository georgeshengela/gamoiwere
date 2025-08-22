import { LoginForm } from "@/components/ui/login-form";
import { ChevronLeft, ShoppingBag, Shield, User, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="text-gray-600 hover:text-primary flex items-center transition-colors">
              <ChevronLeft className="h-5 w-5 mr-1" />
              მთავარ გვერდზე დაბრუნება
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 py-8 md:py-16 gap-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
            <LoginForm />
          </div>
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">იყავით ჩვენი სივრცის ნაწილი</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">ერთი-ერთში შოპინგის გამოცდილება</h3>
                  <p className="text-gray-600 text-sm">აღმოაჩინეთ პროდუქციის ფართო არჩევანი და ისიამოვნეთ მარტივი შოპინგით</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">დაცული ტრანზაქციები</h3>
                  <p className="text-gray-600 text-sm">თქვენი გადახდები ყოველთვის დაცულია უახლესი უსაფრთხოების სტანდარტებით</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">პერსონალიზებული შეთავაზებები</h3>
                  <p className="text-gray-600 text-sm">მიიღეთ თქვენზე მორგებული შეთავაზებები და რეკომენდაციები</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">მრავალფეროვანი გადახდის მეთოდები</h3>
                  <p className="text-gray-600 text-sm">აირჩიეთ თქვენთვის სასურველი გადახდის მეთოდი და განახორციელეთ შეკვეთა მარტივად</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            <p>© 2025 გამოიწერე.გე - ყველა უფლება დაცულია</p>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <Link href="/terms" className="text-gray-500 hover:text-primary">წესები და პირობები</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-primary">კონფიდენციალურობა</Link>
              <Link href="/help" className="text-gray-500 hover:text-primary">დახმარება</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}