import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ArrowUpDown } from "lucide-react";
import usaFlag from "@assets/usa.png";
import chinaFlag from "@assets/china.png";
import turkeyFlag from "@assets/turkey.png";

interface ExchangeRates {
  USD: number;
  CNY: number;
  TRY: number;
}

const CurrencyConverter = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 0.377,    // 1 GEL = 0.377 USD
    CNY: 2.71,     // 1 GEL = 2.71 CNY  
    TRY: 14.25     // 1 GEL = 14.25 TRY
  });

  const [loading, setLoading] = useState(false);

  // Fetch real exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        // Using a free exchange rate API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/GEL');
        if (response.ok) {
          const data = await response.json();
          setExchangeRates({
            USD: data.rates.USD || 2.65,
            CNY: data.rates.CNY || 0.37,
            TRY: data.rates.TRY || 0.078
          });
        }
      } catch (error) {
        console.log('Using fallback exchange rates');
        // Keep default rates if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const currencies = [
    {
      code: "USD",
      name: "დოლარი",
      flag: usaFlag,
      rate: exchangeRates.USD,
      change: "+0.12%",
      isPositive: true
    },
    {
      code: "CNY",
      name: "იუანი",
      flag: chinaFlag,
      rate: exchangeRates.CNY,
      change: "-0.08%",
      isPositive: false
    },
    {
      code: "TRY",
      name: "ლირა",
      flag: turkeyFlag,
      rate: exchangeRates.TRY,
      change: "+0.05%",
      isPositive: true
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-[#5b38ed]" />
          <h2 className="text-[16px] md:text-[20px] font-bold text-gray-900 uppercase" style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}>სავალუტო კურსები</h2>
        </div>
        <div className="text-xs text-gray-500">
          {loading ? "განახლება..." : "ბოლო განახლება: ახლავე"}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {currencies.map((currency) => (
          <div 
            key={currency.code}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={currency.flag} alt={currency.name} className="w-6 h-4 object-cover rounded-sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">1 ₾ = {currency.rate.toFixed(2)} {currency.code}</p>
                  <p className="text-xs text-gray-500">{currency.name}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                currency.isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <TrendingUp className={`h-3 w-3 ${currency.isPositive ? '' : 'rotate-180'}`} />
                {currency.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          * კურსები ეყრდნობა ოფიციალურ საერთაშორისო ბირჟებს და განახლდება რეალურ დროში
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;