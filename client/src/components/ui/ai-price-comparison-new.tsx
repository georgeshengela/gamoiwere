import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, CheckCircle, Sparkles, Target, BarChart3, Zap, Shield, Award } from 'lucide-react';
import { Badge } from './badge';

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
    if (score >= 85) return 'from-emerald-400 to-green-500';
    if (score >= 70) return 'from-green-400 to-blue-500';
    if (score >= 55) return 'from-blue-400 to-indigo-500';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    if (score >= 25) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
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
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI ღირებულების ანალიზი</h3>
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
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI ღირებულების ანალიზი</h3>
              <p className="text-sm text-red-500">ანალიზი ვერ განხორციელდა</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = getScore(analysis.priceRating);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 backdrop-blur-sm mb-6 overflow-hidden">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 sm:p-5 lg:p-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-lg font-bold text-white">AI ღირებულების ანალიზი</h3>
                <p className="text-xs sm:text-sm text-white/80">ინტელექტუალური ბაზრის შეფასება</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">AI ტექნოლოგია</span>
              <span className="sm:hidden">AI</span>
            </Badge>
          </div>

          {/* Main Score Display */}
          <div className="flex items-center justify-between">
            {/* Score Meter */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 251.33} 251.33`}
                      className="transition-all duration-2000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-white">
                        {score}
                      </div>
                      <div className="text-xs text-white/80">ქულა</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-white">
                <div className="text-base sm:text-lg lg:text-lg font-bold">
                  {getScoreLabel(score)}
                </div>
                <div className="text-xs sm:text-sm text-white/80">ღირებულება</div>
                <div className="flex items-center mt-1">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs">{(analysis.confidence * 100).toFixed(0)}% სიზუსტე</span>
                </div>
              </div>
            </div>

            {/* Savings Display */}
            <div className="text-right text-white">
              <div className="flex items-center justify-end space-x-1 mb-1">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xl sm:text-2xl lg:text-2xl font-bold">{analysis.savings}%</span>
              </div>
              <div className="text-xs sm:text-sm text-white/80">დაზოგვა</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-5 lg:p-4">
        {/* Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
            <div className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>{score}/100</div>
            <div className="text-xs text-slate-600">საერთო ქულა</div>
          </div>
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
            <div className="text-base sm:text-lg font-bold text-green-600">₾{(currentPrice * (analysis.savings / 100)).toFixed(2)}</div>
            <div className="text-xs text-slate-600">დაზოგილი</div>
          </div>
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center col-span-2 sm:col-span-1">
            <Badge className={`${getMarketPositionColor(analysis.marketPosition)} text-xs`}>
              <Award className="h-3 w-3 mr-1" />
              {analysis.marketPosition === 'excellent' ? 'შესანიშნავი' :
               analysis.marketPosition === 'good' ? 'კარგი' :
               analysis.marketPosition === 'average' ? 'საშუალო' :
               analysis.marketPosition === 'expensive' ? 'ძვირი' : 'ძალიან ძვირი'}
            </Badge>
            <div className="text-xs text-slate-600 mt-1">ბაზრის პოზიცია</div>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">ბაზრის საშუალო ფასი</span>
            <span className="text-xs sm:text-sm text-slate-600">₾{(currentPrice * (1 + analysis.savings / 100)).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-emerald-700">თქვენი ფასი</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs sm:text-sm font-bold text-emerald-700">₾{currentPrice.toFixed(2)}</span>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Key Insights - Mobile Optimized */}
        <div className="mb-3 sm:mb-4">
          <h4 className="font-bold text-slate-900 mb-2 sm:mb-3 flex items-center text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-600" />
            მთავარი ანალიზი
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {analysis.insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="flex items-start space-x-1.5 sm:space-x-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation - Mobile Optimized */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">AI რეკომენდაცია</h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPriceComparison;