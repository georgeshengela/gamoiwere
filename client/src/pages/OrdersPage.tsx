import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { OrderStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePendingBalance } from "@/hooks/usePendingBalance";

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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Calendar,
  CreditCard
} from "lucide-react";

// Order status badge colors with clean design
const statusColors: Record<keyof typeof OrderStatus, string> = {
  PENDING: "bg-[#fffbeb] text-amber-700 hover:bg-[#fff7db] border-0 font-normal",
  PROCESSING: "bg-[#edf4ff] text-blue-700 hover:bg-[#e6f0ff] border-0 font-normal",
  PAID: "bg-[#edf7ed] text-green-700 hover:bg-[#e6f5e6] border-0 font-normal",
  SHIPPED: "bg-[#f3efff] text-[#5b38ed] hover:bg-[#ebe5ff] border-0 font-normal",
  DELIVERED: "bg-[#edf7ed] text-green-700 hover:bg-[#e6f5e6] border-0 font-normal",
  CANCELLED: "bg-[#fdeded] text-red-700 hover:bg-[#fce8e8] border-0 font-normal",
};

// Georgian translation for order statuses
const statusTranslations: Record<keyof typeof OrderStatus, string> = {
  PENDING: "მოლოდინში",
  PROCESSING: "მუშავდება",
  PAID: "გადახდილი",
  SHIPPED: "გზაშია",
  DELIVERED: "მიწოდებული",
  CANCELLED: "გაუქმებული",
};

interface Order {
  id: number;
  orderNumber: string;
  status: keyof typeof OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
}

const OrdersPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Pending balance data
  const { pendingBalance, pendingOrdersCount, hasPendingOrders } = usePendingBalance();
  
  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  
  // Fetch orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Filter by search query (order number or item names)
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Sort by created date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ჩემი შეკვეთები</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
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
            შეკვეთების სანახავად გაიარეთ ავტორიზაცია.{" "}
            <Link href="/login" className="underline font-medium">
              შესვლა
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ჩემი შეკვეთები</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>შეცდომა</AlertTitle>
          <AlertDescription>
            შეკვეთების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ჩემი შეკვეთები</h1>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedOrders.length > 0 
                ? `ნაჩვენებია ${paginatedOrders.length} შეკვეთა ${filteredAndSortedOrders.length}-დან`
                : "შეკვეთები არ მოიძებნა"
              }
            </p>
          </div>
          <Link href="/profile">
            <Button 
              variant="outline" 
              className="border-[#5b38ed] text-[#5b38ed] hover:bg-[#f8f7ff]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              უკან დაბრუნება
            </Button>
          </Link>
        </div>

        {/* Balance Summary */}
        {hasPendingOrders && (
          <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">გადასახდელი ბალანსი</h3>
                    <p className="text-sm text-red-600">
                      {pendingOrdersCount} გადაუხდელი შეკვეთა
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-700">
                    -{pendingBalance.toFixed(2)} ₾
                  </div>
                  <p className="text-xs text-red-600">გადასახდელი</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ძიება შეკვეთის ნომრის ან პროდუქტის სახელით..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#5b38ed] focus:ring-[#5b38ed]"
                />
              </div>
              
              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="border-gray-200 focus:border-[#5b38ed] focus:ring-[#5b38ed]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="სტატუსის ფილტრი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა სტატუსი</SelectItem>
                    {Object.entries(statusTranslations).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedOrders.length > 0 ? (
          <>
            {/* Orders List */}
            <div className="space-y-4 mb-8">
              {paginatedOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-[#5b38ed]" />
                            <span className="font-semibold text-gray-900">№ {order.orderNumber}</span>
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusTranslations[order.status]}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('ka-GE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>{order.items.length} ნივთი</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-semibold text-[#5b38ed]">
                              {(order.totalAmount / 100).toFixed(2)} ₾
                            </span>
                          </div>
                        </div>
                        
                        {/* Items Preview */}
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">ნივთები: </span>
                          <span>
                            {order.items.slice(0, 2).map(item => item.name).join(", ")}
                            {order.items.length > 2 && ` და კიდევ ${order.items.length - 2} ნივთი`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <Link href={`/orders/${order.id}`}>
                          <Button 
                            className="bg-[#5b38ed] hover:bg-[#7c60f1] w-full lg:w-auto"
                          >
                            დეტალების ნახვა
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  გვერდი {currentPage} {totalPages}-დან
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={
                            currentPage === pageNumber 
                              ? "bg-[#5b38ed] hover:bg-[#7c60f1]" 
                              : "border-gray-200"
                          }
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="border-gray-200"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-gray-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center p-12 border-0 shadow-sm bg-white/80 backdrop-blur">
            <div className="w-20 h-20 bg-gradient-to-br from-[#f8f7ff] to-[#edf4ff] rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-[#5b38ed]" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              {searchQuery || statusFilter !== "all" ? "შეკვეთები არ მოიძებნა" : "შეკვეთები არ გაქვთ"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" 
                ? "სცადეთ სხვა საძიებო პარამეტრები ან გაასუფთავეთ ფილტრები."
                : "დაიწყეთ შოპინგი და განათავსეთ თქვენი პირველი შეკვეთა ჩვენს პლატფორმაზე."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(searchQuery || statusFilter !== "all") ? (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="bg-[#5b38ed] hover:bg-[#7c60f1]"
                >
                  ფილტრების გასუფთავება
                </Button>
              ) : (
                <Link href="/products">
                  <Button className="bg-[#5b38ed] hover:bg-[#7c60f1]">
                    პროდუქტების დათვალიერება
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  className="border-[#5b38ed] text-[#5b38ed] hover:bg-[#f8f7ff]"
                >
                  უკან დაბრუნება
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;