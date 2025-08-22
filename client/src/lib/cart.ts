// Simple cart management library using localStorage

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

// Load cart from localStorage
export function getCart(): CartItem[] {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
    return [];
  }
}

// Save cart to localStorage
export function saveCart(items: CartItem[]): void {
  localStorage.setItem('cart', JSON.stringify(items));
}

// Add item to cart
export function addToCart(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    const newCart = [...cart];
    newCart[existingItemIndex] = {
      ...newCart[existingItemIndex],
      quantity: newCart[existingItemIndex].quantity + 1
    };
    saveCart(newCart);
    return newCart;
  } else {
    // Add new item
    const newCart = [...cart, { ...item, quantity: 1 }];
    saveCart(newCart);
    return newCart;
  }
}

// Remove item from cart
export function removeFromCart(id: number): CartItem[] {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== id);
  saveCart(newCart);
  return newCart;
}

// Update item quantity
export function updateQuantity(id: number, quantity: number): CartItem[] {
  if (quantity < 1) {
    return removeFromCart(id);
  }
  
  const cart = getCart();
  const newCart = cart.map(item => 
    item.id === id ? { ...item, quantity } : item
  );
  saveCart(newCart);
  return newCart;
}

// Clear cart
export function clearCart(): CartItem[] {
  saveCart([]);
  return [];
}

// Get total items count
export function getTotalItems(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get total price
export function getTotalPrice(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}