import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { usePendingBalance } from '@/hooks/usePendingBalance';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ProfileAddressTab } from '@/components/ProfileAddressTab';
import { useFavorites } from '@/hooks/useFavorites';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  User,
  ShoppingBag,
  HelpCircle,
  Heart,
  LogOut,
  Copy,
  Users,
  Check,
  Calendar,
  Package,
  Truck,
  ArrowDownCircle,
  Settings,
  Save,
  Lock,
  Mail,
  Phone,
  MapPin,
  Home,
  Edit,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Shield,
  MessageSquare,
  Navigation,
  Plane,
  CheckCircle,
  Weight,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';

// Add Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// Delivery Tracking Card Component for main dashboard
function DeliveryTrackingCardComponent() {
  const { user } = useAuth();

  // Fetch delivery tracking data for user's orders with auto-refresh
  const { data: deliveryTrackings, isLoading } = useQuery({
    queryKey: ['/api/user/delivery-tracking'],
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Fetch orders to get order numbers with auto-refresh
  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    staleTime: 0,
  });

  const getOrderNumber = (orderId: number) => {
    if (!Array.isArray(orders)) return `#${orderId}`;
    const order = orders.find((o: any) => o.id === orderId);
    return order ? `#${order.orderNumber}` : `#${orderId}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'შეკვეთილია';
      case 'RECEIVED_CHINA':
        return 'მიღებულია ჩინეთში';
      case 'SENT_TBILISI':
        return 'გაგზავნილია თბილისში';
      case 'DELIVERED_TBILISI':
        return 'ჩაბარებულია';
      default:
        return 'უცნობი სტატუსი';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'bg-blue-100 text-blue-700';
      case 'RECEIVED_CHINA':
        return 'bg-yellow-100 text-yellow-700';
      case 'SENT_TBILISI':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED_TBILISI':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const latestTracking =
    Array.isArray(deliveryTrackings) && deliveryTrackings.length > 0
      ? deliveryTrackings[0]
      : null;

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col h-64">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 py-4 px-5 border-b border-gray-100">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Navigation className="h-4 w-4 text-orange-600" />
          მიწოდების სტატუსი
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        ) : latestTracking ? (
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-bold text-orange-700">
                  {getOrderNumber(latestTracking.order_id)}
                </div>
                <p className="text-sm text-gray-500">უახლესი მიწოდება</p>
              </div>
              <Badge
                className={`${getStatusColor(
                  latestTracking.delivery_status
                )} border-0 font-normal`}
              >
                {getStatusText(latestTracking.delivery_status)}
              </Badge>
            </div>

            {latestTracking.tracking_number && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-xs text-gray-500">ტრეკინგ კოდი:</span>
                <p className="font-mono text-sm text-gray-700">
                  {latestTracking.tracking_number}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">
                მიწოდების ინფორმაცია არ მოიძებნა
              </p>
            </div>
          </div>
        )}

        <Button
          size="sm"
          className="w-full mt-auto bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            // Navigate to delivery tab - this will be handled by the parent component
            const deliveryTab = document.querySelector(
              '[data-tab="delivery"]'
            ) as HTMLElement;
            if (deliveryTab) deliveryTab.click();
          }}
        >
          <Navigation className="h-4 w-4 mr-2" />
          სრული ინფორმაცია
        </Button>
      </CardContent>
    </Card>
  );
}

// Delivery Tracking Tab Component
function DeliveryTrackingTab() {
  const { user } = useAuth();

  // Fetch delivery tracking data for user's orders
  const {
    data: deliveryTrackings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/user/delivery-tracking'],
    enabled: !!user,
  });

  // Fetch orders to get order numbers
  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  const getOrderNumber = (orderId: number) => {
    if (!Array.isArray(orders)) return `ORD-${orderId}`;
    const order = orders.find((o: any) => o.id === orderId);
    return order ? order.orderNumber : `ORD-${orderId}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return <ShoppingBag className="h-4 w-4" />;
      case 'RECEIVED_CHINA':
        return <Package className="h-4 w-4" />;
      case 'SENT_TBILISI':
        return <Plane className="h-4 w-4" />;
      case 'DELIVERED_TBILISI':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'პროდუქტი შეკვეთილია';
      case 'RECEIVED_CHINA':
        return 'პროდუქტი მიღებულია ჩინეთში';
      case 'SENT_TBILISI':
        return 'პროდუქტი გაგზავნილია თბილისში';
      case 'DELIVERED_TBILISI':
        return 'პროდუქტი ჩაბარებულია თბილისში';
      default:
        return 'უცნობი სტატუსი';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'bg-blue-100 text-blue-700';
      case 'RECEIVED_CHINA':
        return 'bg-yellow-100 text-yellow-700';
      case 'SENT_TBILISI':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED_TBILISI':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-[#5b38ed]" />
            მიწოდების სტატუსი
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b38ed]"></div>
          <span className="ml-3 text-gray-600">იტვირთება...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Navigation className="h-6 w-6 text-[#5b38ed]" />
          მიწოდების სტატუსი
        </h2>
      </div>

      {!deliveryTrackings ||
      !Array.isArray(deliveryTrackings) ||
      deliveryTrackings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center py-8">
            <Navigation className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              მიწოდების ინფორმაცია არ მოიძებნა
            </h3>
            <p className="text-gray-500">
              თქვენი შეკვეთებისთვის მიწოდების ინფორმაცია ჯერ არ არის დამატებული
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  შეკვეთის ID
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  სტატუსი
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  ტრეკინგ კოდი
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  წონა
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  ტრანსპორტ. ღირებულება
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  ბოლო განახლება
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryTrackings.map((tracking: any) => (
                <TableRow
                  key={tracking.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-[#5b38ed]">
                    #{tracking.order_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-full ${getStatusColor(
                          tracking.delivery_status
                        )}`}
                      >
                        {getStatusIcon(tracking.delivery_status)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {getStatusText(tracking.delivery_status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(tracking.updated_at)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tracking.tracking_number ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {tracking.tracking_number}
                      </code>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tracking.product_weight ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Weight className="h-3 w-3 text-gray-500" />
                        {tracking.product_weight} კგ
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tracking.transportation_price ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {(tracking.transportation_price / 100).toFixed(2)} ₾
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(tracking.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    unreadCount,
  } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;
  const [, setLocation] = useLocation();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delivery_update':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'order_status':
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'delivery_update':
        return 'მიწოდების განახლება';
      case 'order_status':
        return 'შეკვეთის სტატუსი';
      default:
        return 'შეტყობინება';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ka,
      });
    } catch {
      return 'ახლახა';
    }
  };

  const readCount = notifications.filter((n) => n.isRead).length;

  // Pagination calculations
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Reset to first page when notifications change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [notifications.length, currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">შეტყობინებები</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b38ed]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">შეტყობინებები</h2>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-700 px-3 py-1">
              {unreadCount} წაუკითხავი
            </Badge>
          )}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                ყველას წაკითხული
              </Button>
            )}
            {readCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearReadNotifications}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <MessageSquare className="w-4 h-4" />
                წაკითხულის გასუფთავება
              </Button>
            )}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              შეტყობინებები არ არის
            </h3>
            <p className="text-gray-500">თქვენ ჯერ არ გაქვთ შეტყობინებები</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 text-center">სტატუსი</TableHead>
                  <TableHead className="w-16">ტიპი</TableHead>
                  <TableHead>სათაური</TableHead>
                  <TableHead>შეტყობინება</TableHead>
                  <TableHead className="w-40">დრო / მოქმედება</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className={`
                      ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'} 
                      hover:bg-gray-50 transition-colors cursor-pointer
                    `}
                    onClick={() =>
                      !notification.isRead && markAsRead(notification.id)
                    }
                  >
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {notification.isRead ? (
                          <div className="relative">
                            <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border border-gray-300 flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-gray-500" />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            notification.isRead
                              ? 'text-gray-900'
                              : 'text-gray-900 font-semibold'
                          }`}
                        >
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTypeText(notification.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p
                        className={`text-sm ${
                          notification.isRead
                            ? 'text-gray-600'
                            : 'text-gray-800'
                        } line-clamp-2`}
                      >
                        {notification.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.orderId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/orders/${notification.orderId}`);
                            }}
                            className="text-xs px-2 py-1 h-6 w-fit bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            შეკვეთის ნახვა
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  {startIndex + 1}-{Math.min(endIndex, notifications.length)} of{' '}
                  {notifications.length} შეტყობინება
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  წინა
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  შემდეგი
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function ProfilePage() {
  // Authentication and user data
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Auto-refresh data when profile page loads or becomes visible
  useEffect(() => {
    console.log('ProfilePage - Current user data:', user);
    console.log('User balance:', user?.balance);
    console.log(
      'User pending transportation fees:',
      user?.pending_transportation_fees
    );

    // Force refresh all profile-related data
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    queryClient.invalidateQueries({
      queryKey: ['/api/user/delivery-tracking'],
    });
    queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
  }, [queryClient]);

  // Add visibility change listener to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Refresh all data when page becomes visible
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        queryClient.invalidateQueries({
          queryKey: ['/api/user/delivery-tracking'],
        });
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient, user]);

  // Favorites data
  const { favorites, removeFromFavorites, isRemovingFromFavorites } =
    useFavorites();

  // Pending balance data
  const { pendingBalance, pendingOrdersCount, hasPendingOrders } =
    usePendingBalance();

  // Fetch orders with automatic refresh
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale
  });

  // Fetch delivery tracking data with automatic refresh
  const { data: deliveryTrackings = [] } = useQuery({
    queryKey: ['/api/user/delivery-tracking'],
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Phone verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setUserForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'პროფილის განახლება ვერ მოხერხდა');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: 'პროფილი განახლებულია',
        description: 'თქვენი პროფილი წარმატებით განახლდა',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'შეცდომა',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'პაროლის შეცვლა ვერ მოხერხდა');
      }

      return response.json();
    },
    onSuccess: () => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: 'პაროლი შეცვლილია',
        description: 'თქვენი პაროლი წარმატებით შეიცვალა',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'შეცდომა',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/send-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OTP გაგზავნა ვერ მოხერხდა');
      }

      return response.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: 'კოდი გაგზავნილია',
        description: '4-ნიშნა კოდი გაგზავნილია თქვენს ნომერზე',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'შეცდომა',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/user/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'კოდის გადამოწმება ვერ მოხერხდა');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setShowVerificationModal(false);
      setVerificationCode('');
      setOtpSent(false);
      toast({
        title: 'ვერიფიკაცია წარმატებულია',
        description: 'თქვენი მობილური ნომერი ვერიფიცირებულია',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'შეცდომა',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle verification
  const handleVerification = () => {
    if (!user?.phone) {
      toast({
        title: 'შეცდომა',
        description: 'ჯერ დაამატეთ მობილური ნომერი',
        variant: 'destructive',
      });
      return;
    }
    setShowVerificationModal(true);
    if (!otpSent) {
      sendOtpMutation.mutate();
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 4) {
      toast({
        title: 'შეცდომა',
        description: 'კოდი უნდა იყოს 4 ციფრი',
        variant: 'destructive',
      });
      return;
    }
    verifyOtpMutation.mutate(verificationCode);
  };

  // Format balance code with dashes
  const formatBalanceCode = (code?: string | null) => {
    if (!code) return '000-000';
    return code.slice(0, 3) + '-' + code.slice(3);
  };

  // Copy balance code to clipboard
  const copyBalanceCode = () => {
    if (user?.balance_code) {
      navigator.clipboard.writeText(user.balance_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'დაკოპირებულია',
        description: 'ბალანსის კოდი დაკოპირდა გაცვლის ბუფერში',
      });
    }
  };

  // Handle form submission
  const handleSubmitUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(userForm);
  };

  // Handle password form submission
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'შეცდომა',
        description: 'პაროლები არ ემთხვევა ერთმანეთს',
        variant: 'destructive',
      });
      return;
    }

    updatePasswordMutation.mutate(passwordForm);
  };

  // Calculate effective balance (regular balance minus pending transportation fees and pending orders)
  const getEffectiveBalance = () => {
    const currentBalance = (user?.balance || 0) / 100;
    const pendingFees = (user?.pending_transportation_fees || 0) / 100;
    const pendingOrdersTotal = pendingBalance; // This includes all pending order costs
    // Subtract both pending transportation fees and pending order amounts
    return currentBalance - pendingFees - pendingOrdersTotal;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <p className="mt-4">იტვირთება...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                შესვლა საჭიროა
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                პროფილის სანახავად და თქვენი შეკვეთების მართვისთვის გაიარეთ
                ავტორიზაცია სისტემაში
              </p>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link to="/login" className="block">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <User className="w-5 h-5 mr-2" />
                    შესვლა
                  </Button>
                </Link>

                <Link to="/register" className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 font-medium py-3 px-8 rounded-lg transition-all duration-200"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    რეგისტრაცია
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    შეკვეთების მართვა
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    თვალყური ადევნეთ თქვენს შეკვეთებს და მიწოდების სტატუსს
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    რჩეული პროდუქტები
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    შეინახეთ და მართეთ თქვენი საყვარელი პროდუქტები
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    ბალანსის მართვა
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    შეავსეთ ბალანსი და გაუმჯობესეთ შოპინგის გამოცდილება
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* SEO H1 Heading */}
      <h1 className="sr-only">
        მომხმარებლის პროფილი - პირადი ინფორმაცია და პარამეტრები
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-4">
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="text-center bg-[#f8f7ff] border-b border-gray-100 pb-6">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-sm">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-[#5b38ed] text-white text-xl font-semibold">
                    {user.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-1 bg-white p-1 rounded-full border border-gray-200">
                  <Edit className="h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
              <CardTitle className="mt-2 text-gray-800">
                {user.username}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
              {user.phone && (
                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </p>
              )}
              <div className="mt-3 flex flex-col gap-2 items-center">
                <Badge className="bg-[#f1eeff] text-[#5b38ed] border-0 font-light px-3 py-1 text-xs">
                  {user.role === 'admin'
                    ? 'ადმინისტრატორი'
                    : user.role === 'moderator'
                    ? 'მოდერატორი'
                    : 'ძირითადი მომხმარებელი'}
                </Badge>
                <Badge
                  className={`${
                    user.verification_status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  } border-0 font-light px-3 py-1 text-xs flex items-center gap-1`}
                >
                  <Shield className="h-3 w-3" />
                  {user.verification_status === 'verified'
                    ? 'ვერიფიცირებული'
                    : 'არავერიფიცირებული'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <nav>
                <div className="py-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    მთავარი
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'settings'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    პარამეტრები
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'notifications'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    შეტყობინებები
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'addresses'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    მისამართები
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'favorites'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    რჩეულები
                  </button>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'delivery'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <Navigation className="h-5 w-5 mr-3" />
                    მიწოდების სტატუსი
                  </button>
                  <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full flex items-center px-6 py-3 text-sm border-l-4 transition-all ${
                      activeTab === 'help'
                        ? 'bg-[#f8f7ff] text-[#5b38ed] font-medium border-[#5b38ed]'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5 mr-3" />
                    დახმარება
                  </button>
                </div>
                <Separator className="my-2" />
                <div className="p-4">
                  <button
                    onClick={() => {
                      // Clear user data and redirect to home
                      localStorage.removeItem('userData');
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/';
                    }}
                    className="flex items-center text-red-500 hover:text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span className="text-sm">გასვლა</span>
                  </button>
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">პროფილი</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-[#f8f7ff] px-3 py-1.5 rounded-md">
                  <Calendar className="h-4 w-4 text-[#5b38ed]" />
                  <span>
                    {(() => {
                      const date = new Date();
                      const day = date.getDate();
                      const year = date.getFullYear();

                      // Georgian weekdays
                      const georgianWeekdays = [
                        'კვირა',
                        'ორშაბათი',
                        'სამშაბათი',
                        'ოთხშაბათი',
                        'ხუთშაბათი',
                        'პარასკევი',
                        'შაბათი',
                      ];

                      // Georgian months
                      const georgianMonths = [
                        'იანვარი',
                        'თებერვალი',
                        'მარტი',
                        'აპრილი',
                        'მაისი',
                        'ივნისი',
                        'ივლისი',
                        'აგვისტო',
                        'სექტემბერი',
                        'ოქტომბერი',
                        'ნოემბერი',
                        'დეკემბერი',
                      ];

                      const weekday = georgianWeekdays[date.getDay()];
                      const month = georgianMonths[date.getMonth()];

                      return `${weekday}, ${day} ${month}, ${year}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Verification Alert */}
              {user && user.verification_status !== 'verified' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">
                    მობილური ნომრის ვერიფიკაცია
                  </AlertTitle>
                  <AlertDescription className="text-orange-700">
                    შეკვეთების განთავსებისთვის საჭიროა მობილური ნომრის
                    ვერიფიკაცია.
                    <Button
                      onClick={handleVerification}
                      variant="outline"
                      size="sm"
                      className="ml-2 bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                      disabled={sendOtpMutation.isPending || !user.phone}
                    >
                      {sendOtpMutation.isPending ? (
                        <>
                          <MessageSquare className="h-3 w-3 mr-1 animate-pulse" />
                          გაგზავნა...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          ვერიფიკაცია
                        </>
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[170px]">
                {/* Balance Card */}
                <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">ბალანსი</h3>
                      </div>
                      {hasPendingOrders && (
                        <Badge variant="destructive" className="text-xs">
                          {pendingOrdersCount} გადაუხდელი
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div
                        className={`text-2xl font-bold ${
                          getEffectiveBalance() >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {getEffectiveBalance().toFixed(2)} ₾
                      </div>

                      {(user?.pending_transportation_fees || 0) > 0 && (
                        <p className="text-sm text-red-500">
                          აქედან მიწოდების ღირებულება: -
                          {(
                            (user?.pending_transportation_fees || 0) / 100
                          ).toFixed(2)}{' '}
                          ₾
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm text-gray-500">კოდი:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                          {formatBalanceCode(user.balance_code)}
                        </code>
                        <button
                          onClick={copyBalanceCode}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="კოდის კოპირება"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Orders Card */}
                <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-gray-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">შეკვეთები</h3>
                      </div>
                      {Array.isArray(orders) && orders.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {
                            orders.filter(
                              (o: any) =>
                                o.status === 'PENDING' ||
                                o.status === 'PROCESSING'
                            ).length
                          }{' '}
                          აქტიური
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {Array.isArray(orders) ? orders.length : 0}
                      </div>
                      <p className="text-sm text-gray-500">სულ შეკვეთები</p>

                      {Array.isArray(orders) && orders.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {
                            orders.filter((o: any) => o.status === 'DELIVERED')
                              .length
                          }{' '}
                          დასრულებული
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Tracking Card */}
                <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Navigation className="h-4 w-4 text-gray-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          მიწოდების სტატუსი
                        </h3>
                      </div>
                      {Array.isArray(deliveryTrackings) &&
                        deliveryTrackings.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {deliveryTrackings.length} აქტიური
                          </Badge>
                        )}
                    </div>

                    <div className="flex-1">
                      {Array.isArray(deliveryTrackings) &&
                      deliveryTrackings.length > 0 ? (
                        (() => {
                          const latestTracking = deliveryTrackings[0];
                          const getOrderNumber = (orderId: number) => {
                            if (!Array.isArray(orders)) return `#${orderId}`;
                            const order = orders.find(
                              (o: any) => o.id === orderId
                            );
                            return order ? order.orderNumber : `ORD-${orderId}`;
                          };

                          const getStatusText = (status: string) => {
                            switch (status) {
                              case 'ORDERED':
                                return 'შეკვეთილია';
                              case 'RECEIVED_CHINA':
                                return 'მიღებულია ჩინეთში';
                              case 'SENT_TBILISI':
                                return 'გაგზავნილია თბილისში';
                              case 'DELIVERED_TBILISI':
                                return 'ჩაბარებულია';
                              default:
                                return 'უცნობი სტატუსი';
                            }
                          };

                          return (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-gray-900">
                                #{getOrderNumber(latestTracking.order_id)}
                              </div>
                              <p className="text-sm text-gray-500">
                                უახლესი მიწოდება
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {getStatusText(latestTracking.delivery_status)}
                              </Badge>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="space-y-2 text-center py-4">
                          <Navigation className="h-8 w-8 mx-auto text-gray-300" />
                          <div className="text-sm text-gray-500">
                            აქტიური მიწოდებები არ არის
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                    <Package className="h-5 w-5 text-[#5b38ed]" />
                    ბოლო შეკვეთები
                  </h3>
                  {Array.isArray(orders) && orders.length > 3 && (
                    <Link to="/orders">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#5b38ed] hover:bg-[#f8f7ff]"
                      >
                        ყველა შეკვეთა
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>

                {Array.isArray(orders) && orders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {orders
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 3)
                      .map((order: any) => (
                        <Card
                          key={order.id}
                          className="w-full overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col divide-y divide-gray-100">
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-[#f8f7ff] p-2 rounded-full">
                                    <ShoppingBag className="h-5 w-5 text-[#5b38ed]" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      შეკვეთა #{order.orderNumber}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        order.createdAt
                                      ).toLocaleDateString('ka-GE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={`font-normal ${
                                    order.status === 'COMPLETED' ||
                                    order.status === 'DELIVERED'
                                      ? 'bg-[#edf7ed] text-green-700 hover:bg-[#e6f5e6] border-0'
                                      : order.status === 'CANCELLED'
                                      ? 'bg-[#fdeded] text-red-700 hover:bg-[#fce8e8] border-0'
                                      : order.status === 'SHIPPED'
                                      ? 'bg-[#edf4ff] text-blue-700 hover:bg-[#e6f0ff] border-0'
                                      : 'bg-[#fffbeb] text-amber-700 hover:bg-[#fff7db] border-0'
                                  }`}
                                >
                                  {order.status === 'COMPLETED' ||
                                  order.status === 'DELIVERED'
                                    ? 'დასრულებული'
                                    : order.status === 'CANCELLED'
                                    ? 'გაუქმებული'
                                    : order.status === 'SHIPPED'
                                    ? 'გზაშია'
                                    : order.status === 'PROCESSING'
                                    ? 'მუშავდება'
                                    : 'მოლოდინში'}
                                </Badge>
                              </div>

                              <div className="px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 bg-gray-50">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    ნივთები
                                  </p>
                                  <p className="font-medium text-sm">
                                    {order.items
                                      ? order.items.length
                                      : order.itemCount}{' '}
                                    ერთეული
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">ჯამი</p>
                                  <p className="font-medium text-sm">
                                    {(order.totalAmount / 100).toFixed(2)} ₾
                                  </p>
                                </div>
                                <div className="ml-auto">
                                  <Link to={`/orders/${order.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-[#5b38ed] hover:bg-[#f8f7ff] -mr-2 -my-1"
                                    >
                                      დეტალები
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card className="text-center p-8 border border-gray-200 bg-white">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      შეკვეთები არ გაქვთ
                    </h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      დაიწყეთ შოპინგი თქვენი პირველი შეკვეთისთვის ჩვენს
                      პლატფორმაზე
                    </p>
                    <Link to="/products">
                      <Button className="mt-5 bg-[#5b38ed] hover:bg-[#7c60f1]">
                        პროდუქტების დათვალიერება
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                    <Truck className="h-5 w-5 text-[#5b38ed]" />
                    მიწოდების სტატუსი
                  </h3>
                </div>

                {Array.isArray(deliveryTrackings) &&
                deliveryTrackings.length > 0 ? (
                  <div className="space-y-4">
                    {deliveryTrackings.map((tracking: any) => {
                      const getOrderNumber = (orderId: number) => {
                        if (!Array.isArray(orders)) return `ORD-${orderId}`;
                        const order = orders.find((o: any) => o.id === orderId);
                        return order ? order.orderNumber : `ORD-${orderId}`;
                      };

                      const getStatusText = (status: string) => {
                        switch (status) {
                          case 'ORDERED':
                            return 'შეკვეთილია';
                          case 'RECEIVED_CHINA':
                            return 'მიღებულია ჩინეთში';
                          case 'SENT_TBILISI':
                            return 'გაგზავნილია თბილისში';
                          case 'DELIVERED_TBILISI':
                            return 'ჩაბარებულია';
                          default:
                            return 'უცნობი სტატუსი';
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'ORDERED':
                            return 'bg-blue-50 text-blue-700 border border-blue-200';
                          case 'RECEIVED_CHINA':
                            return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
                          case 'SENT_TBILISI':
                            return 'bg-purple-50 text-purple-700 border border-purple-200';
                          case 'DELIVERED_TBILISI':
                            return 'bg-green-50 text-green-700 border border-green-200';
                          default:
                            return 'bg-gray-50 text-gray-700 border border-gray-200';
                        }
                      };

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'ORDERED':
                            return '📦';
                          case 'RECEIVED_CHINA':
                            return '🏭';
                          case 'SENT_TBILISI':
                            return '✈️';
                          case 'DELIVERED_TBILISI':
                            return '✅';
                          default:
                            return '📋';
                        }
                      };

                      return (
                        <Card
                          key={tracking.id}
                          className="border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                              {/* Status Icon */}
                              <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-lg">
                                  {getStatusIcon(tracking.delivery_status)}
                                </span>
                              </div>

                              {/* Main Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 truncate">
                                    შეკვეთა #{getOrderNumber(tracking.order_id)}
                                  </h4>
                                  <Badge
                                    className={`${getStatusColor(
                                      tracking.delivery_status
                                    )} font-medium px-2 py-1 text-xs rounded-full shrink-0 ml-2`}
                                  >
                                    {getStatusText(tracking.delivery_status)}
                                  </Badge>
                                </div>

                                {/* Tracking Code */}
                                {tracking.tracking_number && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs text-gray-500">
                                      ტრეკინგ:
                                    </span>
                                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                      {tracking.tracking_number}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          tracking.tracking_number
                                        );
                                        toast({
                                          title: 'კოპირებულია',
                                          description:
                                            'ტრეკინგ კოდი კოპირებულია',
                                        });
                                      }}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}

                                {/* Weight and Price Info */}
                                <div className="flex items-center gap-4 text-sm">
                                  {tracking.product_weight && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                                        <Package className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <span className="text-gray-600">
                                        {tracking.product_weight} კგ
                                      </span>
                                    </div>
                                  )}
                                  {tracking.transportation_price && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
                                        <Truck className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-gray-600">
                                        {(
                                          tracking.transportation_price / 100
                                        ).toFixed(2)}
                                        ₾
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 shrink-0"
                                onClick={() => setActiveTab('delivery')}
                              >
                                <Navigation className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border border-gray-100 hover:border-gray-200 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                          <Truck className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            აქტიური მიწოდებები არ არის
                          </h4>
                          <p className="text-sm text-gray-500">
                            შეკვეთის განთავსების შემდეგ შეგიძლიათ თვალი ადევნოთ
                            მიწოდებას
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 shrink-0"
                          onClick={() => setActiveTab('delivery')}
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">პარამეტრები</h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">პროფილის ინფორმაცია</h3>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      რედაქტირება
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitUserForm}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">სრული სახელი</Label>
                          <Input
                            id="full_name"
                            value={userForm.full_name}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                full_name: e.target.value,
                              })
                            }
                            placeholder="თქვენი სრული სახელი"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">ელ. ფოსტა</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userForm.email}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                email: e.target.value,
                              })
                            }
                            placeholder="თქვენი ელ. ფოსტა"
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">ტელეფონი</Label>
                          <Input
                            id="phone"
                            value={userForm.phone}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="თქვენი ტელეფონის ნომერი"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">ძირითადი მისამართი</Label>
                          <Input
                            id="address"
                            value={userForm.address}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                address: e.target.value,
                              })
                            }
                            placeholder="თქვენი ძირითადი მისამართი"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setUserForm({
                              full_name: user.full_name || '',
                              email: user.email,
                              phone: user.phone || '',
                              address: user.address || '',
                            });
                          }}
                        >
                          გაუქმება
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              მიმდინარეობს...
                            </div>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              შენახვა
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500 text-sm">
                          სრული სახელი
                        </Label>
                        <p>{user.full_name || 'არ არის მითითებული'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          ელ. ფოსტა
                        </Label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          ტელეფონი
                        </Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <p>{user.phone || 'არ არის მითითებული'}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-sm">
                          ძირითადი მისამართი
                        </Label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <p>{user.address || 'არ არის მითითებული'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold mb-6">პაროლის შეცვლა</h3>

                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">მიმდინარე პაროლი</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">ახალი პაროლი</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        გაიმეორეთ ახალი პაროლი
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            მიმდინარეობს...
                          </div>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            პაროლის შეცვლა
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <ProfileAddressTab />
            </div>
          )}

          {activeTab === 'help' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-6">დახმარება</h3>
              <p className="text-gray-600 mb-4">
                თუ თქვენ გაქვთ რაიმე კითხვა ან საჭიროებთ დახმარებას, შეგიძლიათ
                დაგვიკავშირდეთ:
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">ელ. ფოსტა</p>
                    <p className="text-gray-600">support@gamoiwere.ge</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">ტელეფონი</p>
                    <p className="text-gray-600">+995 (32) 2 111 111</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium mb-2">ხშირად დასმული კითხვები</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">როგორ შევავსო ბალანსი?</p>
                    <p className="text-gray-600 text-sm mt-1">
                      ბალანსის შესავსებად შეგიძლიათ გამოიყენოთ საბანკო ბარათი ან
                      ინტერნეტ ბანკი.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">როგორ შევცვალო მისამართი?</p>
                    <p className="text-gray-600 text-sm mt-1">
                      მისამართების სექციაში შეგიძლიათ დაამატოთ, შეცვალოთ ან
                      წაშალოთ მისამართები.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">შეკვეთები</h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">ჯერ არ გაქვთ შეკვეთები</p>
                <p className="text-gray-400 text-sm">
                  შეკვეთების ისტორია გამოჩნდება აქ მათი განთავსების შემდეგ
                </p>
                <Link to="/products">
                  <Button className="mt-4">პროდუქტების ნახვა</Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">რჩეულები</h2>
                <p className="text-gray-600">
                  {Array.isArray(favorites) ? favorites.length : 0} პროდუქტი
                </p>
              </div>

              {!Array.isArray(favorites) || favorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                  <Heart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    ჯერ არ გაქვთ რჩეული პროდუქტები
                  </p>
                  <p className="text-gray-400 text-sm">
                    რჩეულებში დასამატებლად დააჭირეთ გულის ღილაკს პროდუქტის
                    გვერდზე
                  </p>
                  <Link to="/products">
                    <Button className="mt-4">პროდუქტების ნახვა</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.isArray(favorites) &&
                    favorites.map((favorite: any) => (
                      <Card
                        key={favorite.id || favorite.productId}
                        className="overflow-hidden group hover:shadow-lg transition-shadow"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={
                              favorite.productImage ||
                              favorite.imageUrl ||
                              '/placeholder-product.jpg'
                            }
                            alt={favorite.productTitle || favorite.name}
                            className="w-full h-full object-cover"
                          />

                          <button
                            className="absolute top-3 right-3 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            onClick={() =>
                              removeFromFavorites(favorite.productId)
                            }
                            title="რჩეულებიდან მოშლა"
                            disabled={isRemovingFromFavorites}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>

                        <div className="p-4">
                          <Link
                            to={
                              favorite.productUrl ||
                              `/product/${favorite.productId}`
                            }
                          >
                            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
                              {favorite.productTitle || favorite.name}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-bold text-primary">
                              {favorite.productPrice || favorite.price}₾
                            </div>
                            {favorite.oldPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                {favorite.oldPrice}₾
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary hover:bg-primary/90"
                              onClick={() => {
                                console.log('Add to cart:', favorite.productId);
                              }}
                            >
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              კალათაში
                            </Button>

                            <Link
                              to={
                                favorite.productUrl ||
                                `/product/${favorite.productId}`
                              }
                            >
                              <Button size="sm" variant="outline">
                                ნახვა
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'delivery' && <DeliveryTrackingTab />}

          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Dialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
      >
        <DialogContent className="sm:max-w-md border-0 shadow-xl rounded-xl p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 mr-2" />
              <DialogTitle className="text-lg font-semibold">
                ტელეფონის ვერიფიკაცია
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-100 text-sm">
              კოდი გაგზავნილია: {user?.phone}
            </DialogDescription>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <Label className="text-sm text-gray-600 mb-4 block">
                შეიყვანეთ 4-ნიშნა კოდი
              </Label>

              {/* Individual OTP input boxes */}
              <div className="flex justify-center gap-3 mb-3">
                {[0, 1, 2, 3].map((index) => (
                  <Input
                    key={index}
                    type="text"
                    value={verificationCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 1) {
                        const newCode = verificationCode.split('');
                        newCode[index] = value;
                        const updatedCode = newCode.join('').slice(0, 4);
                        setVerificationCode(updatedCode);

                        // Auto-focus next input
                        if (value && index < 3) {
                          const nextInput = document.querySelector(
                            `input[data-index="${index + 1}"]`
                          ) as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to move to previous input
                      if (
                        e.key === 'Backspace' &&
                        !verificationCode[index] &&
                        index > 0
                      ) {
                        const prevInput = document.querySelector(
                          `input[data-index="${index - 1}"]`
                        ) as HTMLInputElement;
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    data-index={index}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-400">ვალიდურია 10 წუთი</p>
            </div>

            {!otpSent && (
              <div className="text-center">
                <Button
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  {sendOtpMutation.isPending
                    ? 'გაგზავნა...'
                    : 'თავიდან გაგზავნა'}
                </Button>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setOtpSent(false);
                }}
                className="flex-1"
              >
                გაუქმება
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={
                  verificationCode.length !== 4 || verifyOtpMutation.isPending
                }
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {verifyOtpMutation.isPending ? 'იტვირთება...' : 'დადასტურება'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
