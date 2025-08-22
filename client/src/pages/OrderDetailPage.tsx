import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";

// UI components 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  ChevronLeft, 
  ClipboardCopy, 
  Copy, 
  Package,
  ShoppingCart,
  CheckCircle,
  Truck,
  Clock,
  RefreshCw,
  CreditCard,
  XCircle,
  Calculator,
  Calendar
} from "lucide-react";
import { ButtonLoader } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";

// Georgian translation for order statuses
const statusTranslations: Record<keyof typeof OrderStatus, string> = {
  PENDING: "მოლოდინში",
  PROCESSING: "მუშავდება",
  PAID: "გადახდილი",
  SHIPPED: "გზაშია",
  DELIVERED: "მიწოდებული",
  CANCELLED: "გაუქმებული",
};

// Order status badge colors with clean design
const statusColors: Record<keyof typeof OrderStatus, string> = {
  PENDING: "bg-[#fffbeb] text-amber-700 hover:bg-[#fff7db] border-0 font-normal",
  PROCESSING: "bg-[#edf4ff] text-blue-700 hover:bg-[#e6f0ff] border-0 font-normal",
  PAID: "bg-[#edf7ed] text-green-700 hover:bg-[#e6f5e6] border-0 font-normal",
  SHIPPED: "bg-[#f3efff] text-[#5b38ed] hover:bg-[#ebe5ff] border-0 font-normal",
  DELIVERED: "bg-[#edf7ed] text-green-700 hover:bg-[#e6f5e6] border-0 font-normal",
  CANCELLED: "bg-[#fdeded] text-red-700 hover:bg-[#fce8e8] border-0 font-normal",
};

// Delivery status translations
const deliveryStatusTranslations: Record<string, string> = {
  ORDERED: "შეკვეთილი",
  RECEIVED_CHINA: "მიღებული ჩინეთში",
  SENT_TBILISI: "გაგზავნილი თბილისში",
  DELIVERED_TBILISI: "მიწოდებული თბილისში",
};

// Delivery status colors
const deliveryStatusColors: Record<string, string> = {
  ORDERED: "bg-blue-50 text-blue-700 border-blue-200",
  RECEIVED_CHINA: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SENT_TBILISI: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED_TBILISI: "bg-green-50 text-green-700 border-green-200",
};

interface Order {
  id: number;
  orderNumber: string;
  status: keyof typeof OrderStatus;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string;
  contactPhone: string | null;
  contactEmail: string | null;
  shippingMethod: string;
  shippingCost: number;
  notes: string | null;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
}

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  transactionId: string | null;
  payerName: string | null;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
  } | null;
}

interface DeliveryTracking {
  id: number;
  order_id: number;
  delivery_status: string;
  tracking_number: string;
  product_weight: string;
  transportation_price: number;
  ordered_at: string | null;
  received_china_at: string | null;
  sent_tbilisi_at: string | null;
  delivered_tbilisi_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Payment form state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [useBalance, setUseBalance] = useState(false);

