import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, CheckCircle, Sparkles, Target, BarChart3, Award, Zap, Shield } from 'lucide-react';
import { Badge } from './badge';
import { Progress } from './progress';

interface PriceAnalysis {
  priceRating: number;
  marketPosition: 'excellent' | 'good' | 'average' | 'expensive' | 'overpriced';
  savings: number;
  confidence: number;
  insights: string[];
  recommendation: string;
}

interface AIPriceComparisonProps {
  productName: string;
  currentPrice: number;
  category?: string;
  description?: string;
}

const AIPriceComparison: React.FC<AIPriceComparisonProps> = ({
  productName,
  currentPrice,
  category,
  description
}) => {
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePrice = async () => {
      if (!productName || !currentPrice) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/analyze-product-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName,
            currentPrice,
            category,
            description
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze price');
        }

        const result = await response.json();
        setAnalysis(result);
      } catch (err) {
        setError('Failed to analyze product price');
        console.error('Price analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Delay analysis to avoid too many API calls
    const timer = setTimeout(analyzePrice, 500);
    return () => clearTimeout(timer);
  }, [productName, currentPrice, category, description]);

  // Convert 5-point rating to 100-point scale
  const getScore = (rating: number) => Math.round((rating / 5) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-green-600';
    if (score >= 55) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-500';
    if (score >= 70) return 'from-green-500 to-blue-500';
    if (score >= 55) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-amber-500 to-orange-500';
    if (score >= 25) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'შესანიშნავი';
    if (score >= 70) return 'ძალიან კარგი';
    if (score >= 55) return 'კარგი';
    if (score >= 40) return 'საშუალო';
    if (score >= 25) return 'ძვირი';
    return 'ძალიან ძვირი';
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'excellent': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'average': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'expensive': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'overpriced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-lg mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI ფასების ანალიზი</h3>
              <p className="text-sm text-slate-600">ვანალიზებთ ბაზრის ფასებს...</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-lg mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI ფასების ანალიზი</h3>
              <p className="text-sm text-red-500">ანალიზი ვერ განხორციელდა</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-4 lg:p-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 lg:mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg lg:text-base font-semibold text-slate-900">AI ფასების ანალიზი</h3>
            <p className="text-xs sm:text-sm lg:text-xs text-slate-600">ინტელექტუალური ბაზრის შედარება</p>
          </div>
          <div className="hidden sm:block">
            <Badge variant="secondary" className="bg-white/80 text-purple-700 lg:text-xs lg:px-2 lg:py-1">
              <Sparkles className="h-3 w-3 lg:h-2.5 lg:w-2.5 mr-1" />
              AI-დოზირებული
            </Badge>
          </div>
        </div>

        {/* Main Rating */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:justify-between lg:space-y-2 lg:flex-col lg:items-start">
          <div className="flex items-center justify-center space-x-6 sm:space-x-8 lg:space-x-4">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl lg:text-xl font-bold ${getRatingColor(analysis.priceRating)}`}>
                {analysis.priceRating.toFixed(1)}
              </div>
              {/* Modern Speedometer Gauge */}
              <div className="flex items-center justify-center mt-3 mb-1 lg:mt-2 lg:mb-0">
                <div className="relative w-20 h-12 sm:w-24 sm:h-14 lg:w-16 lg:h-10">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 120 70" fill="none">
                    {/* Outer ring */}
                    <path
                      d="M 15 55 A 45 45 0 0 1 105 55"
                      stroke="#f1f5f9"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    
                    {/* Main gauge track */}
                    <path
                      d="M 20 55 A 40 40 0 0 1 100 55"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                    />
                    
                    {/* Colored progress arc */}
                    <path
                      d="M 20 55 A 40 40 0 0 1 100 55"
                      stroke={`url(#speedometer-gradient-${analysis.priceRating})`}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(analysis.priceRating / 5) * 125.66} 125.66`}
                      className="transition-all duration-1500 ease-out"
                    />
                    
                    {/* Tick marks */}
                    <g stroke="#94a3b8" strokeWidth="2">
                      <line x1="20" y1="55" x2="18" y2="50" strokeLinecap="round" />
                      <line x1="60" y1="15" x2="60" y2="10" strokeLinecap="round" />
                      <line x1="100" y1="55" x2="102" y2="50" strokeLinecap="round" />
                    </g>
                    
                    {/* Center pivot point */}
                    <circle cx="60" cy="55" r="3" fill="#374151" />
                    
                    {/* Needle */}
                    <g transform={`rotate(${-90 + (analysis.priceRating / 5) * 180} 60 55)`} className="transition-transform duration-1500 ease-out">
                      <line 
                        x1="60" 
                        y1="55" 
                        x2="60" 
                        y2="25" 
                        stroke="#374151" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                      />
                      <polygon 
                        points="60,27 57,30 63,30" 
                        fill="#ef4444" 
                        className="drop-shadow-sm"
                      />
                    </g>
                    
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id={`speedometer-gradient-${analysis.priceRating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="20%" stopColor="#ea580c" />
                        <stop offset="40%" stopColor="#d97706" />
                        <stop offset="60%" stopColor="#ca8a04" />
                        <stop offset="80%" stopColor="#65a30d" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      <filter id="needle-shadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                  </svg>
                  
                  {/* Score labels */}
                  <div className="absolute inset-0 flex items-end justify-between text-xs text-slate-400 px-1">
                    <span>1</span>
                    <span className="transform translate-y-2">5</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">ღირებულების რეიტინგი</p>
            </div>
            
            <div className="h-10 sm:h-12 w-px bg-slate-200"></div>
            
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-lg font-bold text-green-600">
                {analysis.savings}%
              </div>
              <p className="text-xs text-slate-500 mt-1 lg:mt-0.5">დაზოგვა</p>
            </div>
          </div>

          <Badge className={`px-2 sm:px-3 lg:px-2 py-1 lg:py-0.5 text-xs sm:text-sm lg:text-xs ${getMarketPositionColor(analysis.marketPosition)} self-center sm:self-auto lg:self-start`}>
            <Award className="h-3 w-3 lg:h-2.5 lg:w-2.5 mr-1" />
            {getMarketPositionText(analysis.marketPosition)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-3">
        {/* Market Position Indicator */}
        <div className="mb-4 sm:mb-6 lg:mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm lg:text-xs mb-2 lg:mb-1">
            <span className="text-slate-600">ბაზრის პოზიცია</span>
            <span className="text-slate-900 font-medium">{(analysis.confidence * 100).toFixed(0)}% სიზუსტე</span>
          </div>
          <Progress 
            value={analysis.priceRating * 20} 
            className="h-1.5 sm:h-2 lg:h-1"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1 lg:mt-0.5">
            <span>ძვირი</span>
            <span>შესანიშნავი ღირებულება</span>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-4 sm:mb-6 lg:mb-3">
          <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 lg:mb-1.5 flex items-center text-sm sm:text-base lg:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 mr-1 sm:mr-2 lg:mr-1 text-blue-600" />
            მთავარი ანალიზი
          </h4>
          <div className="space-y-1.5 sm:space-y-2 lg:space-y-1">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-1.5 sm:space-x-2 lg:space-x-1.5">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-xs text-slate-700 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Comparison Visual */}
        <div className="mb-4 sm:mb-6 lg:mb-3 p-3 sm:p-4 lg:p-2.5 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2 lg:mb-1">
            <span className="text-xs sm:text-sm lg:text-xs font-medium text-slate-700">ბაზრის საშუალო ფასი</span>
            <span className="text-xs sm:text-sm lg:text-xs text-slate-600">₾{(currentPrice * (1 + analysis.savings / 100)).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm lg:text-xs font-medium text-green-700">თქვენი ფასი</span>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-1">
              <span className="text-xs sm:text-sm lg:text-xs font-bold text-green-700">₾{currentPrice.toFixed(2)}</span>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 text-green-600" />
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 lg:p-2.5">
          <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 mb-1 lg:mb-0.5 text-sm sm:text-base lg:text-sm">AI რეკომენდაცია</h5>
              <p className="text-xs sm:text-sm lg:text-xs text-slate-700 leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPriceComparison;