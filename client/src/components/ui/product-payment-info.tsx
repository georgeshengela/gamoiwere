import { 
  CreditCard, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Info,
  CheckCircle2 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductPaymentInfoProps {
  price: number;
  hasInstallment?: boolean;
  minMonths?: number;
  maxMonths?: number;
}

const ProductPaymentInfo = ({ 
  price, 
  hasInstallment = true,
  minMonths = 3,
  maxMonths = 24
}: ProductPaymentInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(6);
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  const calculatedPrice = Math.ceil(price / selectedMonths);
  
  const months = Array.from(
    { length: maxMonths - minMonths + 1 }, 
    (_, i) => minMonths + i
  );
  
  if (!hasInstallment) {
    return <div className="mb-6">
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
        <CreditCard className="h-5 w-5 text-primary" />
        <span className="text-sm">ხელმისაწვდომია ბარათით გადახდა</span>
      </div>
    </div>;
  }
  
  return (
    <div className="mb-6">
      <div 
        className={cn(
          "border border-gray-100 rounded-lg transition-all overflow-hidden",
          expanded ? "shadow-sm" : ""
        )}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">განვადება 0%-იანი პირველი შენატანის გარეშე</span>
          </div>
          
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expanded && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">განვადების პერიოდი</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-xs">
                          შეარჩიეთ განვადების სასურველი ვადა. თვეების რაოდენობა გავლენას ახდენს ყოველთვიურ გადასახადზე.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="bg-primary text-white text-xs px-2 py-1 rounded">0% პირველი შენატანი</div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {months.map(month => (
                  <div 
                    key={month}
                    className={cn(
                      "border rounded-md px-2 py-1.5 text-center cursor-pointer transition-all text-sm",
                      selectedMonths === month 
                        ? "border-primary bg-primary/5 text-primary font-medium" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedMonths(month)}
                  >
                    {month} თვე
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 rounded-md">
                <span>ყოველთვიური გადასახადი:</span>
                <span className="text-lg font-bold">₾{calculatedPrice.toFixed(0)}</span>
              </div>
              
              <div className="text-sm text-gray-500 grid gap-1.5">
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>შესაძლებელია ხელმისაწვდომი იყოს სხვადასხვა ბანკის განვადება</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>შეკვეთის გაფორმებისას, ჩვენი ოპერატორი გაცნობებთ ყველა დეტალს</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPaymentInfo;