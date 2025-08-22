import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getCartItems as getCart, getCartTotal as getTotalPrice, addItemToCart, clearCart as clearCartUtils } from "@/utils/cartUtils";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, ShoppingCart, Plus, MapPin, Info, Phone, Clock, Truck, Plane, Ship, CreditCard } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Checkout form schema
const checkoutSchema = z.object({
  deliveryMethod: z.enum(["AIR", "GROUND", "SEA"], {
    required_error: "გთხოვთ აირჩიოთ მიწოდების მეთოდი",
  }),
  paymentMethod: z.enum(["BOG"]),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "გთხოვთ დაეთანხმოთ პირობებს",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { clearCart: clearCartContext } = useCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: '',
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    city: '',
    postal_code: '',
    region: '',
    is_default: false
  });
  const [packageWeight, setPackageWeight] = useState<number>(1); // Default 1kg
  const [saveAddress, setSaveAddress] = useState<boolean>(false); // Option to save address
  
  // Calculate total price from current cart items state
  const calculateCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Fetch user's saved addresses
  const { data: addresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['/api/user/addresses'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await fetch('/api/user/addresses');
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated
  });
  
  // Fetch delivery methods
  const { data: deliveryMethods = [], isLoading: deliveryMethodsLoading } = useQuery({
    queryKey: ['/api/delivery-methods'],
    queryFn: async () => {
      const response = await fetch('/api/delivery-methods');
      if (!response.ok) return [];
      return response.json();
    }
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "AIR", // Default to air shipping
      paymentMethod: "BOG",
      agreeTerms: false,
    },
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: typeof addressForm) => {
      return await apiRequest('/api/user/addresses', {
        method: 'POST',
        data: addressData
      });
    },
    onSuccess: () => {
      refetchAddresses();
      setIsAddAddressDialogOpen(false);
      // Clear the address form
      setAddressForm({
        title: '',
        recipient_name: '',
        recipient_phone: '',
        street_address: '',
        city: '',
        postal_code: '',
        region: '',
        is_default: false
      });
      toast({
        title: "მისამართი დამატებულია",
        description: "თქვენი ახალი მისამართი წარმატებით დაემატა",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission for adding a new address
  const handleAddAddress = () => {
    // Validate required fields
    if (!addressForm.title.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ მისამართის სახელი",
        variant: "destructive",
      });
      return;
    }
    
    if (!addressForm.recipient_name.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ მიმღების სახელი",
        variant: "destructive",
      });
      return;
    }
    
    if (!addressForm.recipient_phone.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ საკონტაქტო ტელეფონი",
        variant: "destructive",
      });
      return;
    }
    
    if (!addressForm.street_address.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ მისამართი",
        variant: "destructive",
      });
      return;
    }
    
    if (!addressForm.city.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ ქალაქი",
        variant: "destructive",
      });
      return;
    }
    
    createAddressMutation.mutate(addressForm);
  };
  
  // Handle address selection
  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
  };
  
  // Load cart items on component mount and save to localStorage for persistence
  useEffect(() => {
    const loadCartItems = () => {
      const items = getCart();
      console.log("Checkout: Loading cart items:", items);
      
      // If cart is empty but we're not in order complete state, try to restore from localStorage
      if (items.length === 0 && !orderComplete) {
        const savedCart = localStorage.getItem('checkout_cart');
        if (savedCart) {
          try {
            const restoredItems = JSON.parse(savedCart);
            console.log("Checkout: Restoring cart from localStorage:", restoredItems);
            setCartItems(restoredItems);
            return;
          } catch (error) {
            console.error("Failed to restore cart from localStorage:", error);
          }
        }
      }
      
      setCartItems(items);
      
      // Save current cart to localStorage for persistence
      if (items.length > 0 && !orderComplete) {
        localStorage.setItem('checkout_cart', JSON.stringify(items));
      }
    };

    loadCartItems();
  }, [orderComplete]);

  // Check for empty cart after items are loaded
  useEffect(() => {
    console.log("Checkout: Cart check - items count:", cartItems.length, "orderComplete:", orderComplete);
    if (cartItems.length === 0 && !orderComplete) {
      console.log("Checkout: Cart is empty, but not redirecting immediately");
      // Don't redirect immediately - let user see the form and message
    }
  }, [cartItems, orderComplete]);

  // Handle address selection when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((addr: any) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id.toString());
      } else if (addresses.length > 0) {
        // If no default address but addresses exist, use the first one
        const firstAddress = addresses[0];
        setSelectedAddressId(firstAddress.id.toString());
      }
    }
  }, [addresses]);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdown !== null) {
        setCountdown(null);
      }
    };
  }, []);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      if (!isAuthenticated || !user) {
        throw new Error("გთხოვთ გაიაროთ ავტორიზაცია");
      }

      // Get the selected address
      if (!selectedAddressId) {
        throw new Error("მიუთითეთ მიწოდების მისამართი");
      }

      const selectedAddress = addresses.find((addr: any) => addr.id.toString() === selectedAddressId);
      if (!selectedAddress) {
        throw new Error("მისამართის მონაცემები ვერ მოიძებნა");
      }

      // Convert cart items to order items format
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      const totalAmount = calculateCartTotal();
      // Calculate shipping cost based on delivery method and package weight
      let shippingCost = 0;
      const method = deliveryMethods.find((m: any) => m.code === data.deliveryMethod);
      if (method) {
        // Convert tetri to GEL (divide by 100)
        shippingCost = (method.price_per_kg * packageWeight) / 100;
      }

      // Calculate estimated delivery date based on selected delivery method
      const currentDate = new Date();
      let estimatedDeliveryDate = new Date(currentDate);
      
      if (data.deliveryMethod === 'AIR') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 14); // 14 days for air
      } else if (data.deliveryMethod === 'GROUND') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 30); // 30 days for ground
      } else if (data.deliveryMethod === 'SEA') {
        estimatedDeliveryDate.setDate(currentDate.getDate() + 45); // 45 days for sea
      }

      const orderData = {
        userId: user.id,
        items: orderItems,
        totalAmount: totalAmount,
        shippingCost: shippingCost,
        status: "PENDING",
        paymentMethod: data.paymentMethod,
        deliveryMethod: data.deliveryMethod,
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        shippingAddress: selectedAddress.street_address,
        shippingCity: selectedAddress.city,
        shippingPostalCode: selectedAddress.postal_code || "",
        recipientName: selectedAddress.recipient_name,
        recipientPhone: selectedAddress.recipient_phone,
        notes: "",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "შეკვეთის გაფორმება ვერ მოხერხდა");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Set order complete state but don't clear cart yet
      setOrderComplete(true);
      setOrderId(data.order?.id || 0);
      setCountdown(10); // Start 10-second countdown

      toast({
        title: "შეკვეთა წარმატებით შეიქმნა",
        description: "გადახდის დეტალებისთვის გადახვალთ შეკვეთის გვერდზე",
      });

      // Clear cart and backup after successful order
      clearCartContext();
      clearCartUtils();
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_cart');
      setCartItems([]);

      // Refresh all profile-related data to show updated orders and balance
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/delivery-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });

      // Navigate to order details page after 10 seconds
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimer);
            navigate(`/orders/${data.order?.id || 0}`);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: error.message || "შეკვეთის გაფორმება ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.",
      });
    },
  });

  // BOG Payment mutation
  const bogPaymentMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues & { selectedAddress: any }) => {
      // Convert cart items to order items format  
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      const totalAmount = calculateCartTotal();

      const bogPaymentData = {
        cartItems: orderItems,
        totalAmount: totalAmount,
        deliveryAddress: {
          name: data.selectedAddress.recipient_name,
          phone: data.selectedAddress.recipient_phone,
          address: data.selectedAddress.street_address,
          city: data.selectedAddress.city,
          postalCode: data.selectedAddress.postal_code || "",
        },
        userInfo: {
          name: user?.full_name || user?.username,
          email: user?.email,
          phone: data.selectedAddress.recipient_phone,
        },
        deliveryMethod: data.deliveryMethod,
      };

      const response = await fetch("/api/bog-payment/create-order", {
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

      // Clear cart after successful BOG payment initiation
      clearCartContext();
      clearCartUtils();
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_cart');
      setCartItems([]);

      // Redirect to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "BOG გადახდის შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Submit handler
  const onSubmit = async (data: CheckoutFormValues) => {
    // Check if terms are agreed to
    if (!data.agreeTerms) {
      toast({
        variant: "destructive",
        title: "მომსახურების პირობები",
        description: "გთხოვთ დაეთანხმოთ მომსახურების პირობებს შეკვეთის გასაფორმებლად",
      });
      return;
    }

    // Check if we have a selected address or if user has a default address
    let addressId = selectedAddressId;
    
    // If no address is selected but we have addresses, try to use the default one
    if (!addressId && addresses.length > 0) {
      const defaultAddress = addresses.find((addr: any) => addr.is_default);
      if (defaultAddress) {
        addressId = defaultAddress.id.toString();
        setSelectedAddressId(addressId);
      } else {
        // Use the first address if no default is set
        addressId = addresses[0].id.toString();
        setSelectedAddressId(addressId);
      }
    }
    
    // Final validation
    if (!addressId || addressId === "new") {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: "მიუთითეთ მიწოდების მისამართი",
      });
      return;
    }
    
    // Get the selected address details
    const selectedAddress = addresses.find((addr: any) => addr.id.toString() === addressId);
    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: "მისამართის მონაცემები ვერ მოიძებნა",
      });
      return;
    }

    // Handle different payment methods
    // Use BOG payment flow
    bogPaymentMutation.mutate({
      ...data,
      selectedAddress: selectedAddress
    });
  };

  // If not authenticated, redirect to login
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ავტორიზაცია საჭიროა</AlertTitle>
          <AlertDescription>
            შეკვეთის გასაფორმებლად საჭიროა ავტორიზაციის გავლა.{" "}
            <a href="/login" className="underline font-medium">
              შესვლა
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Order complete state
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Success Animation Container */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {/* Animated Success Circle */}
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Check className="h-12 w-12 text-white stroke-[3]" />
              </div>
              {/* Floating particles effect */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-300 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-4 -left-4 w-2 h-2 bg-emerald-200 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Main Success Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">🎉 შეკვეთა წარმატებით დასრულდა!</h1>
              <p className="text-emerald-100 text-lg">თქვენი შეკვეთა მიღებულია და მუშავდება</p>
            </div>

            {/* Order Details */}
            <div className="p-8 space-y-6">
              {/* Order Number Highlight */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">შეკვეთის ნომერი</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">#{orderId}</p>
                  </div>
                  <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Status Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-1">დამუშავება</h3>
                  <p className="text-sm text-blue-700">შეკვეთა მუშავდება</p>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900 mb-1">მიწოდება</h3>
                  <p className="text-sm text-amber-700">ტრანსპორტირება მოემზადება</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-1">შეტყობინება</h3>
                  <p className="text-sm text-purple-700">SMS განახლებები</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  რა მოხდება შემდეგ?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">1</span>
                    </div>
                    <p className="text-sm text-indigo-800">მიიღებთ შეკვეთის დასტურს ელფოსტაზე 5 წუთში</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">2</span>
                    </div>
                    <p className="text-sm text-indigo-800">გადაზიდვის ღირებულება და ვადები გეცნობებათ 24 საათში</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">3</span>
                    </div>
                    <p className="text-sm text-indigo-800">ყველა განახლების შესახებ მიიღებთ SMS შეტყობინებებს</p>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              {countdown !== null && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">{countdown}</span> წამში ავტომატურად გადაგიყვანთ შეკვეთის დეტალებზე
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  შეკვეთის თვალყურის დევნება
                </Button>
                <Button
                  onClick={() => navigate('/products')}
                  variant="outline"
                  className="flex-1 border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  გაგრძელება ყიდვისა
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-slate-600 font-medium">მადლობთ რომ აირჩიეთ GAMOIWERE.GE</p>
            <p className="text-sm text-slate-500">ნებისმიერი შეკითხვისთვის დაგვიკავშირდით: support@gamoiwere.ge</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress Steps Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium">
                <Check className="h-3 w-3 md:h-4 md:w-4" />
              </div>
              <span className="text-green-600 font-medium text-xs md:text-sm hidden sm:inline">კალათა</span>
            </div>
            <div className="w-6 md:w-12 h-px bg-slate-300"></div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium">2</div>
              <span className="text-blue-600 font-medium text-xs md:text-sm hidden sm:inline">შეკვეთის დეტალები</span>
            </div>
            <div className="w-6 md:w-12 h-px bg-slate-300"></div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs md:text-sm font-medium">3</div>
              <span className="text-slate-400 text-xs md:text-sm hidden sm:inline">დასრულება</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Important Information Cards */}
            <div className="space-y-3 md:space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3 md:p-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="flex-shrink-0">
                    <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">გადაზიდვის ინფორმაცია</p>
                    <p className="text-blue-700 text-xs md:text-sm mt-1">გადაზიდვის შესახებ ინფორმაციას (ღირებულება, წონა, ვადები) მიიღებთ შეკვეთის დამუშავების შემდგომ.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3 md:p-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="flex-shrink-0">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-amber-800 text-sm font-medium">მობილური ვერიფიკაცია</p>
                    <p className="text-amber-700 text-xs md:text-sm mt-1">პროფილი გვერდზე აუცილებლად გაიარეთ მობილური ნომრის ვერიფიკაცია, ყველა განახლების შესახებ SMS-ის მისაღებად.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-3 md:p-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-purple-800 text-sm font-medium">მიწოდების ვადები</p>
                    <p className="text-purple-700 text-xs md:text-sm mt-1">გადაზიდვის ვადები საორიენტაციოა და ზუსტ თარიღს მიიღებთ შეკვეთის დამუშავების შემდგომ.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-4 md:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-semibold text-slate-900">მიწოდების მისამართი</h2>
                      <p className="text-xs md:text-sm text-slate-500">აირჩიეთ მისამართი ან დაამატეთ ახალი</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddAddressDialogOpen(true)}
                    className="flex items-center gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-xs md:text-sm w-full sm:w-auto"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    ახალი მისამართი
                  </Button>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6"
                >
                  {addresses.length > 0 && (
                    <div className="space-y-3">
                      {addresses.map((address: any) => (
                        <div 
                          key={address.id}
                          className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            selectedAddressId === address.id.toString() 
                              ? 'border-blue-300 bg-blue-50 shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => handleAddressSelect(address.id.toString())}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedAddressId === address.id.toString()
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-slate-300'
                                }`}>
                                  {selectedAddressId === address.id.toString() && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-slate-900">{address.title}</span>
                                  {address.is_default && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                      ძირითადი
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-8 space-y-1">
                                <p className="text-sm font-medium text-slate-700">
                                  {address.recipient_name}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {address.street_address}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {address.city}{address.postal_code && `, ${address.postal_code}`}
                                </p>
                                {address.recipient_phone && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">{address.recipient_phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* მიწოდების მეთოდი */}
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => {
                        // Calculate estimated delivery dates
                        const currentDate = new Date();
                        
                        // Format date to Georgian format (e.g. "10 აპრილი 2025")
                        const formatGeorgianDate = (date: Date) => {
                          const day = date.getDate();
                          const month = date.getMonth();
                          
                          const georgianMonths = [
                            "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", 
                            "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
                          ];
                          
                          return `${day} ${georgianMonths[month]} ${date.getFullYear()}`;
                        };
                        
                        // No shipping cost calculation needed
                        
                        return (
                          <FormItem className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                              <FormLabel>მიწოდების მეთოდი</FormLabel>
                            </div>
                            
                            <FormControl>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                {deliveryMethodsLoading ? (
                                  <div className="col-span-3 flex justify-center py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                      <span>იტვირთება...</span>
                                    </div>
                                  </div>
                                ) : (
                                  deliveryMethods.map((method: any) => {
                                    // Calculate estimated delivery date
                                    const estDate = new Date(currentDate);
                                    estDate.setDate(estDate.getDate() + (method.estimated_days_max || method.estimated_days_min));
                                    
                                    // SVG icon based on delivery method
                                    let icon;
                                    if (method.code === 'AIR') {
                                      icon = <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>;
                                    } else if (method.code === 'GROUND') {
                                      icon = <path d="M3 17h1m16 0h1M5 17a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m5 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0M5 17H3V7a2 2 0 0 1 2-2h1M9 17H7V7a2 2 0 0 1 2-2h1M15 17h-2v-3.15a1 1 0 0 1 .84-.99l4.15-.86V12l2 .5V17h-2m-4 0v-6h4.5M3 9h4m0 0h2m8 0h4"/>;
                                    } else {
                                      icon = <><path d="M2 22a8 8 0 0 1 9-7.76C13 14 14 13.3 14 12V5a3 3 0 0 0-3-3c-1.5 0-3 .83-3 3a2 2 0 0 0 2 2c1.5 0 3-.83 3-3a3 3 0 0 0-3-3H2"/><path d="M22 22a8 8 0 0 0-9-7.76C11 14 10 13.3 10 12V5a3 3 0 0 1 3-3c1.5 0 3 .83 3 3a2 2 0 0 1-2 2c-1.5 0-3-.83-3-3a3 3 0 0 1 3-3h8"/></>;
                                    }
                                    
                                    // Calculate delivery days string
                                    const deliveryDays = method.estimated_days_max 
                                      ? `${method.estimated_days_min}-${method.estimated_days_max} დღე`
                                      : `${method.estimated_days_min} დღე`;
                                    
                                    return (
                                      <div 
                                        key={method.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === method.code ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                                        onClick={() => field.onChange(method.code)}
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className={`p-2 rounded-full ${field.value === method.code ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                              {icon}
                                            </svg>
                                          </div>
                                          <div>
                                            <div className="font-medium">{method.name}</div>
                                            <div className="text-sm text-muted-foreground">{deliveryDays}</div>
                                          </div>
                                        </div>
                                        <div className="mt-2 text-sm">
                                          <div className="font-medium mt-1">სავარაუდო მიღების თარიღი:</div>
                                          <div className="text-muted-foreground">{formatGeorgianDate(estDate)}</div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    <Separator className="md:col-span-2 my-4" />


                  </div>


                </form>
              </Form>
            </CardContent>
          </div>
        </div>
      </div>

          {/* Order Summary - Redesigned */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:sticky lg:top-8">
              <div className="p-4 md:p-6 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-slate-900">შეკვეთის შეჯამება</h2>
                    <p className="text-xs md:text-sm text-slate-500">{cartItems.length} პროდუქტი</p>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6">
              
              {/* Cart Items - Collapsible */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="text-xs md:text-sm font-medium">პროდუქტები</h3>
                  <span className="text-xs text-muted-foreground">
                    {cartItems.length} ნივთი
                  </span>
                </div>
                <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {cartItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-md overflow-hidden border">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 text-xs md:text-sm">{item.name}</p>
                          <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-0.5">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs mr-2">
                              {item.quantity}x
                            </span>
                            <span>{item.price.toFixed(2)} ₾</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-right text-xs md:text-sm">
                        {(item.price * item.quantity).toFixed(2)} ₾
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 md:space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg mb-4 md:mb-5">
                <h3 className="text-xs md:text-sm font-medium pb-2 border-b">ფასების დეტალები</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <span className="inline-block w-2 h-2 md:w-3 md:h-3 bg-primary/20 rounded-full mr-2"></span>
                      პროდუქტების ღირებულება
                    </span>
                    <span>{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ₾</span>
                  </div>
                </div>
              </div>
              
              {/* Tariff Alert - show if total is over 300 GEL */}
              {(() => {
                const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
                
                // Show tariff alert if total is over 300 GEL
                if (total > 300) {
                  const tariffAmount = total * 0.18; // 18% tariff
                  return (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm mb-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-green-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-40"></div>
                      <p className="font-medium text-green-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ამანათი ექვემდებარება განბაჟებას
                      </p>
                      <p className="mt-2 text-green-700 pl-7">
                        სავარაუდო განბაჟების თანხა: <span className="font-semibold">{tariffAmount.toFixed(2)} ₾</span>
                        <span className="text-xs block mt-1 text-green-600">({total.toFixed(2)} ₾ × 18%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Total Amount */}
              <div className="bg-primary text-white p-4 md:p-5 rounded-lg flex items-center justify-between">
                <span className="text-sm md:text-lg font-medium">ჯამური თანხა:</span>
                <span className="text-lg md:text-2xl font-bold">
                  {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                  <span className="text-sm md:text-lg ml-1">₾</span>
                </span>
              </div>
              
              {/* Delivery Estimate */}
              <div className="mt-4 md:mt-5 text-center text-xs md:text-sm text-muted-foreground">
                <p>სავარაუდო მიწოდების თარიღი:</p>
                <p className="font-medium text-foreground mt-1">
                  {(() => {
                    const currentDate = new Date();
                    const selectedMethod = form.watch('deliveryMethod');
                    
                    if (!selectedMethod) return '—';
                    
                    const method = deliveryMethods.find((m: any) => m.code === selectedMethod);
                    if (!method) return '—';
                    
                    // Calculate estimated delivery date
                    const estDate = new Date(currentDate);
                    estDate.setDate(estDate.getDate() + (method.estimated_days_max || method.estimated_days_min));
                    
                    // Format date to Georgian
                    const day = estDate.getDate();
                    const month = estDate.getMonth();
                    
                    const georgianMonths = [
                      "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", 
                      "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
                    ];
                    
                    return `${day} ${georgianMonths[month]} ${estDate.getFullYear()}`;
                  })()}
                </p>
              </div>

              {/* Payment Method */}
              <div className="mt-4 md:mt-6 border-t pt-4 md:pt-6">
                <div className="text-xs md:text-sm font-medium mb-2 md:mb-3">გადახდის მეთოდი</div>
                <div className="p-2 md:p-3 border rounded-lg bg-purple-50 border-purple-200">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span className="text-xs md:text-sm font-medium">BOG ბარათით გადახდა</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">უსაფრთხო ონლაინ გადახდა</p>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="mt-3 md:mt-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <Checkbox
                    checked={form.watch("agreeTerms")}
                    onCheckedChange={(checked) => form.setValue("agreeTerms", checked as boolean)}
                    className="h-4 w-4 md:h-5 md:w-5 mt-0.5"
                  />
                  <div className="text-xs md:text-sm leading-relaxed">
                    ვეთანხმები{" "}
                    <a
                      href="/terms"
                      className="text-primary underline"
                      target="_blank"
                    >
                      მომსახურების პირობებს
                    </a>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                className="w-full mt-4 md:mt-6 h-11 md:h-12 text-sm md:text-base font-medium"
                disabled={createOrderMutation.isPending || bogPaymentMutation.isPending}
                onClick={form.handleSubmit(onSubmit, (errors) => {
                  // Handle form validation errors
                  console.log("Form validation errors:", errors);
                  if (errors.agreeTerms) {
                    toast({
                      variant: "destructive",
                      title: "მომსახურების პირობები",
                      description: "გთხოვთ დაეთანხმოთ მომსახურების პირობებს შეკვეთის გასაფორმებლად",
                    });
                  }
                  if (errors.deliveryMethod) {
                    toast({
                      variant: "destructive",
                      title: "მიწოდების მეთოდი",
                      description: "გთხოვთ აირჩიოთ მიწოდების მეთოდი",
                    });
                  }
                })}
              >
                {(createOrderMutation.isPending || bogPaymentMutation.isPending) ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {form.watch("paymentMethod") === "BOG" ? "BOG გადახდაზე გადამისამართება..." : "იტვირთება..."}
                  </span>
                ) : (
                  form.watch("paymentMethod") === "BOG" ? "გადახდა" : "შეკვეთის განთავსება"
                )}
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddAddressDialogOpen} onOpenChange={setIsAddAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ახალი მისამართის დამატება</DialogTitle>
            <DialogDescription>
              შეავსეთ ინფორმაცია მისამართის დასამატებლად
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-title">მისამართის სახელი</Label>
              <Input
                id="add-title"
                placeholder="მაგ.: სახლი, ოფისი"
                value={addressForm.title}
                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-recipient_name">მიმღების სახელი</Label>
              <Input
                id="add-recipient_name"
                placeholder="მიმღების სრული სახელი"
                value={addressForm.recipient_name}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-recipient_phone">ტელეფონის ნომერი</Label>
              <Input
                id="add-recipient_phone"
                placeholder="მიმღების ტელეფონის ნომერი"
                value={addressForm.recipient_phone}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-street_address">ქუჩის მისამართი</Label>
              <Input
                id="add-street_address"
                placeholder="ქუჩა, ბინა, სართული, და ა.შ."
                value={addressForm.street_address}
                onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-city">ქალაქი</Label>
                <Input
                  id="add-city"
                  placeholder="ქალაქი"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-postal_code">საფოსტო ინდექსი</Label>
                <Input
                  id="add-postal_code"
                  placeholder="საფოსტო ინდექსი"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-region">რეგიონი</Label>
              <Input
                id="add-region"
                placeholder="რეგიონი"
                value={addressForm.region}
                onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-is_default" 
                checked={addressForm.is_default}
                onCheckedChange={(checked) => 
                  setAddressForm({ ...addressForm, is_default: checked as boolean })
                }
              />
              <Label htmlFor="add-is_default">დააყენეთ ნაგულისხმევ მისამართად</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAddressDialogOpen(false)}>
              გაუქმება
            </Button>
            <Button 
              onClick={handleAddAddress}
              disabled={createAddressMutation.isPending}
            >
              {createAddressMutation.isPending ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ინახება...
                </span>
              ) : (
                "დამატება"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;