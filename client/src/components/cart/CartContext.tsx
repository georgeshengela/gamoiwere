import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variations?: {
    [key: string]: string; // e.g., { "ფერი": "წითელი", "ზომა": "M", "სტილი": "კლასიკური" }
  };
  variationId?: string; // Unique identifier for this specific variation combination
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Create the cart context with a default undefined value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}

// Props for the cart provider
interface CartProviderProps {
  children: React.ReactNode;
}

// CartProvider component
export function CartProvider({ children }: CartProviderProps) {
  // State to store cart items
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart items from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  // Add an item to the cart - each variation is treated as a separate item
  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems(prevItems => {
      // Use variationId to uniquely identify items with different variations
      const uniqueId = item.variationId || item.id.toString();
      const existingItemIndex = prevItems.findIndex(i => 
        (i.variationId || i.id.toString()) === uniqueId
      );
      
      if (existingItemIndex >= 0) {
        // Exact same variation exists, update its quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        
        // Create variation description for toast
        const variationDesc = item.variations 
          ? Object.entries(item.variations).map(([key, value]) => `${key}: ${value}`).join(', ')
          : '';
        
        toast({
          title: "რაოდენობა განახლდა",
          description: `${item.name}${variationDesc ? ` (${variationDesc})` : ''} - რაოდენობა: ${newItems[existingItemIndex].quantity}`,
        });
        
        return newItems;
      } else {
        // Different variation or new item, add as separate entry
        const variationDesc = item.variations 
          ? Object.entries(item.variations).map(([key, value]) => `${key}: ${value}`).join(', ')
          : '';
        
        toast({
          title: "პროდუქტი დაემატა კალათაში",
          description: `${item.name}${variationDesc ? ` (${variationDesc})` : ''}`,
        });
        
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };
  
  // Remove an item from the cart using CartItem object
  const removeItem = (item: CartItem) => {
    // Create variation description outside setItems to avoid issues
    const variationDesc = item.variations 
      ? Object.entries(item.variations).map(([key, value]) => `${key}: ${value}`).join(', ')
      : '';
    
    setItems(prevItems => {
      // Remove by unique variation ID or regular ID
      const uniqueId = item.variationId || (item.id ? item.id.toString() : '');
      return prevItems.filter(i => (i.variationId || (i.id ? i.id.toString() : '')) !== uniqueId);
    });
    
    // Show toast after state update
    toast({
      title: "პროდუქტი ამოღებულია კალათიდან",
      description: `${item.name || ''}${variationDesc ? ` (${variationDesc})` : ''}`,
    });
  };
  
  // Update item quantity using CartItem object
  const updateQuantity = (item: CartItem, quantity: number) => {
    if (quantity <= 0) {
      removeItem(item);
      return;
    }
    
    setItems(prevItems => {
      const uniqueId = item.variationId || (item.id ? item.id.toString() : '');
      return prevItems.map(i => {
        if ((i.variationId || (i.id ? i.id.toString() : '')) === uniqueId) {
          return { ...i, quantity };
        }
        return i;
      });
    });
  };
  
  // Clear the cart
  const clearCart = () => {
    setItems([]);
    toast({
      title: "კალათა გასუფთავდა",
    });
  };
  
  // Calculate total number of items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Context value
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}