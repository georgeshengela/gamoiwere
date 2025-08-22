import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, MapPin, Clock, ArrowLeft, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccessPage = () => {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const orderId = searchParams.get('order_id');
  const { user, isAuthenticated } = useAuth();

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/by-external-id/${orderId}`],
    enabled: !!orderId && isAuthenticated,
  }) as { data: any, isLoading: boolean, error: any };

  // Send SMS notification when order is loaded successfully
  const [smsAttempted, setSmsAttempted] = useState(false);
  const { mutate: sendSuccessSMS } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/send-success-sms/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.alreadySent) {
        console.log('SMS was already sent for this order');
      } else {
        console.log('Success SMS sent successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to send success SMS:', error);
    },
  });

  // Send SMS when order data is available and user is authenticated (only once)
  useEffect(() => {
    if (order && isAuthenticated && orderId && !smsAttempted) {
      setSmsAttempted(true);
      sendSuccessSMS();
    }
  }, [order, isAuthenticated, orderId, smsAttempted, sendSuccessSMS]);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">ავტორიზაცია საჭიროა</CardTitle>
            <CardDescription>
              შეკვეთის დეტალების სანახავად გთხოვთ გაიაროთ ავტორიზაცია
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} className="w-full">
              შესვლა
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">შეკვეთის მონაცემების ჩატვირთვა...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">შეკვეთა ვერ მოიძებნა</CardTitle>
            <CardDescription>
              მითითებული შეკვეთის ID-ით შეკვეთა ვერ მოიძებნა ან გადახდა ჯერ არ დასრულებულა
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              შეკვეთის ID: <span className="font-mono">{orderId}</span>
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                მთავარ გვერდზე დაბრუნება
              </Button>
              <Button onClick={() => navigate('/orders')}>
                ჩემი შეკვეთები
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'გადახდილი';
      case 'pending': return 'მუშავდება';
      case 'shipped': return 'გაგზავნილი';
      case 'delivered': return 'ჩაბარებული';
      case 'cancelled': return 'გაუქმებული';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12 pb-20">
        <div className="w-full space-y-6 sm:space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg animate-pulse">
              <CheckCircle className="w-8 h-8 sm:w-14 sm:h-14 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 bg-green-400 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent px-2">
              გადახდა წარმატებით დასრულდა!
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              თქვენი შეკვეთა მიღებულია და გადახდა დადასტურებულია. ჩვენ უკვე ვიწყებთ თქვენი შეკვეთის მომზადებას.
            </p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Information */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-800 dark:text-white text-base sm:text-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                შეკვეთის ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 sm:space-y-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">შეკვეთის ნომერი</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 break-all">{order.orderNumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 sm:space-y-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">სტატუსი</span>
                  <Badge 
                    className={`${getStatusColor(order.status)} text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm w-fit`}
                    variant="secondary"
                  >
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 sm:space-y-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">შეკვეთის თარიღი</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 sm:space-y-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">გადახდის მეთოდი</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">BOG ბარათით გადახდა</span>
                  </div>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">მოსალოდნელი მიწოდება</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatDate(order.estimatedDeliveryDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-800 dark:text-white text-base sm:text-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                მიწოდების ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">მიმღები</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{order.recipientName}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">ტელეფონი</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{order.recipientPhone}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">მისამართი</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {order.shippingAddress}
                    {order.shippingCity && `, ${order.shippingCity}`}
                    {order.shippingPostalCode && `, ${order.shippingPostalCode}`}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">მიწოდების ტიპი</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {order.deliveryMethod === 'AIR' && '✈️ ავიაფოსტა (14 დღე)'}
                    {order.deliveryMethod === 'GROUND' && '🚛 სახმელეთო ტრანსპორტი (30 დღე)'}
                    {order.deliveryMethod === 'SEA' && '🚢 საზღვაო ტრანსპორტი (45 დღე)'}
                    {!order.deliveryMethod && 'განსაზღვრული არ არის'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-800 dark:text-white text-base sm:text-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                გადახდის ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">გადახდის მეთოდი</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">💳 BOG ბანკი</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">გადახდის სტატუსი</span>
                  <p className="font-semibold text-green-600 dark:text-green-400">✅ წარმატებული</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">სულ თანხა</span>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatPrice(order.totalAmount)} ₾</p>
                </div>
                {order.shippingCost > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">მიწოდების ღირებულება</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{formatPrice(order.shippingCost)} ₾</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-800 dark:text-white text-base sm:text-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              შეკვეთილი პროდუქტები
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {order.items && order.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                  {item.imageUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{item.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 px-2 sm:px-3 py-1 rounded-full w-fit">
                        რაოდენობა: {item.quantity}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">{formatPrice(item.price)} ₾</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center py-1 sm:py-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">პროდუქტების ღირებულება</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{formatPrice(order.totalAmount - (order.shippingCost || 0))} ₾</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">მიწოდების ღირებულება</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{formatPrice(order.shippingCost)} ₾</span>
                  </div>
                )}
                <div className="border-t border-gray-300 dark:border-gray-600 my-2 sm:my-3"></div>
                <div className="flex justify-between items-center py-1 sm:py-2">
                  <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">სულ გადასახდელი</span>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{formatPrice(order.totalAmount)} ₾</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            მთავარ გვერდზე დაბრუნება
          </Button>
          <Button 
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            ჩემი შეკვეთები
          </Button>
        </div>
        
        {/* Success Animation */}
        <div className="flex justify-center pt-6 sm:pt-8">
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium px-4">
              მადლობა, რომ ირჩევთ GAMOIWERE.GE-ს!
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;