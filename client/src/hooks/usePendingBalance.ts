import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
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

export const usePendingBalance = () => {
  const { isAuthenticated } = useAuth();
  
  // Fetch orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Calculate pending balance
  const pendingBalance = useMemo(() => {
    if (!orders) return 0;
    
    // Sum up all pending orders (მოლოდინში status)
    const pendingOrders = orders.filter(order => order.status === "PENDING");
    const totalPending = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return totalPending;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(order => order.status === "PENDING").length;
  }, [orders]);

  return {
    pendingBalance: pendingBalance / 100, // Convert from cents to lari
    pendingOrdersCount,
    isLoading,
    error,
    hasPendingOrders: pendingBalance > 0
  };
};