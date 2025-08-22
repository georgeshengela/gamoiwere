import { Bell, X, Check, Package, Clock, BellRing, MessageSquare, Trash2 } from 'lucide-react';
import bellIcon from '@assets/bell_1749419331455.png';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearReadNotifications, isConnected } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delivery_update':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'order_status':
        return <Clock className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ka 
      });
    } catch {
      return 'ახლახან';
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to appropriate page based on notification type and order ID
    if (notification.type === 'delivery_update' && notification.orderId) {
      setLocation(`/orders/${notification.orderId}`);
    } else if (notification.type === 'order_status' && notification.orderId) {
      setLocation(`/orders/${notification.orderId}`);
    } else {
      // For general notifications, navigate to profile page
      setLocation('/profile');
    }

    // Close the notification dropdown
    setIsOpen(false);
  };

  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <img src={bellIcon} alt="Notifications" className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:absolute md:inset-auto md:top-full md:right-0 md:mt-2">
          {/* Mobile backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="relative z-10 mx-4 mt-16 md:mx-0 md:mt-0 md:w-96 max-h-[80vh] md:max-h-96 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                შეტყობინებები
                {!isConnected && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="კავშირი გაწყვეტილია" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    ყველას წაკითხული
                  </Button>
                )}
                {readCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReadNotifications}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    წაკითხულის გასუფთავება
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-full max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>შეტყობინებები არ არის</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}