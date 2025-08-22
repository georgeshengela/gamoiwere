import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Mail,
  Phone,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Plane,
  Ship,
  Navigation,
  Weight,
  DollarSign
} from "lucide-react";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  deliveryMethod?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
}

export default function AdminOrderDetailPage() {
  const [, params] = useRoute("/admin/orders/:id");
  const orderId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    productWeight: "",
    transportationPrice: "",
    trackingNumber: "",
    deliveryStatus: "ORDERED",
    orderedAt: "",
    receivedChinaAt: "",
    sentTbilisiAt: "",
    deliveredTbilisiAt: "",
    notes: ""
  });

  // Fetch order details
  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      return response.json();
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false
  });

  // Fetch delivery tracking
  const { data: deliveryTracking, refetch: refetchDelivery } = useQuery({
    queryKey: ["/api/admin/orders", orderId, "delivery-tracking"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${orderId}/delivery-tracking`);
      if (!response.ok) {
        throw new Error("Failed to fetch delivery tracking");
      }
      return response.json();
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('სტატუსის შეცვლა ვერ მოხერხდა');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      refetch();
      toast({
        title: "სტატუსი განახლდა",
        description: "შეკვეთის სტატუსი წარმატებით შეიცვალა"
      });
      setStatusDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "სტატუსის შეცვლა ვერ მოხერხდა",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('შეკვეთის წაშლა ვერ მოხერხდა');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "შეკვეთა წაიშალა",
        description: "შეკვეთა წარმატებით წაიშალა"
      });
      // Redirect to orders list after successful deletion
      window.location.href = "/admin/orders";
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "შეკვეთის წაშლა ვერ მოხერხდა",
        variant: "destructive"
      });
    }
  });

  // Delivery tracking mutation
  const deliveryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/orders/${orderId}/delivery-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('მიწოდების ინფორმაციის შენახვა ვერ მოხერხდა');
      }
      return response.json();
    },
    onSuccess: () => {
      refetchDelivery();
      toast({
        title: "მიწოდების ინფორმაცია შენახულია",
        description: "მიწოდების დეტალები წარმატებით განახლდა"
      });
      setDeliveryDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "მიწოდების ინფორმაციის შენახვა ვერ მოხერხდა",
        variant: "destructive"
      });
    }
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "მოლოდინში", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", icon: Clock },
      PROCESSING: { label: "მუშავდება", className: "bg-blue-100 text-blue-800 hover:bg-blue-200", icon: RefreshCw },
      PAID: { label: "გადახდილი", className: "bg-green-100 text-green-800 hover:bg-green-200", icon: CheckCircle },
      SHIPPED: { label: "გზაშია", className: "bg-purple-100 text-purple-800 hover:bg-purple-200", icon: Truck },
      DELIVERED: { label: "ჩაბარებული", className: "bg-green-100 text-green-800 hover:bg-green-200", icon: CheckCircle },
      CANCELLED: { label: "გაუქმებული", className: "bg-red-100 text-red-800 hover:bg-red-200", icon: XCircle },
      REFUNDED: { label: "დაბრუნებული", className: "bg-gray-100 text-gray-800 hover:bg-gray-200", icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} border-0 font-medium flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Format date in Georgian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ];
    
    const day = date.getDate();
    const month = georgianMonths[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('ka-GE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${day} ${month}, ${year} - ${time}`;
  };

  // Handle status change
  const handleStatusChange = () => {
    if (newStatus) {
      statusMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-sm sm:text-base text-gray-600">იტვირთება...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center py-8 sm:py-12">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">შეკვეთა ვერ მოიძებნა</h3>
            <p className="text-sm sm:text-base text-gray-500">მითითებული შეკვეთა არ არსებობს</p>
            <Link to="/admin/orders">
              <Button className="mt-3 sm:mt-4 h-8 sm:h-9 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                უკან დაბრუნება
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Link to="/admin/orders">
            <Button variant="outline" size="sm" className="h-8 sm:h-9 w-fit">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">შეკვეთების სია</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              შეკვეთა #{order.orderNumber}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">დეტალური ინფორმაცია</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewStatus(order.status);
                  setStatusDialogOpen(true);
                }}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">სტატუსის შეცვლა</span>
                <span className="sm:hidden">სტატუსი</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>სტატუსის შეცვლა</DialogTitle>
                <DialogDescription>
                  შეკვეთა #{order.orderNumber} - ახალი სტატუსის არჩევა
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="სტატუსის არჩევა" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">მოლოდინში</SelectItem>
                    <SelectItem value="PROCESSING">მუშავდება</SelectItem>
                    <SelectItem value="PAID">გადახდილი</SelectItem>
                    <SelectItem value="SHIPPED">გზაშია</SelectItem>
                    <SelectItem value="DELIVERED">ჩაბარებული</SelectItem>
                    <SelectItem value="CANCELLED">გაუქმებული</SelectItem>
                    <SelectItem value="REFUNDED">დაბრუნებული</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setStatusDialogOpen(false)}
                >
                  გაუქმება
                </Button>
                <Button 
                  onClick={handleStatusChange}
                  disabled={statusMutation.isPending || !newStatus}
                >
                  {statusMutation.isPending ? "იცვლება..." : "შენახვა"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">წაშლა</span>
                <span className="sm:hidden">წაშლა</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>შეკვეთის წაშლა</AlertDialogTitle>
                <AlertDialogDescription>
                  ნამდვილად გსურთ შეკვეთა #{order.orderNumber} წაშლა? 
                  ეს მოქმედება შეუქცევადია და ყველა დაკავშირებული მონაცემი წაიშლება.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "იშლება..." : "წაშლა"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Order Status - Mobile Optimized */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                შეკვეთის სტატუსი
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {getStatusBadge(order.status)}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">ბოლო განახლება</p>
                    <p className="text-sm sm:text-base font-medium">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-600">სავარაუდო მიწოდება</p>
                    <p className="text-sm sm:text-base font-medium">{formatDate(order.estimatedDeliveryDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items - Mobile Optimized */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                შეკვეთილი ნივთები ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">პროდუქტის ID: {item.productId}</p>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right gap-2 sm:gap-0">
                      <div>
                        <p className="text-sm sm:text-base font-medium">{item.quantity} ცალი</p>
                        <p className="text-xs sm:text-sm text-gray-600">{(item.price / 100).toFixed(2)} ₾ თითო</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-green-600">
                          {((item.price * item.quantity) / 100).toFixed(2)} ₾
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>სულ თანხა:</span>
                  <span className="text-green-600">{(order.totalAmount / 100).toFixed(2)} ₾</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  მიწოდების ტრეკინგი
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    // Load existing data if available
                    if (deliveryTracking) {
                      setDeliveryData({
                        productWeight: deliveryTracking.product_weight || "",
                        transportationPrice: deliveryTracking.transportation_price ? (deliveryTracking.transportation_price / 100).toString() : "",
                        trackingNumber: deliveryTracking.tracking_number || "",
                        deliveryStatus: deliveryTracking.delivery_status || "ORDERED",
                        orderedAt: deliveryTracking.ordered_at ? new Date(deliveryTracking.ordered_at).toISOString().slice(0, 16) : "",
                        receivedChinaAt: deliveryTracking.received_china_at ? new Date(deliveryTracking.received_china_at).toISOString().slice(0, 16) : "",
                        sentTbilisiAt: deliveryTracking.sent_tbilisi_at ? new Date(deliveryTracking.sent_tbilisi_at).toISOString().slice(0, 16) : "",
                        deliveredTbilisiAt: deliveryTracking.delivered_tbilisi_at ? new Date(deliveryTracking.delivered_tbilisi_at).toISOString().slice(0, 16) : "",
                        notes: deliveryTracking.notes || ""
                      });
                    }
                    setDeliveryDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {deliveryTracking ? "რედაქტირება" : "დამატება"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliveryTracking ? (
                <div className="space-y-6">
                  {/* Status Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">მიწოდების სტატუსი</h4>
                    <div className="space-y-3">
                      {[
                        { status: "ORDERED", label: "პროდუქტი შეკვეთილია", icon: ShoppingBag, date: deliveryTracking.ordered_at },
                        { status: "RECEIVED_CHINA", label: "პროდუქტი მიღებულია ჩინეთში", icon: Package, date: deliveryTracking.received_china_at },
                        { status: "SENT_TBILISI", label: "პროდუქტი გაგზავნილია თბილისში", icon: Plane, date: deliveryTracking.sent_tbilisi_at },
                        { status: "DELIVERED_TBILISI", label: "პროდუქტი ჩაბარებულია თბილისში", icon: CheckCircle, date: deliveryTracking.delivered_tbilisi_at }
                      ].map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = step.date;
                        const isCurrent = deliveryTracking.delivery_status === step.status;
                        
                        return (
                          <div key={step.status} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : isCurrent 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCompleted ? 'text-green-900' : isCurrent ? 'text-blue-900' : 'text-gray-500'}`}>
                                {step.label}
                              </p>
                              {step.date && (
                                <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Weight and Price Info */}
                  <div className="grid grid-cols-2 gap-4">
                    {deliveryTracking.product_weight && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Weight className="h-4 w-4" />
                          პროდუქტის წონა
                        </p>
                        <p className="font-medium">{deliveryTracking.product_weight} კგ</p>
                      </div>
                    )}
                    {deliveryTracking.transportation_price && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ტრანსპორტირების ღირებულება
                        </p>
                        <p className="font-medium text-green-600">{(deliveryTracking.transportation_price / 100).toFixed(2)} ₾</p>
                      </div>
                    )}
                  </div>

                  {deliveryTracking.tracking_number && (
                    <div>
                      <p className="text-sm text-gray-600">ტრეკინგ კოდი</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{deliveryTracking.tracking_number}</p>
                    </div>
                  )}

                  {deliveryTracking.notes && (
                    <div>
                      <p className="text-sm text-gray-600">შენიშვნები</p>
                      <p className="text-sm text-gray-700">{deliveryTracking.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Navigation className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>მიწოდების ინფორმაცია არ არის დამატებული</p>
                  <p className="text-sm">დააწკაპუნეთ "დამატება" ღილაკზე</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>შენიშვნები</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Mobile Optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                მომხმარებლის ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">სახელი</p>
                <p className="text-sm sm:text-base font-medium">{order.username}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ელ. ფოსტა</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-base font-medium break-all">{order.userEmail}</p>
                </div>
              </div>
              {order.recipientPhone && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">ტელეფონი</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm sm:text-base font-medium">{order.recipientPhone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                მიწოდების ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              {order.recipientName && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">მიმღები</p>
                  <p className="text-sm sm:text-base font-medium">{order.recipientName}</p>
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm text-gray-600">მისამართი</p>
                <p className="text-sm sm:text-base font-medium break-words">{order.shippingAddress}</p>
              </div>
              {order.shippingCity && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">ქალაქი</p>
                  <p className="text-sm sm:text-base font-medium">{order.shippingCity}</p>
                </div>
              )}
              {order.shippingPostalCode && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">საფოსტო კოდი</p>
                  <p className="text-sm sm:text-base font-medium">{order.shippingPostalCode}</p>
                </div>
              )}
              {order.deliveryMethod && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">მიწოდების მეთოდი</p>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm sm:text-base font-medium">{order.deliveryMethod}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                გადახდის ინფორმაცია
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">გადახდის მეთოდი</p>
                <p className="text-sm sm:text-base font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">სულ თანხა</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{(order.totalAmount / 100).toFixed(2)} ₾</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Dates */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                თარიღები
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">შეკვეთის თარიღი</p>
                <p className="text-sm sm:text-base font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ბოლო განახლება</p>
                <p className="text-sm sm:text-base font-medium">{formatDate(order.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delivery Tracking Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              მიწოდების ტრეკინგის მართვა
            </DialogTitle>
            <DialogDescription>
              შეკვეთა #{order?.orderNumber} - მიწოდების დეტალების დამატება/რედაქტირება
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productWeight">პროდუქტის წონა (კგ)</Label>
                <Input
                  id="productWeight"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={deliveryData.productWeight}
                  onChange={(e) => setDeliveryData({...deliveryData, productWeight: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="transportationPrice">ტრანსპორტირების ღირებულება (₾)</Label>
                <Input
                  id="transportationPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={deliveryData.transportationPrice}
                  onChange={(e) => setDeliveryData({...deliveryData, transportationPrice: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="trackingNumber">ტრეკინგ კოდი</Label>
              <Input
                id="trackingNumber"
                placeholder="ტრეკინგ ნომერი"
                value={deliveryData.trackingNumber}
                onChange={(e) => setDeliveryData({...deliveryData, trackingNumber: e.target.value})}
                className="mt-1"
              />
            </div>

            {/* Delivery Status */}
            <div>
              <Label htmlFor="deliveryStatus">მიწოდების სტატუსი</Label>
              <Select value={deliveryData.deliveryStatus} onValueChange={(value) => setDeliveryData({...deliveryData, deliveryStatus: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="სტატუსის არჩევა" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDERED">პროდუქტი შეკვეთილია</SelectItem>
                  <SelectItem value="RECEIVED_CHINA">პროდუქტი მიღებულია ჩინეთში</SelectItem>
                  <SelectItem value="SENT_TBILISI">პროდუქტი გაგზავნილია თბილისში</SelectItem>
                  <SelectItem value="DELIVERED_TBILISI">პროდუქტი ჩაბარებულია თბილისში</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Dates */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">სტატუსების თარიღები</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderedAt">შეკვეთის თარიღი</Label>
                  <Input
                    id="orderedAt"
                    type="datetime-local"
                    value={deliveryData.orderedAt}
                    onChange={(e) => setDeliveryData({...deliveryData, orderedAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="receivedChinaAt">ჩინეთში მიღების თარიღი</Label>
                  <Input
                    id="receivedChinaAt"
                    type="datetime-local"
                    value={deliveryData.receivedChinaAt}
                    onChange={(e) => setDeliveryData({...deliveryData, receivedChinaAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sentTbilisiAt">თბილისში გაგზავნის თარიღი</Label>
                  <Input
                    id="sentTbilisiAt"
                    type="datetime-local"
                    value={deliveryData.sentTbilisiAt}
                    onChange={(e) => setDeliveryData({...deliveryData, sentTbilisiAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveredTbilisiAt">თბილისში ჩაბარების თარიღი</Label>
                  <Input
                    id="deliveredTbilisiAt"
                    type="datetime-local"
                    value={deliveryData.deliveredTbilisiAt}
                    onChange={(e) => setDeliveryData({...deliveryData, deliveredTbilisiAt: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">შენიშვნები</Label>
              <Textarea
                id="notes"
                placeholder="დამატებითი ინფორმაცია..."
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeliveryDialogOpen(false)}
              disabled={deliveryMutation.isPending}
            >
              გაუქმება
            </Button>
            <Button 
              onClick={() => {
                const data = {
                  ...deliveryData,
                  productWeight: deliveryData.productWeight ? parseFloat(deliveryData.productWeight) : null,
                  transportationPrice: deliveryData.transportationPrice ? Math.round(parseFloat(deliveryData.transportationPrice) * 100) : null,
                  orderedAt: deliveryData.orderedAt || null,
                  receivedChinaAt: deliveryData.receivedChinaAt || null,
                  sentTbilisiAt: deliveryData.sentTbilisiAt || null,
                  deliveredTbilisiAt: deliveryData.deliveredTbilisiAt || null
                };
                deliveryMutation.mutate(data);
              }}
              disabled={deliveryMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {deliveryMutation.isPending ? 'შენახვა...' : 'შენახვა'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}