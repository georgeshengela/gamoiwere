import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  ShoppingCart, 
  Mail, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  Database,
  Server,
  Zap,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface SiteStatistics {
  users: {
    total: number;
    verified: number;
    unverified: number;
    admins: number;
    thisMonth: number;
    thisWeek: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    thisMonth: number;
    thisWeek: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  products: {
    total: number;
    favorites: number;
    mostFavorited: Array<{
      productId: string;
      productTitle: string;
      favoriteCount: number;
    }>;
  };
  communications: {
    emailsSent: number;
    smssSent: number;
    emailTemplates: number;
    recentEmails: number;
    recentSms: number;
  };
  translations: {
    total: number;
    cached: number;
    apiCalls: number;
    mostTranslated: Array<{
      originalText: string;
      translatedText: string;
      usageCount: number;
      productUrl?: string;
      productId?: string;
    }>;
    weeklyTranslated: Array<{
      originalText: string;
      translatedText: string;
      usageCount: number;
      productUrl?: string;
      productId?: string;
    }>;
    todayTranslated: Array<{
      originalText: string;
      translatedText: string;
      usageCount: number;
      productUrl?: string;
      productId?: string;
    }>;
  };
  system: {
    totalAddresses: number;
    activeAddresses: number;
    deliveryMethods: number;
    paymentMethods: number;
  };
}

export default function SiteStatisticsPage() {
  const { data: stats, isLoading, error } = useQuery<SiteStatistics>({
    queryKey: ["/api/admin/site-statistics"],
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ka-GE').format(num);
  };

  const formatCurrency = (amount: number) => {
    return `₾${(amount / 100).toFixed(2)}`;
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const renderTranslationTable = (translations: any[], title: string, usageLabel: string) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {translations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-3 font-medium text-sm">რანგი</th>
                  <th className="text-left p-3 font-medium text-sm">{usageLabel}</th>
                  <th className="text-left p-3 font-medium text-sm">ორიგინალური ტექსტი</th>
                  <th className="text-left p-3 font-medium text-sm">ქართული თარგმანი</th>
                  <th className="text-left p-3 font-medium text-sm">პროდუქტი</th>
                </tr>
              </thead>
              <tbody>
                {translations.map((translation, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{formatNumber(translation.usageCount)}</span>
                        <span className="text-xs text-muted-foreground">გამოყენება</span>
                      </div>
                    </td>
                    <td className="p-3 max-w-md">
                      <div className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {translation.originalText}
                      </div>
                    </td>
                    <td className="p-3 max-w-md">
                      <div className="text-sm text-gray-900 dark:text-gray-100 break-words font-medium">
                        {translation.translatedText}
                      </div>
                    </td>
                    <td className="p-3">
                      {translation.productUrl ? (
                        <Link to={`/product/${translation.productId}`}>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-xs font-medium">{translation.productId}</span>
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">პროდუქტი ვერ მოიძებნა</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>ამ პერიოდში ტრანსლაციები ვერ მოიძებნა</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">საიტის სტატისტიკა</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">საიტის სტატისტიკა</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">მონაცემების ჩატვირთვის შეცდომა</h3>
            <p className="text-gray-600">სტატისტიკების მიღება ვერ მოხერხდა</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            უკან
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">საიტის სტატისტიკა</h1>
        <Badge variant="secondary" className="ml-auto">
          <Activity className="h-3 w-3 mr-1" />
          ლაივ მონაცემები
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">მთლიანი მომხმარებლები</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(stats.users.thisWeek)} ამ კვირაში
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">მთლიანი შეკვეთები</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.orders.total)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(stats.orders.thisWeek)} ამ კვირაში
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">მთლიანი შემოსავალი</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.orders.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              საშუალო: {formatCurrency(stats.orders.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ტრანსლაციები</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.translations.total)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.translations.cached)} კეშირებული
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Translation Analysis - Full Width */}
      {stats.translations.mostTranslated.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              ტრანსლაციის ანალიზი - TOP 10 პოპულარული ტრანსლაციები
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-3 font-medium text-sm">რანგი</th>
                    <th className="text-left p-3 font-medium text-sm">გამოყენების რაოდენობა</th>
                    <th className="text-left p-3 font-medium text-sm">ორიგინალური ტექსტი</th>
                    <th className="text-left p-3 font-medium text-sm">ქართული თარგმანი</th>
                    <th className="text-left p-3 font-medium text-sm">პროდუქტი</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.translations.mostTranslated.map((translation, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lg">{formatNumber(translation.usageCount)}</span>
                          <span className="text-xs text-muted-foreground">გამოყენება</span>
                        </div>
                      </td>
                      <td className="p-3 max-w-md">
                        <div className="text-sm text-gray-700 dark:text-gray-300 break-words">
                          {translation.originalText}
                        </div>
                      </td>
                      <td className="p-3 max-w-md">
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words font-medium">
                          {translation.translatedText}
                        </div>
                      </td>
                      <td className="p-3">
                        {translation.productUrl ? (
                          <Link to={`/product/${translation.productId}`}>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-xs font-medium">{translation.productId}</span>
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">პროდუქტი ვერ მოიძებნა</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Translation Analysis */}
      {renderTranslationTable(
        stats.translations.weeklyTranslated, 
        "ტრანსლაციის ანალიზი - ბოლო 7 დღე", 
        "კვირეული გამოყენება"
      )}

      {/* Daily Translation Analysis */}
      {renderTranslationTable(
        stats.translations.todayTranslated, 
        "ტრანსლაციის ანალიზი - დღეს", 
        "დღეური გამოყენება"
      )}

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              მომხმარებლების ანალიზი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">ვერიფიცირებული</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(stats.users.verified)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getPercentage(stats.users.verified, stats.users.total)}%
                  </Badge>
                </div>
              </div>
              <Progress value={getPercentage(stats.users.verified, stats.users.total)} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">არავერიფიცირებული</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(stats.users.unverified)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getPercentage(stats.users.unverified, stats.users.total)}%
                  </Badge>
                </div>
              </div>
              <Progress value={getPercentage(stats.users.unverified, stats.users.total)} className="h-2" />
            </div>

            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">ადმინები</div>
                  <div className="font-medium">{formatNumber(stats.users.admins)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ამ თვეში</div>
                  <div className="font-medium">+{formatNumber(stats.users.thisMonth)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              შეკვეთების ანალიზი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">მომლოდინე</span>
                  <span className="font-medium text-orange-600">{formatNumber(stats.orders.pending)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">გადახდილი</span>
                  <span className="font-medium text-green-600">{formatNumber(stats.orders.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">გაგზავნილი</span>
                  <span className="font-medium text-blue-600">{formatNumber(stats.orders.shipped)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">მიტანილი</span>
                  <span className="font-medium text-purple-600">{formatNumber(stats.orders.delivered)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">გაუქმებული</span>
                  <span className="font-medium text-red-600">{formatNumber(stats.orders.cancelled)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">დაბრუნებული</span>
                  <span className="font-medium text-gray-600">{formatNumber(stats.orders.refunded)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ამ თვეში</span>
                  <span className="font-medium text-green-600">+{formatNumber(stats.orders.thisMonth)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              კომუნიკაციის ანალიზი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">გაგზავნილი ემეილები</span>
                </div>
                <span className="font-medium">{formatNumber(stats.communications.emailsSent)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm">გაგზავნილი SMS</span>
                </div>
                <span className="font-medium">{formatNumber(stats.communications.smssSent)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">ემეილის შაბლონები</span>
                </div>
                <span className="font-medium">{formatNumber(stats.communications.emailTemplates)}</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">ბოლო ემეილები</div>
                  <div className="font-medium">{formatNumber(stats.communications.recentEmails)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ბოლო SMS</div>
                  <div className="font-medium">{formatNumber(stats.communications.recentSms)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-pink-600" />
              პროდუქტების ანალიზი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">მთლიანი რჩეულები</span>
                <span className="font-medium">{formatNumber(stats.products.favorites)}</span>
              </div>
            </div>

            {stats.products.mostFavorited.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-3">ყველაზე პოპულარული</h4>
                <div className="space-y-2">
                  {stats.products.mostFavorited.slice(0, 3).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-xs truncate max-w-32">
                          {product.productTitle}
                        </span>
                      </div>
                      <span className="text-xs font-medium">
                        {formatNumber(product.favoriteCount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Translation Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              ტრანსლაციის რეზიუმე
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">API გამოძახებები</span>
                <span className="font-medium">{formatNumber(stats.translations.apiCalls)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">კეშირებული</span>
                  <span className="text-sm font-medium">{formatNumber(stats.translations.cached)}</span>
                </div>
                <Progress 
                  value={getPercentage(stats.translations.cached, stats.translations.total)} 
                  className="h-2" 
                />
              </div>
              
              <div className="pt-3 border-t">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">სრული ანალიზი ზემოთ</div>
                  <div className="text-xs text-muted-foreground">ცხრილის ფორმატით</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-gray-600" />
              სისტემის ანალიზი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground">მისამართები</div>
                  <div className="font-medium">{formatNumber(stats.system.totalAddresses)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">აქტიური მისამართები</div>
                  <div className="font-medium">{formatNumber(stats.system.activeAddresses)}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground">მიტანის მეთოდები</div>
                  <div className="font-medium">{formatNumber(stats.system.deliveryMethods)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">გადახდის მეთოდები</div>
                  <div className="font-medium">{formatNumber(stats.system.paymentMethods)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}