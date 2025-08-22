// Simple cart utility functions

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
    colorCode?: string;
  };
  variations?: {
    [key: string]: string;
  };
  variationId?: string;
}

// Get cart from localStorage
export const getCartItems = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

// Save cart to localStorage
export const saveCartItems = (items: CartItem[]): void => {
  localStorage.setItem('cart', JSON.stringify(items));
};

// Add item to cart
export const addItemToCart = (item: Omit<CartItem, 'quantity'>): void => {
  const cart = getCartItems();
  const existingItemIndex = cart.findIndex(i => String(i.id) === String(item.id));
  
  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += 1;
    // Make sure variant data is preserved
    if (item.variant) {
      cart[existingItemIndex].variant = item.variant;
    }
    if (item.variations) {
      cart[existingItemIndex].variations = item.variations;
    }
  } else {
    // Add new item with quantity 1
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCartItems(cart);
};

// Remove item from cart
export const removeItemFromCart = (id: string | number): void => {
  const cart = getCartItems();
  const updatedCart = cart.filter(item => String(item.id) !== String(id));
  saveCartItems(updatedCart);
};

// Update item quantity
export const updateItemQuantity = (id: string | number, quantity: number): void => {
  if (quantity < 1) {
    removeItemFromCart(id);
    return;
  }
  
  const cart = getCartItems();
  const updatedCart = cart.map(item => 
    String(item.id) === String(id) ? { ...item, quantity } : item
  );
  
  saveCartItems(updatedCart);
};

// Clear cart
export const clearCart = (): void => {
  saveCartItems([]);
};

// Get total items count
export const getCartItemCount = (): number => {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Get total price
export const getCartTotal = (): number => {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};