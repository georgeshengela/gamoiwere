import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface Notification {
  id: number;
  userId: number;
  orderId?: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch notifications from API
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with user ID
      websocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification' && data.data) {
          // Add new notification to cache
          queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] = []) => {
            return [data.data, ...oldData];
          });
          
          // Show browser notification if permitted and available
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(data.data.title, {
              body: data.data.message,
              icon: '/favicon.png'
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, queryClient]);

  // Request notification permission
  useEffect(() => {
    if (user && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] = []) => {
          return oldData.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          );
        });
      }
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] = []) => {
          return oldData.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date().toISOString() 
          }));
        });
      }
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/clear-read', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] = []) => {
          return oldData.filter(notif => !notif.isRead);
        });
      }
    } catch (error) {
      console.error('Clear read notifications error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    isConnected: ws?.readyState === WebSocket.OPEN
  };
}