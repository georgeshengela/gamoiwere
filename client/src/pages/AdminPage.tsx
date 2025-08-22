import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  UserPlus,
  PackagePlus,
  Eye,
  Edit,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  Send,
  MessageSquare,
  Database,
  Code
} from "lucide-react";

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    enabled: isAuthenticated && user?.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch service status
  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ["/api/admin/service-status"],
    enabled: isAuthenticated && user?.role === 'admin',
    refetchInterval: 60000, // Refresh every minute
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user?.role, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">იტვირთება...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin (should not reach here due to useEffect, but safety check)
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                ადმინისტრატორის პანელი
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                მართეთ თქვენი ე-კომერსის პლატფორმა
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="border-gray-300 text-gray-600 hover:bg-gray-100 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
              >
                <span className="hidden sm:inline">ადმინ პანელზე დაბრუნება</span>
                <span className="sm:hidden">მთავარი</span>
              </Button>
              <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ადმინისტრატორი</span>
                <span className="sm:hidden">ადმინი</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">მომხმარებლები</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.users || 0}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">პროდუქტები</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.products || 0}
                  </p>
                </div>
                <Package className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">შეკვეთები</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.orders || 0}
                  </p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">შემოსავალი</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : `₾${((stats?.revenue || 0) / 100).toFixed(2)}`}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* User Management */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                მომხმარებელთა მართვა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Link href="/admin/users">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  ყველა მომხმარებლის ნახვა
                </Button>
              </Link>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                ახალი მომხმარებლის დამატება
              </Button>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                მომხმარებლის უფლებების მართვა
              </Button>
            </CardContent>
          </Card>

          {/* Product Management */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                პროდუქტების მართვა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                ყველა პროდუქტის ნახვა
              </Button>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <PackagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                ახალი პროდუქტის დამატება
              </Button>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                პროდუქტების რედაქტირება
              </Button>
            </CardContent>
          </Card>

          {/* Order Management */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                შეკვეთების მართვა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Link href="/admin/orders">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  ყველა შეკვეთის ნახვა
                </Button>
              </Link>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                შეკვეთის სტატუსის შეცვლა
              </Button>
              <Button className="w-full justify-start h-9 sm:h-10 text-sm" variant="outline">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                შეკვეთების ანალიტიკა
              </Button>
            </CardContent>
          </Card>

          {/* Email Management */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                Email-ს მართვა
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/test-email">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-2" variant="outline">
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  სატესტო მეილის გაგზავნა
                </Button>
              </Link>
              <Link href="/admin/email-templates">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-3" variant="outline">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  მეილის შაბლონები
                </Button>
              </Link>
              <Link href="/admin/sms-notifications">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-3" variant="outline">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  SMS ნოტიფიკაციები
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                სისტემის პარამეტრები
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/site-statistics">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-2" variant="outline">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  საიტის სტატისტიკა
                </Button>
              </Link>
              <Link href="/admin/monitoring">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-3" variant="outline">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  სისტემის მონიტორინგი
                </Button>
              </Link>
              <Link href="/admin/category-progress">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-3" variant="outline">
                  <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  კატეგორიების პროგრესი
                </Button>
              </Link>
              <Link href="/admin/api-service">
                <Button className="w-full justify-start h-9 sm:h-10 text-sm mt-3" variant="outline">
                  <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  API სერვისები
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities - Mobile Optimized */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                ბოლო აქტივობები
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-3 sm:h-4 w-32 sm:w-48 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="h-3 w-12 sm:w-16 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {activities.map((activity: any) => {
                    const timeAgo = activity.timestamp 
                      ? new Date(Date.now() - new Date(activity.timestamp).getTime()).toISOString().substr(11, 8)
                      : 'N/A';
                    
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'order': return 'bg-green-500';
                        case 'user': return 'bg-blue-500';
                        case 'product': return 'bg-orange-500';
                        default: return 'bg-purple-500';
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                          <span className="text-xs sm:text-sm">{activity.message}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activity.timestamp 
                            ? new Intl.RelativeTimeFormat('ka', { numeric: 'auto' }).format(
                                Math.round((new Date(activity.timestamp).getTime() - Date.now()) / (1000 * 60)), 
                                'minute'
                              )
                            : 'N/A'
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">ბოლო აქტივობები არ არის</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Status Monitoring */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 justify-between text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  სერვისების სტატუსი
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchServices()}
                  disabled={servicesLoading}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${servicesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="h-5 sm:h-6 w-12 sm:w-16 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {services.map((service: any, index: number) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case 'online': return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />;
                        case 'offline': return <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />;
                        case 'error': return <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />;
                        default: return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />;
                      }
                    };

                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case 'online': return <Badge className="bg-green-100 text-green-800 border-green-200 font-light text-xs">მუშაობს</Badge>;
                        case 'offline': return <Badge className="bg-red-100 text-red-800 border-red-200 font-light text-xs">გამორთულია</Badge>;
                        case 'error': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-light text-xs">შეცდომა</Badge>;
                        default: return <Badge variant="secondary" className="font-light text-xs">უცნობი</Badge>;
                      }
                    };

                    return (
                      <div key={index} className="flex items-center justify-between border-b pb-3 sm:pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <p className="text-xs sm:text-sm font-medium">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.url}</p>
                            {service.responseTime && (
                              <p className="text-xs text-gray-400">{service.responseTime}ms</p>
                            )}
                            {service.error && (
                              <p className="text-xs text-red-500">{service.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(service.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(service.lastChecked).toLocaleTimeString('ka-GE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Settings className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">სერვისების ინფორმაცია მიუწვდომელია</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}