  // Fetch order
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: isAuthenticated && !!orderId,
    refetchOnWindowFocus: false,
  });

  // Fetch delivery tracking
  const {
    data: deliveryTracking,
    isLoading: trackingLoading,
  } = useQuery<DeliveryTracking[]>({
    queryKey: [`/api/user/delivery-tracking`],
    enabled: isAuthenticated && !!orderId,
    refetchOnWindowFocus: false,
  });


  
  // Balance payment mutation
  const balancePaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/payments/balance", {
        method: "POST",
        data: {
          orderId,
          amount: order?.totalAmount > (user?.balance || 0) ? (user?.balance || 0) : order?.totalAmount,
        },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "ბალანსით გადახდა წარმატებით შესრულდა",
        description: (user?.balance || 0) >= order.totalAmount 
          ? "თქვენი შეკვეთა სრულად დაფარულია" 
          : `დარჩენილი ${(order.totalAmount - (user?.balance || 0)).toFixed(2)}₾ გადასახდელია სხვა მეთოდით`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: error.message || "ბალანსით გადახდა ვერ მოხერხდა",
      });
    },
  });

  // BOG payment mutation
  const bogPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("შეკვეთა ვერ მოიძებნა");

      const bogPaymentData = {
        orderId: order.id,
        totalAmount: order.totalAmount,
        deliveryAddress: {
          name: order.recipientName || user?.full_name || "მომხმარებელი",
          phone: order.recipientPhone || user?.phone || "",
          address: order.shippingAddress,
          city: order.shippingCity,
          postalCode: order.shippingPostalCode || "",
        },
        userInfo: {
          name: user?.full_name || user?.username,
          email: user?.email,
          phone: order.recipientPhone || user?.phone,
        },
      };

      const response = await fetch("/api/bog-payment/create-order-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(bogPaymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "BOG გადახდის შექმნა ვერ მოხერხდა");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "გადამისამართება BOG გადახდაზე", 
        description: "გადამისამართდებით გადახდის გვერდზე",
      });

      // Open payment URL in same window for better mobile experience
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }


    },
    onError: (error: Error) => {
      toast({
        title: "BOG გადახდის შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle BOG payment button click
  const handleBOGPayment = () => {
    bogPaymentMutation.mutate();
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    
    toast({
      title: "დაკოპირებულია",
      description: "ინფორმაცია დაკოპირებულია გაცვლის ბუფერში",
    });
    
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Navigate back to orders list
  const handleBackClick = () => {
    navigate("/orders");
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="mr-2 h-4 w-4" />
            უკან დაბრუნება
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ავტორიზაცია საჭიროა</AlertTitle>
          <AlertDescription>
            შეკვეთის დეტალების სანახავად გაიარეთ ავტორიზაცია.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            უკან დაბრუნება
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>შეცდომა</AlertTitle>
          <AlertDescription>
            შეკვეთის ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        {/* Header with breadcrumb */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
              <span className="whitespace-nowrap">მთავარი</span>
              <span>/</span>
              <span className="whitespace-nowrap">პროფილი</span>
              <span>/</span>
              <span className="whitespace-nowrap">შეკვეთები</span>
              <span>/</span>
              <span className="text-primary font-medium whitespace-nowrap">შეკვეთა #{id}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 text-gray-600 hover:bg-gray-100 flex-shrink-0 w-full sm:w-auto"
              onClick={() => navigate("/orders")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              შეკვეთების სია
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3 md:space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6 lg:space-y-8">
            {/* Order header */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-white"></div>
                <div className="relative p-4 md:p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h1 className="md:text-3xl font-semibold text-[#000000] text-[22px]">
                            შეკვეთა #{order.orderNumber}
                          </h1>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end w-full lg:w-auto">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-6 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="text-amber-800 text-sm" style={{ fontWeight: 500 }}>
                            სტატუსი : {statusTranslations[order.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Tracking Section */}
            {deliveryTracking && deliveryTracking.length > 0 && deliveryTracking.filter(t => t.order_id === orderId).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">ამანათის გადაზიდვის ინფორმაცია</h2>
                      <p className="text-sm text-gray-600">შეკვეთის მიწოდების სტატუსი და დეტალები</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  {deliveryTracking.filter(t => t.order_id === orderId).map((tracking) => (
                    <div key={tracking.id} className="space-y-6">
                      {/* Tracking Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">ტრეკინგ ნომერი</p>
                              <p className="font-semibold text-blue-700">{tracking.tracking_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Calculator className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">წონა</p>
                              <p className="font-semibold text-purple-700">{tracking.product_weight} კგ</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">ტრანსპორტირების ღირებულება</p>
                              <p className="font-semibold text-green-700">{(tracking.transportation_price / 100).toFixed(2)} ₾</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="relative">
                        <div className="space-y-4">
                          {/* Ordered Status */}
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                tracking.ordered_at 
                                  ? 'bg-blue-100 border-blue-500 text-blue-600' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}>
                                {tracking.ordered_at ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              {(tracking.received_china_at || tracking.sent_tbilisi_at || tracking.delivered_tbilisi_at) && (
                                <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-yellow-300 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">შეკვეთილი</h3>
                                <Badge className={deliveryStatusColors['ORDERED']} variant="outline">
                                  {deliveryStatusTranslations['ORDERED']}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">შეკვეთა მიღებულია და მუშავდება</p>
                              {tracking.ordered_at && (
                                <p className="text-xs text-blue-600 font-medium">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(tracking.ordered_at).toLocaleDateString('ka-GE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })} {new Date(tracking.ordered_at).toLocaleTimeString('ka-GE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Received in China Status */}
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                tracking.received_china_at 
                                  ? 'bg-yellow-100 border-yellow-500 text-yellow-600' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}>
                                {tracking.received_china_at ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              {(tracking.sent_tbilisi_at || tracking.delivered_tbilisi_at) && (
                                <div className="w-0.5 h-8 bg-gradient-to-b from-yellow-300 to-purple-300 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">მიღებულია ჩინეთში</h3>
                                {tracking.received_china_at && (
                                  <Badge className={deliveryStatusColors['RECEIVED_CHINA']} variant="outline">
                                    {deliveryStatusTranslations['RECEIVED_CHINA']}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">პროდუქტი მიღებულია ჩინეთის საწყობში</p>
                              {tracking.received_china_at && (
                                <p className="text-xs text-yellow-600 font-medium">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(tracking.received_china_at).toLocaleDateString('ka-GE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })} {new Date(tracking.received_china_at).toLocaleTimeString('ka-GE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Sent to Tbilisi Status */}
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                tracking.sent_tbilisi_at 
                                  ? 'bg-purple-100 border-purple-500 text-purple-600' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}>
                                {tracking.sent_tbilisi_at ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              {tracking.delivered_tbilisi_at && (
                                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-300 to-green-300 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">გაგზავნილია თბილისში</h3>
                                {tracking.sent_tbilisi_at && (
                                  <Badge className={deliveryStatusColors['SENT_TBILISI']} variant="outline">
                                    {deliveryStatusTranslations['SENT_TBILISI']}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">პროდუქტი გზაშია თბილისისკენ</p>
                              {tracking.sent_tbilisi_at && (
                                <p className="text-xs text-purple-600 font-medium">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(tracking.sent_tbilisi_at).toLocaleDateString('ka-GE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })} {new Date(tracking.sent_tbilisi_at).toLocaleTimeString('ka-GE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Delivered to Tbilisi Status */}
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                tracking.delivered_tbilisi_at 
                                  ? 'bg-green-100 border-green-500 text-green-600' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}>
                                {tracking.delivered_tbilisi_at ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">მიწოდებულია თბილისში</h3>
                                {tracking.delivered_tbilisi_at && (
                                  <Badge className={deliveryStatusColors['DELIVERED_TBILISI']} variant="outline">
                                    {deliveryStatusTranslations['DELIVERED_TBILISI']}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">პროდუქტი მიწოდებულია თბილისის საწყობში</p>
                              {tracking.delivered_tbilisi_at && (
                                <p className="text-xs text-green-600 font-medium">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(tracking.delivered_tbilisi_at).toLocaleDateString('ka-GE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })} {new Date(tracking.delivered_tbilisi_at).toLocaleTimeString('ka-GE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      {tracking.notes && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                              <AlertCircle className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">დამატებითი ინფორმაცია</h4>
                              <p className="text-sm text-gray-600">{tracking.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order products */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">შეკვეთის პროდუქტები</h2>
                    <p className="text-sm text-gray-600">{order.items.length} პროდუქტი</p>
                  </div>
                </div>
              </div>
              
              {/* Mobile Product Cards */}
              <div className="block md:hidden p-4 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white bg-white flex-shrink-0 shadow-sm">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">პროდუქტი #{item.productId}</p>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600">რაოდენობა:</span>
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                {item.quantity}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">× {(item.price / 100).toFixed(2)} ₾</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity / 100).toFixed(2)} ₾</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[350px] font-semibold text-gray-700">პროდუქტი</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">რაოდენობა</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">ფასი</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">ჯამი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            {item.imageUrl && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">პროდუქტის ID: {item.productId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-gray-600">{(item.price / 100).toFixed(2)} ₾</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-blue-600">{(item.price * item.quantity / 100).toFixed(2)} ₾</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-white p-3 md:p-6 border-t border-gray-100">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center text-gray-600 text-sm md:text-base">
                      <span>ჯამური ღირებულება:</span>
                      <span className="font-medium">{order.totalAmount ? (order.totalAmount / 100).toFixed(2) : "0.00"} ₾</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 text-sm md:text-base">
                      <span>მიწოდების ღირებულება:</span>
                      <span className="font-medium">{order.shippingCost ? (order.shippingCost / 100).toFixed(2) : "0.00"} ₾</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-base md:text-lg font-semibold">
                      <span className="text-gray-900">სულ:</span>
                      <span className="text-blue-600">{(((order.totalAmount || 0) + (order.shippingCost || 0)) / 100).toFixed(2)} ₾</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* მიწოდების მისამართი */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">მიწოდების მისამართი</h2>
                    <p className="text-sm text-gray-600">მიწოდების დეტალები და ადგილი</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* მოდერნული და სიმეტრიული დიზაინი */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* მიღების ადგილი */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-blue-900">მიღების ადგილი</h4>
                        <p className="text-blue-700 text-sm">მიმღები და მისამართი</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <span className="text-blue-700 font-medium text-sm">მიმღები</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 ml-11">{order.recipientName || user?.full_name || "მომხმარებელი"}</p>
                        {(order.recipientPhone || user?.phone) && (
                          <p className="text-blue-600 font-medium ml-11 mt-1">{order.recipientPhone || user?.phone}</p>
                        )}
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <span className="text-blue-700 font-medium text-sm">მისამართი</span>
                        </div>
                        <div className="ml-11">
                          <p className="text-gray-900 font-semibold leading-relaxed">{order.shippingAddress}</p>
                          <p className="text-gray-700 mt-1">
                            {order.shippingCity}
                            {order.shippingPostalCode && `, ${order.shippingPostalCode}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* მიწოდების დეტალები */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-purple-900">მიწოდების დეტალები</h4>
                        <p className="text-purple-700 text-sm">ვადები და მეთოდი</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </div>
                          <span className="text-purple-700 font-medium text-sm">მიწოდების მეთოდი</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 ml-11">
                          {order.deliveryMethod === "AIR" && "საჰაერო გზავნილი (7-14 დღე)"}
                          {order.deliveryMethod === "GROUND" && "სახმელეთო გზავნილი (20-30 დღე)"}
                          {order.deliveryMethod === "SEA" && "საზღვაო გზავნილი (30-45 დღე)"}
                          {!order.deliveryMethod && "სტანდარტული მიწოდება"}
                        </p>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-purple-700 font-medium text-sm">სავარაუდო მიწოდება</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600 ml-11">
                          {(() => {
                            const georgianDays = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
                            const georgianMonths = [
                              'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
                              'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
                            ];
                            
                            let date;
                            if (order.estimatedDeliveryDate) {
                              date = new Date(order.estimatedDeliveryDate);
                            } else {
                              // Fallback calculation
                              date = new Date(order.createdAt);
                              let daysToAdd = 14;
                              if (order.deliveryMethod === "AIR") daysToAdd = 14;
                              else if (order.deliveryMethod === "GROUND") daysToAdd = 30;
                              else if (order.deliveryMethod === "SEA") daysToAdd = 45;
                              
                              date.setDate(date.getDate() + daysToAdd);
                            }
                            
                            const dayName = georgianDays[date.getDay()];
                            const day = date.getDate();
                            const month = georgianMonths[date.getMonth()];
                            return `${dayName}, ${day} ${month}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* შენიშვნები (თუ არსებობს) */}
                {order.notes && (
                  <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">შენიშვნები</h4>
                        <p className="text-gray-600 text-sm">დამატებითი ინფორმაცია</p>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                      <p className="text-gray-900 font-medium leading-relaxed">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* შეკვეთის სტატუსი და დამატებითი ინფორმაცია */}
            {order.status === "PROCESSING" && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-700">
                  გადახდის დადასტურების მოლოდინი
                </AlertTitle>
                <AlertDescription className="text-blue-600">
                  თქვენი გადახდა მოწმდება. ეს პროცესი შეიძლება გაგრძელდეს 24
                  საათამდე.
                </AlertDescription>
              </Alert>
            )}
            {/* Processing status */}
            {order.status === "PROCESSING" && (
              <Alert className="bg-[#f0f7ff] border-l-4 border-l-blue-500 border-r border-t border-b border-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <AlertTitle className="text-blue-700 font-bold">თქვენი შეკვეთა მუშავდება</AlertTitle>
                <AlertDescription className="text-blue-600">
                  თქვენი შეკვეთა დამუშავების პროცესშია. გთხოვთ, დაელოდოთ დასტურს ან განახლებას სტატუსის შესახებ.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Paid status */}
            {order.status === "PAID" && (
              <Alert className="bg-[#f0fff4] border-l-4 border-l-green-500 border-r border-t border-b border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <AlertTitle className="text-green-700 font-bold">
                  გადახდა დადასტურებულია
                </AlertTitle>
                <AlertDescription className="text-green-600">
                  თქვენი შეკვეთა მზადდება გასაგზავნად. ამანათის შესახებ ინფორმაციას მიიღებთ ელფოსტაზე.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Shipped status */}
            {order.status === "SHIPPED" && (
              <Alert className="bg-[#f3efff] border-l-4 border-l-[#5b38ed] border-r border-t border-b border-[#5b38ed]/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5b38ed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <AlertTitle className="text-[#5b38ed] font-bold">
                  შეკვეთა გაგზავნილია
                </AlertTitle>
                <AlertDescription className="text-[#5b38ed]/80">
                  თქვენი შეკვეთა გზაშია. ამანათის მიღების შემდეგ სტატუსი ავტომატურად განახლდება.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Delivered status */}
            {order.status === "DELIVERED" && (
              <Alert className="bg-[#f0fff4] border-l-4 border-l-green-500 border-r border-t border-b border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <AlertTitle className="text-green-700 font-bold">
                  შეკვეთა მიწოდებულია
                </AlertTitle>
                <AlertDescription className="text-green-600">
                  თქვენი შეკვეთა წარმატებით მიწოდებულია. მადლობა რომ სარგებლობთ ჩვენი სერვისით!
                </AlertDescription>
              </Alert>
            )}
            
            {/* Cancelled status */}
            {order.status === "CANCELLED" && (
              <Alert className="bg-[#fdeded] border-l-4 border-l-red-500 border-r border-t border-b border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <AlertTitle className="text-red-700 font-bold">
                  შეკვეთა გაუქმებულია
                </AlertTitle>
                <AlertDescription className="text-red-600">
                  ეს შეკვეთა გაუქმებულია. გთხოვთ, დაგვიკავშირდეთ დამატებითი ინფორმაციისთვის.
                </AlertDescription>
              </Alert>
            )}


          </div>

          {/* შეკვეთის შეჯამება - მარჯვენა მხარე */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">შეჯამება</h2>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* პროდუქტების სტატისტიკა - თანამედროვე დიზაინი */}
                <div className="mb-6">
                  {/* პროდუქტების რაოდენობა */}
                  <div className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">პროდუქტი</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">{order.items.length}</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600/10 rounded-full"></div>
                  </div>
                </div>

                {/* ღირებულების დეტალები - კომპაქტური */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">პროდუქტები</span>
                    <span className="font-semibold text-gray-900">
                      {(order.items
                        .reduce((sum, item) => sum + item.price * item.quantity, 0) / 100)
                        .toFixed(2)} ₾
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">მიწოდება</span>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {order.deliveryMethod === "AIR" && "ჰაერით"}
                        {order.deliveryMethod === "GROUND" && "მიწით"}
                        {order.deliveryMethod === "SEA" && "ზღვით"}
                        {!order.deliveryMethod && "სტანდარტული"}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {order.shippingCost ? (Number(order.shippingCost) / 100).toFixed(2) : "0.00"} ₾
                    </span>
                  </div>
                </div>

                {/* საერთო ჯამი */}
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">სულ</div>
                        <div className="text-xs text-gray-500">ყველაფერი</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-indigo-600">
                        {(Number(order.totalAmount) / 100).toFixed(2)} ₾
                      </div>
                      <div className="text-xs text-gray-500">
                        ≈ ${((Number(order.totalAmount) / 100) / 2.7).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* შეძენის თარიღი */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      შეძენის თარიღი
                    </span>
                    <span className="font-medium text-gray-900">
                      {order.createdAt ? (() => {
                        const date = new Date(order.createdAt);
                        const georgianMonths = [
                          'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
                          'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
                        ];
                        const day = date.getDate();
                        const month = georgianMonths[date.getMonth()];
                        const year = date.getFullYear();
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        return `${day} ${month}, ${year} - ${hours}:${minutes}`;
                      })() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* გადახდის ღილაკი */}
              {order.status === "PENDING" && (
                <div className="px-6 pb-6 space-y-4">
                    {/* ბალანსით გადახდის ოპცია */}
                    {user?.balance !== null && user?.balance !== undefined && user?.balance > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-700 font-medium">ბალანსით გადახდა</span>
                            <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                              {((user?.balance || 0) / 100).toFixed(2)} ₾
                            </span>
                          </div>
                          <Switch
                            checked={useBalance}
                            onCheckedChange={setUseBalance}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        
                        {useBalance && (
                          <div className="p-3 bg-white rounded border border-blue-200">
                            {(user?.balance || 0) >= order.totalAmount ? (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-700">ბალანსიდან ჩამოიჭრება:</span>
                                <span className="font-bold text-blue-800">{(order.totalAmount / 100).toFixed(2)} ₾</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-blue-700">ბალანსიდან:</span>
                                  <span className="font-bold text-blue-800">{((user?.balance || 0) / 100).toFixed(2)} ₾</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-red-500">დარჩენილი გადასახდელი:</span>
                                  <span className="font-bold text-red-600">{((order.totalAmount - (user?.balance || 0)) / 100).toFixed(2)} ₾</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {useBalance && (user?.balance || 0) >= order.totalAmount ? (
                      <Button 
                        onClick={() => balancePaymentMutation.mutate()}
                        disabled={balancePaymentMutation.isPending}
                        className="w-full py-6 text-base font-bold bg-blue-600 hover:bg-blue-700"
                      >
                        {balancePaymentMutation.isPending ? "მიმდინარეობს გადახდა..." : "ბალანსით გადახდა"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleBOGPayment}
                        disabled={bogPaymentMutation.isPending}
                        className="w-full py-6 text-base font-bold bg-purple-600 hover:bg-purple-700"
                      >
                        {bogPaymentMutation.isPending ? "მიმდინარეობს გადახდა..." : "BOG ბარათით გადახდა"}
                      </Button>
                    )}
                    
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      სისტემა მიიღებს თქვენს გადახდას 24 საათის განმავლობაში
                    </p>
                  </div>
                )}

                {/* ტრეკინგის ინფორმაცია */}
                {order.status === "SHIPPED" && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      ტრეკინგის ინფორმაცია
                    </h3>
                    <div className="mb-2 text-sm">
                      <span className="font-medium block text-muted-foreground">ტრეკინგის ნომერი:</span>
                      <div className="flex items-center mt-1">
                        <code className="bg-muted p-1.5 rounded text-sm flex-grow">RP71082023456</code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="ml-1"
                          onClick={() => copyToClipboard("RP71082023456", "tracking")}
                        >
                          {copiedField === "tracking" ? (
                            <ClipboardCopy className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-sm mt-2">
                      ამანათის მიდევნება
                    </Button>
                  </div>
                )}

                {/* დახმარების ბლოკი */}
              <div className="p-6 pt-4 border-t">
                <h3 className="font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  გჭირდებათ დახმარება?
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  დაგვიკავშირდით შეკვეთის ნომრით თუ გაქვთ კითხვები
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    ჩატი
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    დახმარება
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>შეკვეთა ვერ მოიძებნა</AlertTitle>
          <AlertDescription>
            შეკვეთა მითითებული ID-ით ვერ მოიძებნა. გთხოვთ, გადაამოწმოთ და სცადოთ
            თავიდან.
          </AlertDescription>
        </Alert>
      )}

      {/* განბაჟების ინფორმაცია - ფვერდის ბოლოში */}
      {order && (
        <div className="mt-8 bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-amber-800">მნიშვნელოვანი ინფორმაცია განბაჟების შესახებ</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p>300₾-ზე მეტი ღირებულების შემთხვევაში შესაძლებელია განბაჟების გადახდის საჭიროება (დაახლოებით 18%).</p>
                <p>განბაჟება იხდება მიღების დროს და დამოკიდებულია პროდუქტის კატეგორიაზე და საქართველოს საბაჟო კოდექსზე.</p>
                <p>ზუსტი ინფორმაციისთვის დაუკავშირდით საბაჟო სამსახურს: <span className="font-medium">*8080</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default OrderDetailPage;
