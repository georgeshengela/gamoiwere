import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Package,
  User,
  CreditCard,
  Truck,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";

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
  items: any[];
  shippingAddress: string;
  paymentMethod: string;
  deliveryMethod?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const itemsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query params
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
    ...(searchQuery && { search: searchQuery }),
    ...(dateFilter && dateFilter !== "all" && { date: dateFilter })
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/admin/orders', currentPage, statusFilter, searchQuery, dateFilter],
    queryFn: () => fetch(`/api/admin/orders?${queryParams}`).then(res => res.json()),
  });

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
      toast({
        title: "წარმატება",
        description: "შეკვეთის სტატუსი წარმატებით განახლდა",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "სტატუსის განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "წარმატება",
        description: "შეკვეთა წარმატებით წაიშალა",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "შეკვეთის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = () => {
    if (selectedOrder && newStatus) {
      statusMutation.mutate({ orderId: selectedOrder.id, status: newStatus });
    }
  };

  const handleDelete = (orderId: number) => {
    deleteMutation.mutate(orderId);
  };

  const exportOrders = () => {
    const filteredOrders = orders;
    const csvContent = [
      ['შეკვეთის #', 'მომხმარებელი', 'ელ. ფოსტა', 'სტატუსი', 'თანხა', 'თარიღი'].join(','),
      ...filteredOrders.map((order: Order) => [
        order.orderNumber,
        order.username,
        order.userEmail,
        order.status,
        (order.totalAmount / 100).toFixed(2),
        formatDate(order.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'მოლოდინში', variant: 'outline' as const },
      PROCESSING: { label: 'მუშავდება', variant: 'default' as const },
      PAID: { label: 'გადახდილი', variant: 'secondary' as const },
      SHIPPED: { label: 'გზაშია', variant: 'default' as const },
      DELIVERED: { label: 'ჩაბარებული', variant: 'default' as const },
      CANCELLED: { label: 'გაუქმებული', variant: 'destructive' as const },
      REFUNDED: { label: 'დაბრუნებული', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, dateFilter]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">უკან</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">შეკვეთების მართვა</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={exportOrders} 
            variant="outline" 
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            ექსპორტი
          </Button>
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            ფილტრები
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">ძიება</label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="შეკვეთის # ან მომხმარებელი"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">სტატუსი</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="ყველა სტატუსი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა სტატუსი</SelectItem>
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

            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">თარიღი</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="ყველა თარიღი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა თარიღი</SelectItem>
                  <SelectItem value="today">დღეს</SelectItem>
                  <SelectItem value="yesterday">გუშინ</SelectItem>
                  <SelectItem value="last_7_days">ბოლო 7 დღე</SelectItem>
                  <SelectItem value="last_30_days">ბოლო 30 დღე</SelectItem>
                  <SelectItem value="last_90_days">ბოლო 90 დღე</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                  setDateFilter("all");
                  setCurrentPage(1);
                }}
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
              >
                გასუფთავება
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">მოლოდინში</p>
                <p className="text-lg sm:text-xl font-bold">
                  {orders.filter((o: Order) => o.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">მუშავდება</p>
                <p className="text-lg sm:text-xl font-bold">
                  {orders.filter((o: Order) => o.status === 'PROCESSING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ჩაბარებული</p>
                <p className="text-lg sm:text-xl font-bold">
                  {orders.filter((o: Order) => o.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">გადახდილი</p>
                <p className="text-lg sm:text-xl font-bold">
                  {orders.filter((o: Order) => o.status === 'PAID').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">გზაშია</p>
                <p className="text-lg sm:text-xl font-bold">
                  {orders.filter((o: Order) => o.status === 'SHIPPED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">სულ</p>
                <p className="text-lg sm:text-xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            შეკვეთების სია
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-sm sm:text-base text-gray-600">იტვირთება...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">შეკვეთები ვერ მოიძებნა</h3>
              <p className="text-sm sm:text-base text-gray-500">შეცვალეთ ძიების პარამეტრები ან ფილტრები</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="space-y-3 p-3">
                  {orders.map((order: Order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">#{order.orderNumber}</span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>მომხმარებელი: {order.username}</div>
                        <div>ელ. ფოსტა: {order.userEmail}</div>
                        <div>თანხა: ₾{(order.totalAmount / 100).toFixed(2)}</div>
                        <div>ნივთები: {order.items?.length || 0} ცალი</div>
                        <div>თარიღი: {formatDate(order.createdAt)}</div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            ნახვა
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setStatusDialogOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          სტატუსი
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">შეკვეთის #</TableHead>
                      <TableHead className="font-semibold">მომხმარებელი</TableHead>
                      <TableHead className="font-semibold">სტატუსი</TableHead>
                      <TableHead className="font-semibold">თანხა</TableHead>
                      <TableHead className="font-semibold">ნივთები</TableHead>
                      <TableHead className="font-semibold">თარიღი</TableHead>
                      <TableHead className="font-semibold text-center">მოქმედებები</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: Order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold text-blue-600">#{order.orderNumber}</span>
                            {order.deliveryMethod && (
                              <span className="text-xs text-gray-500">
                                მიწოდება: {order.deliveryMethod}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.username}</span>
                            <span className="text-sm text-gray-500">{order.userEmail}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {(order.totalAmount / 100).toFixed(2)} ₾
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{order.items?.length || 0}</span>
                            <span className="text-sm text-gray-500">ნივთი</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatDate(order.createdAt)}
                            </span>
                            {order.updatedAt !== order.createdAt && (
                              <span className="text-xs text-gray-500">
                                განახლდა: {formatDate(order.updatedAt)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link to={`/admin/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                ნახვა
                              </Button>
                            </Link>
                            
                            <Dialog open={statusDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                              setStatusDialogOpen(open);
                              if (!open) {
                                setSelectedOrder(null);
                                setNewStatus("");
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus(order.status);
                                    setStatusDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  სტატუსი
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
                                    onClick={() => {
                                      setStatusDialogOpen(false);
                                      setSelectedOrder(null);
                                      setNewStatus("");
                                    }}
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
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  წაშლა
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
                                    onClick={() => handleDelete(order.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? "იშლება..." : "წაშლა"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination - Mobile Optimized */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-6 px-3 sm:px-0">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            გვერდი {currentPage} / {totalPages} - სულ {totalOrders} შეკვეთა
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              წინა
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              შემდეგი
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}